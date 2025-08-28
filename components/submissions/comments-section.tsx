'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CommentsSectionProps {
  submissionId: string;
}

export function CommentsSection({ submissionId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', submissionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: true });

      return data || [];
    },
  });

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comments')
        .insert({
          submission_id: submissionId,
          user_id: user.id,
          content: newComment,
        });

      if (error) throw error;

      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', submissionId] });
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment */}
        <div className="space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || loading}
            size="sm"
          >
            {loading ? 'Adding...' : 'Add Comment'}
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : comments?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments?.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback>
                    {comment.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium">
                      {comment.profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}