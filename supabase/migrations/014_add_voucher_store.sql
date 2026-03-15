-- Voucher store: claim canteen vouchers when XP threshold is reached.
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS voucher_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  xp_cost INTEGER NOT NULL CHECK (xp_cost > 0),
  voucher_value INTEGER NOT NULL CHECK (voucher_value > 0),
  stock INTEGER CHECK (stock IS NULL OR stock >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voucher_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  voucher_id UUID NOT NULL REFERENCES voucher_catalog(id) ON DELETE RESTRICT,
  code TEXT UNIQUE NOT NULL,
  xp_spent INTEGER NOT NULL CHECK (xp_spent > 0),
  voucher_value INTEGER NOT NULL CHECK (voucher_value > 0),
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'redeemed', 'expired')),
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_user_created
  ON voucher_redemptions (user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_voucher_redemptions_user_voucher_unique
  ON voucher_redemptions (user_id, voucher_id);

ALTER TABLE voucher_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_redemptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'voucher_catalog' AND policyname = 'voucher_catalog_public_read'
  ) THEN
    CREATE POLICY voucher_catalog_public_read
      ON voucher_catalog
      FOR SELECT
      USING (is_active = true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'voucher_redemptions' AND policyname = 'voucher_redemptions_self_read'
  ) THEN
    CREATE POLICY voucher_redemptions_self_read
      ON voucher_redemptions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION generate_voucher_code(p_len INTEGER DEFAULT 10)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  output TEXT := '';
  idx INTEGER;
BEGIN
  IF p_len < 6 THEN
    p_len := 6;
  END IF;

  FOR idx IN 1..p_len LOOP
    output := output || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;

  RETURN output;
END;
$$;

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

  SELECT id, xp
  INTO v_profile
  FROM profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;

  SELECT id, name, xp_cost, voucher_value, stock
  INTO v_voucher
  FROM voucher_catalog
  WHERE id = p_voucher_id
    AND is_active = true
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

INSERT INTO voucher_catalog (name, description, xp_cost, voucher_value, stock, is_active) VALUES
  ('Voucher Kantin Rp5.000', 'Bisa dipakai untuk potongan belanja di kantin sekolah.', 300, 5000, NULL, true),
  ('Voucher Kantin Rp10.000', 'Bisa dipakai untuk potongan belanja di kantin sekolah.', 550, 10000, NULL, true),
  ('Voucher Kantin Rp15.000', 'Bisa dipakai untuk potongan belanja di kantin sekolah.', 800, 15000, NULL, true),
  ('Voucher Kantin Rp20.000', 'Bisa dipakai untuk potongan belanja di kantin sekolah.', 1000, 20000, NULL, true)
ON CONFLICT (name)
DO UPDATE SET
  description = EXCLUDED.description,
  xp_cost = EXCLUDED.xp_cost,
  voucher_value = EXCLUDED.voucher_value,
  stock = EXCLUDED.stock,
  is_active = EXCLUDED.is_active;
