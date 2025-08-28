-- Completely remove the old trigger and function
DROP TRIGGER IF EXISTS update_submission_counts ON submissions;
DROP FUNCTION IF EXISTS update_profile_counts();

-- Create a new, more robust function
CREATE OR REPLACE FUNCTION update_profile_counts()
RETURNS TRIGGER AS $$
DECLARE
    affected_user_id uuid;
BEGIN
    -- Determine which user_id to update based on the operation
    IF TG_OP = 'INSERT' THEN
        affected_user_id := NEW.user_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If user_id changed, update both old and new user
        IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
            -- Update old user's counts
            UPDATE profiles 
            SET 
                total_submissions = (
                    SELECT COUNT(*) FROM submissions WHERE user_id = OLD.user_id
                ),
                total_published = (
                    SELECT COUNT(*) FROM submissions WHERE user_id = OLD.user_id AND status = 'published'
                )
            WHERE id = OLD.user_id;
        END IF;
        affected_user_id := NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        affected_user_id := OLD.user_id;
    ELSE
        RETURN NULL;
    END IF;

    -- Update the affected user's counts
    UPDATE profiles 
    SET 
        total_submissions = (
            SELECT COUNT(*) FROM submissions WHERE user_id = affected_user_id
        ),
        total_published = (
            SELECT COUNT(*) FROM submissions WHERE user_id = affected_user_id AND status = 'published'
        )
    WHERE id = affected_user_id;

    -- Return appropriate value based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the new trigger
CREATE TRIGGER update_submission_counts 
    AFTER INSERT OR UPDATE OR DELETE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_profile_counts();

-- Create a function to manually recalculate all profile counts
CREATE OR REPLACE FUNCTION recalculate_all_profile_counts()
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET 
        total_submissions = (
            SELECT COUNT(*) FROM submissions WHERE user_id = profiles.id
        ),
        total_published = (
            SELECT COUNT(*) FROM submissions WHERE user_id = profiles.id AND status = 'published'
        );
END;
$$ LANGUAGE plpgsql;

-- Create a function to recalculate counts for a specific user
CREATE OR REPLACE FUNCTION recalculate_user_profile_counts(user_uuid uuid)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET 
        total_submissions = (
            SELECT COUNT(*) FROM submissions WHERE user_id = user_uuid
        ),
        total_published = (
            SELECT COUNT(*) FROM submissions WHERE user_id = user_uuid AND status = 'published'
        )
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;
