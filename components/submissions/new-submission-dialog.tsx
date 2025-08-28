"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { extractVideoId } from "@/lib/youtube";

interface NewSubmissionDialogProps {
  children: React.ReactNode;
}

export function NewSubmissionDialog({ children }: NewSubmissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
    drive_url: "",
    link_type: "youtube" as "youtube" | "drive",
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Submission error:", result);
        let errorMessage = "Failed to create submission";

        if (result.error) {
          errorMessage = result.error;
        }

        if (result.details && Array.isArray(result.details)) {
          // Handle Zod validation errors
          const validationErrors = result.details.map((err: any) => {
            if (err.path && err.path.length > 0) {
              return `${err.path.join(".")}: ${err.message}`;
            }
            return err.message;
          });
          errorMessage = validationErrors.join(", ");
        } else if (typeof result.details === "string") {
          errorMessage = result.details;
        }

        toast.error(errorMessage);
        return;
      }

      toast.success("Submission created successfully!");
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        youtube_url: "",
        drive_url: "",
        link_type: "youtube",
      });
      router.push(`/submissions/${result.id}`);
    } catch (error) {
      toast.error("Failed to create submission");
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = async (url: string, type: "youtube" | "drive") => {
    setFormData((prev) => ({
      ...prev,
      [type === "youtube" ? "youtube_url" : "drive_url"]: url,
    }));

    // Auto-fetch YouTube metadata if it's a YouTube URL
    if (type === "youtube" && url) {
      const videoId = extractVideoId(url);
      if (videoId && !formData.title) {
        try {
          const response = await fetch(
            `/api/youtube/metadata?videoId=${videoId}`
          );
          if (response.ok) {
            const metadata = await response.json();
            setFormData((prev) => ({
              ...prev,
              title: metadata.title || prev.title,
              description: metadata.description || prev.description,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch YouTube metadata:", error);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Submission</DialogTitle>
          <DialogDescription>
            Submit a new video for review and collaboration tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter video title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter video description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-type">Link Type</Label>
            <Select
              value={formData.link_type}
              onValueChange={(value: "youtube" | "drive") =>
                setFormData((prev) => ({ ...prev, link_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="drive">Google Drive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">
              {formData.link_type === "youtube"
                ? "YouTube URL"
                : "Google Drive URL"}
            </Label>
            <Input
              id="url"
              value={
                formData.link_type === "youtube"
                  ? formData.youtube_url
                  : formData.drive_url
              }
              onChange={(e) =>
                handleUrlChange(e.target.value, formData.link_type)
              }
              placeholder={
                formData.link_type === "youtube"
                  ? "https://www.youtube.com/watch?v=..."
                  : "https://drive.google.com/..."
              }
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Submission"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
