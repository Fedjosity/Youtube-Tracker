"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { StatusTimeline } from "./status-timeline";
import { CommentsSection } from "./comments-section";
import { format } from "date-fns";
import {
  ExternalLink,
  Calendar,
  Eye,
  ThumbsUp,
  MessageCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import YouTube from "react-youtube";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SubmissionDetailProps {
  submission: any;
  isAdmin?: boolean;
}

export function SubmissionDetail({
  submission,
  isAdmin = false,
}: SubmissionDetailProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      draft: "bg-gray-100 text-gray-800",
      edited: "bg-blue-100 text-blue-800",
      uploaded: "bg-yellow-100 text-yellow-800",
      published: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleAdminAction = async (action: "approve" | "reject") => {
    if (!isAdmin) return;

    setLoading(true);

    try {
      const newStatus = action === "approve" ? "published" : "rejected";
      const timestampField =
        action === "approve" ? "published_at" : "rejected_at";

      const { error } = await supabase
        .from("submissions")
        .update({
          status: newStatus,
          [timestampField]: new Date().toISOString(),
        })
        .eq("id", submission.id);

      if (error) {
        throw error;
      }

      toast({
        title: `Submission ${action === "approve" ? "approved" : "rejected"}`,
        description: `The submission has been ${
          action === "approve" ? "published" : "rejected"
        } successfully.`,
      });

      // Refresh the page to show updated status
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} submission`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {submission.title}
          </h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={submission.profiles?.avatar_url} />
                <AvatarFallback>
                  {submission.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                {submission.profiles?.full_name || "Unknown User"}
              </span>
            </div>
            <Badge
              className={getStatusColor(submission.status)}
              variant="secondary"
            >
              {submission.status}
            </Badge>
            <span className="text-sm text-gray-500">
              Created {format(new Date(submission.created_at), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin &&
          submission.status === "draft" &&
          submission.link_type === "drive" && (
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAdminAction("approve")}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleAdminAction("reject")}
                disabled={loading}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview */}
          {submission.link_type === "youtube" &&
            submission.youtube_video_id && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <YouTube
                      videoId={submission.youtube_video_id}
                      opts={{
                        width: "100%",
                        height: "100%",
                        playerVars: {
                          autoplay: 0,
                        },
                      }}
                      className="w-full h-full"
                    />
                  </div>

                  {/* YouTube Stats */}
                  {submission.youtube_view_count > 0 && (
                    <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>
                          {submission.youtube_view_count.toLocaleString()} views
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>
                          {submission.youtube_like_count.toLocaleString()} likes
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>
                          {submission.youtube_comment_count.toLocaleString()}{" "}
                          comments
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Description */}
          {submission.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {submission.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* External Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {submission.youtube_url && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-900">YouTube Video</p>
                    <p className="text-sm text-red-700 truncate">
                      {submission.youtube_url}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={submission.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
              {submission.drive_url && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Google Drive</p>
                    <p className="text-sm text-blue-700 truncate">
                      {submission.drive_url}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={submission.drive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <CommentsSection submissionId={submission.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <StatusTimeline submission={submission} />

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Type
                </Label>
                <p className="mt-1 capitalize">{submission.link_type}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Created
                </Label>
                <div className="mt-1 flex items-center space-x-1 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{format(new Date(submission.created_at), "PPP")}</span>
                </div>
              </div>

              {submission.youtube_published_at && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Published on YouTube
                    </Label>
                    <div className="mt-1 flex items-center space-x-1 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {format(
                          new Date(submission.youtube_published_at),
                          "PPP"
                        )}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
