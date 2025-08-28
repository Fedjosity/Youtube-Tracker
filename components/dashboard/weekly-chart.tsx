'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, addWeeks } from 'date-fns';

export function WeeklyChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['weekly-chart'],
    queryFn: async () => {
      const { data: submissions } = await supabase
        .from('submissions')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at');

      if (!submissions) return [];

      const weeklyData: { [key: string]: { week: string; submissions: number; published: number } } = {};

      // Initialize last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const weekStart = startOfWeek(addWeeks(new Date(), -i));
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        weeklyData[weekKey] = {
          week: format(weekStart, 'MMM d'),
          submissions: 0,
          published: 0
        };
      }

      // Aggregate submissions by week
      submissions.forEach(submission => {
        const weekStart = startOfWeek(new Date(submission.created_at));
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        
        if (weeklyData[weekKey]) {
          weeklyData[weekKey].submissions += 1;
          if (submission.status === 'published') {
            weeklyData[weekKey].published += 1;
          }
        }
      });

      return Object.values(weeklyData);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 bg-gray-200 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="submissions" fill="#3B82F6" name="Total" />
              <Bar dataKey="published" fill="#10B981" name="Published" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}