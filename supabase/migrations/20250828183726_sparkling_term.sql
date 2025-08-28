/*
  # YouTube Collaboration Tracker Schema

  1. New Tables
    - `profiles` - User profiles with roles (admin/editor)
    - `submissions` - Video submissions with metadata and status tracking  
    - `comments` - Comments on submissions with threading support
    - `badges` - Achievement badge definitions with thresholds
    - `user_badges` - Junction table for user badge awards
    - `audit_logs` - Admin action tracking for compliance

  2. Security
    - Enable RLS on all tables
    - Policies for role-based access (admin vs editor)
    - Users can only modify their own submissions
    - Admin-only access to user management and review features

  3. Features
    - Status workflow tracking with timestamps
    - YouTube metadata storage (title, thumbnail, etc.)
    - Gamification system with automatic badge awards
    - Full audit trail for admin actions
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  total_submissions integer DEFAULT 0,
  total_published integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  youtube_url text,
  drive_url text,
  link_type text NOT NULL DEFAULT 'youtube' CHECK (link_type IN ('youtube', 'drive')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'edited', 'uploaded', 'published', 'rejected')),
  youtube_video_id text,
  youtube_title text,
  youtube_description text,
  youtube_thumbnail text,
  youtube_published_at timestamptz,
  youtube_view_count integer DEFAULT 0,
  youtube_like_count integer DEFAULT 0,
  youtube_comment_count integer DEFAULT 0,
  submitted_at timestamptz DEFAULT now(),
  edited_at timestamptz,
  uploaded_at timestamptz,
  published_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  threshold integer NOT NULL,
  icon text NOT NULL DEFAULT '🏆',
  color text NOT NULL DEFAULT 'gold',
  created_at timestamptz DEFAULT now()
);

-- User badges junction table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Submissions policies
CREATE POLICY "Users can read all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Comments policies
CREATE POLICY "Users can read all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Users can read all badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage badges"
  ON badges FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- User badges policies
CREATE POLICY "Users can read all user badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert user badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Audit logs policies
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update profile submission counts
CREATE OR REPLACE FUNCTION update_profile_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total submissions count
    UPDATE profiles 
    SET total_submissions = (
      SELECT COUNT(*) FROM submissions WHERE user_id = profiles.id
    ),
    total_published = (
      SELECT COUNT(*) FROM submissions WHERE user_id = profiles.id AND status = 'published'
    )
    WHERE id = COALESCE(NEW.user_id, OLD.user_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Add triggers for submission counts
CREATE TRIGGER update_submission_counts 
  AFTER INSERT OR UPDATE OR DELETE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_profile_counts();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_submission_id ON comments(submission_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);