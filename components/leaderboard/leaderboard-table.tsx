"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";

interface User {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  role: string;
  total_published: number;
  total_submissions: number;
  user_badges?: Array<{
    badges?: {
      name: string;
      icon: string;
      color: string;
    };
  }>;
}

export function LeaderboardTable() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select(
          `
          *,
          user_badges (
            badges (
              name,
              icon,
              color
            )
          )
        `
        )
        .order("total_published", { ascending: false });

      return (data || []) as User[];
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contributors Ranking</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Contributor</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Badges</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard?.map((user: User, index) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="w-16">
                    {getRankIcon(index + 1)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.full_name?.[0]?.toUpperCase() ||
                            user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.full_name || user.email}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-lg font-semibold text-green-600">
                      {user.total_published}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-lg font-semibold">
                      {user.total_submissions}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {user.user_badges
                        ?.slice(0, 3)
                        .map((userBadge, badgeIndex) => (
                          <Badge
                            key={badgeIndex}
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor:
                                userBadge.badges?.color || "#6B7280",
                            }}
                          >
                            {userBadge.badges?.icon || "🏆"}{" "}
                            {userBadge.badges?.name || "Badge"}
                          </Badge>
                        ))}
                      {user.user_badges && user.user_badges.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.user_badges.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
