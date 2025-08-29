"use client";

import { ChartContainer } from "@/components/ui/chart-container";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Eye, ThumbsUp, MessageCircle, Users } from "lucide-react";

interface Submission {
  youtube_view_count?: number;
  youtube_like_count?: number;
  youtube_comment_count?: number;
}

export function ChannelMetrics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["channel-metrics"],
    queryFn: async () => {
      const { data: submissions } = await (supabase as any)
        .from("submissions")
        .select("youtube_view_count, youtube_like_count, youtube_comment_count")
        .eq("status", "published");

      if (!submissions) return null;

      const totalViews = (submissions as Submission[]).reduce(
        (sum, s) => sum + (s.youtube_view_count || 0),
        0
      );
      const totalLikes = (submissions as Submission[]).reduce(
        (sum, s) => sum + (s.youtube_like_count || 0),
        0
      );
      const totalComments = (submissions as Submission[]).reduce(
        (sum, s) => sum + (s.youtube_comment_count || 0),
        0
      );
      const totalVideos = submissions.length;

      return {
        totalViews,
        totalLikes,
        totalComments,
        totalVideos,
      };
    },
  });

  const metricCards = [
    {
      title: "Total Views",
      value: metrics?.totalViews?.toLocaleString() || "0",
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Likes",
      value: metrics?.totalLikes?.toLocaleString() || "0",
      icon: ThumbsUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Comments",
      value: metrics?.totalComments?.toLocaleString() || "0",
      icon: MessageCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Published Videos",
      value: metrics?.totalVideos?.toString() || "0",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <ChartContainer
      title="Channel Overview"
      description="Key performance metrics for your YouTube channel"
    >
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {metricCards.map((metric) => (
            <div
              key={metric.title}
              className={`flex items-center space-x-3 p-4 rounded-lg ${metric.bgColor} border`}
            >
              <metric.icon className={`h-8 w-8 ${metric.color}`} />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartContainer>
  );
}
