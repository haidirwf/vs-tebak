-- Rollback migration for 018_add_performance_indexes.sql
-- Use this only if 018 introduces unexpected query-planning issues.

DROP INDEX IF EXISTS public.idx_xp_logs_user_created_at;
DROP INDEX IF EXISTS public.idx_user_modules_user_status_completed_at;
DROP INDEX IF EXISTS public.idx_user_daily_quests_user_date;
DROP INDEX IF EXISTS public.idx_battles_waiting_lookup;
DROP INDEX IF EXISTS public.idx_battles_room_code_upper;

