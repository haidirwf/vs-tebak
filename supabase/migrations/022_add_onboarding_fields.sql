-- supabase/migrations/022_add_onboarding_fields.sql
-- Add onboarding flags and streak goal configuration to profiles

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS has_completed_streak_onboarding BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS streak_goal_minutes INT DEFAULT 10;

COMMENT ON COLUMN profiles.has_completed_streak_onboarding IS 'Flag indicating if user completed the FTUE streak onboarding modal';
COMMENT ON COLUMN profiles.streak_goal_minutes IS 'User daily study goal target in minutes (e.g. 5, 10, or 15 minutes)';
