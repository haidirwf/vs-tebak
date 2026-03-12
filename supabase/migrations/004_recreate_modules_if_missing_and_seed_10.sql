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
