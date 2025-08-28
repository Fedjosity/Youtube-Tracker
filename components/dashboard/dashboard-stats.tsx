"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { FileText, CheckCircle, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Get total submissions count
      const { count: totalSubmissions } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true });

      // Get published submissions count
      const { count: totalPublished } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

      // Get active editors count
      const { count: activeEditors } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "editor");

      // Get weekly submissions count
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { count: weeklySubmissions } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo.toISOString());

      return {
        totalSubmissions: totalSubmissions || 0,
        totalPublished: totalPublished || 0,
        activeEditors: activeEditors || 0,
        weeklySubmissions: weeklySubmissions || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Total Submissions",
      value: stats?.totalSubmissions || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Published Videos",
      value: stats?.totalPublished || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Editors",
      value: stats?.activeEditors || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "This Week",
      value: stats?.weeklySubmissions || 0,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse" />
                ) : (
                  stat.value
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
