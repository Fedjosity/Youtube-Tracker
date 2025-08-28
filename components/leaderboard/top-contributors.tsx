'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export function TopContributors() {
  const { data: topContributors, isLoading } = useQuery({
    queryKey: ['top-contributors'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('total_published', { ascending: false })
        .limit(5);

      return data || [];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Contributors</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topContributors?.map((contributor, index) => (
              <motion.div
                key={contributor.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-lg font-bold text-gray-400 w-6">
                  #{index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={contributor.avatar_url} />
                  <AvatarFallback>
                    {contributor.full_name?.[0]?.toUpperCase() || contributor.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {contributor.full_name || contributor.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {contributor.total_published} published
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {contributor.total_submissions} total
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}