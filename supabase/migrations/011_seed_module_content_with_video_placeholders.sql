-- Separate content seed/update for module lesson flow with YouTube placeholders.
-- Safe to run multiple times.
-- NOTE: Replace each YOUTUBE_URL_HERE_* with your actual YouTube URL.

UPDATE modules
SET content = '[
  {"id":"1","title":"Pengenalan HTML dan CSS","type":"text","content":"HTML dipakai untuk struktur halaman, CSS dipakai untuk tampilan. Di materi ini kamu akan memahami elemen dasar untuk membangun halaman web."},
  {"id":"2","title":"Video: Dasar HTML & CSS","type":"video","content":"https://www.youtube.com/watch?v=3U1AhjEf7DM"},
  {"id":"3","title":"Ringkasan","type":"text","content":"Setelah menonton video, pastikan kamu paham struktur dokumen HTML, selector CSS, dan cara mengatur layout sederhana."}
]'::jsonb
WHERE slug = 'html-css-dasar';

UPDATE modules
SET content = '[
  {"id":"1","title":"Konsep Dasar JavaScript","type":"text","content":"JavaScript membuat halaman web menjadi interaktif. Kamu akan belajar variabel, kondisi, dan fungsi sebagai fondasi."},
  {"id":"2","title":"Video: JavaScript Pemula","type":"video","content":"https://www.youtube.com/watch?v=mD6uSGSjgr4"},
  {"id":"3","title":"Ringkasan","type":"text","content":"Fokuskan pemahaman ke alur logika program, cara menyimpan nilai, dan cara menjalankan fungsi."}
]'::jsonb
WHERE slug = 'javascript-pemula';

UPDATE modules
SET content = '[
  {"id":"1","title":"Dasar Figma untuk UI","type":"text","content":"Figma digunakan untuk desain antarmuka. Materi ini membahas frame, komponen, dan konsistensi visual."},
  {"id":"2","title":"Video: Figma UI Dasar","type":"video","content":"https://www.youtube.com/watch?v=AmDKFOXD_Jg"},
  {"id":"3","title":"Ringkasan","type":"text","content":"Setelah sesi video, kamu seharusnya paham struktur file desain dan reusable component."}
]'::jsonb
WHERE slug = 'figma-ui-dasar';

UPDATE modules
SET content = '[
  {"id":"1","title":"Prinsip Manajemen Waktu","type":"text","content":"Belajar efektif dimulai dari prioritas, durasi fokus, dan evaluasi rutin. Gunakan prinsip sederhana agar konsisten."},
  {"id":"2","title":"Video: Manajemen Waktu Pelajar","type":"video","content":"https://www.youtube.com/watch?v=SUaBkTgpKHU"},
  {"id":"3","title":"Ringkasan","type":"text","content":"Gunakan teknik yang cocok buat ritme harian kamu, lalu evaluasi mingguan untuk melihat progres."}
]'::jsonb
WHERE slug = 'manajemen-waktu';

UPDATE modules
SET content = '[
  {"id":"1","title":"Komponen dan State di React","type":"text","content":"React membangun UI dari komponen. State dipakai saat data berubah karena aksi user."},
  {"id":"2","title":"Video: React Komponen & State","type":"video","content":"https://www.youtube.com/watch?v=kcnwI_5nKyA"},
  {"id":"3","title":"Ringkasan","type":"text","content":"Pastikan kamu paham kapan pakai props, kapan pakai state, dan bagaimana alur data antar komponen."}
]'::jsonb
WHERE slug = 'react-dasar-komponen';

UPDATE modules
SET content = '[
  {"id":"1","title":"Dasar Negosiasi","type":"text","content":"Negosiasi dimulai dari persiapan tujuan, batas minimum, dan memahami kebutuhan lawan bicara."},
  {"id":"2","title":"Video: Negosiasi Pemula","type":"video","content":"https://www.youtube.com/watch?v=Q6t3tkAIfZk"},
  {"id":"3","title":"Ringkasan","type":"text","content":"Prinsip utama negosiasi adalah win-win, komunikasi jelas, dan kesepakatan yang terdokumentasi."}
]'::jsonb
WHERE slug = 'negosiasi-dasar';
