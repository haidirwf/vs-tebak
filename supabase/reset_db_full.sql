-- SkillQuest full reset (safe, idempotent)
-- Run this in Supabase SQL editor.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================
-- RESET
-- ==============================
DROP TABLE IF EXISTS xp_logs CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_daily_quests CASCADE;
DROP TABLE IF EXISTS daily_quests CASCADE;
DROP TABLE IF EXISTS battle_questions CASCADE;
DROP TABLE IF EXISTS battles CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS user_modules CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ==============================
-- TABLES
-- ==============================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  school_name TEXT,
  city TEXT,
  avatar_class TEXT NOT NULL DEFAULT 'warrior' CHECK (avatar_class IN ('warrior', 'mage', 'archer', 'healer')),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  xp_to_next_level INTEGER NOT NULL DEFAULT 100 CHECK (xp_to_next_level > 0),
  streak_count INTEGER NOT NULL DEFAULT 0 CHECK (streak_count >= 0),
  last_active DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('coding', 'design', 'productivity', 'business')),
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  thumbnail_url TEXT,
  content JSONB,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ,
  xp_granted_at TIMESTAMPTZ,
  UNIQUE (user_id, module_id)
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INTEGER NOT NULL CHECK (correct_option >= 0),
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  explanation TEXT,
  UNIQUE (module_id, question_text)
);

CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  player1_id UUID REFERENCES profiles(id),
  player2_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  player1_ready BOOLEAN NOT NULL DEFAULT FALSE,
  player2_ready BOOLEAN NOT NULL DEFAULT FALSE,
  player1_score INTEGER NOT NULL DEFAULT 0 CHECK (player1_score >= 0),
  player2_score INTEGER NOT NULL DEFAULT 0 CHECK (player2_score >= 0),
  winner_id UUID REFERENCES profiles(id),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('coding', 'design', 'productivity', 'business', 'general')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE battle_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('coding', 'design', 'productivity', 'business', 'general')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INTEGER NOT NULL CHECK (correct_option >= 0),
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  explanation TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category, question_text)
);

CREATE TABLE daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('complete_module', 'win_battle', 'maintain_streak', 'earn_xp')),
  target_value INTEGER NOT NULL DEFAULT 1 CHECK (target_value > 0),
  xp_reward INTEGER NOT NULL DEFAULT 30 CHECK (xp_reward >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (date, quest_type)
);

CREATE TABLE user_daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES daily_quests(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0 CHECK (current_value >= 0),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, quest_id, date)
);

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('level', 'streak', 'battles_won', 'modules_completed')),
  condition_value INTEGER NOT NULL CHECK (condition_value > 0)
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

CREATE TABLE xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modules_category ON modules(category);
CREATE INDEX idx_questions_module_id ON questions(module_id);
CREATE INDEX idx_battles_room_code ON battles(room_code);
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_user_modules_user_id ON user_modules(user_id);
CREATE INDEX idx_user_daily_quests_user_date ON user_daily_quests(user_id, date);
CREATE INDEX idx_xp_logs_user_created ON xp_logs(user_id, created_at DESC);

-- ==============================
-- RLS
-- ==============================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_public_read ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_self_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_self_update ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY modules_public_read ON modules FOR SELECT USING (is_published = true);
CREATE POLICY questions_public_read ON questions FOR SELECT USING (true);
CREATE POLICY battle_questions_public_read ON battle_questions FOR SELECT USING (is_active = true);
CREATE POLICY daily_quests_public_read ON daily_quests FOR SELECT USING (true);
CREATE POLICY daily_quests_auth_insert_today ON daily_quests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND date = CURRENT_DATE);
CREATE POLICY badges_public_read ON badges FOR SELECT USING (true);

CREATE POLICY user_modules_self ON user_modules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_daily_quests_self ON user_daily_quests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_badges_read ON user_badges FOR SELECT USING (true);
CREATE POLICY user_badges_insert ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY xp_logs_self ON xp_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY battles_read ON battles FOR SELECT USING (true);
CREATE POLICY battles_insert ON battles FOR INSERT WITH CHECK (auth.uid() = player1_id);
CREATE POLICY battles_delete ON battles FOR DELETE USING (auth.uid() = player1_id);
CREATE POLICY battles_update ON battles
FOR UPDATE
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

-- ==============================
-- SEED
-- ==============================
INSERT INTO daily_quests (title, description, quest_type, target_value, xp_reward, date) VALUES
  ('Pelajar Rajin', 'Selesaikan 1 chapter modul hari ini', 'complete_module', 1, 30, CURRENT_DATE),
  ('Petarung Sejati', 'Menangkan 1 battle quiz', 'win_battle', 1, 40, CURRENT_DATE),
  ('Konsisten', 'Pertahankan streak 3 hari berturut-turut', 'maintain_streak', 3, 50, CURRENT_DATE),
  ('XP Hunter', 'Kumpulkan 100 XP hari ini', 'earn_xp', 100, 35, CURRENT_DATE)
ON CONFLICT (date, quest_type) DO NOTHING;

INSERT INTO badges (name, description, icon_url, condition_type, condition_value) VALUES
  ('Pemula', 'Selesaikan modul pertamamu', 'book', 'modules_completed', 1),
  ('Pelajar Aktif', 'Selesaikan 5 modul', 'mortarboard', 'modules_completed', 5),
  ('Master Modul', 'Selesaikan 10 modul', 'trophy', 'modules_completed', 10),
  ('Level 5', 'Capai level 5', 'star', 'level', 5),
  ('Level 10', 'Capai level 10', 'sparkle', 'level', 10),
  ('Streak Seminggu', 'Streak 7 hari berturut-turut', 'flame', 'streak', 7),
  ('Streak Sebulan', 'Streak 30 hari berturut-turut', 'gem', 'streak', 30),
  ('Petarung', 'Menangkan 1 battle', 'sword', 'battles_won', 1),
  ('Jawara Battle', 'Menangkan 10 battle', 'medal', 'battles_won', 10)
ON CONFLICT (name) DO NOTHING;

INSERT INTO modules (slug, title, description, category, difficulty, xp_reward, duration_minutes, content) VALUES
  ('html-css-dasar', 'HTML & CSS Dasar', 'Fondasi web development dengan HTML dan CSS.', 'coding', 'beginner', 50, 45, '[]'::jsonb),
  ('javascript-pemula', 'JavaScript untuk Pemula', 'Variabel, fungsi, kondisi, dan manipulasi DOM.', 'coding', 'beginner', 75, 60, '[]'::jsonb),
  ('figma-ui-dasar', 'Desain UI dengan Figma', 'Dari wireframe sampai prototype interaktif.', 'design', 'beginner', 50, 40, '[]'::jsonb),
  ('manajemen-waktu', 'Manajemen Waktu Pelajar', 'Teknik manajemen waktu untuk belajar efektif.', 'productivity', 'beginner', 35, 25, '[]'::jsonb),
  ('react-dasar-komponen', 'React Dasar: Komponen & State', 'Konsep komponen, props, dan state.', 'coding', 'beginner', 70, 55, '[]'::jsonb),
  ('negosiasi-dasar', 'Negosiasi Dasar untuk Pemula', 'Teknik negosiasi praktis untuk kerja tim.', 'business', 'beginner', 55, 40, '[]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (module_id, question_text, options, correct_option, explanation)
SELECT id, 'Apa kepanjangan dari HTML?', '["HyperText Markup Language", "High Text Machine Learning", "Hyper Transfer Markup Link", "Home Text Markup Language"]'::jsonb, 0, 'HTML = HyperText Markup Language.'
FROM modules WHERE slug = 'html-css-dasar'
ON CONFLICT (module_id, question_text) DO NOTHING;

INSERT INTO questions (module_id, question_text, options, correct_option, explanation)
SELECT id, 'Tag HTML mana yang digunakan untuk heading terbesar?', '["<h6>", "<h1>", "<heading>", "<title>"]'::jsonb, 1, '<h1> adalah heading terbesar.'
FROM modules WHERE slug = 'html-css-dasar'
ON CONFLICT (module_id, question_text) DO NOTHING;

INSERT INTO questions (module_id, question_text, options, correct_option, explanation)
SELECT id, 'Apa output dari console.log(2 + "3")?', '["5", "23", "Error", "undefined"]'::jsonb, 1, 'Type coercion menghasilkan string "23".'
FROM modules WHERE slug = 'javascript-pemula'
ON CONFLICT (module_id, question_text) DO NOTHING;

INSERT INTO battle_questions (category, question_text, options, correct_option, difficulty, explanation) VALUES
  ('coding', 'Di React, data dari parent ke child dikirim lewat apa?', '["state", "props", "context menu", "event loop"]'::jsonb, 1, 'easy', 'Props dipakai untuk kirim data ke child.'),
  ('coding', 'Manakah yang memicu re-render komponen React?', '["Perubahan state/props", "Rename file", "Restart laptop", "Ganti wallpaper"]'::jsonb, 0, 'medium', 'Re-render saat state/props berubah.'),
  ('coding', 'Di JavaScript, metode untuk menggabungkan array adalah...', '["map()", "join()", "concat()", "slice()"]'::jsonb, 2, 'easy', 'concat() menggabungkan dua atau lebih array.'),
  ('coding', 'HTTP status code untuk resource tidak ditemukan adalah...', '["200", "301", "404", "500"]'::jsonb, 2, 'easy', '404 berarti Not Found.'),
  ('coding', 'Tujuan utama TypeScript adalah...', '["Menambah type safety", "Mempercepat internet", "Mengganti HTML", "Menghapus bug otomatis"]'::jsonb, 0, 'easy', 'TypeScript menambah sistem tipe agar error lebih cepat terdeteksi.'),
  ('coding', 'Perintah Git untuk mengambil perubahan remote dan menggabungkannya ke branch aktif adalah...', '["git status", "git merge", "git pull", "git init"]'::jsonb, 2, 'easy', 'git pull = fetch + merge ke branch aktif.'),
  ('coding', 'Apa fungsi useEffect di React?', '["Mengatur routing", "Menangani efek samping", "Menyimpan state global", "Compile komponen"]'::jsonb, 1, 'medium', 'useEffect dipakai untuk side effect seperti fetch data dan subscription.'),
  ('coding', 'Manakah struktur data yang bekerja dengan prinsip LIFO?', '["Queue", "Stack", "Tree", "Graph"]'::jsonb, 1, 'medium', 'Stack menggunakan Last In First Out.'),
  ('design', 'Tujuan design system adalah...', '["Membuat UI konsisten", "Membuat desain random", "Menghapus komponen", "Meniadakan dokumentasi"]'::jsonb, 0, 'easy', 'Design system menyamakan pola UI.'),
  ('design', 'Prinsip visual hierarchy bertujuan untuk...', '["Mengarahkan perhatian pengguna", "Membuat semua elemen sama menonjol", "Menghapus kontras", "Memperbanyak warna acak"]'::jsonb, 0, 'easy', 'Hierarchy membantu pengguna memahami prioritas informasi.'),
  ('design', 'Wireframe biasanya dibuat pada tahap...', '["Validasi detail visual akhir", "Perencanaan struktur awal", "Deploy produk", "Analisis log server"]'::jsonb, 1, 'easy', 'Wireframe dipakai untuk menyusun struktur dan alur dasar.'),
  ('design', 'Whitespace dalam desain berguna untuk...', '["Membuat layout lebih padat", "Meningkatkan keterbacaan", "Menghapus navigasi", "Menambah distraksi"]'::jsonb, 1, 'easy', 'Whitespace memberi ruang agar konten lebih mudah dibaca.'),
  ('design', 'A/B testing pada UI digunakan untuk...', '["Memilih variasi desain paling efektif", "Menghapus semua metrik", "Menentukan stack backend", "Mengganti database"]'::jsonb, 0, 'medium', 'A/B test membandingkan performa dua variasi desain.'),
  ('design', 'Contrast ratio penting untuk...', '["Aksesibilitas teks", "Kecepatan build", "Ukuran file gambar", "Jumlah komponen"]'::jsonb, 0, 'medium', 'Kontras yang baik membantu keterbacaan termasuk untuk pengguna low vision.'),
  ('design', 'User flow menggambarkan...', '["Urutan langkah pengguna menyelesaikan tugas", "Daftar warna brand", "Struktur database", "Riwayat commit"]'::jsonb, 0, 'easy', 'User flow memetakan perjalanan pengguna dari awal hingga tujuan.'),
  ('productivity', 'Huruf M pada SMART berarti...', '["Measurable", "Manual", "Maximum", "Minimal"]'::jsonb, 0, 'easy', 'M = Measurable.'),
  ('productivity', 'Teknik Pomodoro klasik menggunakan pola...', '["25 menit fokus + 5 menit jeda", "60 menit fokus nonstop", "10 menit fokus + 20 menit jeda", "90 menit fokus + 30 menit jeda"]'::jsonb, 0, 'easy', 'Metode paling umum adalah 25/5.'),
  ('productivity', 'To-do list efektif sebaiknya berisi...', '["Task spesifik dan terukur", "Target sangat umum", "Semua ide tanpa prioritas", "Hanya tugas yang sudah selesai"]'::jsonb, 0, 'easy', 'Task yang spesifik lebih mudah dieksekusi.'),
  ('productivity', 'Batching task berarti...', '["Mengelompokkan tugas sejenis", "Mengerjakan semua sekaligus", "Menunda tugas berat", "Menghapus jadwal harian"]'::jsonb, 0, 'medium', 'Batching mengurangi context switching.'),
  ('productivity', 'Eisenhower Matrix memisahkan tugas berdasarkan...', '["Penting dan mendesak", "Mudah dan sulit", "Online dan offline", "Individu dan tim"]'::jsonb, 0, 'medium', 'Matrix ini menilai prioritas via urgensi dan dampak.'),
  ('productivity', 'Time blocking membantu dengan cara...', '["Mengalokasikan jam khusus per tugas", "Mengerjakan tugas tanpa rencana", "Menambah notifikasi", "Membuat deadline kabur"]'::jsonb, 0, 'easy', 'Time blocking memberi batas waktu yang jelas.'),
  ('productivity', 'Retrospektif personal mingguan berguna untuk...', '["Belajar dari hasil minggu berjalan", "Menghapus semua target", "Menyalahkan faktor luar", "Menambah multitasking"]'::jsonb, 0, 'medium', 'Refleksi rutin membantu perbaikan berkelanjutan.'),
  ('business', 'CTA yang efektif sebaiknya...', '["Spesifik dan jelas", "Sangat umum", "Tidak ditulis", "Banyak instruksi sekaligus"]'::jsonb, 0, 'easy', 'CTA spesifik meningkatkan konversi.'),
  ('business', 'UVP (Unique Value Proposition) menjelaskan...', '["Nilai unik yang membedakan produk", "Nama domain", "Jumlah karyawan", "Harga server"]'::jsonb, 0, 'easy', 'UVP menjawab alasan utama pelanggan memilih produkmu.'),
  ('business', 'CAC dalam bisnis digital adalah...', '["Biaya mendapatkan satu pelanggan", "Total pendapatan tahunan", "Jumlah trafik organik", "Rasio error aplikasi"]'::jsonb, 0, 'medium', 'CAC = Customer Acquisition Cost.'),
  ('business', 'Funnel penjualan umumnya bergerak dari...', '["Awareness ke conversion", "Conversion ke awareness", "Support ke coding", "Testing ke wireframe"]'::jsonb, 0, 'easy', 'Funnel memetakan perjalanan calon pelanggan sampai beli.'),
  ('business', 'Validasi ide bisnis paling awal bisa dilakukan dengan...', '["Wawancara calon pengguna", "Scale besar langsung", "Rekrut tim besar dulu", "Buat iklan tanpa riset"]'::jsonb, 0, 'medium', 'Interview cepat menguji masalah dan kebutuhan pasar.'),
  ('business', 'Metode pricing berbasis value berarti...', '["Harga ditentukan dari nilai yang dirasakan pelanggan", "Harga asal murah", "Harga selalu ikut kompetitor", "Harga tanpa riset"]'::jsonb, 0, 'hard', 'Value-based pricing fokus pada manfaat yang diterima pelanggan.'),
  ('business', 'Metrik retensi menunjukkan...', '["Seberapa banyak pengguna bertahan", "Jumlah like konten", "Banyaknya rapat tim", "Jumlah desain mockup"]'::jsonb, 0, 'medium', 'Retensi mengukur kemampuan produk mempertahankan pengguna.'),
  ('general', 'Indikator progres terbaik adalah...', '["Output nyata yang selesai", "Lama duduk", "Banyak tab terbuka", "Sering ganti tools"]'::jsonb, 0, 'easy', 'Progress dinilai dari output nyata.')
  ,('general', 'Feedback yang efektif sebaiknya...', '["Spesifik dan berbasis observasi", "Umum dan menghakimi", "Ditunda terlalu lama", "Tanpa contoh"]'::jsonb, 0, 'easy', 'Feedback yang jelas lebih mudah ditindaklanjuti.')
  ,('general', 'Root cause analysis bertujuan untuk...', '["Mencari penyebab utama masalah", "Menyalahkan individu", "Menambah kompleksitas", "Melewati evaluasi"]'::jsonb, 0, 'medium', 'Analisis akar masalah mencegah masalah berulang.')
  ,('general', 'Dokumentasi kerja tim penting karena...', '["Menjaga pengetahuan tetap terbagi", "Membuat proses lebih lambat tanpa manfaat", "Mengganti komunikasi", "Menghapus kebutuhan onboarding"]'::jsonb, 0, 'easy', 'Dokumentasi membantu kolaborasi dan onboarding.')
  ,('general', 'Saat terjadi miskomunikasi, langkah terbaik adalah...', '["Klarifikasi ekspektasi dan rangkum keputusan", "Mendiamkan masalah", "Menyalahkan pihak lain", "Mengganti semua tools"]'::jsonb, 0, 'medium', 'Klarifikasi cepat mencegah miskomunikasi berulang.')
  ,('general', 'Decision log dipakai untuk...', '["Mencatat keputusan penting dan alasannya", "Menyimpan password tim", "Mencatat absensi harian", "Mengatur warna UI"]'::jsonb, 0, 'medium', 'Decision log menjaga konteks saat tim berkembang.')
  ,('general', 'Kolaborasi lintas fungsi paling efektif saat...', '["Peran dan tujuan tiap pihak jelas", "Semua tugas tanpa owner", "Komunikasi hanya saat krisis", "Dokumen tidak pernah diperbarui"]'::jsonb, 0, 'easy', 'Kejelasan peran meningkatkan kecepatan dan kualitas eksekusi.')
ON CONFLICT (category, question_text) DO NOTHING;

COMMIT;
