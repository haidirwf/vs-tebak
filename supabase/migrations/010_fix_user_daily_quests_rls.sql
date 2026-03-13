-- Fix RLS policy on user_daily_quests to allow INSERT.
-- The original policy used FOR ALL with USING only, which blocks INSERT
-- because PostgreSQL requires WITH CHECK for INSERT operations.

-- Drop the old incomplete policy
DROP POLICY IF EXISTS "user_daily_quests_self" ON user_daily_quests;

-- Recreate with both USING (for SELECT/UPDATE/DELETE) and WITH CHECK (for INSERT/UPDATE)
CREATE POLICY "user_daily_quests_self"
  ON user_daily_quests
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also fix the same issue on user_modules and xp_logs
DROP POLICY IF EXISTS "user_modules_self" ON user_modules;
CREATE POLICY "user_modules_self"
  ON user_modules
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "xp_logs_self" ON xp_logs;
CREATE POLICY "xp_logs_self"
  ON xp_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

