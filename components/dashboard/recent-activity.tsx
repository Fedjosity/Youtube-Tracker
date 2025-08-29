"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Activity {
  id: string;
  title: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("submissions")
        .select(
          `
          id,
          title,
          status,
          created_at,
          profiles (
            full_name,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(8);

      return (data || []) as Activity[];
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities?.map((activity: Activity) => (
              <Link
                key={activity.id}
                href={`/submissions/${activity.id}`}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.profiles?.avatar_url} />
                  <AvatarFallback>
                    {activity.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Badge
                  className={getStatusColor(activity.status)}
                  variant="secondary"
                >
                  {activity.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
