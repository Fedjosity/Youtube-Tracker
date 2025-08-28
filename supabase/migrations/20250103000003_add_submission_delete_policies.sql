-- Add DELETE policies for submissions table
-- Users can delete their own submissions
CREATE POLICY "Users can delete own submissions"
  ON submissions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can delete any submission
CREATE POLICY "Admins can delete all submissions"
  ON submissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
