-- Drop the existing trigger and function to recreate them
DROP TRIGGER IF EXISTS update_submission_counts ON submissions;
DROP FUNCTION IF EXISTS update_profile_counts();

-- Recreate the function with better logic
CREATE OR REPLACE FUNCTION update_profile_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles 
        SET 
            total_submissions = (
                SELECT COUNT(*) FROM submissions WHERE user_id = NEW.user_id
            ),
            total_published = (
                SELECT COUNT(*) FROM submissions WHERE user_id = NEW.user_id AND status = 'published'
            )
        WHERE id = NEW.user_id;
        RETURN NEW;
    END IF;

    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Update counts for the old user_id (if changed)
        IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
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

        -- Update counts for the new user_id
        UPDATE profiles 
        SET 
            total_submissions = (
                SELECT COUNT(*) FROM submissions WHERE user_id = NEW.user_id
            ),
            total_published = (
                SELECT COUNT(*) FROM submissions WHERE user_id = NEW.user_id AND status = 'published'
            )
        WHERE id = NEW.user_id;
        RETURN NEW;
    END IF;

    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        UPDATE profiles 
        SET 
            total_submissions = (
                SELECT COUNT(*) FROM submissions WHERE user_id = OLD.user_id
            ),
            total_published = (
                SELECT COUNT(*) FROM submissions WHERE user_id = OLD.user_id AND status = 'published'
            )
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_submission_counts 
    AFTER INSERT OR UPDATE OR DELETE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_profile_counts();

-- Add a function to manually recalculate all profile counts (for fixing existing data)
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
