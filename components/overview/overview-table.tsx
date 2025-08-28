"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Search,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  User,
  Play,
  ExternalLink,
} from "lucide-react";
import YouTube from "react-youtube";
import { motion } from "framer-motion";
import { extractVideoId } from "@/lib/youtube";

interface Submission {
  id: string;
  title: string;
  description: string;
  status: string;
  link_type: string;
  youtube_url: string;
  youtube_video_id: string;
  youtube_title: string;
  youtube_thumbnail: string;
  youtube_view_count: number;
  youtube_like_count: number;
  youtube_comment_count: number;
  created_at: string;
  published_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
    role: string;
  };
}

interface UserVideos {
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    role: string;
  };
  videos: Submission[];
}

export function OverviewTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const { toast } = useToast();
  const router = useRouter();

  const {
    data: userVideos,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["overview-submissions", searchTerm, statusFilter, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from("submissions")
        .select(
          `
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            role
          )
        `
        )
        .order("created_at", { ascending: false });

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply date filter
      if (dateFilter !== "all") {
        const now = new Date();
        let startDate = new Date();

        switch (dateFilter) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        query = query.gte("created_at", startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log("Raw submissions data:", data);

      // Apply search filter
      let filteredData = data || [];
      if (searchTerm) {
        filteredData = filteredData.filter(
          (submission: Submission) =>
            submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (submission.profiles?.full_name || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            submission.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      console.log("After search filter:", filteredData);

      // Filter for YouTube videos and extract video IDs
      const youtubeSubmissions = filteredData
        .filter((submission: Submission) => {
          // Check if profiles exists
          if (!submission.profiles) {
            console.warn(`Submission ${submission.id} has no profile data`);
            return false;
          }

          let videoId = submission.youtube_video_id;

          // If video_id is null but we have a URL, try to extract it
          if (!videoId && submission.youtube_url) {
            videoId = extractVideoId(submission.youtube_url);
            console.log(`Extracted video ID from URL: ${videoId}`);
          }

          const hasVideoId = videoId && videoId.trim() !== "";
          const isYouTube = submission.link_type === "youtube";

          console.log(`Submission ${submission.id}:`, {
            title: submission.title,
            hasVideoId,
            videoId: videoId,
            originalVideoId: submission.youtube_video_id,
            youtubeUrl: submission.youtube_url,
            status: submission.status,
            linkType: submission.link_type,
            isYouTube,
            hasProfile: !!submission.profiles,
          });

          return hasVideoId && isYouTube;
        })
        .map((submission: Submission) => {
          // Add extracted video ID to the submission object if it was missing
          if (!submission.youtube_video_id && submission.youtube_url) {
            const extractedId = extractVideoId(submission.youtube_url);
            return {
              ...submission,
              youtube_video_id: extractedId || "",
            };
          }
          return submission;
        });

      console.log("Final filtered submissions:", youtubeSubmissions);

      // Group videos by user
      const groupedByUser: { [key: string]: UserVideos } = {};

      youtubeSubmissions.forEach((submission: Submission) => {
        if (!submission.profiles) {
          console.warn(
            `Skipping submission ${submission.id} - no profile data`
          );
          return;
        }

        const userId = submission.profiles.id;
        if (!groupedByUser[userId]) {
          groupedByUser[userId] = {
            user: submission.profiles,
            videos: [],
          };
        }
        groupedByUser[userId].videos.push(submission);
      });

      // Convert to array and sort by user name
      const userVideosArray = Object.values(groupedByUser).sort((a, b) =>
        (a.user?.full_name || "").localeCompare(b.user?.full_name || "")
      );

      console.log("Grouped user videos:", userVideosArray);
      return userVideosArray;
    },
  });

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

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/submissions/${submissionId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userVideos || userVideos.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">No videos found</div>
            <div className="text-gray-400 text-sm">
              {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No YouTube videos available"}
            </div>
            <div className="mt-4 text-xs text-gray-400">
              Debug: Check console for submission data
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by title, user, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published Only</SelectItem>
                <SelectItem value="draft">Draft Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Video Sections */}
      {userVideos.map((userVideo: UserVideos) => {
        // Skip if user data is missing
        if (!userVideo?.user) {
          console.warn("Skipping user video section - missing user data");
          return null;
        }

        return (
          <Card key={userVideo.user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userVideo.user.avatar_url || ""} />
                    <AvatarFallback>
                      {userVideo.user.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {userVideo.user.full_name || "Unknown User"}
                    </CardTitle>
                    <p className="text-sm text-gray-500 capitalize">
                      {userVideo.user.role || "user"} •{" "}
                      {userVideo.videos.length} videos
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  {userVideo.videos.length} videos
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {userVideo.videos.map(
                    (submission: Submission, index: number) => (
                      <CarouselItem
                        key={submission.id}
                        className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="h-full hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              {/* Video Embed */}
                              <div className="aspect-video mb-4 rounded-lg overflow-hidden bg-gray-100">
                                {submission.youtube_video_id && (
                                  <YouTube
                                    videoId={submission.youtube_video_id}
                                    opts={{
                                      width: "100%",
                                      height: "100%",
                                      playerVars: {
                                        autoplay: 0,
                                        modestbranding: 1,
                                        rel: 0,
                                        controls: 1,
                                      },
                                    }}
                                    className="w-full h-full"
                                    onError={(error: any) => {
                                      console.error(
                                        "YouTube player error:",
                                        error
                                      );
                                    }}
                                  />
                                )}
                              </div>

                              {/* Video Info */}
                              <div className="space-y-3">
                                {/* Title */}
                                <div>
                                  <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                                    {submission.title}
                                  </h3>
                                  <Badge
                                    className={getStatusColor(
                                      submission.status
                                    )}
                                  >
                                    {submission.status}
                                  </Badge>
                                </div>

                                {/* Description */}
                                {submission.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {submission.description}
                                  </p>
                                )}

                                {/* Stats */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                      <Eye className="h-3 w-3" />
                                      <span>
                                        {submission.youtube_view_count?.toLocaleString() ||
                                          0}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <ThumbsUp className="h-3 w-3" />
                                      <span>
                                        {submission.youtube_like_count?.toLocaleString() ||
                                          0}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MessageCircle className="h-3 w-3" />
                                      <span>
                                        {submission.youtube_comment_count?.toLocaleString() ||
                                          0}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-xs">
                                    {format(
                                      new Date(submission.created_at),
                                      "MMM d, yyyy"
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleViewSubmission(submission.id)
                                    }
                                    className="flex-1"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      window.open(
                                        submission.youtube_url,
                                        "_blank"
                                      )
                                    }
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </CarouselItem>
                    )
                  )}
                </CarouselContent>
                {userVideo.videos.length > 3 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
