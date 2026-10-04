-- Migration 021: Reset Expired Streaks
-- Reset streak_count to 0 for users who missed 1 or more full calendar days without activity.
UPDATE public.profiles
SET streak_count = 0
WHERE streak_count > 0
  AND (
    last_active IS NULL
    OR last_active < (CURRENT_DATE - INTERVAL '1 day')
  );

-- Create a helper function / RPC to clean up expired streaks on demand or via cron
CREATE OR REPLACE FUNCTION public.reset_expired_streaks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.profiles
  SET streak_count = 0
  WHERE streak_count > 0
    AND (
      last_active IS NULL
      OR last_active < (CURRENT_DATE - INTERVAL '1 day')
    );
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

-- Grant permission to execute
GRANT EXECUTE ON FUNCTION public.reset_expired_streaks() TO authenticated, service_role, anon;
