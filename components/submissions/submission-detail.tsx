"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Play,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";
import YouTube from "react-youtube";
import { supabase } from "@/lib/supabase/client";

interface SubmissionDetailProps {
  submission: any;
  isAdmin?: boolean;
}

export function SubmissionDetail({
  submission,
  isAdmin = false,
}: SubmissionDetailProps) {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: submission.title,
    description: submission.description || "",
  });
  const { toast } = useToast();
  const router = useRouter();

  // Get current user for edit permissions
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setCurrentUser({ ...user, profile });
      }
    };
    getUser();
  }, []);

  const canEdit = () => {
    return (
      currentUser &&
      (currentUser.profile?.role === "admin" ||
        submission.user_id === currentUser.id)
    );
  };

  const handleAdminAction = async (action: "approve" | "reject") => {
    if (!isAdmin) return;

    setLoading(true);

    try {
      const newStatus = action === "approve" ? "published" : "rejected";
      const timestampField =
        action === "approve" ? "published_at" : "rejected_at";

      const { error } = await (supabase as any)
        .from("submissions")
        .update({
          status: newStatus,
          [timestampField]: new Date().toISOString(),
        })
        .eq("id", submission.id);

      if (error) {
        throw error;
      }

      // If approved, update the user's profile count
      if (action === "approve") {
        const { error: profileError } = await (supabase as any)
          .from("profiles")
          .update({
            total_published: (submission.profiles as any).total_published + 1,
          })
          .eq("id", submission.user_id);

        if (profileError) {
          console.error("Profile update error:", profileError);
        }
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

  const handleEdit = () => {
    setEditForm({
      title: submission.title,
      description: submission.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    setLoading(true);

    try {
      const { error } = await (supabase as any)
        .from("submissions")
        .update({
          title: editForm.title,
          description: editForm.description,
        })
        .eq("id", submission.id);

      if (error) throw error;

      toast({
        title: "Submission updated",
        description: "The submission has been updated successfully.",
      });

      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update submission",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this submission? This action cannot be undone."
      )
    )
      return;

    setLoading(true);

    try {
      // First, check if the user has permission to delete this submission
      if (!canEdit()) {
        throw new Error("You don't have permission to delete this submission");
      }

      console.log("Deleting submission:", submission.id);

      // Delete the submission - the database trigger will automatically update profile counts
      const { error: deleteError } = await supabase
        .from("submissions")
        .delete()
        .eq("id", submission.id);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        throw new Error(deleteError.message || "Failed to delete submission");
      }

      console.log("Submission deleted successfully");

      // Manually trigger profile count update for the user as a backup
      try {
        const { error: countError } = await (supabase as any).rpc(
          "recalculate_user_profile_counts",
          {
            user_uuid: submission.user_id,
          }
        );

        if (countError) {
          console.warn("Manual count update failed:", countError);
          // Don't throw here as the main deletion was successful
        } else {
          console.log("Profile counts updated for user:", submission.user_id);
        }
      } catch (countUpdateError) {
        console.warn("Manual count update failed:", countUpdateError);
        // Don't throw here as the main deletion was successful
      }

      toast({
        title: "Submission deleted",
        description:
          "The submission has been deleted successfully. Profile counts have been updated.",
      });

      // Redirect to submissions page
      router.push("/submissions");
    } catch (error: any) {
      console.error("Delete submission error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {submission.title}
          </h1>
          <p className="text-gray-600 mt-2">
            by {submission.profiles.full_name} •{" "}
            {format(new Date(submission.created_at), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(submission.status)}>
            {submission.status}
          </Badge>
          {canEdit() && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
                disabled={loading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Video Section */}
      {submission.youtube_video_id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <YouTube
                videoId={submission.youtube_video_id}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: {
                    autoplay: 0,
                    modestbranding: 1,
                    rel: 0,
                  },
                }}
                className="w-full h-full"
              />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => window.open(submission.youtube_url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on YouTube
              </Button>
              {submission.youtube_view_count > 0 && (
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>
                      {submission.youtube_view_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>
                      {submission.youtube_like_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>
                      {submission.youtube_comment_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

          {/* Submission Details */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="outline" className="capitalize">
                    {submission.link_type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span>
                    {format(
                      new Date(submission.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
                {submission.published_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published:</span>
                    <span>
                      {format(
                        new Date(submission.published_at),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                )}
                {submission.rejected_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rejected:</span>
                    <span>
                      {format(
                        new Date(submission.rejected_at),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Submitted by
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={submission.profiles.avatar_url} />
                  <AvatarFallback>
                    {submission.profiles.full_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {submission.profiles.full_name}
                    {typeof submission.profiles.total_submissions ===
                      "number" && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({submission.profiles.total_submissions} submissions)
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {submission.profiles.role}
                  </div>
                  <div className="text-sm text-gray-500">
                    {/* Optionally remove this line if redundant */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {isAdmin &&
            submission.status === "draft" &&
            submission.link_type === "drive" && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAdminAction("approve")}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAdminAction("reject")}
                      disabled={loading}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Submission</DialogTitle>
            <DialogDescription>Update the submission details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                placeholder="Enter title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Enter description"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
