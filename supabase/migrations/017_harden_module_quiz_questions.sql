-- Increase baseline module quiz difficulty by replacing generic fallback questions
-- with more scenario-based and reasoning-oriented items.

DELETE FROM questions q
USING modules m
WHERE q.module_id = m.id
  AND m.is_published = true
  AND (
    q.question_text LIKE 'Apa fokus utama pembelajaran pada modul "%"?'
    OR q.question_text LIKE 'Kategori materi yang paling sesuai untuk modul "%" adalah...'
    OR q.question_text LIKE 'Untuk level "%", pendekatan belajar terbaik di modul "%" adalah...'
    OR q.question_text LIKE 'Setelah menyelesaikan modul "%", output paling relevan adalah...'
    OR q.question_text LIKE 'Indikator bahwa kamu memahami modul "%" adalah...'
  );

WITH module_counts AS (
  SELECT
    m.id AS module_id,
    m.title,
    m.category,
    m.difficulty,
    COALESCE(COUNT(q.id), 0)::int AS question_count
  FROM modules m
  LEFT JOIN questions q ON q.module_id = m.id
  WHERE m.is_published = true
  GROUP BY m.id, m.title, m.category, m.difficulty
),
question_candidates AS (
  SELECT
    mc.module_id,
    mc.question_count,
    v.ord,
    v.question_text,
    v.options,
    v.correct_option,
    v.explanation,
    CASE
      WHEN mc.difficulty = 'advanced' THEN 'hard'::text
      WHEN mc.difficulty = 'intermediate' THEN 'medium'::text
      ELSE 'medium'::text
    END AS difficulty
  FROM module_counts mc
  CROSS JOIN LATERAL (
    VALUES
      (
        1,
        format('Dalam konteks modul "%s", bukti paling kuat bahwa konsepnya benar-benar dipahami adalah...', mc.title),
        jsonb_build_array(
          CASE mc.category
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
        'Pemahaman tinggi terlihat dari transfer konsep ke konteks baru, bukan sekadar reproduksi contoh.'
      ),
      (
        2,
        format('Kamu diminta membuat mini-project dari modul "%s" dengan waktu terbatas. Prioritas langkah pertama paling tepat adalah...', mc.title),
        jsonb_build_array(
          CASE mc.difficulty
            WHEN 'advanced' THEN 'Menentukan constraint teknis, kriteria keberhasilan, dan risiko utama sebelum menulis implementasi'
            WHEN 'intermediate' THEN 'Menyusun alur solusi inti dan acceptance criteria sederhana agar eksekusi tetap terarah'
            ELSE 'Memecah tujuan menjadi task kecil terukur lalu mengeksekusi versi minimum yang bisa diuji'
          END,
          'Langsung membangun fitur tambahan agar terlihat kompleks sejak awal',
          'Menghabiskan mayoritas waktu untuk styling/polishing sebelum inti solusi selesai',
          'Menunda validasi hingga project selesai total agar tidak mengganggu ritme kerja'
        ),
        0,
        'Urutan kerja yang benar dimulai dari masalah, batasan, dan target ukur sebelum optimasi kosmetik.'
      ),
      (
        3,
        format('Saat menerapkan materi "%s", hasil awal tidak sesuai ekspektasi. Tindakan iterasi paling tepat adalah...', mc.title),
        jsonb_build_array(
          CASE mc.category
            WHEN 'coding' THEN 'Profiling bottleneck, verifikasi asumsi input-output, lalu refactor bagian paling berdampak lebih dulu'
            WHEN 'design' THEN 'Uji ulang alur pengguna utama, cek friction point, lalu revisi komponen dengan dampak tertinggi'
            WHEN 'productivity' THEN 'Audit pemicu distraksi, sesuaikan beban harian, lalu ukur ulang konsistensi eksekusi mingguan'
            WHEN 'business' THEN 'Pisahkan masalah akuisisi-retensi-konversi, lalu eksperimen cepat pada variabel dengan leverage tertinggi'
            ELSE 'Identifikasi akar masalah, uji hipotesis prioritas, lalu iterasi berdasarkan data'
          END,
          'Mengganti semua pendekatan sekaligus supaya ada kemungkinan salah satunya berhasil',
          'Mempertahankan cara lama agar konsisten walau metrik terus menurun',
          'Berhenti mengukur hasil karena iterasi dianggap memperlambat progres'
        ),
        0,
        'Iterasi efektif harus berbasis diagnosa akar masalah dan prioritas dampak.'
      ),
      (
        4,
        format('Metrik evaluasi yang PALING valid untuk menilai keberhasilan penerapan modul "%s" adalah...', mc.title),
        jsonb_build_array(
          CASE mc.category
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
        'Metrik valid harus terhubung langsung dengan outcome, bukan aktivitas permukaan.'
      ),
      (
        5,
        format('Trade-off yang PALING rasional saat menerapkan modul "%s" pada resource terbatas adalah...', mc.title),
        jsonb_build_array(
          'Memaksimalkan dampak pada alur inti lebih dulu, lalu menunda optimasi sekunder ke iterasi berikutnya',
          'Memaksimalkan semua aspek sekaligus meski mengorbankan stabilitas delivery',
          'Mengutamakan elemen visual/atribut tambahan walau fungsi inti belum konsisten',
          'Menghapus tahap validasi agar proses tampak lebih cepat di awal'
        ),
        0,
        'Prioritasi resource harus mengikuti leverage dampak, bukan pemerataan kerja.'
      ),
      (
        6,
        format('Peserta bisa menjawab teori modul "%s", tapi berulang kali gagal saat praktik. Intervensi yang paling tepat adalah...', mc.title),
        jsonb_build_array(
          'Gunakan deliberate practice: pecah skill ke sub-komponen, beri feedback cepat, lalu tingkatkan kompleksitas bertahap',
          'Tambah porsi hafalan definisi agar pemahaman konseptual makin tebal',
          'Lanjutkan latihan dengan tingkat kesulitan sama tanpa review kesalahan sebelumnya',
          'Fokuskan evaluasi pada kecepatan mengerjakan agar terlihat progres lebih cepat'
        ),
        0,
        'Gap teori-praktik ditutup lewat latihan terstruktur berbasis feedback, bukan sekadar repetisi acak.'
      )
  ) AS v(ord, question_text, options, correct_option, explanation)
),
missing_candidates AS (
  SELECT
    qc.*,
    ROW_NUMBER() OVER (PARTITION BY qc.module_id ORDER BY qc.ord) AS rn
  FROM question_candidates qc
  WHERE NOT EXISTS (
    SELECT 1
    FROM questions qx
    WHERE qx.module_id = qc.module_id
      AND qx.question_text = qc.question_text
  )
),
to_insert AS (
  SELECT
    module_id,
    question_text,
    options,
    correct_option,
    difficulty,
    explanation
  FROM missing_candidates
  WHERE rn <= GREATEST(6 - question_count, 0)
)
INSERT INTO questions (module_id, question_text, options, correct_option, difficulty, explanation)
SELECT module_id, question_text, options, correct_option, difficulty, explanation
FROM to_insert;
