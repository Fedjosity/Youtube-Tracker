/*
  # Seed Initial Data

  1. Default Badges
    - Creates achievement badges for different submission milestones
    - Thresholds: 10, 50, 100 submissions

  2. Test Data
    - Sample profiles for development
    - Sample submissions for testing features
*/

-- Insert default badges
INSERT INTO badges (name, description, threshold, icon, color) VALUES
  ('First Steps', 'Submitted your first 10 videos', 10, '🎬', 'blue'),
  ('Rising Star', 'Reached 50 video submissions', 50, '⭐', 'purple'),
  ('Content Machine', 'Amazing! 100+ video submissions', 100, '🚀', 'gold')
ON CONFLICT (name) DO NOTHING;