-- Ensure every published module has quiz questions.
-- Strategy:
-- 1) Top-up each published module to at least 5 questions.
-- 2) Questions are tied to each module title (title is embedded in question text).
-- 3) Safe to run repeatedly.

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
    v.explanation
  FROM module_counts mc
  CROSS JOIN LATERAL (
    VALUES
      (
        1,
        format('Apa fokus utama pembelajaran pada modul "%s"?', mc.title),
        jsonb_build_array(
          format('Mempelajari inti topik "%s"', mc.title),
          'Mempelajari sejarah kerajaan kuno',
          'Mempelajari resep masakan tradisional',
          'Mempelajari teknik olahraga air'
        ),
        0,
        format('Fokus modul mengikuti judulnya: "%s".', mc.title)
      ),
      (
        2,
        format('Kategori materi yang paling sesuai untuk modul "%s" adalah...', mc.title),
        jsonb_build_array(
          CASE mc.category
            WHEN 'coding' THEN 'Teknis pemrograman dan implementasi'
            WHEN 'design' THEN 'Perancangan visual dan pengalaman pengguna'
            WHEN 'productivity' THEN 'Manajemen fokus, waktu, dan kebiasaan kerja'
            WHEN 'business' THEN 'Strategi bisnis, komunikasi, dan nilai pasar'
            ELSE 'Pengembangan skill umum'
          END,
          'Biologi kelautan',
          'Arkeologi prasejarah',
          'Astronomi antarbintang'
        ),
        0,
        'Pilihan benar mengikuti kategori modul di sistem.'
      ),
      (
        3,
        format('Untuk level "%s", pendekatan belajar terbaik di modul "%s" adalah...', mc.difficulty, mc.title),
        jsonb_build_array(
          CASE mc.difficulty
            WHEN 'beginner' THEN 'Mulai dari konsep dasar, lalu latihan sederhana'
            WHEN 'intermediate' THEN 'Perkuat konsep inti lalu kerjakan studi kasus'
            WHEN 'advanced' THEN 'Fokus pada analisis mendalam dan penerapan kompleks'
            ELSE 'Belajar bertahap sesuai konteks'
          END,
          'Langsung menghafal tanpa memahami konsep',
          'Mengabaikan latihan praktik',
          'Melewatkan evaluasi hasil belajar'
        ),
        0,
        'Strategi belajar mengikuti tingkat kesulitan modul.'
      ),
      (
        4,
        format('Setelah menyelesaikan modul "%s", output paling relevan adalah...', mc.title),
        jsonb_build_array(
          CASE mc.category
            WHEN 'coding' THEN 'Mampu membuat implementasi teknis kecil dari materi'
            WHEN 'design' THEN 'Mampu membuat rancangan UI/UX yang lebih terstruktur'
            WHEN 'productivity' THEN 'Mampu menerapkan sistem kerja yang lebih konsisten'
            WHEN 'business' THEN 'Mampu mengambil keputusan bisnis lebih terarah'
            ELSE 'Mampu menjelaskan inti materi dengan jelas'
          END,
          'Menghafal istilah tanpa praktik',
          'Tidak melakukan evaluasi pembelajaran',
          'Menghindari penerapan di proyek nyata'
        ),
        0,
        'Output belajar harus bisa diterapkan, bukan sekadar dihafal.'
      ),
      (
        5,
        format('Indikator bahwa kamu memahami modul "%s" adalah...', mc.title),
        jsonb_build_array(
          format('Bisa menjelaskan konsep modul "%s" dan menerapkannya pada tugas sederhana', mc.title),
          'Hanya membaca judul tanpa memahami isi',
          'Mengandalkan tebakan tanpa dasar',
          'Tidak pernah mencoba latihan'
        ),
        0,
        'Pemahaman terlihat dari kemampuan menjelaskan dan mempraktikkan materi.'
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
    'medium'::text AS difficulty,
    explanation
  FROM missing_candidates
  WHERE rn <= GREATEST(5 - question_count, 0)
)
INSERT INTO questions (module_id, question_text, options, correct_option, difficulty, explanation)
SELECT module_id, question_text, options, correct_option, difficulty, explanation
FROM to_insert;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM modules m
    WHERE m.is_published = true
      AND NOT EXISTS (
        SELECT 1 FROM questions q WHERE q.module_id = m.id
      )
  ) THEN
    RAISE EXCEPTION 'Masih ada modul published tanpa quiz. Cek data modules/questions.';
  END IF;
END
$$;
