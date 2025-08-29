"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { CheckCircle, XCircle, Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

interface Submission {
  id: string;
  title: string;
  description?: string;
  status: string;
  youtube_url?: string;
  youtube_thumbnail?: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export function ReviewQueue() {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["review-queue"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("submissions")
        .select(
          `
          *,
          profiles (
            full_name,
            avatar_url
          )
        `
        )
        .in("status", ["edited", "uploaded"])
        .order("created_at", { ascending: true });

      return (data || []) as Submission[];
    },
  });

  const handleStatusUpdate = async (
    submissionId: string,
    newStatus: string
  ) => {
    setProcessingIds((prev) => new Set(prev).add(submissionId));

    try {
      const response = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          status: newStatus,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to update submission");

      queryClient.invalidateQueries({ queryKey: ["review-queue"] });
      toast.success(`Submission ${newStatus} successfully`);
    } catch (error) {
      toast.error("Failed to update submission status");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      edited: "bg-blue-100 text-blue-800",
      uploaded: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Reviews ({submissions?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : submissions?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No submissions pending review
          </div>
        ) : (
          <div className="space-y-4">
            {submissions?.map((submission: Submission) => (
              <div
                key={submission.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {submission.youtube_thumbnail && (
                        <img
                          src={submission.youtube_thumbnail}
                          alt=""
                          className="w-16 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {submission.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage
                                src={submission.profiles?.avatar_url}
                              />
                              <AvatarFallback>
                                {submission.profiles?.full_name?.[0]?.toUpperCase() ||
                                  "U"}
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
                            {format(
                              new Date(submission.created_at),
                              "MMM d, yyyy"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {submission.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {submission.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      <Link href={`/submissions/${submission.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>

                      {submission.youtube_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={submission.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            YouTube
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      onClick={() =>
                        handleStatusUpdate(submission.id, "published")
                      }
                      disabled={processingIds.has(submission.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Publish
                    </Button>

                    {submission.status === "edited" && (
                      <Button
                        onClick={() =>
                          handleStatusUpdate(submission.id, "uploaded")
                        }
                        disabled={processingIds.has(submission.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Mark Uploaded
                      </Button>
                    )}

                    <Button
                      onClick={() =>
                        handleStatusUpdate(submission.id, "rejected")
                      }
                      disabled={processingIds.has(submission.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
