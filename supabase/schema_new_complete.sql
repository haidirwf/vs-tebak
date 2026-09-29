-- ==============================================================================
-- SKILLUNGO COMPLETE DATABASE SCHEMA & SEED (SINGLE FILE CONSOLIDATED)
-- Platform: Supabase (PostgreSQL 15+)
-- Cara Pakai:
-- 1. Buat project baru di Supabase Dashboard (https://supabase.com).
-- 2. Buka menu "SQL Editor" -> "New query".
-- 3. Copy-paste seluruh isi file ini, lalu klik "Run".
-- ==============================================================================

-- Aktifkan ekstensi UUID dan crypto jika belum aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABEL UTAMA
-- ==============================================================================

-- 1.1 Profiles (Terhubung ke auth.users Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  school_name TEXT,
  city TEXT,
  avatar_class TEXT DEFAULT 'warrior' CHECK (avatar_class IN ('warrior', 'mage', 'archer', 'healer')),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100,
  streak_count INTEGER DEFAULT 0,
  last_active DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Modules (Modul Pembelajaran)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('coding', 'design', 'productivity', 'business')),
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  xp_reward INTEGER DEFAULT 50,
  duration_minutes INTEGER,
  thumbnail_url TEXT,
  content JSONB,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 User Modules (Progres Modul Siswa)
CREATE TABLE IF NOT EXISTS public.user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  xp_granted_at TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

-- 1.4 Questions (Bank Soal Kuis per Modul)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INTEGER NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  explanation TEXT
);

-- 1.5 Standalone Battle Questions (Bank Soal PvP 1v1)
CREATE TABLE IF NOT EXISTS public.battle_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('coding', 'design', 'productivity', 'business', 'general')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INTEGER NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  explanation TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, question_text)
);

-- 1.6 Battles (Room PvP Kuis 1v1 Real-time)
CREATE TABLE IF NOT EXISTS public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  player1_id UUID REFERENCES public.profiles(id),
  player2_id UUID REFERENCES public.profiles(id),
  player1_ready BOOLEAN NOT NULL DEFAULT FALSE,
  player2_ready BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES public.profiles(id),
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 Daily Quests (Misi Harian)
CREATE TABLE IF NOT EXISTS public.daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT CHECK (quest_type IN ('complete_module', 'win_battle', 'maintain_streak', 'earn_xp')),
  target_value INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 30,
  date DATE DEFAULT CURRENT_DATE
);
CREATE UNIQUE INDEX IF NOT EXISTS daily_quests_date_type_unique ON public.daily_quests (date, quest_type);

-- 1.8 User Daily Quests (Progres Misi Siswa)
CREATE TABLE IF NOT EXISTS public.user_daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES public.daily_quests(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, quest_id, date)
);

-- 1.9 Badges (Lencana Prestasi)
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  condition_type TEXT CHECK (condition_type IN ('level', 'streak', 'battles_won', 'modules_completed')),
  condition_value INTEGER
);

-- 1.10 User Badges (Lencana yang Dimiliki Siswa)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 1.11 XP Logs (Riwayat Perolehan XP)
CREATE TABLE IF NOT EXISTS public.xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.12 Voucher Store (Katalog Voucher Kantin)
CREATE TABLE IF NOT EXISTS public.voucher_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  xp_cost INTEGER NOT NULL CHECK (xp_cost > 0),
  voucher_value INTEGER NOT NULL CHECK (voucher_value > 0),
  stock INTEGER CHECK (stock IS NULL OR stock >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.13 Voucher Redemptions (Penukaran Voucher Siswa)
CREATE TABLE IF NOT EXISTS public.voucher_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  voucher_id UUID NOT NULL REFERENCES public.voucher_catalog(id) ON DELETE RESTRICT,
  code TEXT UNIQUE NOT NULL,
  xp_spent INTEGER NOT NULL CHECK (xp_spent > 0),
  voucher_value INTEGER NOT NULL CHECK (voucher_value > 0),
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'redeemed', 'expired')),
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_user_created ON public.voucher_redemptions (user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_voucher_redemptions_user_voucher_unique ON public.voucher_redemptions (user_id, voucher_id);

-- ==============================================================================
-- 2. INDEX OPTIMASI PERFORMA TINGGI (SPA INSTANT QUERY)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_xp_desc ON public.profiles (xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_streak_desc ON public.profiles (streak_count DESC);
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_created_at ON public.xp_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_modules_user_status_completed_at ON public.user_modules (user_id, status, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_daily_quests_user_date ON public.user_daily_quests (user_id, date);
CREATE INDEX IF NOT EXISTS idx_battles_waiting_lookup ON public.battles (status, player2_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battles_room_code_upper ON public.battles (upper(room_code));

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_redemptions ENABLE ROW LEVEL SECURITY;

-- 3.1 Profiles Policies
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3.2 Modules Policies
DROP POLICY IF EXISTS "modules_public_read" ON public.modules;
CREATE POLICY "modules_public_read" ON public.modules FOR SELECT USING (is_published = true);

-- 3.3 Questions Policies
DROP POLICY IF EXISTS "questions_public_read" ON public.questions;
CREATE POLICY "questions_public_read" ON public.questions FOR SELECT USING (true);

-- 3.4 Battle Questions Policies
DROP POLICY IF EXISTS "battle_questions_public_read" ON public.battle_questions;
CREATE POLICY "battle_questions_public_read" ON public.battle_questions FOR SELECT USING (is_active = true);

-- 3.5 User Modules Policies
DROP POLICY IF EXISTS "user_modules_self" ON public.user_modules;
CREATE POLICY "user_modules_self" ON public.user_modules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3.6 Battles Policies
DROP POLICY IF EXISTS "battles_read" ON public.battles;
CREATE POLICY "battles_read" ON public.battles FOR SELECT USING (true);

DROP POLICY IF EXISTS "battles_insert" ON public.battles;
CREATE POLICY "battles_insert" ON public.battles FOR INSERT WITH CHECK (auth.uid() = player1_id);

DROP POLICY IF EXISTS "battles_update" ON public.battles;
CREATE POLICY "battles_update" ON public.battles FOR UPDATE
USING (
  auth.uid() = player1_id
  OR auth.uid() = player2_id
  OR (status = 'waiting' AND player2_id IS NULL)
)
WITH CHECK (
  auth.uid() = player1_id
  OR auth.uid() = player2_id
  OR (
    auth.uid() = player2_id
    AND status = 'active'
    AND player1_ready = false
    AND player2_ready = false
    AND winner_id IS NULL
    AND player1_score = 0
    AND player2_score = 0
  )
);

DROP POLICY IF EXISTS "battles_delete" ON public.battles;
CREATE POLICY "battles_delete" ON public.battles FOR DELETE USING (auth.uid() = player1_id);

-- 3.7 Daily Quests Policies
DROP POLICY IF EXISTS "daily_quests_public_read" ON public.daily_quests;
CREATE POLICY "daily_quests_public_read" ON public.daily_quests FOR SELECT USING (true);

DROP POLICY IF EXISTS "daily_quests_auth_insert_today" ON public.daily_quests;
CREATE POLICY "daily_quests_auth_insert_today" ON public.daily_quests FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND date = CURRENT_DATE
  AND xp_reward BETWEEN 10 AND 100
  AND quest_type IN ('complete_module', 'win_battle', 'maintain_streak', 'earn_xp')
);

-- 3.8 User Daily Quests Policies
DROP POLICY IF EXISTS "user_daily_quests_self" ON public.user_daily_quests;
CREATE POLICY "user_daily_quests_self" ON public.user_daily_quests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3.9 Badges & User Badges Policies
DROP POLICY IF EXISTS "badges_public_read" ON public.badges;
CREATE POLICY "badges_public_read" ON public.badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_badges_read" ON public.user_badges;
CREATE POLICY "user_badges_read" ON public.user_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_badges_insert" ON public.user_badges;
CREATE POLICY "user_badges_insert" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3.10 XP Logs Policies (Immutable audit trail: Read and insert allowed, no manual edit/delete)
DROP POLICY IF EXISTS "xp_logs_self" ON public.xp_logs;
DROP POLICY IF EXISTS "xp_logs_self_read" ON public.xp_logs;
CREATE POLICY "xp_logs_self_read" ON public.xp_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "xp_logs_self_insert" ON public.xp_logs;
CREATE POLICY "xp_logs_self_insert" ON public.xp_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3.11 Voucher Policies
DROP POLICY IF EXISTS "voucher_catalog_public_read" ON public.voucher_catalog;
CREATE POLICY "voucher_catalog_public_read" ON public.voucher_catalog FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "voucher_redemptions_self_read" ON public.voucher_redemptions;
CREATE POLICY "voucher_redemptions_self_read" ON public.voucher_redemptions FOR SELECT USING (auth.uid() = user_id);

-- ==============================================================================
-- 4. REALTIME PUBLICATION SETUP
-- ==============================================================================
-- Memastikan tabel battles bisa disimak perubahannya via Supabase Realtime WebSocket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'battles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.battles;
  END IF;
END
$$;

-- ==============================================================================
-- 5. STORED PROCEDURES & FUNCTIONS
-- ==============================================================================

-- Otomatis buat profil saat user mendaftar di auth.users (mencegah profil kosong)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    school_name,
    city,
    avatar_class
  )
  VALUES (
    new.id,
    COALESCE(NULLIF(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1), 'hero_' || substr(new.id::text, 1, 5)),
    COALESCE(NULLIF(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    COALESCE(NULLIF(new.raw_user_meta_data->>'school_name', ''), 'Sekolah Indonesia'),
    COALESCE(NULLIF(new.raw_user_meta_data->>'city', ''), 'Indonesia'),
    COALESCE(NULLIF(new.raw_user_meta_data->>'avatar_class', ''), 'warrior')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper pembuat kode voucher unik
CREATE OR REPLACE FUNCTION public.generate_voucher_code(p_len INTEGER DEFAULT 10)
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

-- Fungsi transaksi atomik penukaran voucher dengan XP
CREATE OR REPLACE FUNCTION public.redeem_voucher_xp(p_voucher_id UUID)
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

  -- Potong XP user secara atomik
  UPDATE public.profiles
  SET xp = xp - v_voucher.xp_cost
  WHERE id = v_user_id;

  -- Catat log pengurangan XP ke tabel audit xp_logs
  INSERT INTO public.xp_logs (user_id, xp_amount, reason)
  VALUES (v_user_id, -v_voucher.xp_cost, 'Tukar voucher: ' || v_voucher.name);

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
    (v_profile.xp - v_voucher.xp_cost)::INTEGER,
    v_voucher.xp_cost::INTEGER,
    v_voucher.voucher_value::INTEGER,
    v_voucher.name::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_voucher_xp(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_voucher_xp(UUID) TO authenticated;

-- ==============================================================================
-- 6. SEED DATA LENGKAP (MASTER DATA)
-- ==============================================================================

-- 6.1 Seed Badges (9 Lencana RPG)
INSERT INTO public.badges (name, description, icon_url, condition_type, condition_value) VALUES
  ('Pemula', 'Selesaikan modul pertamamu', '📚', 'modules_completed', 1),
  ('Pelajar Aktif', 'Selesaikan 5 modul', '🎓', 'modules_completed', 5),
  ('Master Modul', 'Selesaikan 10 modul', '🏆', 'modules_completed', 10),
  ('Level 5', 'Capai level 5', '⭐', 'level', 5),
  ('Level 10', 'Capai level 10', '🌟', 'level', 10),
  ('Streak Seminggu', 'Streak 7 hari berturut-turut', '🔥', 'streak', 7),
  ('Streak Sebulan', 'Streak 30 hari berturut-turut', '💎', 'streak', 30),
  ('Petarung', 'Menangkan 1 battle', '⚔️', 'battles_won', 1),
  ('Jawara Battle', 'Menangkan 10 battle', '🏅', 'battles_won', 10)
ON CONFLICT DO NOTHING;

-- 6.2 Seed Voucher Store (4 Pilihan Voucher Kantin)
INSERT INTO public.voucher_catalog (name, description, xp_cost, voucher_value, stock, is_active) VALUES
  ('Voucher Kantin Rp5.000', 'Bisa dipakai untuk potongan belanja di kantin sekolah.', 300, 5000, NULL, true),
  ('Voucher Kantin Rp10.000', 'Bisa dipakai untuk potongan belanja di kantin sekolah.', 550, 10000, NULL, true),
  ('Voucher Kantin Rp15.000', 'Bisa dipakai untuk potongan belanja di kantin sekolah.', 800, 15000, NULL, true),
  ('Voucher Kantin Rp20.000', 'Bisa dipakai untuk potongan belanja di kantin sekolah.', 1000, 20000, NULL, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  xp_cost = EXCLUDED.xp_cost,
  voucher_value = EXCLUDED.voucher_value,
  stock = EXCLUDED.stock,
  is_active = EXCLUDED.is_active;

-- 6.3 Seed Daily Quests Hari Ini
INSERT INTO public.daily_quests (title, description, quest_type, target_value, xp_reward, date) VALUES
  ('Pelajar Rajin', 'Selesaikan 1 chapter modul hari ini', 'complete_module', 1, 30, CURRENT_DATE),
  ('Petarung Sejati', 'Menangkan 1 battle quiz', 'win_battle', 1, 40, CURRENT_DATE),
  ('Konsisten', 'Pertahankan streak 3 hari berturut-turut', 'maintain_streak', 3, 50, CURRENT_DATE),
  ('XP Hunter', 'Kumpulkan 100 XP hari ini', 'earn_xp', 100, 35, CURRENT_DATE)
ON CONFLICT (date, quest_type) DO NOTHING;

-- 6.4 Seed 20+ Modul Belajar Digital Beragam Kategori
INSERT INTO public.modules (slug, title, description, category, difficulty, xp_reward, duration_minutes, content) VALUES
  (
    'html-css-dasar',
    'HTML & CSS Dasar',
    'Pelajari fondasi web development dengan HTML dan CSS. Dari struktur dasar hingga styling yang menarik.',
    'coding', 'beginner', 50, 45,
    '[
      {"id":"1","title":"Pengenalan HTML dan CSS","type":"text","content":"HTML dipakai untuk struktur halaman, CSS dipakai untuk tampilan. Di materi ini kamu akan memahami elemen dasar untuk membangun halaman web."},
      {"id":"2","title":"Video: Dasar HTML & CSS","type":"video","content":"https://www.youtube.com/watch?v=3U1AhjEf7DM"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Setelah menonton video, pastikan kamu paham struktur dokumen HTML, selector CSS, dan cara mengatur layout sederhana."}
    ]'::jsonb
  ),
  (
    'javascript-pemula',
    'JavaScript untuk Pemula',
    'Mulai programming dengan JavaScript. Variabel, fungsi, kondisi, dan manipulasi DOM.',
    'coding', 'beginner', 75, 60,
    '[
      {"id":"1","title":"Konsep Dasar JavaScript","type":"text","content":"JavaScript membuat halaman web menjadi interaktif. Kamu akan belajar variabel, kondisi, dan fungsi sebagai fondasi."},
      {"id":"2","title":"Video: JavaScript Pemula","type":"video","content":"https://www.youtube.com/watch?v=mD6uSGSjgr4"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Fokuskan pemahaman ke alur logika program, cara menyimpan nilai, dan cara menjalankan fungsi."}
    ]'::jsonb
  ),
  (
    'react-dasar-komponen',
    'React Dasar: Komponen & State',
    'Pahami konsep komponen, props, dan state untuk membangun UI interaktif dengan React.',
    'coding', 'beginner', 70, 55,
    '[
      {"id":"1","title":"Komponen dan State di React","type":"text","content":"React membangun UI dari komponen. State dipakai saat data berubah karena aksi user."},
      {"id":"2","title":"Video: React Komponen & State","type":"video","content":"https://www.youtube.com/watch?v=kcnwI_5nKyA"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Pastikan kamu paham kapan pakai props, kapan pakai state, dan bagaimana alur data antar komponen."}
    ]'::jsonb
  ),
  (
    'git-github-kolaborasi',
    'Git & GitHub untuk Kolaborasi',
    'Belajar workflow tim: commit rapi, branch, pull request, dan code review.',
    'coding', 'beginner', 60, 45,
    '[
      {"id":"1","title":"Dasar Version Control","type":"text","content":"Git mencatat riwayat perubahan kode. Ini memudahkan rollback dan kolaborasi tim tanpa saling menimpa."},
      {"id":"2","title":"Branching Strategy","type":"text","content":"Gunakan branch terpisah untuk tiap fitur atau bugfix. Hindari kerja langsung di branch utama."},
      {"id":"3","title":"Pull Request","type":"text","content":"Pull request dipakai untuk review sebelum merge. Jelaskan perubahan, dampak, dan langkah testing agar review cepat."}
    ]'::jsonb
  ),
  (
    'typescript-dasar',
    'TypeScript Dasar',
    'Kuasai pengetikan kode yang aman dan minim bug di proyek modern.',
    'coding', 'beginner', 70, 55,
    '[
      {"id":"1","title":"Kenapa TypeScript","type":"text","content":"TypeScript membantu mendeteksi error lebih cepat lewat type checking, terutama di project yang makin besar."},
      {"id":"2","title":"Video: TypeScript Dasar","type":"video","content":"https://www.youtube.com/watch?v=nFwmB1_iQ7A&t=216s"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Fokus ke tipe data, interface, dan fungsi bertipe agar kode lebih aman dan mudah dirawat."}
    ]'::jsonb
  ),
  (
    'nextjs-fundamental',
    'Next.js Fundamental',
    'Pahami routing, rendering, dan struktur project Next.js.',
    'coding', 'intermediate', 85, 65,
    '[
      {"id":"1","title":"Konsep App Router","type":"text","content":"App Router memudahkan pembagian route dan layout secara modular untuk aplikasi modern."},
      {"id":"2","title":"Video: Next.js Fundamental","type":"video","content":"https://www.youtube.com/watch?v=WyTIjLegirE"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Pelajari kapan pakai server component, client component, dan cara menyusun folder route."}
    ]'::jsonb
  ),
  (
    'sql-dasar-pemula',
    'SQL Dasar untuk Pemula',
    'Belajar query inti untuk membaca dan mengelola data.',
    'coding', 'beginner', 65, 50,
    '[
      {"id":"1","title":"SELECT dan WHERE","type":"text","content":"SELECT mengambil data, WHERE memfilter hasil berdasarkan kondisi tertentu."},
      {"id":"2","title":"Video: SQL Dasar","type":"video","content":"https://www.youtube.com/watch?v=kbKty5ZVKMY"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Prioritaskan pemahaman query dasar sebelum lanjut ke join dan agregasi yang lebih kompleks."}
    ]'::jsonb
  ),
  (
    'api-design-rest',
    'REST API Design Dasar',
    'Rancang API yang konsisten, mudah dipakai, dan mudah dipelihara.',
    'coding', 'intermediate', 80, 60,
    '[
      {"id":"1","title":"Resource dan Endpoint","type":"text","content":"Tentukan resource utama lalu turunkan endpoint yang merepresentasikan aksi CRUD."},
      {"id":"2","title":"Video: REST API Design","type":"video","content":"https://www.youtube.com/watch?v=FOHJQwst1uw"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Pastikan standar status code, naming endpoint, dan struktur response konsisten."}
    ]'::jsonb
  ),
  (
    'figma-ui-dasar',
    'Desain UI dengan Figma',
    'Belajar desain antarmuka profesional menggunakan Figma. Dari wireframe hingga prototype interaktif.',
    'design', 'beginner', 50, 40,
    '[
      {"id":"1","title":"Dasar Figma untuk UI","type":"text","content":"Figma digunakan untuk desain antarmuka. Materi ini membahas frame, komponen, dan konsistensi visual."},
      {"id":"2","title":"Video: Figma UI Dasar","type":"video","content":"https://www.youtube.com/watch?v=AmDKFOXD_Jg"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Setelah sesi video, kamu seharusnya paham struktur file desain dan reusable component."}
    ]'::jsonb
  ),
  (
    'design-system-dasar',
    'Design System Dasar',
    'Bangun konsistensi visual lewat token warna, tipografi, dan komponen reusable.',
    'design', 'intermediate', 75, 60,
    '[
      {"id":"1","title":"Kenapa Design System","type":"text","content":"Design system mempercepat desain dan dev karena pola komponen sudah jelas serta konsisten."},
      {"id":"2","title":"Design Tokens","type":"text","content":"Token adalah nilai dasar seperti warna, spacing, radius, dan typography yang dipakai lintas produk."},
      {"id":"3","title":"Komponen Reusable","type":"text","content":"Dokumentasikan komponen utama seperti button, input, card, dan states-nya agar tim punya acuan yang sama."}
    ]'::jsonb
  ),
  (
    'ux-research-pemula',
    'UX Research untuk Pemula',
    'Kuasai riset pengguna dasar agar solusi yang dibuat benar-benar relevan.',
    'design', 'beginner', 65, 50,
    '[
      {"id":"1","title":"Menentukan Tujuan Riset","type":"text","content":"Mulai dari pertanyaan riset yang spesifik: masalah apa, untuk siapa, dan keputusan apa yang ingin diambil."},
      {"id":"2","title":"Metode Interview","type":"text","content":"Gunakan pertanyaan terbuka, gali konteks perilaku pengguna, lalu catat pain point yang berulang."},
      {"id":"3","title":"Sintesis Insight","type":"text","content":"Kelompokkan temuan menjadi tema. Prioritaskan insight yang berdampak langsung pada perbaikan produk."}
    ]'::jsonb
  ),
  (
    'color-theory-ui',
    'Color Theory untuk UI',
    'Terapkan teori warna agar antarmuka lebih jelas dan nyaman dipakai.',
    'design', 'intermediate', 75, 55,
    '[
      {"id":"1","title":"Kontras dan Hirarki","type":"text","content":"Kontras yang tepat membantu pengguna membedakan elemen penting dan elemen sekunder."},
      {"id":"2","title":"Video: Color Theory UI","type":"video","content":"https://www.youtube.com/watch?v=-4lMJ4is2pE"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Gunakan palet utama, netral, dan status color yang konsisten di seluruh halaman."}
    ]'::jsonb
  ),
  (
    'manajemen-waktu',
    'Manajemen Waktu Pelajar',
    'Teknik time management terbukti untuk pelajar SMK/SMA.',
    'productivity', 'beginner', 35, 25,
    '[
      {"id":"1","title":"Prinsip Manajemen Waktu","type":"text","content":"Belajar efektif dimulai dari prioritas, durasi fokus, dan evaluasi rutin. Gunakan prinsip sederhana agar konsisten."},
      {"id":"2","title":"Video: Manajemen Waktu Pelajar","type":"video","content":"https://www.youtube.com/watch?v=SUaBkTgpKHU"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Gunakan teknik yang cocok buat ritme harian kamu, lalu evaluasi mingguan untuk melihat progres."}
    ]'::jsonb
  ),
  (
    'fokus-deep-work',
    'Deep Work & Fokus Belajar',
    'Tingkatkan fokus belajar dengan teknik deep work, blocking distraksi, dan evaluasi harian.',
    'productivity', 'intermediate', 55, 40,
    '[
      {"id":"1","title":"Prinsip Deep Work","type":"text","content":"Deep work adalah sesi fokus tanpa gangguan untuk pekerjaan bernilai tinggi. Kualitas lebih penting dari lama waktu."},
      {"id":"2","title":"Menata Lingkungan Fokus","type":"text","content":"Matikan notifikasi, siapkan target sesi, dan gunakan durasi kerja yang realistis agar ritme stabil."},
      {"id":"3","title":"Review Harian","type":"text","content":"Tutup hari dengan evaluasi singkat: apa yang selesai, apa penghambat, dan apa prioritas besok."}
    ]'::jsonb
  ),
  (
    'pomodoro-efektif',
    'Teknik Pomodoro Efektif',
    'Gunakan Pomodoro secara tepat untuk menjaga fokus dan energi.',
    'productivity', 'beginner', 55, 35,
    '[
      {"id":"1","title":"Aturan Dasar Pomodoro","type":"text","content":"Satu siklus terdiri dari sesi fokus pendek lalu istirahat singkat agar ritme tetap stabil."},
      {"id":"2","title":"Video: Pomodoro","type":"video","content":"https://www.youtube.com/watch?v=TsYYyo_rMd4"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Sesuaikan durasi dengan jenis tugas, lalu evaluasi hasil per sesi."}
    ]'::jsonb
  ),
  (
    'personal-branding-digital',
    'Personal Branding di Dunia Digital',
    'Bangun citra profesional lewat portofolio, konten, dan komunikasi online yang konsisten.',
    'business', 'intermediate', 70, 55,
    '[
      {"id":"1","title":"Nilai Diri Utama","type":"text","content":"Tentukan posisi unikmu: skill inti, topik yang dikuasai, dan audiens yang ingin kamu bantu."},
      {"id":"2","title":"Portofolio Efektif","type":"text","content":"Tampilkan proyek terbaik lengkap dengan masalah, proses, dan hasil agar lebih meyakinkan."},
      {"id":"3","title":"Konsistensi Konten","type":"text","content":"Publikasikan insight rutin dengan gaya komunikasi yang sama supaya mudah dikenali."}
    ]'::jsonb
  ),
  (
    'negosiasi-dasar',
    'Negosiasi Dasar untuk Pemula',
    'Pelajari teknik negosiasi praktis untuk kerja tim, organisasi, dan proyek.',
    'business', 'beginner', 55, 40,
    '[
      {"id":"1","title":"Dasar Negosiasi","type":"text","content":"Negosiasi dimulai dari persiapan tujuan, batas minimum, dan memahami kebutuhan lawan bicara."},
      {"id":"2","title":"Video: Negosiasi Pemula","type":"video","content":"https://www.youtube.com/watch?v=Q6t3tkAIfZk"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Prinsip utama negosiasi adalah win-win, komunikasi jelas, dan kesepakatan yang terdokumentasi."}
    ]'::jsonb
  ),
  (
    'fundamental-marketing',
    'Fundamental Digital Marketing',
    'Pahami funnel, channel, dan metrik inti pemasaran digital.',
    'business', 'intermediate', 80, 60,
    '[
      {"id":"1","title":"Marketing Funnel","type":"text","content":"Pahami tahapan awareness, consideration, conversion, dan retention."},
      {"id":"2","title":"Video: Digital Marketing Dasar","type":"video","content":"https://www.youtube.com/watch?v=aQbZdee5PXI"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Pilih channel sesuai audiens dan ukur hasil dengan metrik yang relevan."}
    ]'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  xp_reward = EXCLUDED.xp_reward,
  duration_minutes = EXCLUDED.duration_minutes,
  content = EXCLUDED.content;

-- 6.5 Seed Standalone Battle Questions (Bank Soal PvP 1v1 Lengkap)
INSERT INTO public.battle_questions (category, question_text, options, correct_option, difficulty, explanation) VALUES
  ('coding', 'Di React, data dari parent ke child dikirim lewat apa?', '["state", "props", "context menu", "event loop"]'::jsonb, 1, 'easy', 'Props dipakai mengirim data dari parent ke child.'),
  ('coding', 'Tujuan utama Git branch adalah...', '["Memecah fitur agar kerja tim aman", "Menghapus histori", "Mengganti bahasa pemrograman", "Menghapus repository"]'::jsonb, 0, 'easy', 'Branch memisahkan perubahan per fitur/bugfix.'),
  ('coding', 'Manakah yang memicu re-render komponen React?', '["Perubahan state/props", "Rename file", "Restart laptop", "Ganti wallpaper"]'::jsonb, 0, 'medium', 'Re-render terjadi saat state atau props berubah.'),
  ('coding', 'Commit yang baik seharusnya...', '["Besar dan campur aduk", "Kecil dan fokus", "Tanpa pesan", "Langsung force push"]'::jsonb, 1, 'easy', 'Commit kecil memudahkan review dan debugging.'),
  ('coding', 'Pull Request dipakai untuk...', '["Review sebelum merge", "Backup foto", "Ganti DNS", "Install database"]'::jsonb, 0, 'easy', 'PR adalah proses review perubahan kode.'),
  ('coding', 'Di JavaScript, metode untuk menggabungkan array adalah...', '["map()", "join()", "concat()", "slice()"]'::jsonb, 2, 'easy', 'concat() menggabungkan dua atau lebih array.'),
  ('coding', 'HTTP status code untuk resource tidak ditemukan adalah...', '["200", "301", "404", "500"]'::jsonb, 2, 'easy', '404 berarti Not Found.'),
  ('coding', 'Tujuan utama TypeScript adalah...', '["Menambah type safety", "Mempercepat internet", "Mengganti HTML", "Menghapus bug otomatis"]'::jsonb, 0, 'easy', 'TypeScript menambah sistem tipe agar error lebih cepat terdeteksi.'),
  ('coding', 'Perintah Git untuk mengambil perubahan remote dan menggabungkannya ke branch aktif adalah...', '["git status", "git merge", "git pull", "git init"]'::jsonb, 2, 'easy', 'git pull = fetch + merge ke branch aktif.'),
  ('coding', 'Apa fungsi useEffect di React?', '["Mengatur routing", "Menangani efek samping", "Menyimpan state global", "Compile komponen"]'::jsonb, 1, 'medium', 'useEffect dipakai untuk side effect seperti fetch data dan subscription.'),

  ('design', 'Design token biasanya berisi...', '["Warna, spacing, radius, typography", "Daftar kontak", "Jadwal meeting", "Endpoint API"]'::jsonb, 0, 'easy', 'Token menyimpan nilai dasar desain.'),
  ('design', 'Tujuan design system adalah...', '["Membuat UI konsisten", "Membuat desain random", "Menghapus komponen", "Meniadakan dokumentasi"]'::jsonb, 0, 'easy', 'Design system menyamakan pola UI lintas produk.'),
  ('design', 'Dalam UX research, langkah awal yang benar adalah...', '["Menentukan pertanyaan riset", "Langsung high-fidelity", "Skip interview", "Langsung deploy"]'::jsonb, 0, 'medium', 'Riset selalu dimulai dari pertanyaan yang jelas.'),
  ('design', 'Pertanyaan terbuka saat interview membantu untuk...', '["Menggali pain point", "Membatasi jawaban", "Mempercepat asumsi", "Menutup diskusi"]'::jsonb, 0, 'medium', 'Pertanyaan terbuka memberi insight lebih dalam.'),
  ('design', 'Komponen reusable penting karena...', '["Agar konsisten dan hemat waktu", "Agar semua halaman beda", "Agar susah maintenance", "Agar style inline semua"]'::jsonb, 0, 'easy', 'Reusable component mengurangi duplikasi.'),
  ('design', 'Prinsip visual hierarchy bertujuan untuk...', '["Mengarahkan perhatian pengguna", "Membuat semua elemen sama menonjol", "Menghapus kontras", "Memperbanyak warna acak"]'::jsonb, 0, 'easy', 'Hierarchy membantu pengguna memahami prioritas informasi.'),
  ('design', 'Wireframe biasanya dibuat pada tahap...', '["Validasi detail visual akhir", "Perencanaan struktur awal", "Deploy produk", "Analisis log server"]'::jsonb, 1, 'easy', 'Wireframe dipakai untuk menyusun struktur dan alur dasar.'),
  ('design', 'Whitespace dalam desain berguna untuk...', '["Membuat layout lebih padat", "Meningkatkan keterbacaan", "Menghapus navigasi", "Menambah distraksi"]'::jsonb, 1, 'easy', 'Whitespace memberi ruang agar konten lebih mudah dibaca.'),

  ('productivity', 'Deep work adalah...', '["Kerja fokus tanpa distraksi", "Kerja sambil multitasking notif", "Belajar sambil scrolling", "Kerja tanpa target"]'::jsonb, 0, 'easy', 'Deep work menekankan fokus penuh pada tugas bernilai tinggi.'),
  ('productivity', 'Huruf M pada SMART berarti...', '["Measurable", "Manual", "Maximum", "Minimal"]'::jsonb, 0, 'easy', 'Goal harus bisa diukur.'),
  ('productivity', 'Review mingguan berguna untuk...', '["Evaluasi progres dan koreksi rencana", "Menghapus target", "Tambah distraksi", "Menunda kerja"]'::jsonb, 0, 'easy', 'Weekly review menjaga target tetap on track.'),
  ('productivity', 'Salah satu musuh fokus terbesar adalah...', '["Notifikasi berlebihan", "Target jelas", "Lingkungan tenang", "Jadwal realistis"]'::jsonb, 0, 'easy', 'Distraksi digital menurunkan kualitas fokus.'),
  ('productivity', 'Teknik Pomodoro klasik menggunakan pola...', '["25 menit fokus + 5 menit jeda", "60 menit fokus nonstop", "10 menit fokus + 20 menit jeda", "90 menit fokus + 30 menit jeda"]'::jsonb, 0, 'easy', 'Metode paling umum adalah 25/5.'),
  ('productivity', 'Eisenhower Matrix memisahkan tugas berdasarkan...', '["Penting dan mendesak", "Mudah dan sulit", "Online dan offline", "Individu dan tim"]'::jsonb, 0, 'medium', 'Matrix ini menilai prioritas via urgensi dan dampak.'),

  ('business', 'Langkah awal personal branding adalah...', '["Tentukan nilai unik dan audiens", "Posting acak", "Ganti niche tiap hari", "Meniru semua orang"]'::jsonb, 0, 'medium', 'Brand kuat butuh positioning yang jelas.'),
  ('business', 'Hook pada copywriting berfungsi untuk...', '["Menarik perhatian di awal", "Menutup konten", "Menghapus CTA", "Menambah jargon"]'::jsonb, 0, 'easy', 'Hook menentukan apakah audiens lanjut membaca.'),
  ('business', 'Negosiasi yang baik dimulai dari...', '["Persiapan target dan batas minimum", "Langsung setuju", "Skip diskusi", "Menekan lawan bicara"]'::jsonb, 0, 'medium', 'Persiapan membantu hasil negosiasi lebih terarah.'),
  ('business', 'CTA yang efektif sebaiknya...', '["Spesifik dan jelas", "Sangat umum", "Tidak ditulis", "Banyak instruksi sekaligus"]'::jsonb, 0, 'easy', 'CTA spesifik meningkatkan konversi aksi.'),
  ('business', 'UVP (Unique Value Proposition) menjelaskan...', '["Nilai unik yang membedakan produk", "Nama domain", "Jumlah karyawan", "Harga server"]'::jsonb, 0, 'easy', 'UVP menjawab alasan utama pelanggan memilih produkmu.'),
  ('business', 'CAC dalam bisnis digital adalah...', '["Biaya mendapatkan satu pelanggan", "Total pendapatan tahunan", "Jumlah trafik organik", "Rasio error aplikasi"]'::jsonb, 0, 'medium', 'CAC = Customer Acquisition Cost.'),

  ('general', 'Komunikasi tim yang baik biasanya ditandai dengan...', '["Ekspektasi jelas", "Asumsi tanpa konfirmasi", "Info tersebar", "Tidak ada dokumentasi"]'::jsonb, 0, 'easy', 'Kejelasan ekspektasi mengurangi miskomunikasi.'),
  ('general', 'Prioritas kerja paling sehat adalah...', '["Tugas penting dulu", "Yang paling gampang dulu selalu", "Semua sekaligus", "Tunda semua"]'::jsonb, 0, 'easy', 'Prioritaskan dampak dan urgensi.'),
  ('general', 'Saat deadline mepet, langkah pertama yang tepat...', '["Pecah tugas dan tentukan prioritas inti", "Panik", "Tambah distraksi", "Ganti semua rencana"]'::jsonb, 0, 'medium', 'Struktur prioritas membantu eksekusi saat tekanan tinggi.'),
  ('general', 'Belajar efektif biasanya terjadi saat...', '["Ada jeda review berkala", "Belajar nonstop tanpa istirahat", "Tanpa target", "Hanya hafalan pasif"]'::jsonb, 0, 'medium', 'Review berkala bantu retensi jangka panjang.'),
  ('general', 'Feedback yang efektif sebaiknya...', '["Spesifik dan berbasis observasi", "Umum dan menghakimi", "Ditunda terlalu lama", "Tanpa contoh"]'::jsonb, 0, 'easy', 'Feedback yang jelas lebih mudah ditindaklanjuti.')
ON CONFLICT (category, question_text) DO NOTHING;

-- 6.6 Seed Pertanyaan Kuis Skenario Berbobot per Modul
DO $$
DECLARE
  m RECORD;
BEGIN
  FOR m IN SELECT id, title, category, difficulty FROM public.modules WHERE is_published = true LOOP
    INSERT INTO public.questions (module_id, question_text, options, correct_option, difficulty, explanation)
    VALUES
      (
        m.id,
        format('Dalam konteks modul "%s", bukti paling kuat bahwa konsepnya benar-benar dipahami adalah...', m.title),
        jsonb_build_array(
          CASE m.category
            WHEN 'coding' THEN 'Mampu menjelaskan trade-off solusi lalu mengimplementasikannya pada kasus baru tanpa copy-paste langkah mentah'
            WHEN 'design' THEN 'Mampu mempertahankan keputusan desain dengan data pengguna, bukan sekadar selera visual'
            WHEN 'productivity' THEN 'Mampu menjaga sistem kerja yang konsisten minimal 2 minggu dan mengevaluasi metrik performa pribadi'
            WHEN 'business' THEN 'Mampu memvalidasi asumsi pasar dengan eksperimen kecil sebelum menambah biaya eksekusi'
            ELSE 'Mampu menerapkan konsep pada konteks baru dan menjelaskan alasannya'
          END,
          'Bisa meniru contoh persis seperti di materi tanpa memahami alasan tiap langkah',
          'Bisa menghafal definisi utama namun belum pernah menguji ke praktik nyata',
          'Bisa menjawab cepat, tapi gagal menjelaskan alasan ketika skenario diubah'
        ),
        0,
        CASE WHEN m.difficulty = 'advanced' THEN 'hard' ELSE 'medium' END,
        'Pemahaman tinggi terlihat dari transfer konsep ke konteks baru, bukan sekadar reproduksi contoh.'
      ),
      (
        m.id,
        format('Kamu diminta membuat mini-project dari modul "%s" dengan waktu terbatas. Prioritas langkah pertama paling tepat adalah...', m.title),
        jsonb_build_array(
          CASE m.difficulty
            WHEN 'advanced' THEN 'Menentukan constraint teknis, kriteria keberhasilan, dan risiko utama sebelum menulis implementasi'
            WHEN 'intermediate' THEN 'Menyusun alur solusi inti dan acceptance criteria sederhana agar eksekusi tetap terarah'
            ELSE 'Memecah tujuan menjadi task kecil terukur lalu mengeksekusi versi minimum yang bisa diuji'
          END,
          'Langsung membangun fitur tambahan agar terlihat kompleks sejak awal',
          'Menghabiskan mayoritas waktu untuk styling/polishing sebelum inti solusi selesai',
          'Menunda validasi hingga project selesai total agar tidak mengganggu ritme kerja'
        ),
        0,
        CASE WHEN m.difficulty = 'advanced' THEN 'hard' ELSE 'medium' END,
        'Urutan kerja yang benar dimulai dari masalah, batasan, dan target ukur sebelum optimasi kosmetik.'
      ),
      (
        m.id,
        format('Metrik evaluasi yang PALING valid untuk menilai keberhasilan penerapan modul "%s" adalah...', m.title),
        jsonb_build_array(
          CASE m.category
            WHEN 'coding' THEN 'Kualitas output fungsional (pass acceptance test) + waktu penyelesaian terhadap kompleksitas task'
            WHEN 'design' THEN 'Peningkatan task success rate pengguna + penurunan error/interaksi buntu pada alur utama'
            WHEN 'productivity' THEN 'Rasio rencana vs realisasi kerja fokus + tren penurunan context switching yang tidak perlu'
            WHEN 'business' THEN 'Perubahan metrik funnel inti (mis. conversion/retention) setelah eksperimen terkontrol'
            ELSE 'Metrik hasil yang bisa dibandingkan sebelum dan sesudah penerapan'
          END,
          'Jumlah istilah teknis yang bisa disebutkan saat presentasi akhir',
          'Seberapa banyak fitur tambahan dibuat di luar tujuan awal',
          'Kesan subjektif tim tanpa data pembanding sebelum-sesudah'
        ),
        0,
        CASE WHEN m.difficulty = 'advanced' THEN 'hard' ELSE 'medium' END,
        'Metrik valid harus terhubung langsung dengan outcome, bukan aktivitas permukaan.'
      )
    ON CONFLICT DO NOTHING;
  END LOOP;
END
$$;

-- ==============================================================================
-- 7. PERFORMANCE ARCHITECTURE INDEXING & AGGREGATION RPCS
-- ==============================================================================

-- 7.1 Indexing untuk seluruh Foreign Key dan Filter RLS (auth.uid() = user_id)
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

-- 7.2 Stored Procedure: get_dashboard_summary (Aggregasi Total 1 Round-trip)
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

-- 7.3 Stored Procedure: get_school_rankings (Aggregasi Peringkat Sekolah di Database)
CREATE OR REPLACE FUNCTION public.get_school_rankings(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  school TEXT,
  city TEXT,
  "totalXp" BIGINT,
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
    COALESCE(SUM(xp), 0)::BIGINT AS "totalXp",
    COUNT(id)::BIGINT AS members
  FROM profiles
  GROUP BY 1, 2
  ORDER BY "totalXp" DESC
  LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION public.get_school_rankings(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_school_rankings(INTEGER) TO authenticated;

