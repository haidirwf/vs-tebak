-- Allow safe daily quest generation from authenticated app flow.
-- 1) Prevent duplicate quest rows per day/type
-- 2) Allow authenticated insert only for "today"

CREATE UNIQUE INDEX IF NOT EXISTS daily_quests_date_type_unique
ON daily_quests (date, quest_type);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'daily_quests'
      AND policyname = 'daily_quests_auth_insert_today'
  ) THEN
    CREATE POLICY "daily_quests_auth_insert_today"
    ON daily_quests
    FOR INSERT
    WITH CHECK (
      auth.uid() IS NOT NULL
      AND date = CURRENT_DATE
    );
  END IF;
END
$$;
