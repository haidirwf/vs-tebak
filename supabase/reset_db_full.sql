-- DROP EXISTING TABLES TO RESET
DROP TABLE IF EXISTS xp_logs CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_daily_quests CASCADE;
DROP TABLE IF EXISTS daily_quests CASCADE;
DROP TABLE IF EXISTS battles CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS battle_questions CASCADE;
DROP TABLE IF EXISTS user_modules CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- SkillQuest Database Schema
-- FICPACT CUP 2026 — Jalankan di Supabase SQL Editor

-- 1. Profiles (extend auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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

-- 2. Modules
CREATE TABLE IF NOT EXISTS modules (
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

-- 3. User Module Progress
CREATE TABLE IF NOT EXISTS user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

-- 4. Questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INTEGER NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  explanation TEXT
);

-- 5. Battles
CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  player1_id UUID REFERENCES profiles(id),
  player2_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES profiles(id),
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Daily Quests
CREATE TABLE IF NOT EXISTS daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT CHECK (quest_type IN ('complete_module', 'win_battle', 'maintain_streak', 'earn_xp')),
  target_value INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 30,
  date DATE DEFAULT CURRENT_DATE
);

-- 7. User Quest Progress
CREATE TABLE IF NOT EXISTS user_daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES daily_quests(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, quest_id, date)
);

-- 8. Badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  condition_type TEXT CHECK (condition_type IN ('level', 'streak', 'battles_won', 'modules_completed')),
  condition_value INTEGER
);

-- 9. User Badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 10. XP Logs
CREATE TABLE IF NOT EXISTS xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ ROW LEVEL SECURITY ============

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, self write
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Modules: public read
CREATE POLICY "modules_public_read" ON modules FOR SELECT USING (is_published = true);

-- Questions: public read
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_public_read" ON questions FOR SELECT USING (true);

-- User Modules: self only
CREATE POLICY "user_modules_self" ON user_modules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Daily Quests: public read
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_quests_public_read" ON daily_quests FOR SELECT USING (true);

-- User Daily Quests: self only
CREATE POLICY "user_daily_quests_self" ON user_daily_quests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Badges: public read
CREATE POLICY "badges_public_read" ON badges FOR SELECT USING (true);

-- User Badges: public read (untuk profile)
CREATE POLICY "user_badges_read" ON user_badges FOR SELECT USING (true);
CREATE POLICY "user_badges_insert" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- XP Logs: self only
CREATE POLICY "xp_logs_self" ON xp_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Battles: public read (participants), insert by auth users
CREATE POLICY "battles_read" ON battles FOR SELECT USING (true);
CREATE POLICY "battles_insert" ON battles FOR INSERT WITH CHECK (auth.uid() = player1_id);
CREATE POLICY "battles_update" ON battles FOR UPDATE USING (
  auth.uid() = player1_id OR 
  auth.uid() = player2_id OR
  (player2_id IS NULL AND status = 'waiting')
);
-- Allow the host (player1) to delete their own room
CREATE POLICY "battles_delete" ON battles FOR DELETE USING (
  auth.uid() = player1_id
);

-- ============ SEED DATA ============

-- Daily Quests (setiap hari akan dibuat baru, ini template)
INSERT INTO daily_quests (title, description, quest_type, target_value, xp_reward, date) VALUES
  ('Pelajar Rajin', 'Selesaikan 1 chapter modul hari ini', 'complete_module', 1, 30, CURRENT_DATE),
  ('Petarung Sejati', 'Menangkan 1 battle quiz', 'win_battle', 1, 40, CURRENT_DATE),
  ('Konsisten', 'Pertahankan streak 3 hari berturut-turut', 'maintain_streak', 3, 50, CURRENT_DATE),
  ('XP Hunter', 'Kumpulkan 100 XP hari ini', 'earn_xp', 100, 35, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Badges
INSERT INTO badges (name, description, icon_url, condition_type, condition_value) VALUES
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

-- Modules Seed Data
INSERT INTO modules (slug, title, description, category, difficulty, xp_reward, duration_minutes, content) VALUES
  (
    'html-css-dasar',
    'HTML & CSS Dasar',
    'Pelajari fondasi web development dengan HTML dan CSS. Dari struktur dasar hingga styling yang menarik.',
    'coding', 'beginner', 50, 45,
    '[
      {"id":"1","title":"Pengenalan HTML","type":"text","content":"HTML (HyperText Markup Language) adalah bahasa markup standar untuk membuat halaman web. HTML mendeskripsikan struktur halaman web menggunakan elemen-elemen yang direpresentasikan oleh tag.\n\nStruktur dasar HTML:\n```html\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>Halaman Pertamaku</title>\n  </head>\n  <body>\n    <h1>Hello World!</h1>\n    <p>Ini paragraf pertamaku.</p>\n  </body>\n</html>\n```"},
      {"id":"2","title":"Tag HTML Penting","type":"text","content":"Tag yang paling sering digunakan:\n- <h1> hingga <h6>: Heading\n- <p>: Paragraf\n- <a>: Link/tautan\n- <img>: Gambar\n- <ul>, <ol>, <li>: List\n- <div>: Container/pembungkus\n- <span>: Inline container\n- <button>: Tombol\n- <input>: Input form"},
      {"id":"3","title":"CSS Dasar","type":"text","content":"CSS (Cascading Style Sheets) digunakan untuk mendeskripsikan tampilan dokumen HTML. CSS mengontrol warna, font, ukuran, spacing, dan banyak aspek visual lainnya.\n\nCara menulis CSS:\n```css\n/* Selector - Property: Value */\nh1 {\n  color: blue;\n  font-size: 24px;\n  font-family: Arial, sans-serif;\n}\n\n.card {\n  background-color: white;\n  padding: 16px;\n  border-radius: 8px;\n}\n```"},
      {"id":"4","title":"Box Model","type":"text","content":"Setiap elemen HTML adalah sebuah kotak (box). Box Model terdiri dari:\n1. Content: Isi elemen\n2. Padding: Jarak antara content dan border\n3. Border: Garis pembatas\n4. Margin: Jarak antara elemen dengan elemen lain\n\nContoh:\n```css\n.kotak {\n  width: 200px;\n  height: 100px;\n  padding: 16px;\n  border: 2px solid black;\n  margin: 8px;\n}\n```"},
      {"id":"5","title":"Flexbox Layout","type":"text","content":"Flexbox adalah cara modern untuk mengatur layout di CSS. Sangat berguna untuk membuat layout yang responsif.\n\n```css\n.container {\n  display: flex;\n  justify-content: center; /* horizontal */\n  align-items: center;     /* vertikal */\n  gap: 16px;               /* jarak antar item */\n}\n```\n\nChild elements di dalam flex container disebut flex items dan bisa diatur posisinya dengan mudah."}
    ]'::jsonb
  ),
  (
    'javascript-pemula',
    'JavaScript untuk Pemula',
    'Mulai programming dengan JavaScript. Variabel, fungsi, kondisi, dan manipulasi DOM.',
    'coding', 'beginner', 75, 60,
    '[
      {"id":"1","title":"Apa itu JavaScript?","type":"text","content":"JavaScript adalah bahasa programming yang membuat halaman web menjadi interaktif. Bisa dijalankan langsung di browser tanpa install apapun.\n\nContoh sederhana:\n```javascript\nalert(\"Hello World!\");\nconsole.log(\"Halo dari JavaScript!\");\ndocument.getElementById(\"judul\").textContent = \"Judul Baru\";\n```"},
      {"id":"2","title":"Variabel & Tipe Data","type":"text","content":"```javascript\n// Deklarasi variabel\nlet nama = \"Budi\";        // String\nlet umur = 17;             // Number  \nlet sudahLogin = true;     // Boolean\nlet data = null;           // Null\n\n// const untuk nilai yang tidak berubah\nconst PI = 3.14;\n\n// Operasi string\nlet salam = \"Helo \" + nama;\nconsole.log(salam); // \"Helo Budi\"\n```"},
      {"id":"3","title":"Kondisi If-Else","type":"text","content":"```javascript\nlet nilai = 85;\n\nif (nilai >= 90) {\n  console.log(\"Nilai A - Sempurna!\");\n} else if (nilai >= 80) {\n  console.log(\"Nilai B - Bagus!\");\n} else if (nilai >= 70) {\n  console.log(\"Nilai C - Cukup\");\n} else {\n  console.log(\"Perlu belajar lebih giat\");\n}\n```"},
      {"id":"4","title":"Fungsi","type":"text","content":"```javascript\n// Mendefinisikan fungsi\nfunction tambah(a, b) {\n  return a + b;\n}\n\n// Memanggil fungsi\nlet hasil = tambah(5, 3);\nconsole.log(hasil); // 8\n\n// Arrow function (cara modern)\nconst kali = (a, b) => a * b;\nconsole.log(kali(4, 5)); // 20\n```"},
      {"id":"5","title":"Manipulasi DOM","type":"text","content":"DOM (Document Object Model) adalah representasi HTML sebagai objek JavaScript.\n\n```javascript\n// Mencari elemen\nconst judul = document.getElementById(\"judul\");\nconst tombol = document.querySelector(\".btn\");\n\n// Mengubah konten\njudul.textContent = \"Judul Baru\";\njudul.style.color = \"red\";\n\n// Event listener (interaktivitas)\ntombol.addEventListener(\"click\", function() {\n  alert(\"Tombol diklik!\");\n});\n```"}
    ]'::jsonb
  ),
  (
    'figma-ui-dasar',
    'Desain UI dengan Figma',
    'Belajar desain antarmuka profesional menggunakan Figma. Dari wireframe hingga prototype interaktif.',
    'design', 'beginner', 50, 40,
    '[
      {"id":"1","title":"Mengenal Figma","type":"text","content":"Figma adalah tools desain UI/UX berbasis cloud yang sangat populer di industri. Advantages:\n- Gratis untuk pelajar\n- Kolaborasi real-time\n- Tersedia di browser (tidak perlu install)\n- Banyak template dan plugin gratis\n\nUntuk mulai: buka figma.com dan buat akun dengan email sekolah!"},
      {"id":"2","title":"Interface Figma","type":"text","content":"Bagian-bagian penting Figma:\n1. Toolbar atas: Tools utama (Select, Frame, Shape, Text, dll)\n2. Panel kiri: Layers dan Pages\n3. Canvas/Canvas: Area kerja utama\n4. Panel kanan: Properties (ukuran, warna, efek)\n\nShortcut penting:\n- V = Select tool\n- F = Frame tool\n- R = Rectangle\n- T = Text\n- Ctrl+Z = Undo"},
      {"id":"3","title":"Frame & Layout","type":"text","content":"Frame adalah container utama di Figma. Gunakan Frame untuk:\n- Ukuran layar (Mobile 375x812, Desktop 1440x900)\n- Sections dalam desain\n\nAuto Layout:\nFitur powerful untuk membuat layout yang responsif otomatis. Pilih elemen → Add Auto Layout (Shift+A)."},
      {"id":"4","title":"Warna & Typography","type":"text","content":"Tips warna yang profesional:\n1. Gunakan maksimal 3 warna utama\n2. Buat color library (Styles)\n3. Perhatikan kontras untuk aksesibilitas\n\nTypography:\n- Heading: Bold, besar (24-48px)\n- Body: Regular, 14-16px\n- Caption: 12px\n\nGunakan Google Fonts: Inter, Plus Jakarta Sans, atau Poppins untuk tampilan modern."},
      {"id":"5","title":"Komponen & Reuse","type":"text","content":"Komponen (Components) adalah elemen yang bisa digunakan berulang. Sangat penting untuk konsistensi desain!\n\nCara membuat komponen:\n1. Buat desain elemen (misal tombol)\n2. Klik kanan → Create Component (Ctrl+Alt+K)\n3. Drag dari panel komponen ke canvas\n\nSetiap perubahan di Main Component akan mempengaruhi semua instances!"}
    ]'::jsonb
  ),
  (
    'canva-konten-kreatif',
    'Konten Kreatif dengan Canva',
    'Buat konten visual yang menarik untuk media sosial menggunakan Canva. Poster, feed Instagram, dan presentasi.',
    'design', 'beginner', 40, 30,
    '[
      {"id":"1","title":"Kenapa Canva?","type":"text","content":"Canva adalah platform desain grafis online yang sangat mudah digunakan bahkan tanpa pengalaman desain. Perfect untuk:\n- Poster event sekolah\n- Feed Instagram yang estetik\n- Presentasi kelas\n- Sertifikat dan kartu nama\n- Infografis\n\nCanva gratis dan tersedia di browser maupun aplikasi mobile!"},
      {"id":"2","title":"Template & Customization","type":"text","content":"Canva memiliki ribuan template gratis siap pakai.\n\nLangkah-langkah:\n1. Pilih kategori (Instagram Post, Poster, dll)\n2. Pilih template yang sesuai\n3. Klik teks untuk edit\n4. Ganti gambar dengan foto milikmu\n5. Sesuaikan warna dengan brand\n\nTips: Gunakan template yang template, lalu customisasi secara signifikan agar tidak terlihat generik."},
      {"id":"3","title":"Prinsip Desain Dasar","type":"text","content":"4 prinsip desain (CRAP):\n\n1. Contrast: Buat perbedaan jelas antara elemen (warna, ukuran, font)\n2. Repetition: Gunakan elemen yang sama secara konsisten\n3. Alignment: Ratakan elemen secara horizontal atau vertikal\n4. Proximity: Kumpulkan elemen yang berhubungan\n\nInti: Desain yang baik adalah yang mudah dibaca dan jelas pesan-nya!"}
    ]'::jsonb
  ),
  (
    'manajemen-waktu',
    'Manajemen Waktu Pelajar',
    'Teknik time management terbukti untuk pelajar SMK/SMA. Belajar efektif dan tetap punya waktu ngabuburit!',
    'productivity', 'beginner', 35, 25,
    '[
      {"id":"1","title":"Mengapa Time Management Penting?","type":"text","content":"Sebagai pelajar, kamu punya banyak tuntutan: tugas sekolah, ekstrakurikuler, les, dan tentu saja waktu untuk bersenang-senang.\n\nFakta: Pelajar yang pandai mengatur waktu:\n- Nilai lebih baik dengan belajar lebih sedikit (tapi efektif)\n- Lebih sedikit stres\n- Punya lebih banyak waktu untuk hobi\n- Lebih siap menghadapi dunia kerja"},
      {"id":"2","title":"Teknik Pomodoro","type":"text","content":"Teknik Pomodoro adalah metode belajar yang terbukti ilmiah:\n\n1. Pilih 1 tugas yang ingin dikerjakan\n2. Set timer 25 menit\n3. Fokus 100% tanpa distraksi (phone silenced!)\n4. Istirahat 5 menit\n5. Setelah 4 sesi, istirahat 15-30 menit\n\nKenapa 25 menit? Otak manusia bisa fokus maksimal ~25 menit. Setelah itu produktivitas menurun drastis."},
      {"id":"3","title":"Matriks Eisenhower","type":"text","content":"Prioritaskan tugasmu dengan Matriks Eisenhower:\n\n┌─────────────────┬─────────────────┐\n│  PENTING &      │  PENTING &      │\n│  MENDESAK       │  TIDAK MENDESAK │\n│  → KERJAKAN     │  → JADWALKAN    │\n│  SEKARANG       │                 │\n├─────────────────┼─────────────────┤\n│  TIDAK PENTING  │  TIDAK PENTING  │\n│  & MENDESAK     │  & TIDAK        │\n│  → DELEGASIKAN  │  MENDESAK       │\n│                 │  → ELIMINASI    │\n└─────────────────┴─────────────────┘"}
    ]'::jsonb
  ),
  (
    'public-speaking-dasar',
    'Public Speaking Dasar',
    'Overcome rasa takut bicara di depan umum. Teknik presentasi, bahasa tubuh, dan cara menyampaikan pesan dengan percaya diri.',
    'productivity', 'intermediate', 60, 50,
    '[
      {"id":"1","title":"Mengatasi Rasa Takut","type":"text","content":"Fakta mengejutkan: 75% orang mengalami glossophobia (takut bicara di depan umum). Bahkan pembicara profesional pun gugup!\n\nKuncinya bukan menghilangkan rasa gugup, tapi mengubahnya menjadi energi positif.\n\nTeknik 4-7-8 Breathing:\n1. Tarik napas 4 detik\n2. Tahan 7 detik\n3. Hembuskan 8 detik\nUlangi 3-4 kali sebelum presentasi."},
      {"id":"2","title":"Struktur Presentasi","type":"text","content":"Struktur presentasi yang efektif:\n\n1. PEMBUKA (10%): Hook perhatian audiens\n   - Pertanyaan provokatif\n   - Fakta mengejutkan\n   - Cerita singkat\n\n2. ISI (80%): Poin-poin utama\n   - Maksimal 3 poin utama\n   - Setiap poin ada contoh/data\n\n3. PENUTUP (10%): \n   - Rangkum poin utama\n   - Call to action\n   - Closing yang kuat"},
      {"id":"3","title":"Bahasa Tubuh","type":"text","content":"55% komunikasi adalah bahasa tubuh, 38% nada bicara, hanya 7% kata-kata!\n\nBahasa tubuh yang baik:\n✓ Postur tegak (jangan bungkuk)\n✓ Eye contact bergantian (2-3 detik per orang)\n✓ Gestur tangan yang natural\n✓ Senyum tulus\n✗ Hindari menyilangkan tangan\n✗ Hindari memegang podium erat-erat\n✗ Hindari mondar-mandir"}
    ]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- Quiz Questions
INSERT INTO questions (module_id, question_text, options, correct_option, explanation) 
SELECT 
  id,
  'Apa kepanjangan dari HTML?',
  '["HyperText Markup Language", "High Text Machine Learning", "Hyper Transfer Markup Link", "Home Text Markup Language"]'::jsonb,
  0,
  'HTML singkatan dari HyperText Markup Language, bahasa standar untuk membuat halaman web.'
FROM modules WHERE slug = 'html-css-dasar'
ON CONFLICT DO NOTHING;

INSERT INTO questions (module_id, question_text, options, correct_option, explanation)
SELECT 
  id,
  'Tag HTML mana yang digunakan untuk membuat heading terbesar?',
  '["<h6>", "<h1>", "<heading>", "<title>"]'::jsonb,
  1,
  '<h1> adalah tag heading terbesar dalam HTML, digunakan untuk judul utama halaman.'
FROM modules WHERE slug = 'html-css-dasar'
ON CONFLICT DO NOTHING;

INSERT INTO questions (module_id, question_text, options, correct_option, explanation)
SELECT 
  id,
  'Property CSS mana yang mengatur warna teks?',
  '["background-color", "text-color", "color", "font-color"]'::jsonb,
  2,
  'Property "color" di CSS digunakan untuk mengatur warna teks elemen.'
FROM modules WHERE slug = 'html-css-dasar'
ON CONFLICT DO NOTHING;

INSERT INTO questions (module_id, question_text, options, correct_option, explanation)
SELECT 
  id,
  'Variabel di JavaScript yang nilainya TIDAK bisa diubah menggunakan keyword:',
  '["var", "let", "const", "fixed"]'::jsonb,
  2,
  'const digunakan untuk mendeklarasikan variabel yang nilainya konstan / tidak bisa diubah setelah didefinisikan.'
FROM modules WHERE slug = 'javascript-pemula'
ON CONFLICT DO NOTHING;

INSERT INTO questions (module_id, question_text, options, correct_option, explanation)
SELECT 
  id,
  'Apa output dari: console.log(2 + "3") di JavaScript?',
  '["5", "23", "Error", "undefined"]'::jsonb,
  1,
  'JavaScript melakukan type coercion: angka 2 dikonversi ke string "2", lalu digabung dengan "3" menjadi "23".'
FROM modules WHERE slug = 'javascript-pemula'
ON CONFLICT DO NOTHING;
-- Track per-player ready state in battle lobby.
ALTER TABLE battles
ADD COLUMN IF NOT EXISTS player1_ready BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS player2_ready BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill safety for older rows that might have null values.
UPDATE battles
SET
  player1_ready = COALESCE(player1_ready, FALSE),
  player2_ready = COALESCE(player2_ready, FALSE)
WHERE player1_ready IS NULL OR player2_ready IS NULL;
-- Recovery migration when modules table was removed from Supabase
-- 1) Recreate modules table (if missing)
-- 2) Ensure RLS + public read policy
-- 3) Seed 10 modules

CREATE TABLE IF NOT EXISTS modules (
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

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'modules'
      AND policyname = 'modules_public_read'
  ) THEN
    CREATE POLICY "modules_public_read" ON modules FOR SELECT USING (is_published = true);
  END IF;
END
$$;

INSERT INTO modules (slug, title, description, category, difficulty, xp_reward, duration_minutes, content) VALUES
  (
    'react-dasar-komponen',
    'React Dasar: Komponen & State',
    'Pahami konsep komponen, props, dan state untuk membangun UI interaktif dengan React.',
    'coding', 'beginner', 70, 55,
    '[
      {"id":"1","title":"Konsep Komponen","type":"text","content":"React membangun UI dari potongan kecil bernama komponen. Setiap komponen punya tanggung jawab jelas agar mudah dirawat."},
      {"id":"2","title":"Props untuk Data","type":"text","content":"Props adalah cara mengirim data dari parent ke child component. Anggap props sebagai parameter fungsi."},
      {"id":"3","title":"State dan Interaksi","type":"text","content":"State menyimpan data yang bisa berubah karena aksi user. Saat state berubah, komponen akan re-render otomatis."}
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
    'goal-setting-pelajar',
    'Goal Setting untuk Pelajar',
    'Susun target belajar yang terukur dengan framework SMART dan weekly review.',
    'productivity', 'beginner', 45, 30,
    '[
      {"id":"1","title":"Framework SMART","type":"text","content":"Tujuan harus Specific, Measurable, Achievable, Relevant, dan Time-bound agar mudah dieksekusi."},
      {"id":"2","title":"Breakdown Target","type":"text","content":"Ubah target bulanan menjadi target mingguan dan harian agar progres terasa dan mudah dipantau."},
      {"id":"3","title":"Weekly Check-in","type":"text","content":"Lakukan review mingguan untuk melihat capaian, hambatan, lalu sesuaikan rencana minggu berikutnya."}
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
      {"id":"1","title":"Persiapan Negosiasi","type":"text","content":"Tentukan target, batas minimum, dan alternatif sebelum negosiasi dimulai."},
      {"id":"2","title":"Teknik Bertanya","type":"text","content":"Pertanyaan terbuka membantu memahami kebutuhan lawan bicara dan membuka ruang win-win."},
      {"id":"3","title":"Menutup Kesepakatan","type":"text","content":"Rangkum poin yang disepakati, konfirmasi detail, lalu dokumentasikan agar jelas untuk semua pihak."}
    ]'::jsonb
  ),
  (
    'copywriting-sosmed',
    'Copywriting untuk Sosial Media',
    'Menulis caption dan hook yang jelas, relevan, dan mendorong interaksi audiens.',
    'business', 'intermediate', 60, 45,
    '[
      {"id":"1","title":"Memahami Audiens","type":"text","content":"Pesan yang efektif selalu berangkat dari kebutuhan audiens, bukan dari asumsi pembuat konten."},
      {"id":"2","title":"Formula Hook","type":"text","content":"Buka dengan kalimat yang memancing rasa ingin tahu: masalah, hasil, atau pertanyaan tajam."},
      {"id":"3","title":"Call to Action","type":"text","content":"Akhiri dengan CTA spesifik seperti komentar, simpan, atau klik link agar tujuan konten tercapai."}
    ]'::jsonb
  ),
  (
    'analisis-data-excel',
    'Analisis Data Dasar dengan Excel',
    'Gunakan fungsi Excel dasar untuk mengolah data, membuat ringkasan, dan insight sederhana.',
    'business', 'beginner', 65, 50,
    '[
      {"id":"1","title":"Struktur Data Rapi","type":"text","content":"Pastikan data tabular konsisten: satu header, tanpa merge cell, dan tipe data jelas."},
      {"id":"2","title":"Formula Penting","type":"text","content":"Pelajari SUM, AVERAGE, COUNTIF, dan IF untuk kebutuhan analisis dasar sehari-hari."},
      {"id":"3","title":"Ringkasan Cepat","type":"text","content":"Gunakan sort/filter dan pivot sederhana untuk menemukan pola serta membuat laporan singkat."}
    ]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
-- Standalone battle question bank (independent from modules table)

CREATE TABLE IF NOT EXISTS battle_questions (
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

ALTER TABLE battle_questions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'battle_questions'
      AND policyname = 'battle_questions_public_read'
  ) THEN
    CREATE POLICY "battle_questions_public_read" ON battle_questions FOR SELECT USING (is_active = true);
  END IF;
END
$$;

INSERT INTO battle_questions (category, question_text, options, correct_option, difficulty, explanation) VALUES
  -- coding
  ('coding', 'Di React, data dari parent ke child dikirim lewat apa?', '["state", "props", "context menu", "event loop"]'::jsonb, 1, 'easy', 'Props dipakai mengirim data dari parent ke child.'),
  ('coding', 'Tujuan utama Git branch adalah...', '["Memecah fitur agar kerja tim aman", "Menghapus histori", "Mengganti bahasa pemrograman", "Menghapus repository"]'::jsonb, 0, 'easy', 'Branch memisahkan perubahan per fitur/bugfix.'),
  ('coding', 'Manakah yang memicu re-render komponen React?', '["Perubahan state/props", "Rename file", "Restart laptop", "Ganti wallpaper"]'::jsonb, 0, 'medium', 'Re-render terjadi saat state atau props berubah.'),
  ('coding', 'Commit yang baik seharusnya...', '["Besar dan campur aduk", "Kecil dan fokus", "Tanpa pesan", "Langsung force push"]'::jsonb, 1, 'easy', 'Commit kecil memudahkan review dan debugging.'),
  ('coding', 'Pull Request dipakai untuk...', '["Review sebelum merge", "Backup foto", "Ganti DNS", "Install database"]'::jsonb, 0, 'easy', 'PR adalah proses review perubahan kode.'),

  -- design
  ('design', 'Design token biasanya berisi...', '["Warna, spacing, radius, typography", "Daftar kontak", "Jadwal meeting", "Endpoint API"]'::jsonb, 0, 'easy', 'Token menyimpan nilai dasar desain.'),
  ('design', 'Tujuan design system adalah...', '["Membuat UI konsisten", "Membuat desain random", "Menghapus komponen", "Meniadakan dokumentasi"]'::jsonb, 0, 'easy', 'Design system menyamakan pola UI lintas produk.'),
  ('design', 'Dalam UX research, langkah awal yang benar adalah...', '["Menentukan pertanyaan riset", "Langsung high-fidelity", "Skip interview", "Langsung deploy"]'::jsonb, 0, 'medium', 'Riset selalu dimulai dari pertanyaan yang jelas.'),
  ('design', 'Pertanyaan terbuka saat interview membantu untuk...', '["Menggali pain point", "Membatasi jawaban", "Mempercepat asumsi", "Menutup diskusi"]'::jsonb, 0, 'medium', 'Pertanyaan terbuka memberi insight lebih dalam.'),
  ('design', 'Komponen reusable penting karena...', '["Agar konsisten dan hemat waktu", "Agar semua halaman beda", "Agar susah maintenance", "Agar style inline semua"]'::jsonb, 0, 'easy', 'Reusable component mengurangi duplikasi.'),

  -- productivity
  ('productivity', 'Deep work adalah...', '["Kerja fokus tanpa distraksi", "Kerja sambil multitasking notif", "Belajar sambil scrolling", "Kerja tanpa target"]'::jsonb, 0, 'easy', 'Deep work menekankan fokus penuh pada tugas bernilai tinggi.'),
  ('productivity', 'Huruf M pada SMART berarti...', '["Measurable", "Manual", "Maximum", "Minimal"]'::jsonb, 0, 'easy', 'Goal harus bisa diukur.'),
  ('productivity', 'Review mingguan berguna untuk...', '["Evaluasi progres dan koreksi rencana", "Menghapus target", "Tambah distraksi", "Menunda kerja"]'::jsonb, 0, 'easy', 'Weekly review menjaga target tetap on track.'),
  ('productivity', 'Salah satu musuh fokus terbesar adalah...', '["Notifikasi berlebihan", "Target jelas", "Lingkungan tenang", "Jadwal realistis"]'::jsonb, 0, 'easy', 'Distraksi digital menurunkan kualitas fokus.'),
  ('productivity', 'Tujuan dipecah jadi target harian supaya...', '["Eksekusi lebih realistis", "Makin abstrak", "Tidak bisa diukur", "Sulit dipantau"]'::jsonb, 0, 'easy', 'Breakdown membuat target besar jadi actionable.'),

  -- business
  ('business', 'Langkah awal personal branding adalah...', '["Tentukan nilai unik dan audiens", "Posting acak", "Ganti niche tiap hari", "Meniru semua orang"]'::jsonb, 0, 'medium', 'Brand kuat butuh positioning yang jelas.'),
  ('business', 'Hook pada copywriting berfungsi untuk...', '["Menarik perhatian di awal", "Menutup konten", "Menghapus CTA", "Menambah jargon"]'::jsonb, 0, 'easy', 'Hook menentukan apakah audiens lanjut membaca.'),
  ('business', 'Negosiasi yang baik dimulai dari...', '["Persiapan target dan batas minimum", "Langsung setuju", "Skip diskusi", "Menekan lawan bicara"]'::jsonb, 0, 'medium', 'Persiapan membantu hasil negosiasi lebih terarah.'),
  ('business', 'CTA yang efektif sebaiknya...', '["Spesifik dan jelas", "Sangat umum", "Tidak ditulis", "Banyak instruksi sekaligus"]'::jsonb, 0, 'easy', 'CTA spesifik meningkatkan konversi aksi.'),
  ('business', 'Portofolio yang kuat menampilkan...', '["Masalah, proses, hasil", "Hanya foto", "Tanpa konteks", "Daftar kontak saja"]'::jsonb, 0, 'medium', 'Audiens butuh melihat proses dan dampak proyek.'),

  -- general
  ('general', 'Komunikasi tim yang baik biasanya ditandai dengan...', '["Ekspektasi jelas", "Asumsi tanpa konfirmasi", "Info tersebar", "Tidak ada dokumentasi"]'::jsonb, 0, 'easy', 'Kejelasan ekspektasi mengurangi miskomunikasi.'),
  ('general', 'Prioritas kerja paling sehat adalah...', '["Tugas penting dulu", "Yang paling gampang dulu selalu", "Semua sekaligus", "Tunda semua"]'::jsonb, 0, 'easy', 'Prioritaskan dampak dan urgensi.'),
  ('general', 'Saat deadline mepet, langkah pertama yang tepat...', '["Pecah tugas dan tentukan prioritas inti", "Panik", "Tambah distraksi", "Ganti semua rencana"]'::jsonb, 0, 'medium', 'Struktur prioritas membantu eksekusi saat tekanan tinggi.'),
  ('general', 'Belajar efektif biasanya terjadi saat...', '["Ada jeda review berkala", "Belajar nonstop tanpa istirahat", "Tanpa target", "Hanya hafalan pasif"]'::jsonb, 0, 'medium', 'Review berkala bantu retensi jangka panjang.'),
  ('general', 'Indikator progres terbaik adalah...', '["Output nyata yang selesai", "Lama duduk", "Banyak tab terbuka", "Sering ganti tools"]'::jsonb, 0, 'easy', 'Ukuran progres terbaik adalah hasil yang terdeliver.')
ON CONFLICT (category, question_text) DO NOTHING;
-- Harden battles UPDATE policy:
-- - Keep participant updates (player1/player2)
-- - Allow non-owner update only for safe "join room" transition
--   (waiting -> active with caller becoming player2, no score/winner tampering)

DROP POLICY IF EXISTS "battles_update" ON battles;

CREATE POLICY "battles_update" ON battles
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
-- Allow safe daily quest generation from authenticated app flow.
-- 1) Prevent duplicate quest rows per day/type
-- 2) Allow authenticated insert only for "today"

CREATE UNIQUE INDEX IF NOT EXISTS daily_quests_date_type_unique
ON daily_quests (date, quest_type);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'daily_quests'
      AND policyname = 'daily_quests_auth_insert_today'
  ) THEN
    CREATE POLICY "daily_quests_auth_insert_today"
    ON daily_quests
    FOR INSERT
    WITH CHECK (
      auth.uid() IS NOT NULL
      AND date = CURRENT_DATE
    );
  END IF;
END
$$;
-- Prevent duplicate XP claims from completing the same module repeatedly.
ALTER TABLE user_modules
ADD COLUMN IF NOT EXISTS xp_granted_at TIMESTAMPTZ;

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

