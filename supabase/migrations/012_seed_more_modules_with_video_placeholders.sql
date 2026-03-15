-- Add more learning modules with video placeholders.
-- Safe to run multiple times.
-- NOTE: replace "YOUTUBE_URL_HERE" in each module content as needed.

INSERT INTO modules (
  slug,
  title,
  description,
  category,
  difficulty,
  xp_reward,
  duration_minutes,
  content
)
VALUES
  (
    'typescript-dasar',
    'TypeScript Dasar',
    ' sejak awal.',
    'coding',
    'beginner',
    70,
    55,
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
    'coding',
    'intermediate',
    85,
    65,
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
    'coding',
    'beginner',
    65,
    50,
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
    'coding',
    'intermediate',
    80,
    60,
    '[
      {"id":"1","title":"Resource dan Endpoint","type":"text","content":"Tentukan resource utama lalu turunkan endpoint yang merepresentasikan aksi CRUD."},
      {"id":"2","title":"Video: REST API Design","type":"video","content":"https://www.youtube.com/watch?v=FOHJQwst1uw"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Pastikan standar status code, naming endpoint, dan struktur response konsisten."}
    ]'::jsonb
  ),
  (
    'wireframing-cepat',
    'Wireframing Cepat',
    'Susun alur layar dan prioritas konten sebelum desain high fidelity.',
    'design',
    'beginner',
    60,
    45,
    '[
      {"id":"1","title":"Tujuan Wireframe","type":"text","content":"Wireframe dipakai untuk validasi struktur dan alur, bukan untuk polish visual."},
      {"id":"2","title":"Video: Wireframing","type":"video","content":"https://www.youtube.com/watch?v=qpH7-KFWZRI"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Buat cepat, iteratif, dan fokus pada kejelasan informasi serta navigasi."}
    ]'::jsonb
  ),
  (
    'color-theory-ui',
    'Color Theory untuk UI',
    'Terapkan teori warna agar antarmuka lebih jelas dan nyaman dipakai.',
    'design',
    'intermediate',
    75,
    55,
    '[
      {"id":"1","title":"Kontras dan Hirarki","type":"text","content":"Kontras yang tepat membantu pengguna membedakan elemen penting dan elemen sekunder."},
      {"id":"2","title":"Video: Color Theory UI","type":"video","content":"https://www.youtube.com/watch?v=-4lMJ4is2pE"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Gunakan palet utama, netral, dan status color yang konsisten di seluruh halaman."}
    ]'::jsonb
  ),
  (
    'microcopy-ux-writing',
    'UX Writing & Microcopy',
    'Tulis copy antarmuka yang singkat, jelas, dan membantu pengguna.',
    'design',
    'intermediate',
    70,
    50,
    '[
      {"id":"1","title":"Prinsip Microcopy","type":"text","content":"Gunakan bahasa sederhana, langsung ke tujuan, dan sesuai konteks aksi pengguna."},
      {"id":"2","title":"Video: UX Writing","type":"video","content":"https://www.youtube.com/watch?v=1Yvu-i9H6lI"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Perbaiki label tombol, empty state, dan pesan error agar lebih actionable."}
    ]'::jsonb
  ),
  (
    'accessibility-ui-dasar',
    'Accessibility UI Dasar',
    'Buat UI yang lebih inklusif untuk berbagai kondisi pengguna.',
    'design',
    'intermediate',
    80,
    60,
    '[
      {"id":"1","title":"Dasar Aksesibilitas","type":"text","content":"Aksesibilitas mencakup kontras warna, navigasi keyboard, dan struktur semantik."},
      {"id":"2","title":"Video: Accessibility UI","type":"video","content":"https://www.youtube.com/watch?v=2oiBKSjOOFE&t=64s"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Biasakan audit komponen penting agar pengalaman semua pengguna tetap optimal."}
    ]'::jsonb
  ),
  (
    'pomodoro-efektif',
    'Teknik Pomodoro Efektif',
    'Gunakan Pomodoro secara tepat untuk menjaga fokus dan energi.',
    'productivity',
    'beginner',
    55,
    35,
    '[
      {"id":"1","title":"Aturan Dasar Pomodoro","type":"text","content":"Satu siklus terdiri dari sesi fokus pendek lalu istirahat singkat agar ritme tetap stabil."},
      {"id":"2","title":"Video: Pomodoro","type":"video","content":"https://www.youtube.com/watch?v=TsYYyo_rMd4"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Sesuaikan durasi dengan jenis tugas, lalu evaluasi hasil per sesi."}
    ]'::jsonb
  ),
  (
    'belajar-aktif-notetaking',
    'Belajar Aktif & Note-Taking',
    'Catatan belajar yang efektif untuk retensi jangka panjang.',
    'productivity',
    'beginner',
    60,
    40,
    '[
      {"id":"1","title":"Metode Catatan","type":"text","content":"Gunakan format ringkas seperti Cornell atau outline untuk memudahkan review ulang."},
      {"id":"2","title":"Video: Note-Taking","type":"video","content":"https://www.youtube.com/watch?v=SAB7l6bnDHQ"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Tulis poin inti dengan bahasa sendiri, lalu buat latihan recall singkat."}
    ]'::jsonb
  ),
  (
    'prioritas-eisenhower',
    'Prioritas dengan Eisenhower Matrix',
    'Pisahkan tugas penting vs mendesak untuk keputusan harian yang lebih tepat.',
    'productivity',
    'intermediate',
    65,
    45,
    '[
      {"id":"1","title":"Empat Kuadran Prioritas","type":"text","content":"Klasifikasikan tugas ke kuadran do, schedule, delegate, dan eliminate."},
      {"id":"2","title":"Video: Eisenhower Matrix","type":"video","content":"https://www.youtube.com/watch?v=QjWxd9jzkAY"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Review daftar tugas harian dengan matrix agar waktu dipakai untuk hal paling bernilai."}
    ]'::jsonb
  ),
  (
    'anti-prokrastinasi',
    'Strategi Anti Prokrastinasi',
    'Kurangi kebiasaan menunda dengan strategi yang realistis.',
    'productivity',
    'intermediate',
    70,
    50,
    '[
      {"id":"1","title":"Pemicu Menunda","type":"text","content":"Identifikasi pola menunda: takut gagal, tugas terlalu besar, atau distraksi berlebih."},
      {"id":"2","title":"Video: Anti Prokrastinasi","type":"video","content":"https://www.youtube.com/watch?v=5UAWUI_BjAg"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Pecah tugas menjadi langkah kecil dengan deadline jelas agar lebih mudah mulai."}
    ]'::jsonb
  ),
  (
    'presentasi-yang-meyakinkan',
    'Presentasi yang Meyakinkan',
    'Bangun struktur presentasi yang jelas dan mudah diikuti.',
    'business',
    'beginner',
    65,
    45,
    '[
      {"id":"1","title":"Struktur Presentasi","type":"text","content":"Gunakan alur masalah, solusi, bukti, dan ajakan agar pesan lebih kuat."},
      {"id":"2","title":"Video: Public Speaking Dasar","type":"video","content":"https://www.youtube.com/watch?v=zgKjAvmdY5o"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Latih pembukaan, transisi, dan penutupan agar penyampaian lebih percaya diri."}
    ]'::jsonb
  ),
  (
    'fundamental-marketing',
    'Fundamental Digital Marketing',
    'Pahami funnel, channel, dan metrik inti pemasaran digital.',
    'business',
    'intermediate',
    80,
    60,
    '[
      {"id":"1","title":"Marketing Funnel","type":"text","content":"Pahami tahapan awareness, consideration, conversion, dan retention."},
      {"id":"2","title":"Video: Digital Marketing Dasar","type":"video","content":"https://www.youtube.com/watch?v=aQbZdee5PXI"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Pilih channel sesuai audiens dan ukur hasil dengan metrik yang relevan."}
    ]'::jsonb
  ),
  (
    'pricing-strategy-dasar',
    'Pricing Strategy Dasar',
    'Susun harga produk/jasa dengan pendekatan value dan positioning.',
    'business',
    'advanced',
    95,
    70,
    '[
      {"id":"1","title":"Dasar Penentuan Harga","type":"text","content":"Harga dipengaruhi biaya, nilai yang dirasakan, dan posisi terhadap kompetitor."},
      {"id":"2","title":"Video: Pricing Strategy","type":"video","content":"https://www.youtube.com/watch?v=gJZg62uHcCg"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Uji skenario harga, evaluasi respons pasar, lalu iterasi bertahap."}
    ]'::jsonb
  ),
  (
    'business-model-canvas',
    'Business Model Canvas',
    'Petakan model bisnis secara ringkas dalam 9 blok utama.',
    'business',
    'intermediate',
    85,
    65,
    '[
      {"id":"1","title":"9 Blok BMC","type":"text","content":"Mulai dari value proposition lalu hubungkan customer segment, channel, dan revenue stream."},
      {"id":"2","title":"Video: Business Model Canvas","type":"video","content":"https://www.youtube.com/watch?v=zex88hxqY4w"},
      {"id":"3","title":"Ringkasan","type":"text","content":"Validasi asumsi model bisnis lewat eksperimen kecil dan feedback pengguna."}
    ]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
