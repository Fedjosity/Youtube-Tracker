export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'editor';
          total_submissions: number;
          total_published: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'editor';
          total_submissions?: number;
          total_published?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'editor';
          total_submissions?: number;
          total_published?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          youtube_url: string | null;
          drive_url: string | null;
          link_type: 'youtube' | 'drive';
          status: 'draft' | 'edited' | 'uploaded' | 'published' | 'rejected';
          youtube_video_id: string | null;
          youtube_title: string | null;
          youtube_description: string | null;
          youtube_thumbnail: string | null;
          youtube_published_at: string | null;
          youtube_view_count: number;
          youtube_like_count: number;
          youtube_comment_count: number;
          submitted_at: string;
          edited_at: string | null;
          uploaded_at: string | null;
          published_at: string | null;
          rejected_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          youtube_url?: string | null;
          drive_url?: string | null;
          link_type?: 'youtube' | 'drive';
          status?: 'draft' | 'edited' | 'uploaded' | 'published' | 'rejected';
          youtube_video_id?: string | null;
          youtube_title?: string | null;
          youtube_description?: string | null;
          youtube_thumbnail?: string | null;
          youtube_published_at?: string | null;
          youtube_view_count?: number;
          youtube_like_count?: number;
          youtube_comment_count?: number;
          submitted_at?: string;
          edited_at?: string | null;
          uploaded_at?: string | null;
          published_at?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          youtube_url?: string | null;
          drive_url?: string | null;
          link_type?: 'youtube' | 'drive';
          status?: 'draft' | 'edited' | 'uploaded' | 'published' | 'rejected';
          youtube_video_id?: string | null;
          youtube_title?: string | null;
          youtube_description?: string | null;
          youtube_thumbnail?: string | null;
          youtube_published_at?: string | null;
          youtube_view_count?: number;
          youtube_like_count?: number;
          youtube_comment_count?: number;
          submitted_at?: string;
          edited_at?: string | null;
          uploaded_at?: string | null;
          published_at?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          submission_id: string;
          user_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          user_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          user_id?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          threshold: number;
          icon: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          threshold: number;
          icon?: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          threshold?: number;
          icon?: string;
          color?: string;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string;
          old_values: any | null;
          new_values: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string;
          old_values?: any | null;
          new_values?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          target_type?: string;
          target_id?: string;
          old_values?: any | null;
          new_values?: any | null;
          created_at?: string;
        };
      };
    };
  };
}