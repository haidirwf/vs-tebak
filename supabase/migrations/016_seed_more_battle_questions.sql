-- Add more standalone battle questions across all categories.
-- Safe to run multiple times due to UNIQUE(category, question_text).

INSERT INTO battle_questions (category, question_text, options, correct_option, difficulty, explanation) VALUES
  -- coding
  ('coding', 'Di JavaScript, metode untuk menggabungkan array adalah...', '["map()", "join()", "concat()", "slice()"]'::jsonb, 2, 'easy', 'concat() menggabungkan dua atau lebih array.'),
  ('coding', 'HTTP status code untuk resource tidak ditemukan adalah...', '["200", "301", "404", "500"]'::jsonb, 2, 'easy', '404 berarti Not Found.'),
  ('coding', 'Tujuan utama TypeScript adalah...', '["Menambah type safety", "Mempercepat internet", "Mengganti HTML", "Menghapus bug otomatis"]'::jsonb, 0, 'easy', 'TypeScript menambah sistem tipe agar error lebih cepat terdeteksi.'),
  ('coding', 'Perintah Git untuk mengambil perubahan remote dan menggabungkannya ke branch aktif adalah...', '["git status", "git merge", "git pull", "git init"]'::jsonb, 2, 'easy', 'git pull = fetch + merge ke branch aktif.'),
  ('coding', 'Apa fungsi useEffect di React?', '["Mengatur routing", "Menangani efek samping", "Menyimpan state global", "Compile komponen"]'::jsonb, 1, 'medium', 'useEffect dipakai untuk side effect seperti fetch data dan subscription.'),
  ('coding', 'Manakah struktur data yang bekerja dengan prinsip LIFO?', '["Queue", "Stack", "Tree", "Graph"]'::jsonb, 1, 'medium', 'Stack menggunakan Last In First Out.'),

  -- design
  ('design', 'Prinsip visual hierarchy bertujuan untuk...', '["Mengarahkan perhatian pengguna", "Membuat semua elemen sama menonjol", "Menghapus kontras", "Memperbanyak warna acak"]'::jsonb, 0, 'easy', 'Hierarchy membantu pengguna memahami prioritas informasi.'),
  ('design', 'Wireframe biasanya dibuat pada tahap...', '["Validasi detail visual akhir", "Perencanaan struktur awal", "Deploy produk", "Analisis log server"]'::jsonb, 1, 'easy', 'Wireframe dipakai untuk menyusun struktur dan alur dasar.'),
  ('design', 'Whitespace dalam desain berguna untuk...', '["Membuat layout lebih padat", "Meningkatkan keterbacaan", "Menghapus navigasi", "Menambah distraksi"]'::jsonb, 1, 'easy', 'Whitespace memberi ruang agar konten lebih mudah dibaca.'),
  ('design', 'A/B testing pada UI digunakan untuk...', '["Memilih variasi desain paling efektif", "Menghapus semua metrik", "Menentukan stack backend", "Mengganti database"]'::jsonb, 0, 'medium', 'A/B test membandingkan performa dua variasi desain.'),
  ('design', 'Contrast ratio penting untuk...', '["Aksesibilitas teks", "Kecepatan build", "Ukuran file gambar", "Jumlah komponen"]'::jsonb, 0, 'medium', 'Kontras yang baik membantu keterbacaan termasuk untuk pengguna low vision.'),
  ('design', 'User flow menggambarkan...', '["Urutan langkah pengguna menyelesaikan tugas", "Daftar warna brand", "Struktur database", "Riwayat commit"]'::jsonb, 0, 'easy', 'User flow memetakan perjalanan pengguna dari awal hingga tujuan.'),

  -- productivity
  ('productivity', 'Teknik Pomodoro klasik menggunakan pola...', '["25 menit fokus + 5 menit jeda", "60 menit fokus nonstop", "10 menit fokus + 20 menit jeda", "90 menit fokus + 30 menit jeda"]'::jsonb, 0, 'easy', 'Metode paling umum adalah 25/5.'),
  ('productivity', 'To-do list efektif sebaiknya berisi...', '["Task spesifik dan terukur", "Target sangat umum", "Semua ide tanpa prioritas", "Hanya tugas yang sudah selesai"]'::jsonb, 0, 'easy', 'Task yang spesifik lebih mudah dieksekusi.'),
  ('productivity', 'Batching task berarti...', '["Mengelompokkan tugas sejenis", "Mengerjakan semua sekaligus", "Menunda tugas berat", "Menghapus jadwal harian"]'::jsonb, 0, 'medium', 'Batching mengurangi context switching.'),
  ('productivity', 'Eisenhower Matrix memisahkan tugas berdasarkan...', '["Penting dan mendesak", "Mudah dan sulit", "Online dan offline", "Individu dan tim"]'::jsonb, 0, 'medium', 'Matrix ini menilai prioritas via urgensi dan dampak.'),
  ('productivity', 'Time blocking membantu dengan cara...', '["Mengalokasikan jam khusus per tugas", "Mengerjakan tugas tanpa rencana", "Menambah notifikasi", "Membuat deadline kabur"]'::jsonb, 0, 'easy', 'Time blocking memberi batas waktu yang jelas.'),
  ('productivity', 'Retrospektif personal mingguan berguna untuk...', '["Belajar dari hasil minggu berjalan", "Menghapus semua target", "Menyalahkan faktor luar", "Menambah multitasking"]'::jsonb, 0, 'medium', 'Refleksi rutin membantu perbaikan berkelanjutan.'),

  -- business
  ('business', 'UVP (Unique Value Proposition) menjelaskan...', '["Nilai unik yang membedakan produk", "Nama domain", "Jumlah karyawan", "Harga server"]'::jsonb, 0, 'easy', 'UVP menjawab alasan utama pelanggan memilih produkmu.'),
  ('business', 'CAC dalam bisnis digital adalah...', '["Biaya mendapatkan satu pelanggan", "Total pendapatan tahunan", "Jumlah trafik organik", "Rasio error aplikasi"]'::jsonb, 0, 'medium', 'CAC = Customer Acquisition Cost.'),
  ('business', 'Funnel penjualan umumnya bergerak dari...', '["Awareness ke conversion", "Conversion ke awareness", "Support ke coding", "Testing ke wireframe"]'::jsonb, 0, 'easy', 'Funnel memetakan perjalanan calon pelanggan sampai beli.'),
  ('business', 'Validasi ide bisnis paling awal bisa dilakukan dengan...', '["Wawancara calon pengguna", "Scale besar langsung", "Rekrut tim besar dulu", "Buat iklan tanpa riset"]'::jsonb, 0, 'medium', 'Interview cepat menguji masalah dan kebutuhan pasar.'),
  ('business', 'Metode pricing berbasis value berarti...', '["Harga ditentukan dari nilai yang dirasakan pelanggan", "Harga asal murah", "Harga selalu ikut kompetitor", "Harga tanpa riset"]'::jsonb, 0, 'hard', 'Value-based pricing fokus pada manfaat yang diterima pelanggan.'),
  ('business', 'Metrik retensi menunjukkan...', '["Seberapa banyak pengguna bertahan", "Jumlah like konten", "Banyaknya rapat tim", "Jumlah desain mockup"]'::jsonb, 0, 'medium', 'Retensi mengukur kemampuan produk mempertahankan pengguna.'),

  -- general
  ('general', 'Feedback yang efektif sebaiknya...', '["Spesifik dan berbasis observasi", "Umum dan menghakimi", "Ditunda terlalu lama", "Tanpa contoh"]'::jsonb, 0, 'easy', 'Feedback yang jelas lebih mudah ditindaklanjuti.'),
  ('general', 'Root cause analysis bertujuan untuk...', '["Mencari penyebab utama masalah", "Menyalahkan individu", "Menambah kompleksitas", "Melewati evaluasi"]'::jsonb, 0, 'medium', 'Analisis akar masalah mencegah masalah berulang.'),
  ('general', 'Dokumentasi kerja tim penting karena...', '["Menjaga pengetahuan tetap terbagi", "Membuat proses lebih lambat tanpa manfaat", "Mengganti komunikasi", "Menghapus kebutuhan onboarding"]'::jsonb, 0, 'easy', 'Dokumentasi membantu kolaborasi dan onboarding.'),
  ('general', 'Saat terjadi miskomunikasi, langkah terbaik adalah...', '["Klarifikasi ekspektasi dan rangkum keputusan", "Mendiamkan masalah", "Menyalahkan pihak lain", "Mengganti semua tools"]'::jsonb, 0, 'medium', 'Klarifikasi cepat mencegah miskomunikasi berulang.'),
  ('general', 'Decision log dipakai untuk...', '["Mencatat keputusan penting dan alasannya", "Menyimpan password tim", "Mencatat absensi harian", "Mengatur warna UI"]'::jsonb, 0, 'medium', 'Decision log menjaga konteks saat tim berkembang.'),
  ('general', 'Kolaborasi lintas fungsi paling efektif saat...', '["Peran dan tujuan tiap pihak jelas", "Semua tugas tanpa owner", "Komunikasi hanya saat krisis", "Dokumen tidak pernah diperbarui"]'::jsonb, 0, 'easy', 'Kejelasan peran meningkatkan kecepatan dan kualitas eksekusi.')
ON CONFLICT (category, question_text) DO NOTHING;
