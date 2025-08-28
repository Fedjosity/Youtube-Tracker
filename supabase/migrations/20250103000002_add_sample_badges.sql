-- Add sample badges for the gamification system
INSERT INTO badges (name, description, threshold, icon, color) VALUES
  ('First Steps', 'Submit your first video', 1, '🎬', 'bronze'),
  ('Content Creator', 'Submit 5 videos', 5, '📹', 'silver'),
  ('Video Master', 'Submit 10 videos', 10, '🎥', 'gold'),
  ('Collaboration Expert', 'Submit 25 videos', 25, '🤝', 'platinum'),
  ('YouTube Legend', 'Submit 50 videos', 50, '🏆', 'diamond')
ON CONFLICT (name) DO NOTHING;
