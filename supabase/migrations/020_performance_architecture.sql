-- ==============================================================================
-- 020_performance_architecture.sql
-- Optimasi Fundamental: RLS Indexing, Aggregation RPCs, Zero-Waterfall Data Fetching
-- ==============================================================================

-- 1. Indexing untuk seluruh Foreign Key dan Filter RLS (auth.uid() = user_id)
-- Mencegah Full Table Scan saat evaluasi policy RLS di PostgreSQL.

CREATE INDEX IF NOT EXISTS idx_user_modules_user_id 
  ON public.user_modules (user_id);

CREATE INDEX IF NOT EXISTS idx_user_modules_module_id 
  ON public.user_modules (module_id);

CREATE INDEX IF NOT EXISTS idx_user_modules_user_status 
  ON public.user_modules (user_id, status);

CREATE INDEX IF NOT EXISTS idx_xp_logs_user_created 
  ON public.xp_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_daily_quests_user_date 
  ON public.user_daily_quests (user_id, date);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id 
  ON public.user_badges (user_id);

CREATE INDEX IF NOT EXISTS idx_battles_player1_status 
  ON public.battles (player1_id, status);

CREATE INDEX IF NOT EXISTS idx_battles_player2_status 
  ON public.battles (player2_id, status);

CREATE INDEX IF NOT EXISTS idx_battles_winner_id 
  ON public.battles (winner_id);

CREATE INDEX IF NOT EXISTS idx_questions_module_id 
  ON public.questions (module_id);

CREATE INDEX IF NOT EXISTS idx_battle_questions_category_active 
  ON public.battle_questions (category) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_user_created 
  ON public.voucher_redemptions (user_id, created_at DESC);

-- 2. Stored Procedure: get_dashboard_summary (Aggregasi Total 1 Round-trip)
-- Mengambil quests, user_quests, 5 modul selesai terbaru, dan 10 xp_logs dalam 1 query.
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_user_id UUID, p_today DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Validasi akses: hanya user pemilik atau service_role
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  SELECT jsonb_build_object(
    'quests', COALESCE((
      SELECT jsonb_agg(q ORDER BY q.xp_reward DESC)
      FROM daily_quests q
      WHERE q.date = p_today
    ), '[]'::jsonb),
    'user_quests', COALESCE((
      SELECT jsonb_agg(uq)
      FROM user_daily_quests uq
      WHERE uq.user_id = p_user_id AND uq.date = p_today
    ), '[]'::jsonb),
    'completed_modules', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'completed_at', um.completed_at,
        'modules', jsonb_build_object('title', m.title, 'category', m.category, 'xp_reward', m.xp_reward)
      ))
      FROM user_modules um
      JOIN modules m ON m.id = um.module_id
      WHERE um.user_id = p_user_id AND um.status = 'completed'
      ORDER BY um.completed_at DESC NULLS LAST
      LIMIT 5
    ), '[]'::jsonb),
    'xp_logs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'xp_amount', xl.xp_amount,
        'reason', xl.reason,
        'created_at', xl.created_at
      ))
      FROM (
        SELECT xp_amount, reason, created_at
        FROM xp_logs
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 10
      ) xl
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_dashboard_summary(UUID, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary(UUID, DATE) TO authenticated;

-- 3. Stored Procedure: get_school_rankings (Aggregasi Peringkat Sekolah di Database)
CREATE OR REPLACE FUNCTION public.get_school_rankings(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  school TEXT,
  city TEXT,
  totalXp BIGINT,
  members BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(NULLIF(school_name, ''), 'Sekolah Indonesia') AS school,
    COALESCE(NULLIF(city, ''), 'Indonesia') AS city,
    COALESCE(SUM(xp), 0)::BIGINT AS totalXp,
    COUNT(id)::BIGINT AS members
  FROM profiles
  GROUP BY 1, 2
  ORDER BY totalXp DESC
  LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION public.get_school_rankings(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_school_rankings(INTEGER) TO authenticated;
