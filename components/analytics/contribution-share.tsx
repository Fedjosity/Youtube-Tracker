"use client";

import { ChartContainer } from "@/components/ui/chart-container";
import { ChartTooltipContent } from "@/components/ui/chart-tooltip";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Download } from "lucide-react";

interface User {
  full_name?: string;
  email: string;
  total_published: number;
}

export function ContributionShare() {
  const { data: contributions, isLoading } = useQuery({
    queryKey: ["contribution-share"],
    queryFn: async () => {
      const { data: users } = await (supabase as any)
        .from("profiles")
        .select("full_name, email, total_published")
        .gt("total_published", 0)
        .order("total_published", { ascending: false });

      if (!users) return [];

      const colors = [
        "hsl(var(--primary))",
        "hsl(var(--secondary))",
        "hsl(var(--accent))",
        "hsl(var(--destructive))",
        "hsl(var(--muted))",
        "hsl(var(--success))",
      ];

      return (users as User[]).map((user, index) => ({
        name: user.full_name || user.email.split("@")[0],
        value: user.total_published,
        color: colors[index % colors.length],
      }));
    },
  });

  const handleExportCSV = async () => {
    if (!contributions) return;

    const csvContent = [
      ["Name", "Published Videos"],
      ...contributions.map((item) => [item.name, item.value.toString()]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contribution-share.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <ChartContainer
      title="Contribution Share"
      description="Distribution of published videos across team members"
      className="relative"
    >
      <div className="absolute top-6 right-6">
        <Button onClick={handleExportCSV} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="h-80 bg-muted rounded animate-pulse" />
      ) : contributions?.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          No published videos yet
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={contributions}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="hsl(var(--primary))"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {contributions?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartContainer>
  );
}
