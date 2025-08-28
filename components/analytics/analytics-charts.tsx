'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, addMonths } from 'date-fns';

export function AnalyticsCharts() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['analytics-charts'],
    queryFn: async () => {
      const { data: submissions } = await supabase
        .from('submissions')
        .select('created_at, published_at, youtube_view_count, status')
        .eq('status', 'published')
        .gte('published_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('published_at');

      if (!submissions) return [];

      const monthlyData: { [key: string]: { month: string; videos: number; views: number } } = {};

      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthStart = startOfMonth(addMonths(new Date(), -i));
        const monthKey = format(monthStart, 'yyyy-MM');
        monthlyData[monthKey] = {
          month: format(monthStart, 'MMM yyyy'),
          videos: 0,
          views: 0
        };
      }

      // Aggregate data by month
      submissions.forEach(submission => {
        if (submission.published_at) {
          const monthStart = startOfMonth(new Date(submission.published_at));
          const monthKey = format(monthStart, 'yyyy-MM');
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].videos += 1;
            monthlyData[monthKey].views += submission.youtube_view_count || 0;
          }
        }
      });

      return Object.values(monthlyData);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 bg-gray-200 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="videos" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Videos Published"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="views" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Total Views"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}