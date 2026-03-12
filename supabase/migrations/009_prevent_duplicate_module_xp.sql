-- Prevent duplicate XP claims from completing the same module repeatedly.
ALTER TABLE user_modules
ADD COLUMN IF NOT EXISTS xp_granted_at TIMESTAMPTZ;

