-- Boost one demo account so judges can see high-level stats immediately.
-- How to use:
-- 1) Replace v_email below with your demo account email.
-- 2) Run this in Supabase SQL Editor.
-- 3) Ensure you already created the auth user (via register page or dashboard).

DO $$
DECLARE
  v_email TEXT := 'akundemo@skillungo.com';
  v_user_id UUID;
BEGIN
  SELECT id
  INTO v_user_id
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user with email % was not found in auth.users', v_email;
  END IF;

  UPDATE profiles
  SET
    username = COALESCE(NULLIF(username, ''), 'Demo Champion'),
    full_name = 'Akun Demo Juri',
    school_name = 'SMK Demo Nusantara',
    city = 'Jakarta',
    avatar_class = 'warrior',
    level = 8,
    xp = 4200,
    xp_to_next_level = 2262,
    streak_count = 21,
    last_active = NOW()
  WHERE id = v_user_id;

  INSERT INTO user_badges (user_id, badge_id)
  SELECT v_user_id, b.id
  FROM badges b
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  INSERT INTO user_modules (
    user_id,
    module_id,
    status,
    progress_percent,
    completed_at,
    xp_granted_at
  )
  SELECT
    v_user_id,
    m.id,
    'completed',
    100,
    NOW(),
    NOW()
  FROM modules m
  ON CONFLICT (user_id, module_id) DO UPDATE
  SET
    status = 'completed',
    progress_percent = 100,
    completed_at = COALESCE(user_modules.completed_at, NOW()),
    xp_granted_at = COALESCE(user_modules.xp_granted_at, NOW());

  INSERT INTO xp_logs (user_id, xp_amount, reason, created_at)
  VALUES
    (v_user_id, 800, 'Demo boost: pencapaian awal', NOW() - INTERVAL '6 days'),
    (v_user_id, 1200, 'Demo boost: menyelesaikan batch modul', NOW() - INTERVAL '4 days'),
    (v_user_id, 900, 'Demo boost: battle streak', NOW() - INTERVAL '2 days')
  ON CONFLICT DO NOTHING;
END
$$;
