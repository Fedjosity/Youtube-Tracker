"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function ContributionShare() {
  const { data: contributions, isLoading } = useQuery({
    queryKey: ["contribution-share"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, total_published")
        .gt("total_published", 0)
        .order("total_published", { ascending: false });

      return (
        data?.map((user, index) => ({
          name: user.full_name || user.email,
          value: user.total_published,
          color: `hsl(${(index * 137.508) % 360}, 70%, 50%)`, // Golden ratio for nice color distribution
        })) || []
      );
    },
  });

  const handleExportCSV = async () => {
    const response = await fetch("/api/export/csv?type=contributions");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "contributions.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Contribution Share</CardTitle>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 bg-gray-200 rounded animate-pulse" />
        ) : contributions?.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No published videos yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={contributions}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {contributions?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
