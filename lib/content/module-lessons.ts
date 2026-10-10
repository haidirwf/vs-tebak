import { LessonStep, Question } from '@/types'

export const MODULE_LESSONS_MAP: Record<string, LessonStep[]> = {
    // =========================================================================
    // 1. CODING: HTML & CSS Dasar
    // =========================================================================
    'html-css-dasar': [
        {
            id: 'html-struktur-semantik',
            title: 'Struktur Fondasi & Elemen Semantik HTML5',
            type: 'text',
            content: `HTML (*Hypertext Markup Language*) merupakan fondasi utama dari setiap situs web di internet. Bahasa ini menggunakan tag dan elemen untuk menstrukturkan informasi agar dipahami oleh peramban (*browser*), mesin pencari (SEO), dan teknologi asistif (*screen reader*).

## Struktur Standar Dokumen HTML5
Setiap dokumen HTML diawali dengan deklarasi \`<!DOCTYPE html>\` yang menginstruksikan peramban agar menggunakan mode standar HTML5 modern.

Contoh kerangka dokumen lengkap:
\`\`\`html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Petualangan Web Pertama — Skillungo</title>
</head>
<body>
  <header>
    <h1>Skillungo RPG Academy</h1>
    <p>Platform pembelajaran digital gamified untuk pelajar Indonesia.</p>
  </header>
  
  <main>
    <section>
      <h2>Selamat Datang di Dunia Web Development</h2>
      <p>Pelajari fondasi kode HTML dan CSS untuk merakit antarmuka modern.</p>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2026 Skillungo. All rights reserved.</p>
  </footer>
</body>
</html>
\`\`\`

## Memahami Elemen Semantik HTML5
Sebelum era HTML5, pengembang banyak menggunakan tag umum \`<div class="header">\` atau \`<div class="menu">\`. HTML5 memperkenalkan tag **semantik** yang memiliki arti jelas bagi peramban dan manusia:

- **\`<header>\`**: Bagian kepala halaman atau pengantar konten, biasanya memuat judul atau logo.
- **\`<nav>\`**: Penampung navigasi utama (menu tautan).
- **\`<main>\`**: Konten utama yang unik pada halaman tersebut (hanya boleh ada satu \`<main>\` per halaman).
- **\`<article>\`**: Komponen konten mandiri yang dapat didistribusikan atau digunakan ulang (misalnya postingan artikel, kartu profil, atau kartu produk).
- **\`<section>\`**: Bagian tematik dari sebuah halaman, umumnya diawali dengan heading.
- **\`<aside>\`**: Konten sampingan yang terkait secara tidak langsung (sidebar atau kutipan).
- **\`<footer>\`**: Kaki halaman yang memuat hak cipta, kontak, atau tautan tambahan.

## Hirarki Teks & Media Penting
1. **Heading (\`<h1>\` sampai \`<h6>\`)**: Gunakan satu \`<h1>\` utama per halaman sebagai judul paling penting, disusul \`<h2>\` untuk sub-bagian, dan seterusnya.
2. **Paragraf (\`<p>\`)**: Digunakan untuk teks deskriptif atau alinea bacaan.
3. **Tautan (\`<a href="...">\`)**: Menghubungkan halaman satu dengan halaman lainnya.
4. **Gambar (\`<img src="..." alt="...">\`)**: Wajib menyertakan atribut \`alt\` sebagai teks pengganti bila gambar gagal dimuat dan ramah bagi pengguna pembaca layar.`,
        },
        {
            id: 'html-video',
            title: 'Video Pembelajaran: Dasar HTML & CSS Web Development',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=3U1AhjEf7DM',
        },
        {
            id: 'css-selektor-tipografi',
            title: 'Fondasi CSS: Selektor, Warna & Tipografi',
            type: 'text',
            content: `CSS (*Cascading Style Sheets*) bertanggung jawab atas seluruh aspek visual: estetika warna, tata letak, tipografi, dan responsivitas halaman.

## Anatomi Deklarasi CSS
Aturan CSS terdiri dari **selektor** (target elemen) dan blok deklarasi berisi pasangan **properti** serta **nilai**:

\`\`\`css
/* Selektor class kartu */
.hero-card {
  background-color: #1a1a24;
  color: #f8fafc;
  border-radius: 10px;
  padding: 24px;
}
\`\`\`

## Macam-Macam Selektor CSS
- **Selektor Tag**: Menargetkan semua elemen HTML tertentu (misal: \`h1 { color: #f59e0b; }\`).
- **Selektor Class (\`.\`)**: Menargetkan elemen dengan atribut class tertentu (misal: \`.btn-action\`). Fleksibel dan sangat dianjurkan untuk gaya yang dapat dipakai ulang.
- **Selektor ID (\`#\`)**: Menargetkan elemen unik dengan ID tertentu (misal: \`#navbar\`). Hindari penggunaan berlebih karena spesifisitasnya yang terlalu tinggi.
- **Pseudo-Class (\`:\`)**: Mengatur gaya saat elemen berada dalam kondisi tertentu, seperti ketika kursor diarahkan:
\`\`\`css
.btn-action:hover {
  background-color: #d97706;
  transform: translateY(-2px);
}
\`\`\`

## Pewarnaan & Tipografi Modern
1. **Sistem Warna**:
   - **HEX**: \`#F59E0B\` (kombinasi 6 digit heksadesimal).
   - **RGB / RGBA**: \`rgba(245, 158, 11, 0.85)\` (memiliki saluran alfa untuk transparansi).
   - **HSL**: \`hsl(38, 92%, 50%)\` (Hue, Saturation, Lightness — intuitif untuk penyesuaian gelap-terang).
2. **Tipografi**:
   - Selalu atur \`line-height\` yang nyaman (misal: \`1.6\` untuk teks paragraf).
   - Gunakan \`font-family\` sistem atau web font dengan *fallback generic* (seperti \`sans-serif\`).`,
        },
        {
            id: 'css-box-model-flexbox',
            title: 'CSS Box Model & Tata Letak Flexbox Modern',
            type: 'text',
            content: `Dua konsep terpenting yang wajib dikuasai setiap developer web adalah **CSS Box Model** dan **Flexbox**.

## CSS Box Model
Setiap elemen di peramban pada dasarnya adalah sebuah kotak (*box*) yang memiliki 4 lapisan:
1. **Content**: Area inti tempat teks, gambar, atau elemen anak berada.
2. **Padding**: Ruang kosong di dalam elemen (antara konten dan border).
3. **Border**: Garis pembatas yang mengelilingi padding dan konten.
4. **Margin**: Ruang kosong di luar elemen yang memisahkan elemen tersebut dari tetangganya.

### Mengapa \`box-sizing: border-box\` Sangat Krusial?
Secara bawaan (\`content-box\`), jika kamu memberi elemen lebar \`200px\` lalu menambahkan padding \`20px\`, lebar total elemen akan membengkak menjadi \`240px\`.
Dengan menerapkan:
\`\`\`css
* {
  box-sizing: border-box;
}
\`\`\`
Peramban akan menyertakan padding dan border ke dalam ukuran lebar total yang ditentukan, sehingga tata letak tidak akan pecah atau bergeser secara tidak terduga.

## Tata Letak Modern dengan Flexbox
Flexbox (*Flexible Box Layout*) memudahkan penataan elemen secara satu dimensi (baris atau kolom) dengan pembagian ruang yang fleksibel.

Contoh penataan baris kartu petualang:
\`\`\`css
.card-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between; /* Rata kiri-kanan dengan ruang di tengah */
  align-items: center;            /* Rata tengah secara vertikal */
  gap: 16px;                      /* Jarak antar kartu */
}

.card-item {
  flex: 1;                        /* Setiap kartu membagi lebar sama rata */
}
\`\`\`

Dengan menggabungkan Box Model dan Flexbox, kamu dapat membangun antarmuka web apa pun dengan rapi, proporsional, dan adaptif di berbagai resolusi layar.`,
        },
        {
            id: 'html-css-challenge',
            title: 'Tantangan Koding: Membangun Kartu Profil Petualang',
            type: 'code',
            content: 'Latihan praktik koding interaktif: Bangun komponen Kartu Profil Petualang RPG menggunakan HTML semantik dan styling CSS modern.',
            codeChallenge: {
                language: 'html',
                instructions: 'Lengkapi file index.html dan style.css untuk merakit sebuah Kartu Profil Petualang RPG. Ikuti kriteria: buat elemen kartu semantik <article class="adventurer-card">, tambahkan judul nama petualang <h2> dengan class "adventurer-name", sertakan paragraf <p> dengan class "adventurer-bio", serta sebuah tombol <button class="btn-action">. Di file style.css, pastikan kartu memiliki border-radius dan padding, serta tombol memiliki background-color yang menarik!',
                starterHtml: `<!-- Lengkapi struktur kartu profil petualang di bawah ini -->
<article class="adventurer-card">
  <div class="card-header">
    <h2 class="adventurer-name">Ksatria Skillungo</h2>
    <span class="adventurer-role">Warrior Kelas 1</span>
  </div>

  <p class="adventurer-bio">
    Petualang tangguh yang siap menaklukkan berbagai tantangan kode dan logika web!
  </p>

  <!-- Tambahkan tombol aksi di bawah ini dengan class "btn-action" -->
  <button class="btn-action">Mulai Petualangan</button>
</article>`,
                starterCss: `/* Atur tampilan kartu profil petualang RPG di bawah ini */
.adventurer-card {
  background-color: #181822;
  border: 1px solid #2e2e42;
  border-radius: 12px;
  padding: 24px;
  max-width: 380px;
  margin: 0 auto;
  color: #f8fafc;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.adventurer-name {
  color: #f5c542;
  font-size: 20px;
  margin: 0 0 4px 0;
}

.adventurer-role {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
}

.adventurer-bio {
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.6;
  margin: 16px 0 20px 0;
}

/* Berikan styling pada tombol .btn-action */
.btn-action {
  background-color: #f59e0b;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-action:hover {
  opacity: 0.9;
}`,
                testCases: [
                    {
                        id: 'tc-card',
                        description: 'Memiliki elemen kartu <article> dengan class "adventurer-card"',
                        type: 'selector',
                        selector: 'article.adventurer-card',
                        hint: 'Pastikan ada tag <article class="adventurer-card"> sebagai pembungkus utama.',
                    },
                    {
                        id: 'tc-name',
                        description: 'Memiliki judul nama petualang <h2> dengan class "adventurer-name"',
                        type: 'selector',
                        selector: 'h2.adventurer-name',
                        hint: 'Tambahkan tag <h2 class="adventurer-name"> untuk nama karakter.',
                    },
                    {
                        id: 'tc-bio',
                        description: 'Memiliki paragraf <p> dengan class "adventurer-bio" yang terisi teks',
                        type: 'selector',
                        selector: 'p.adventurer-bio',
                        hint: 'Pastikan elemen <p class="adventurer-bio"> memuat deskripsi petualang.',
                    },
                    {
                        id: 'tc-button',
                        description: 'Memiliki tombol aksi <button> dengan class "btn-action"',
                        type: 'selector',
                        selector: 'button.btn-action',
                        hint: 'Tambahkan tag <button class="btn-action">Teks Tombol</button>.',
                    },
                    {
                        id: 'tc-css-card',
                        description: 'File style.css menerapkan properti "border-radius" pada kartu .adventurer-card',
                        type: 'css',
                        selector: '.adventurer-card',
                        cssProperty: 'border-radius',
                        hint: 'Buka tab style.css dan pastikan .adventurer-card memiliki border-radius.',
                    },
                    {
                        id: 'tc-css-btn',
                        description: 'File style.css menerapkan properti "background-color" pada tombol .btn-action',
                        type: 'css',
                        selector: '.btn-action',
                        cssProperty: 'background-color',
                        hint: 'Buka tab style.css dan berikan properti background-color pada .btn-action.',
                    },
                ],
                hints: [
                    'Gunakan tab index.html untuk menyusun elemen dan tab style.css untuk memberikan gaya tampilan.',
                    'Pastikan ejaan class sesuai huruf kecil: "adventurer-card", "adventurer-name", dan "btn-action".',
                    'Periksa apakah tombol sudah berada di dalam elemen <article class="adventurer-card">.',
                ],
            },
        },
    ],

    // =========================================================================
    // 2. CODING: JavaScript untuk Pemula
    // =========================================================================
    'javascript-pemula': [
        {
            id: 'js-variabel',
            title: 'Variabel Modern (let & const)',
            type: 'text',
            content: `JavaScript modern (ES6+) memperkenalkan kata kunci \`let\` dan \`const\` untuk mendeklarasikan variabel dengan cakupan blok (*block scope*).

## Menentukan Deklarasi yang Tepat
Gunakan \`const\` secara bawaan untuk nilai yang tidak akan di-reassign, dan gunakan \`let\` jika nilai variabel perlu diperbarui di kemudian waktu.

Contoh deklarasi variabel:
\`\`\`javascript
const kursus = "JavaScript Pemula";
let skorLatihan = 85;

// Memperbarui skor
skorLatihan = skorLatihan + 15;

console.log(\`Selamat! Kursus \${kursus} meraih skor: \${skorLatihan}\`);
\`\`\`

Hindari penggunaan kata kunci \`var\` warisan lama untuk mencegah ketidaksengajaan *variable hoisting*.`,
        },
        {
            id: 'js-video',
            title: 'Video Pembelajaran: JavaScript Pemula',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=mD6uSGSjgr4',
        },
        {
            id: 'js-fungsi',
            title: 'Fungsi & Arrow Function',
            type: 'text',
            content: `Fungsi adalah blok kode terstruktur yang dapat dipanggil berulang kali untuk mengeksekusi logika tertentu.

Contoh fungsi konvensional dan arrow function:
\`\`\`javascript
// Arrow function ringkas untuk kalkulasi XP
const hitungBonusXP = (baseXP, persentase) => {
  return baseXP + (baseXP * persentase / 100);
};

const totalXP = hitungBonusXP(50, 15);
console.log("Total XP Didapat:", totalXP); // 57.5
\`\`\`

Arrow function memberikan sintaks yang lebih padat dan menjaga konteks \`this\` secara leksikal.`,
        },
    ],

    // =========================================================================
    // 3. CODING: React Dasar: Komponen & State
    // =========================================================================
    'react-dasar-komponen': [
        {
            id: 'react-komponen',
            title: 'Komponen & Props di React',
            type: 'text',
            content: `React membangun antarmuka pengguna berbasis komponen modular yang dapat digunakan kembali (*reusable components*).

## Membangun Komponen Fungsional
Komponen React ditulis menggunakan sintaks JSX yang menggabungkan kemampuan logika JavaScript dan struktur deklaratif.

Contoh komponen kartu ucapan:
\`\`\`jsx
function WelcomeCard({ name, role }) {
  return (
    <div className="welcome-card">
      <h2>Halo, {name}!</h2>
      <p>Peran aktif: {role}</p>
    </div>
  );
}

export default function App() {
  return <WelcomeCard name="Petualang" role="Frontend Developer" />;
}
\`\`\`

Props bersifat *read-only* (tidak dapat diubah langsung oleh komponen anak), menjaga aliran data satu arah yang dapat diprediksi.`,
        },
        {
            id: 'react-video',
            title: 'Video: React Komponen & State',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=kcnwI_5nKyA',
        },
        {
            id: 'react-inline-style',
            title: 'Inline Style pada Komponen React',
            type: 'text',
            content: `Pemberian *styling* dengan cara *Inline* merupakan salah satu teknik yang cepat digunakan ketika membangun purwarupa antarmuka di React.

## Hal yang Harus Diperhatikan dalam Menerapkan Inline Style
*Inline Style* **dapat diterapkan** pada React, namun terdapat beberapa perbedaan dibanding HTML konvensional.

Pertama, yang perlu disiapkan adalah *prop* \`style\`. *Prop* ini menerima objek JavaScript dengan *key* dan *value styling* yang akan diberikan.

Contoh:
\`\`\`jsx
function App() {
  const styles = {
    color: "#F5C542",
    fontSize: "16px",
    backgroundColor: "#18181b",
  };

  return (
    <div>
      <p style={styles}>Ini adalah teks dengan inline style bernuansa emas.</p>
    </div>
  );
}
\`\`\`

Atau juga bisa dituliskan secara langsung di dalam tag JSX (*double curly braces*):
\`\`\`jsx
function App() {
  return (
    <div>
      <p
        style={{
          color: "#F5C542",
          fontSize: "16px",
          backgroundColor: "#18181b",
        }}
      >
        Ini adalah teks dengan inline style.
      </p>
    </div>
  );
}
\`\`\`

Key pada objek style yang memiliki lebih dari satu kata, ditulis dengan gaya penulisan *camelCase* seperti \`fontSize\` dan \`backgroundColor\`.`,
        },
    ],

    // =========================================================================
    // 4. CODING: Git & GitHub untuk Kolaborasi
    // =========================================================================
    'git-github-kolaborasi': [
        {
            id: 'git-fondasi',
            title: 'Fondasi Version Control & Git Workflow',
            type: 'text',
            content: `Git adalah sistem kontrol versi terdistribusi (*Distributed Version Control System*) yang mencatat setiap riwayat perubahan baris kode proyek secara terperinci.

## Tiga Area Utama di Git
Dalam siklus kerja lokal, kode bergerak melalui tiga status penting:
- **Working Directory**: Tempat kamu mengedit berkas kode secara langsung.
- **Staging Area (Index)**: Titik persiapan berkas mana saja yang siap disimpan.
- **Repository (.git)**: Tempat snapshot kode tersimpan permanen setelah di-commit.

Contoh perintah dasar harian:
\`\`\`bash
# Memeriksa status berkas
git status

# Menambahkan perubahan ke Staging Area
git add src/components/Header.tsx

# Membuat commit atomik dengan pesan jelas
git commit -m "feat: add user navigation dropdown to header"
\`\`\`

Pastikan pesan commit menggunakan format imperatif yang menjelaskan niat perubahan secara ringkas.`,
        },
        {
            id: 'git-video',
            title: 'Video Pembelajaran: Git & GitHub Kolaborasi',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
        },
        {
            id: 'git-branching',
            title: 'Branching Strategy & Pull Request',
            type: 'text',
            content: `Saat bekerja dalam tim, hindari melakukan commit langsung ke branch utama (\`main\`). Gunakan sistem *Feature Branch* untuk mengisolasi setiap fitur atau perbaikan bug.

## Alur Kerja Kolaborasi Tim
1. Buat branch baru dari branch \`main\` terbaru:
\`\`\`bash
git checkout -b feat/sistem-duel-1v1
\`\`\`
2. Lakukan pekerjaan, commit secara bertahap, lalu push ke remote repository:
\`\`\`bash
git push -u origin feat/sistem-duel-1v1
\`\`\`
3. Buka **Pull Request (PR)** di GitHub. Sertakan ringkasan perubahan, bukti pengujian lokal, dan minta ulasan dari rekan tim sebelum di-merge.

Pendekatan ini meminimalkan konflik kode (*merge conflict*) dan menjamin branch utama selalu stabil di production.`,
        },
    ],

    // =========================================================================
    // 5. CODING: TypeScript Dasar
    // =========================================================================
    'typescript-dasar': [
        {
            id: 'ts-intro',
            title: 'Kenapa TypeScript & Type Annotation',
            type: 'text',
            content: `TypeScript adalah *superset* dari JavaScript yang menambahkan sistem tipe statis (*static typing*). Kode diperiksa sebelum dijalankan (*compile-time*), sehingga mencegah galat fatal di lingkungan produksi.

## Tipe Primitif & Type Inference
TypeScript secara cerdas dapat menebak tipe data (*type inference*), namun kamu juga dapat mendeklarasikannya secara eksplisit (*type annotation*).

Contoh deklarasi tipe:
\`\`\`typescript
// Tipe primitif eksplisit
const username: string = "Arka_Warrior";
const level: number = 14;
const isOnline: boolean = true;

// Fungsi dengan tipe parameter dan nilai balik
function tambahXP(currentXP: number, rewardXP: number): number {
  return currentXP + rewardXP;
}

const totalBaru = tambahXP(120, 50);
console.log("XP Sekarang:", totalBaru);
\`\`\`

Hindari menggunakan tipe \`any\` karena menghilangkan semua manfaat keamanan yang ditawarkan TypeScript.`,
        },
        {
            id: 'ts-video',
            title: 'Video Pembelajaran: TypeScript Dasar',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=nFwmB1_iQ7A&t=216s',
        },
        {
            id: 'ts-interface',
            title: 'Interface, Type Alias & Union Types',
            type: 'text',
            content: `Untuk memodelkan data objek yang kompleks seperti profil pemain atau data modul, gunakan \`interface\` atau \`type\`.

## Contoh Pemodelan Karakter RPG
\`\`\`typescript
type AvatarClass = 'warrior' | 'mage' | 'archer' | 'healer';

interface UserProfile {
  id: string;
  username: string;
  avatarClass: AvatarClass;
  xp: number;
  badgeCount?: number; // properti opsional
}

const pemain: UserProfile = {
  id: "usr_992",
  username: "Citra_Healer",
  avatarClass: "healer",
  xp: 450,
};
\`\`\`

Dengan *Union Types* (\`'warrior' | 'mage' | ...\`), kamu mencegah kesalahan salah ketik (*typo*) pada data status karakter di seluruh aplikasi.`,
        },
    ],

    // =========================================================================
    // 6. CODING: Next.js Fundamental
    // =========================================================================
    'nextjs-fundamental': [
        {
            id: 'next-router',
            title: 'Arsitektur App Router & Konvensi Berkas',
            type: 'text',
            content: `Next.js App Router menggunakan sistem perutean berbasis struktur folder di dalam direktori \`app/\`. Setiap segmen URL diwakili oleh sebuah nama folder.

## Konvensi Berkas Inti
- \`page.tsx\`: Komponen antarmuka utama yang dapat diakses melalui URL.
- \`layout.tsx\`: Tata letak bersama yang membungkus beberapa halaman dan mempertahankan state saat navigasi.
- \`loading.tsx\`: Tampilan skeleton instan berbasis React Suspense saat halaman sedang memuat data.
- \`error.tsx\`: Penanganan galat otomatis di level segmen rute.

Contoh struktur rute:
\`\`\`text
app/
├── layout.tsx         # Root Layout
├── page.tsx           # URL: /
└── modules/
    ├── page.tsx       # URL: /modules
    └── [slug]/
        └── page.tsx   # URL: /modules/:slug
\`\`\`

Dengan konvensi ini, navigasi antar halaman terasa sangat responsif dan efisien.`,
        },
        {
            id: 'next-video',
            title: 'Video Pembelajaran: Next.js Fundamental',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=WyTIjLegirE',
        },
        {
            id: 'next-rsc',
            title: 'Server Components vs Client Components',
            type: 'text',
            content: `Secara bawaan (*default*), seluruh komponen di dalam direktori \`app/\` adalah **React Server Components (RSC)**.

## Perbedaan Peran & Penerapan
- **Server Component**: Merender HTML langsung di server. Sangat cepat, ukuran berkas JavaScript klien kecil, dan dapat langsung mengakses basis data secara aman tanpa membocorkan kredensial.
- **Client Component**: Ditandai dengan arahan \`'use client'\` di baris pertama berkas. Diperlukan saat komponen membutuhkan interaktivitas (seperti \`useState\`, \`useEffect\`, event handler \`onClick\`, atau browser API).

Contoh integrasi:
\`\`\`tsx
// app/modules/[slug]/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server';
import ModuleDetail from './ModuleDetail';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: module } = await supabase.from('modules').select('*').eq('slug', slug).single();

  // Teruskan data server ke Client Component interaktif
  return <ModuleDetail module={module} />;
}
\`\`\`

Pola ini menghasilkan performa optimal dengan waktu muat awal (*First Contentful Paint*) yang sangat singkat.`,
        },
    ],

    // =========================================================================
    // 7. CODING: SQL Dasar untuk Pemula
    // =========================================================================
    'sql-dasar-pemula': [
        {
            id: 'sql-select',
            title: 'Sintaks SELECT, WHERE & Filtering Data',
            type: 'text',
            content: `SQL (*Structured Query Language*) adalah bahasa standar untuk berinteraksi dengan basis data relasional seperti PostgreSQL, MySQL, dan SQLite.

## Membaca Data Tertentu
Klausa \`SELECT\` menentukan kolom yang ingin diambil, \`FROM\` menentukan tabel sumber, dan \`WHERE\` menyaring baris berdasarkan kriteria tertentu.

Contoh query dasar:
\`\`\`sql
-- Mengambil nama pengguna dan level untuk pemain level 10 ke atas
SELECT username, level, xp
FROM profiles
WHERE level >= 10 AND avatar_class = 'mage'
ORDER BY xp DESC;
\`\`\`

Hindari penggunaan \`SELECT *\` di lingkungan produksi berskala besar. Cantumkan nama kolom secara spesifik untuk menghemat bandwidth memori database.`,
        },
        {
            id: 'sql-video',
            title: 'Video Pembelajaran: SQL Dasar untuk Pemula',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=kbKty5ZVKMY',
        },
        {
            id: 'sql-agregasi',
            title: 'Fungsi Agregasi & Pengelompokan (GROUP BY)',
            type: 'text',
            content: `Fungsi agregasi digunakan untuk menghitung nilai rangkuman dari sekumpulan baris data, seperti jumlah total, rata-rata, nilai tertinggi, atau penghitungan frekuensi.

## Contoh Penggunaan GROUP BY
\`\`\`sql
-- Menghitung total pemain dan rata-rata XP per kelas avatar
SELECT 
  avatar_class,
  COUNT(id) AS total_pemain,
  ROUND(AVG(xp), 1) AS rata_rata_xp,
  MAX(level) AS level_tertinggi
FROM profiles
GROUP BY avatar_class
HAVING COUNT(id) > 0;
\`\`\`

Klausa \`HAVING\` digunakan untuk memfilter hasil agregasi setelah proses pengelompokan selesai, berbeda dengan \`WHERE\` yang memfilter baris sebelum dikelompokkan.`,
        },
    ],

    // =========================================================================
    // 8. CODING: REST API Design Dasar
    // =========================================================================
    'api-design-rest': [
        {
            id: 'rest-prinsip',
            title: 'Prinsip Dasar Arsitektur RESTful API',
            type: 'text',
            content: `REST (*Representational State Transfer*) adalah standar arsitektur komunikasi layanan web berbasis protokol HTTP yang bersifat *stateless*.

## Penamaan Endpoint Berorientasi Resource
Endpoint RESTful harus menggunakan kata benda jamak (*plural nouns*) yang merepresentasikan entitas data, bukan kata kerja aksi.

Contoh konvensi yang benar vs salah:
- ❌ **Kurang tepat**: \`GET /api/getUserModules\` atau \`POST /api/deleteItem\`
- ✅ **Sesuai standar REST**:
  - \`GET /api/modules\` : Mendapatkan daftar seluruh modul
  - \`GET /api/modules/html-css-dasar\` : Mengambil modul spesifik
  - \`POST /api/modules\` : Membuat modul baru
  - \`DELETE /api/items/it_sword_01\` : Menghapus item tertentu

HTTP method (\`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`) sudah mewakili kata kerja operasi yang dilakukan.`,
        },
        {
            id: 'rest-video',
            title: 'Video Pembelajaran: REST API Design',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=FOHJQwst1uw',
        },
        {
            id: 'rest-status-code',
            title: 'Standar Status Code & Format Respons JSON',
            type: 'text',
            content: `Gunakan HTTP Status Code standar agar aplikasi frontend dapat menangani respons jaringan dengan konsisten dan terprediksi.

## Kategori Status Code Utama
- **200 OK**: Permintaan berhasil.
- **201 Created**: Entitas baru berhasil dibuat (misal pendaftaran user atau claim item).
- **400 Bad Request**: Payload request klien tidak valid (salah format/tipe data).
- **401 Unauthorized**: Pengguna belum terautentikasi (belum login).
- **403 Forbidden**: Pengguna terautentikasi namun tidak memiliki hak akses.
- **404 Not Found**: Data atau rute tidak ditemukan.
- **500 Internal Server Error**: Kegagalan tak terduga pada server backend.

Contoh struktur payload respons standar:
\`\`\`json
{
  "success": true,
  "data": {
    "moduleId": "mod_01",
    "xpAwarded": 50,
    "streak": 3
  },
  "message": "Modul berhasil diselesaikan"
}
\`\`\``,
        },
    ],

    // =========================================================================
    // 9. DESIGN: Desain UI dengan Figma
    // =========================================================================
    'figma-ui-dasar': [
        {
            id: 'figma-workspace',
            title: 'Workspace, Frame & Auto Layout di Figma',
            type: 'text',
            content: `Figma adalah alat desain antarmuka berbasis komputasi awan yang menjadi standar industri global untuk kolaborasi UI/UX Designer dan Developer.

## Auto Layout: Fondasi Desain Responsif
Fitur **Auto Layout** di Figma bekerja sangat mirip dengan konsep CSS Flexbox di pengembangan web.

Tiga prinsip penting Auto Layout:
1. **Direction**: Mengatur susunan elemen secara vertikal atau horizontal.
2. **Spacing & Padding**: Memberikan jarak konsisten antar elemen tanpa perlu menggeser layer secara manual.
3. **Resizing Constraints**:
   - \`Fixed\`: Dimensi ukuran bernilai tetap.
   - \`Hug Contents\`: Ukuran frame menyesuaikan konten di dalamnya.
   - \`Fill Container\`: Frame memanjang mengisi seluruh ruang kontainer induk.

Dengan menguasai Auto Layout, desain tombol, kartu modul, dan navigasi akan otomatis rapi saat teks bertambah panjang.`,
        },
        {
            id: 'figma-video',
            title: 'Video Pembelajaran: Figma UI Dasar',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=AmDKFOXD_Jg',
        },
        {
            id: 'figma-komponen',
            title: 'Komponen Reusable & Prototyping',
            type: 'text',
            content: `Dalam alur kerja profesional, elemen visual yang berulang harus dijadikan **Component** (\`Ctrl + Alt + K\`).

## Main Component & Instance
- **Main Component**: Master desain yang mendefinisikan tampilan dasar.
- **Instance**: Duplikasi komponen yang dapat dikustomisasi kontennya (*override*) namun tetap terikat pada gaya induknya.

## Prototyping Alur Antarmuka
Hubungkan frame satu dengan frame lain melalui tab *Prototype*. Gunakan transisi interaktif seperti *Smart Animate* untuk menyimulasikan pengalaman animasi tombol hover, transisi halaman, dan drawer slide-over sebelum diserahkan ke tim developer (*developer handoff*).`,
        },
    ],

    // =========================================================================
    // 10. DESIGN: Design System Dasar
    // =========================================================================
    'design-system-dasar': [
        {
            id: 'ds-anatomi',
            title: 'Anatomi Design System & Fondasi Token',
            type: 'text',
            content: `Design System adalah kumpulan standar desain, pedoman aturan, dan komponen kode reusable yang digunakan bersama oleh tim produk untuk menjaga konsistensi visual.

## Apa itu Design Token?
Design Token adalah nama variabel semantik untuk menyimpan nilai desain atomik (seperti kode warna heksadesimal, ukuran tipografi, dan spasi).

Contoh hirarki token:
- **Global Token**: \`--color-gold-400: #F5C542\`
- **Semantic Token**: \`--accent-primary: var(--color-gold-400)\`
- **Component Token**: \`--button-primary-bg: var(--accent-primary)\`

Dengan pendekatan token semantik, perubahan tema (misalnya mode gelap ke mode terang) dapat dilakukan cukup dengan mengganti pemetaan token tanpa mengubah baris kode komponen individual.`,
        },
        {
            id: 'ds-video',
            title: 'Video Pembelajaran: Membangun Design System',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=AmDKFOXD_Jg',
        },
        {
            id: 'ds-komponen',
            title: 'Dokumentasi Komponen & State Management UI',
            type: 'text',
            content: `Setiap komponen antarmuka yang masuk ke dalam Design System harus mendokumentasikan variasi statusnya (*states*) secara lengkap.

## Status Wajib untuk Komponen Interaktif:
1. **Default / Rest**: Tampilan awal sebelum ada interaksi.
2. **Hover**: Respon visual saat kursor berada di atas elemen.
3. **Active / Pressed**: Respon saat tombol sedang diklik atau ditekan.
4. **Focus**: Indikator cincin kontras (*focus ring*) untuk aksesibilitas navigasi keyboard.
5. **Disabled**: Status non-aktif dengan opasitas rendah saat aksi belum diizinkan.

Dokumentasi yang jelas memangkas waktu komunikasi antar desainer dan perekayasa perangkat lunak hingga 40%.`,
        },
    ],

    // =========================================================================
    // 11. DESIGN: UX Research untuk Pemula
    // =========================================================================
    'ux-research-pemula': [
        {
            id: 'uxr-tujuan',
            title: 'Merumuskan Masalah & Pertanyaan Riset',
            type: 'text',
            content: `UX Research adalah proses sistematis mempelajari kebutuhan, perilaku, dan hambatan pengguna nyata untuk memastikan produk yang dibuat benar-benar menyelesaikan masalah yang tepat.

## Menghindari Asumsi Pribadi
Sering kali desainer membuat antarmuka berdasarkan apa yang *mereka sukai*, bukan apa yang *pengguna butuhkan*.

Langkah awal merumuskan riset:
1. **Identifikasi Masalah**: Masalah apa yang dihadapi pelajar saat belajar mandiri?
2. **Sasaran Riset**: Memahami alasan utama siswa berhenti mengerjakan modul di tengah jalan.
3. **Pertanyaan Terbuka**: Ajukan pertanyaan berawalan *"Bagaimana biasanya kamu..."* atau *"Ceritakan pengalaman terakhir saat kamu..."* alih-alih pertanyaan yang dijawab *"ya/tidak"*.`,
        },
        {
            id: 'uxr-video',
            title: 'Video Pembelajaran: UX Research Dasar',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=b4O6Fz1_O8s',
        },
        {
            id: 'uxr-sintesis',
            title: 'Sintesis Insight & Pembuatan User Persona',
            type: 'text',
            content: `Setelah melakukan wawancara dengan 5–8 pengguna, kumpulkan catatan ke dalam papan *Affinity Mapping*.

## Mengelompokkan Temuan Menjadi Tindakan
- **Pain Points**: Hambatan terbesar yang dirasakan pengguna (misal: materi terlalu panjang tanpa ringkasan).
- **Motivasi**: Pendorong pengguna untuk terus belajar (misal: sistem XP level-up dan ranking sekolah).
- **Actionable Insight**: Rekomendasi konkret perbaikan fitur (misal: memecah materi panjang menjadi kartu langkah 3 menit dengan bar progres instan).

Hasil riset ini menjadi dasar kokoh penentuan roadmap fitur bagi seluruh tim pengembangan.`,
        },
    ],

    // =========================================================================
    // 12. DESIGN: Color Theory untuk UI
    // =========================================================================
    'color-theory-ui': [
        {
            id: 'color-hirarki',
            title: 'Hirarki Warna & Formula 60-30-10',
            type: 'text',
            content: `Pewarnaan antarmuka digital bukan sekadar dekorasi, melainkan bahasa visual yang memandu mata pengguna ke elemen paling penting di layar.

## Aturan Klasik 60 - 30 - 10
- **60% Warna Dominan Netral**: Latar kanvas dasar dan ruang kosong (*white space*), seperti putih bersih (\`#ffffff\`) atau abu-abu lembut (\`#fafafa\`).
- **30% Warna Sekunder Struktur**: Permukaan kartu, header topbar, teks sekunder, dan garis tepi border.
- **10% Warna Aksen Utama**: Tombol aksi utama (*Call to Action*), lencana reward emas, dan indikator progres.

Dengan proporsi ini, antarmuka terlihat tenang, profesional, dan mata pengguna tidak cepat lelah saat belajar berjam-jam.`,
        },
        {
            id: 'color-video',
            title: 'Video Pembelajaran: Color Theory UI',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=-4lMJ4is2pE',
        },
        {
            id: 'color-aksesibilitas',
            title: 'Aksesibilitas Kontras WCAG & Semantic Palette',
            type: 'text',
            content: `Setiap kombinasi warna teks dan latar belakang wajib memenuhi standar kontras keterbacaan **WCAG (Web Content Accessibility Guidelines)** minimal level AA.

## Rasio Kontras Minimum
- **Teks Reguler (di bawah 18px)**: Rasio kontras minimal **4.5 : 1** terhadap latar belakang.
- **Teks Besar / Heading**: Rasio kontras minimal **3 : 1**.

## Warna Semantik Fungsional
Gunakan warna yang memiliki makna universal untuk status sistem:
- **Hijau**: Keberhasilan (*Success*), penyelesaian modul, kenaikan streak.
- **Emas / Kuning**: Penghargaan (*Reward*), XP poin, peringatan tip ringan.
- **Merah**: Galat (*Error*), jawaban kuis salah, zona bahaya.
- **Biru**: Panduan bantuan, informasi netral, dan dokumentasi eksternal.`,
        },
    ],

    // =========================================================================
    // 13. PRODUCTIVITY: Manajemen Waktu Pelajar
    // =========================================================================
    'manajemen-waktu': [
        {
            id: 'waktu-matriks',
            title: 'Matriks Prioritas Eisenhower (Urgent vs Important)',
            type: 'text',
            content: `Banyak pelajar merasa sibuk seharian namun tidak ada target penting yang benar-benar tercapai. Kuncinya terletak pada membedakan hal yang **Mendesak (*Urgent*)** dan hal yang **Penting (*Important*)**.

## 4 Kuadran Eisenhower
1. **Kuadran 1 (Mendesak & Penting)**: Kerjakan segera! Tugas sekolah dengan tenggat waktu hari ini atau persiapan ujian besok.
2. **Kuadran 2 (Tidak Mendesak tapi Penting)**: Jadwalkan teratur! Belajar skill coding baru, membaca modul Skillungo, dan berolahraga. Inilah area pertumbuhan jangka panjangmu.
3. **Kuadran 3 (Mendesak tapi Tidak Penting)**: Delegasikan atau batasi! Pesan grup chat yang terus berdering.
4. **Kuadran 4 (Tidak Mendesak & Tidak Penting)**: Hapus atau minimalisasi! *Doom-scrolling* media sosial tanpa tujuan.

Fokuskan 60% energimu pada aktivitas di **Kuadran 2** untuk melihat lonjakan prestasi yang nyata.`,
        },
        {
            id: 'waktu-video',
            title: 'Video Pembelajaran: Manajemen Waktu Pelajar',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=SUaBkTgpKHU',
        },
        {
            id: 'waktu-timeblock',
            title: 'Teknik Time-Blocking & Review Mingguan',
            type: 'text',
            content: `Alih-alih membuat daftar to-do list tanpa batasan jam, gunakan metode **Time-Blocking** di mana setiap jam dalam harimu memiliki blok tugas spesifik.

## Cara Menerapkan Time-Blocking
- **07.00 - 13.00**: Blok Pembelajaran Formal Sekolah.
- **15.00 - 16.30**: Blok Belajar Skill Mandiri (1 modul Skillungo + latihan kuis).
- **16.30 - 17.30**: Blok Buffer & Istirahat (olahraga / hobi).

Tutup setiap akhir pekan dengan refleksi 10 menit: berapa target yang tuntas, apa kendala utama, dan apa prioritas terbesar untuk pekan depan.`,
        },
    ],

    // =========================================================================
    // 14. PRODUCTIVITY: Deep Work & Fokus Belajar
    // =========================================================================
    'fokus-deep-work': [
        {
            id: 'deep-konsep',
            title: 'Konsep Deep Work vs Shallow Work',
            type: 'text',
            content: `Istilah **Deep Work** diperkenalkan oleh profesor ilmu komputer Cal Newport: kemampuan fokus tanpa distraksi pada tugas yang menuntut kemampuan kognitif tinggi.

## Mengapa Deep Work Sangat Berharga?
- **Deep Work**: Memecahkan masalah algoritma rumit, merancang arsitektur aplikasi, atau memahami konsep baru secara mendalam. Hasilnya bernilai tinggi dan sulit digantikan.
- **Shallow Work**: Tugas-tugas administratif bernilai rendah yang bisa dikerjakan sambil terdistraksi (seperti membalas chat singkat atau merapikan folder berkas).

Di era kecerdasan buatan, orang yang mampu mempertahankan fokus mendalam selama 90 menit tanpa teralihkan akan memiliki keunggulan kompetitif luar biasa.`,
        },
        {
            id: 'deep-video',
            title: 'Video Pembelajaran: Deep Work & Fokus',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=TsYYyo_rMd4',
        },
        {
            id: 'deep-ritual',
            title: 'Membangun Ritual Fokus & Shutdown Routine',
            type: 'text',
            content: `Fokus tidak muncul secara kebetulan; fokus dibangun melalui ritual lingkungan yang konsisten.

## Checklist Sesi Deep Work 60 Menit
1. **Singkirkan Smartphone**: Letakkan ponsel di ruangan berbeda atau aktifkan mode *Do Not Disturb*.
2. **Siapkan Alat Kerja**: Buka hanya tab modul yang sedang dipelajari dan editor kode yang relevan.
3. **Tetapkan Satu Output Pasti**: *"Sesi ini tuntas apabila latihan kuis modul React selesai dikerjakan."*
4. **Shutdown Routine**: Di akhir sesi, catat progres terakhir agar otak tidak terus memikirkan tugas saat waktu istirahat tiba.`,
        },
    ],

    // =========================================================================
    // 15. PRODUCTIVITY: Teknik Pomodoro Efektif
    // =========================================================================
    'pomodoro-efektif': [
        {
            id: 'pomo-dasar',
            title: 'Siklus Interval 25 - 5 & Ritme Otak',
            type: 'text',
            content: `Teknik Pomodoro dikembangkan oleh Francesco Cirillo pada akhir tahun 1980-an menggunakan pengatur waktu dapur berbentuk tomat.

## Alur Dasar 1 Siklus Pomodoro
1. Pilih satu tugas spesifik yang ingin diselesaikan.
2. Pasang timer selama **25 menit**.
3. Bekerja secara intensif tanpa membuka tab lain hingga timer berbunyi.
4. Istirahat sejenak selama **5 menit** (berdiri, minum air, regangkan tubuh).
5. Ulangi 4 siklus, lalu ambil istirahat panjang selama **15–30 menit**.

Istirahat 5 menit memberi kesempatan bagi otak untuk melakukan konsolidasi memori materi yang baru saja dipelajari.`,
        },
        {
            id: 'pomo-video',
            title: 'Video Pembelajaran: Teknik Pomodoro',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=TsYYyo_rMd4',
        },
        {
            id: 'pomo-interupsi',
            title: 'Menangani Interupsi Internal & Eksternal',
            type: 'text',
            content: `Tantangan terbesar saat menjalankan Pomodoro adalah interupsi. Interupsi terbagi menjadi dua jenis:

## 1. Interupsi Internal (Pikiran Sendiri)
Tiba-tiba kamu ingat ingin mencari sepatu baru atau mengecek media sosial.
- **Solusi**: Siapkan selembar kertas kosong (*Distraction Sheet*). Catat ide tersebut dalam 3 detik, lalu segera kembali ke tugasmu. Eksekusi catatan itu saat jam istirahat.

## 2. Interupsi Eksternal (Orang Lain)
Teman mengajak mengobrol saat timer masih berjalan.
- **Solusi**: Terapkan metode *Inform - Negotiate - Call Back*: beri tahu bahwa kamu sedang menuntaskan tugas dalam 10 menit, dan kamu akan menghubunginya setelah selesai.`,
        },
    ],

    // =========================================================================
    // 16. BUSINESS: Personal Branding di Dunia Digital
    // =========================================================================
    'personal-branding-digital': [
        {
            id: 'brand-fondasi',
            title: 'Menemukan Nilai Diri & Niche Keahlian',
            type: 'text',
            content: `Personal branding bukanlah tentang membual atau membuat citra palsu, melainkan cara mengkomunikasikan keahlian, nilai, dan hasil karyamu kepada dunia profesional.

## Tiga Pertanyaan Kunci Personal Branding
1. **Apa keahlian utamamu?** (Contoh: *"Frontend Web Developer spesialis React & Tailwind CSS"*).
2. **Siapa yang terbantu oleh karyamu?** (Contoh: *"Membantu UMKM membangun website toko online interaktif"*).
3. **Apa bukti nyata portofoliomu?** (Contoh: Repository GitHub aktif, proyek live demo yang bisa diuji coba).

Di era digital, rekam jejak digitalmu adalah resume terkuat yang berbicara sebelum kamu menghadiri sesi wawancara.`,
        },
        {
            id: 'brand-video',
            title: 'Video Pembelajaran: Personal Branding Digital',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=aQbZdee5PXI',
        },
        {
            id: 'brand-portofolio',
            title: 'Membangun Portofolio Studi Kasus & GitHub',
            type: 'text',
            content: `Perekrut tidak hanya ingin melihat tampilan screenshot akhir; mereka ingin mengetahui **bagaimana cara berpikirmu** saat memecahkan masalah.

## Struktur Studi Kasus Portofolio yang Menarik:
- **Latar Belakang Proyek**: Masalah apa yang sedang dipecahkan?
- **Peranmu**: Apakah kamu merancang UI, menyusun database, atau menulis kode frontend?
- **Tantangan Teknis**: Bug atau kendala apa yang kamu temui, dan bagaimana kamu menyelesaikannya?
- **Hasil Terukur**: Bagaimana performa aplikasinya setelah selesai diluncurkan?

Dokumentasikan setiap modul yang kamu pelajari di Skillungo ke dalam repositori publik untuk memperkaya portofolio belajarmu.`,
        },
    ],

    // =========================================================================
    // 17. BUSINESS: Negosiasi Dasar untuk Pemula
    // =========================================================================
    'negosiasi-dasar': [
        {
            id: 'nego-prinsip',
            title: 'Prinsip Win-Win & Pemetaan BATNA',
            type: 'text',
            content: `Negosiasi yang baik bukanlah tentang mengalahkan pihak lawan, melainkan mencari titik temu di mana kedua belah pihak merasa diuntungkan (*win-win outcome*).

## Konsep Kunci: BATNA
**BATNA** (*Best Alternative to a Negotiated Agreement*) adalah opsi terbaik yang kamu miliki jika kesepakatan tidak tercapai.
- Memiliki BATNA yang kuat memberikanmu rasa percaya diri dan posisi tawar yang kokoh.
- Sebelum memasuki negosiasi (misal penentuan honor proyek freelance atau pembagian tugas kelompok), selalu tentukan batas minimal yang dapat kamu terima (*Walk-away price*).`,
        },
        {
            id: 'nego-video',
            title: 'Video Pembelajaran: Negosiasi Pemula',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=Q6t3tkAIfZk',
        },
        {
            id: 'nego-taktik',
            title: 'Komunikasi Persuasif & Mengunci Kesepakatan',
            type: 'text',
            content: `Dalam sesi negosiasi, orang yang paling banyak mendengarkan adalah orang yang memegang kendali percakapan.

## Tiga Taktik Praktis:
1. **Active Listening**: Dengarkan kebutuhan lawan bicara sebelum menawarkan solusi. Ajukan pertanyaan: *"Apa prioritas terpenting bagi tim Anda saat ini?"*
2. **Anchor Pricing**: Saat menyebutkan angka, berikan kisaran yang masuk akal dan jelaskan nilai tambah yang akan mereka dapatkan.
3. **Dokumentasikan Kesepakatan**: Segera catat poin-poin yang telah disepakati dalam bentuk ringkasan tertulis untuk mencegah kesalahpahaman di kemudian hari.`,
        },
    ],

    // =========================================================================
    // 18. BUSINESS: Fundamental Digital Marketing
    // =========================================================================
    'fundamental-marketing': [
        {
            id: 'mkt-funnel',
            title: 'Memahami Marketing Funnel (AIDA Framework)',
            type: 'text',
            content: `Digital marketing adalah seni dan ilmu menghubungkan produk dengan orang yang tepat pada waktu yang tepat menggunakan kanal digital.

## Tahapan AIDA Funnel
1. **Awareness (Kesadaran)**: Calon pelanggan mengetahui keberadaan produkmu melalui konten edukatif di media sosial atau mesin pencari.
2. **Interest (Ketertarikan)**: Pengguna mulai tertarik mencari tahu lebih banyak tentang fitur dan keunggulan produk.
3. **Desire (Keinginan)**: Calon pelanggan terdorong ingin mencoba setelah melihat bukti ulasan positif, demo, atau studi kasus.
4. **Action (Aksi)**: Pengguna melakukan pembelian atau mendaftar akun.

Pahami di tahap mana audiensmu berada agar pesan komunikasi yang kamu buat tepat sasaran.`,
        },
        {
            id: 'mkt-video',
            title: 'Video Pembelajaran: Digital Marketing Dasar',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=aQbZdee5PXI',
        },
        {
            id: 'mkt-metrik',
            title: 'Channel Distribusi & Metrik Kinerja (KPI)',
            type: 'text',
            content: `Pemasaran digital terukur secara presisi melalui metrik kinerja (*Key Performance Indicators*).

## Metrik Inti yang Wajib Dipahami:
- **CTR (Click-Through Rate)**: Persentase orang yang mengklik tautan setelah melihat konten iklan/promosimu.
- **Conversion Rate**: Persentase pengunjung yang berhasil menyelesaikan aksi target (seperti checkout atau registrasi).
- **CAC (Customer Acquisition Cost)**: Total biaya yang dikeluarkan untuk mendapatkan satu pengguna baru.
- **Organic vs Paid**: Seimbangkan strategi jangka panjang (SEO & konten organik) dengan akselerasi jangka pendek (iklan berbayar).`,
        },
    ],
}

export function getCuratedStepsForModule(slug: string): LessonStep[] | null {
    return MODULE_LESSONS_MAP[slug] || null
}

export const MODULE_QUESTIONS_MAP: Record<string, Question[]> = {
    'html-css-dasar': [
        {
            id: 'q-html-1',
            question_text: 'Tag semantik HTML5 manakah yang paling tepat untuk mengelompokkan konten mandiri yang dapat didistribusikan secara independen (seperti postingan blog atau kartu produk)?',
            options: ['<article>', '<section>', '<div>', '<aside>'],
            correct_option: 0,
            difficulty: 'beginner',
            explanation: '<article> dirancang khusus untuk membungkus konten mandiri yang memiliki arti utuh tersendiri.',
        },
        {
            id: 'q-html-2',
            question_text: 'Apa fungsi utama dari deklarasi box-sizing: border-box pada CSS?',
            options: [
                'Menghitung padding dan border ke dalam total dimensi elemen',
                'Menghilangkan margin bawaan pada browser secara otomatis',
                'Membuat elemen menjadi fleksibel layaknya display: flex',
                'Mengubah elemen inline menjadi elemen blok',
            ],
            correct_option: 0,
            difficulty: 'beginner',
            explanation: 'border-box memastikan padding dan border tidak menambah ukuran total lebar dan tinggi elemen sehingga kalkulasi tata letak konsisten.',
        },
        {
            id: 'q-html-3',
            question_text: 'Properti Flexbox manakah yang digunakan untuk meratakan dan mendistribusikan elemen anak sepanjang sumbu utama (main axis)?',
            options: ['justify-content', 'align-items', 'flex-wrap', 'align-content'],
            correct_option: 0,
            difficulty: 'beginner',
            explanation: 'justify-content mengatur perataan sepanjang main axis (horizontal secara default), sedangkan align-items mengatur sumbu silang (cross axis).',
        },
        {
            id: 'q-html-4',
            question_text: 'Atribut apakah yang wajib disertakan pada tag <img> untuk mendukung aksesibilitas (screen reader) dan SEO?',
            options: ['alt', 'title', 'aria-label', 'caption'],
            correct_option: 0,
            difficulty: 'beginner',
            explanation: 'Atribut alt (alternative text) mendeskripsikan isi visual gambar bagi pengguna pembaca layar dan saat gambar gagal dimuat.',
        },
        {
            id: 'q-html-5',
            question_text: 'Manakah urutan hierarki spesifisitas (kekuatan bobot) selektor CSS dari yang terendah ke tertinggi?',
            options: [
                'Tag elemen < Class selector < ID selector < Inline style',
                'ID selector < Class selector < Tag elemen < Inline style',
                'Class selector < ID selector < Tag elemen < Inline style',
                'Inline style < ID selector < Class selector < Tag elemen',
            ],
            correct_option: 0,
            difficulty: 'intermediate',
            explanation: 'Spesifisitas terendah dimulai dari tag elemen (h1, p), lalu class (.btn), kemudian ID (#hero), dan tertinggi adalah inline style (style="...").',
        },
    ],
}

export function getCuratedQuestionsForModule(slug: string): Question[] | null {
    return MODULE_QUESTIONS_MAP[slug] || null
}
