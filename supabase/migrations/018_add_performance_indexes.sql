-- Performance indexes for high-frequency dashboard and battle flows.

CREATE INDEX IF NOT EXISTS idx_xp_logs_user_created_at
ON public.xp_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_modules_user_status_completed_at
ON public.user_modules (user_id, status, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_daily_quests_user_date
ON public.user_daily_quests (user_id, date);

CREATE INDEX IF NOT EXISTS idx_battles_waiting_lookup
ON public.battles (status, player2_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_battles_room_code_upper
ON public.battles (upper(room_code));

