-- Reset demo account to "fresh user" state (no boost).
-- How to use:
-- 1) Replace v_email below with your demo account email.
-- 2) Run this in Supabase SQL Editor.
-- 3) Ensure auth user already exists.

DO $$
DECLARE
  v_email TEXT := 'akundemo@skillungo.com';
  v_user_id UUID;
  v_level INTEGER := 0;
BEGIN
  SELECT id
  INTO v_user_id
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user with email % was not found in auth.users', v_email;
  END IF;

  -- If DB has constraint level >= 1, keep level at 1 to avoid SQL error.
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'profiles'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%level >= 1%'
  ) THEN
    v_level := 1;
  END IF;

  -- Wipe demo progress/history so it looks like a brand-new account.
  DELETE FROM voucher_redemptions WHERE user_id = v_user_id;
  DELETE FROM xp_logs WHERE user_id = v_user_id;
  DELETE FROM user_badges WHERE user_id = v_user_id;
  DELETE FROM user_daily_quests WHERE user_id = v_user_id;
  DELETE FROM user_modules WHERE user_id = v_user_id;
  DELETE FROM battles WHERE player1_id = v_user_id OR player2_id = v_user_id;

  UPDATE profiles
  SET
    username = 'BOT_JURI',
    full_name = 'Akun Bot Juri',
    school_name = NULL,
    city = NULL,
    avatar_class = 'warrior',
    level = v_level,
    xp = 0,
    xp_to_next_level = 100,
    streak_count = 0,
    last_active = NULL
  WHERE id = v_user_id;
END
$$;
