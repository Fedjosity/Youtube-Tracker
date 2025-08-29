-- Secure upsert for profiles that preserves admin and supports desired role
-- Drop old function if exists
DROP FUNCTION IF EXISTS safe_profile_upsert(uuid, text, text, text);

-- Create new function with SECURITY DEFINER to bypass RLS safely
CREATE OR REPLACE FUNCTION safe_profile_upsert(
  user_id uuid,
  user_email text,
  user_full_name text,
  user_avatar_url text,
  desired_role text DEFAULT NULL -- e.g., 'admin' to bootstrap
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_role text;
  final_role text;
BEGIN
  -- Read existing role if any
  SELECT role INTO existing_role FROM profiles WHERE id = user_id;

  -- Decide final role:
  -- 1) If existing admin, keep admin
  -- 2) Else if desired_role is provided (e.g., 'admin'), apply it
  -- 3) Else default to 'editor'
  IF existing_role = 'admin' THEN
    final_role := 'admin';
  ELSIF desired_role IS NOT NULL THEN
    final_role := desired_role;
  ELSE
    final_role := 'editor';
  END IF;

  -- Upsert profile
  INSERT INTO profiles (id, email, full_name, avatar_url, role, created_at, updated_at)
  VALUES (user_id, user_email, user_full_name, user_avatar_url, final_role, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    role = CASE
      WHEN profiles.role = 'admin' THEN profiles.role -- never downgrade admin
      WHEN EXCLUDED.role IS NOT NULL THEN EXCLUDED.role
      ELSE profiles.role
    END,
    updated_at = now();
END;
$$;

-- Allow authenticated users to call the function (used during OAuth callback)
GRANT EXECUTE ON FUNCTION safe_profile_upsert(uuid, text, text, text, text) TO authenticated;
