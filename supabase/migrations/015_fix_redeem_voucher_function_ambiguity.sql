-- Fix ambiguity in redeem_voucher_xp() caused by output param names
-- overlapping with selected column names (e.g. voucher_value).

CREATE OR REPLACE FUNCTION redeem_voucher_xp(p_voucher_id UUID)
RETURNS TABLE (
  redemption_id UUID,
  code TEXT,
  new_xp INTEGER,
  xp_spent INTEGER,
  voucher_value INTEGER,
  voucher_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_voucher RECORD;
  v_redemption_id UUID;
  v_code TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  SELECT p.id, p.xp
  INTO v_profile
  FROM profiles AS p
  WHERE p.id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;

  SELECT vc.id, vc.name, vc.xp_cost, vc.voucher_value, vc.stock
  INTO v_voucher
  FROM voucher_catalog AS vc
  WHERE vc.id = p_voucher_id
    AND vc.is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'VOUCHER_NOT_FOUND';
  END IF;

  IF v_profile.xp < v_voucher.xp_cost THEN
    RAISE EXCEPTION 'XP_NOT_ENOUGH';
  END IF;

  IF v_voucher.stock IS NOT NULL AND v_voucher.stock <= 0 THEN
    RAISE EXCEPTION 'VOUCHER_OUT_OF_STOCK';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM voucher_redemptions vr
    WHERE vr.user_id = v_user_id
      AND vr.voucher_id = v_voucher.id
  ) THEN
    RAISE EXCEPTION 'ALREADY_CLAIMED';
  END IF;

  LOOP
    v_code := generate_voucher_code(10);
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM voucher_redemptions vr WHERE vr.code = v_code
    );
  END LOOP;

  IF v_voucher.stock IS NOT NULL THEN
    UPDATE voucher_catalog
    SET stock = stock - 1
    WHERE id = v_voucher.id;
  END IF;

  INSERT INTO voucher_redemptions (
    user_id, voucher_id, code, xp_spent, voucher_value, status
  )
  VALUES (
    v_user_id, v_voucher.id, v_code, v_voucher.xp_cost, v_voucher.voucher_value, 'issued'
  )
  RETURNING id INTO v_redemption_id;

  RETURN QUERY
  SELECT
    v_redemption_id,
    v_code,
    v_profile.xp::INTEGER,
    v_voucher.xp_cost::INTEGER,
    v_voucher.voucher_value::INTEGER,
    v_voucher.name::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION redeem_voucher_xp(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION redeem_voucher_xp(UUID) TO authenticated;
