"use client";

import { ChartContainer } from "@/components/ui/chart-container";
import { ChartTooltipContent } from "@/components/ui/chart-tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, startOfWeek, addWeeks } from "date-fns";

interface Submission {
  created_at: string;
  status: string;
}

export function WeeklyChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["weekly-chart"],
    queryFn: async () => {
      const { data: submissions } = await (supabase as any)
        .from("submissions")
        .select("created_at, status")
        .gte(
          "created_at",
          new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order("created_at");

      if (!submissions) return [];

      const weeklyData: {
        [key: string]: { week: string; submissions: number; published: number };
      } = {};

      // Initialize last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const weekStart = startOfWeek(addWeeks(new Date(), -i));
        const weekKey = format(weekStart, "yyyy-MM-dd");
        weeklyData[weekKey] = {
          week: format(weekStart, "MMM d"),
          submissions: 0,
          published: 0,
        };
      }

      // Aggregate submissions by week
      (submissions as Submission[]).forEach((submission) => {
        const weekStart = startOfWeek(new Date(submission.created_at));
        const weekKey = format(weekStart, "yyyy-MM-dd");

        if (weeklyData[weekKey]) {
          weeklyData[weekKey].submissions += 1;
          if (submission.status === "published") {
            weeklyData[weekKey].published += 1;
          }
        }
      });

      return Object.values(weeklyData);
    },
  });

  return (
    <ChartContainer
      title="Weekly Submissions"
      description="Track submission activity and publication rates"
    >
      {isLoading ? (
        <div className="h-80 bg-muted rounded animate-pulse" />
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="submissions"
                fill="hsl(var(--primary))"
                name="Total"
              />
              <Bar
                dataKey="published"
                fill="hsl(var(--success))"
                name="Published"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartContainer>
  );
}
