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
