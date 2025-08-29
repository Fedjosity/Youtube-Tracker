-- Fix profile insert policy to allow admins to preserve their role
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policy that allows users to insert their own profile
-- and allows admins to preserve their role
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create a function to safely upsert profiles without overwriting admin roles
CREATE OR REPLACE FUNCTION safe_profile_upsert(
  user_id uuid,
  user_email text,
  user_full_name text,
  user_avatar_url text
) RETURNS void AS $$
BEGIN
  -- Check if profile exists and has admin role
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  ) THEN
    -- Update existing admin profile without changing role
    UPDATE profiles 
    SET 
      email = user_email,
      full_name = user_full_name,
      avatar_url = user_avatar_url,
      updated_at = now()
    WHERE id = user_id;
  ELSE
    -- Insert new profile or update non-admin profile
    INSERT INTO profiles (id, email, full_name, avatar_url, role, created_at, updated_at)
    VALUES (user_id, user_email, user_full_name, user_avatar_url, 'editor', now(), now())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION safe_profile_upsert(uuid, text, text, text) TO authenticated;
