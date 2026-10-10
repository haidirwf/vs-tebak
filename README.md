<div align="center">
  <img src="public/favicon.svg" alt="Skillungo Logo" width="90" height="90" />

  # Skillungo
  **Gamified Learning & Real-Time 1v1 Battle Platform for Indonesian Vocational & High School Students**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](package.json)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Realtime_DB-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.x-orange?style=flat)](https://github.com/pmndrs/zustand)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.x-black?style=flat&logo=framer)](https://motion.dev/)

</div>

<br />

**Skillungo** adalah platform pembelajaran berbasis web mutakhir yang merevolusi cara belajar siswa SMK dan SMA di Indonesia. Dengan memadukan kurikulum digital interaktif, mekanik *role-playing game* (RPG), dan arena pertarungan kuis duel 1v1 secara *real-time*, Skillungo mentransformasi proses belajar yang monoton menjadi petualangan kompetitif yang seru, terukur, dan memotivasi.

Siswa dapat memilih kelas karakter avatar RPG (*Warrior*, *Mage*, *Archer*, *Healer*), menaklukkan modul pembelajaran mikro, melengkapi perlengkapan senjata dan zirah, menyelesaikan *daily quest*, bertanding langsung dengan teman secara sinkronus atau melawan AI Sentinel, mengumpulkan XP untuk naik level, hingga menukarkan poin hadiah di Toko Voucher dan Toko Aksesoris.

---

## Table of Contents

- [Key Features](#-key-features)
- [Architecture & Technology Stack](#-architecture--technology-stack)
- [Design System & Aesthetics](#-design-system--aesthetics)
- [System Requirements](#-system-requirements)
- [Local Installation & Setup](#-local-installation--setup)
- [Project Directory Structure](#-project-directory-structure)
- [Database & Schema Architecture](#-database--schema-architecture)
- [Security Hardening & Privacy](#-security-hardening--privacy)
- [Deployment Guide](#-deployment-guide)
- [Contributing](#-contributing)

---

## Key Features

- **Interactive Micro-Learning Modules (`/modules` & `/modules/[slug]`):** Modul materi digital terstruktur (Coding, Desain UI/UX, Produktivitas, dan Bisnis) dengan sistem bab bertahap (*lesson steps*), video embedding, panduan belajar modal, pelacak progres membaca persentase, dan kuis pemahaman di akhir tiap modul berhadiah XP serta bonus pengali per kelas RPG.
- **Real-Time 1v1 Quiz Battle Arena (`/battle`):** Arena duel kuis *real-time* berbasis WebSockets Supabase Realtime Channels. Fitur lengkap mencakup:
  - *Buat Room*: Bikin arena tanding kustom dengan pilihan kategori materi, kode unik 6 karakter, dan tombol salin tautan undangan instan.
  - *Join Room*: Masuk langsung ke ruang tunggu tanding rekan dengan input kode room.
  - *Matchmaking Otomatis*: Sistem pencarian lawan publik secara otomatis dan seimbang dengan animasi radar visual.
  - *Vs Computer (AI Bot)*: Mode latihan mandiri instan melawan bot cerdas tanpa harus menunggu pemain lain online (`/battle/computer`).
  - *Combat Mechanics & Audio Feedback*: Health points (HP), damage floating numbers, hit combo multiplier, efek serang/tangkis visual, audio efek & kontrol musik kemenangan, serta modal rekapitulasi ulasan kuis pasca tanding (*Post-Battle Review*).
- **RPG Character Customization & Gear Equipment (`/character`):** 
  - 4 kelas karakter khas RPG (*Warrior*, *Mage*, *Archer*, *Healer*) dengan atribut pasif tempur dan animasi SVG interaktif.
  - Manajemen inventori perlengkapan: slot senjata (*Weapon*), zirah (*Armor*), pelindung kepala (*Helmet*), dan aksesoris (*Accessory*).
  - Kalkulasi atribut dinamis (*Attack*, *Defense*, *Speed*, *Luck*) berdasarkan perlengkapan yang digunakan.
  - Klasifikasi *rarity* bertingkat: Common, Rare, Epic, hingga Legendary.
- **Interactive Learning Analytics Dashboard (`/dashboard`):** 
  - Grafik batang interaktif perolehan XP 7 hari terakhir dengan penanda hari aktif.
  - Diagram distribusi penguasaan bidang modul (Coding, Desain, Produktivitas, Bisnis).
  - Widget *Hero Profile*, ringkasan kalender streak 7 hari, dan *Quick Leaderboard*.
- **Gamified Daily Quests & Streaks:** Misi harian otomatis (*Login Harian*, *Selesaikan Modul*, *Menangkan Battle 1v1*) dengan indikator streak harian untuk menjaga retensi dan kedisiplinan belajar.
- **Celebration Modals & Gamification Feedback:**
  - *Level Up Modal*: Dialog perayaan kenaikan level dengan visual transisi angka level dan klaim reward.
  - *Streak Up Modal*: Dialog apresiasi konsistensi belajar harian.
  - *Badge Unlock Modal*: Dialog perolehan lencana prestasi baru.
- **Voucher & RPG Gear Shop (`/shop`):** 
  - *Toko Voucher*: Konversi tabungan XP menjadi voucher beasiswa, diskon kursus, atau voucer kantin sekolah.
  - *Toko Aksesoris*: Belanja perlengkapan dan gear tempur baru untuk memperkuat atribut karakter duel.
- **National & School Leaderboards (`/leaderboard`):** Papan peringkat dinamis dengan filter: Top Siswa Nasional, Peringkat Antar Sekolah, dan Peringkat Antar Kota.
- **Public Student Profile (`/pelajar/[username]`):** Halaman profil publik yang dapat dibagikan untuk memamerkan avatar RPG, lencana title prestasi, total XP, dan riwayat modul yang telah diselesaikan.
- **Ultra-Fast Single-Page Experience (SPA Architecture):** Transisi halaman instan 0ms antar dashboard, modul, dan leaderboard menggunakan arsitektur caching memori Zustand (*stale-while-revalidate*) dan prefetching rute Next.js.

---

## Architecture & Technology Stack

Platform Skillungo dibangun di atas fondasi teknologi modern berorientasi performa tinggi dan skalabilitas:

- **Framework & Core:** [Next.js 16.1](https://nextjs.org/) (App Router, React Server & Client Components) + [React 19.2](https://react.dev/).
- **Type Safety:** [TypeScript 5](https://www.typescriptlang.org/) dengan kontrak antarmuka end-to-end yang ketat (`types/index.ts`).
- **Styling & Design System:** [Tailwind CSS v4](https://tailwindcss.com/) dipadukan dengan arsitektur variabel CSS adaptif (`app/globals.css`) untuk dukungan penuh **Light Mode** & **Dark Mode**.
- **State Management & Caching:** [Zustand 5](https://github.com/pmndrs/zustand) untuk central data cache (`userStore`, `contentStore`, `battleStore`) demi navigasi instan tanpa overhead *re-fetching*.
- **Real-Time Synchronization:** [Supabase Realtime](https://supabase.com/docs/guides/realtime) (WebSockets & PostgreSQL changes) untuk sinkronisasi state battle, status ready, timer sinkron, dan submisi jawaban antar kedua pemain.
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL 15, Supabase Auth via SSR cookie handling `@supabase/ssr`, dan Row Level Security).
- **Physics & Micro-Animations:** [Framer Motion v12](https://motion.dev/) untuk transisi kartu modul, animasi damage RPG terapung, perayaan modal level-up, dan interaksi layout responsif.
- **Iconography:** [Lucide React](https://lucide.dev/) untuk ikon SVG skalabel dan berkinerja tinggi.

---

## Design System & Aesthetics

Platform mengadopsi estetika **Clean Modern Learning Console** (terinspirasi dari platform edukasi modern dengan tata letak terstruktur dan aksen *Radiant Gold* khas Skillungo):

1. **Light-First Clarity & Deep Dark Mode:** 
   - Light Mode: Latar belakang kanvas netral halus (`--surface-canvas: #f8f9fa`), kartu putih bersih (`#ffffff`), dan border 1px lembut (`#e2e8f0`).
   - Dark Mode: Nuansa arang pekat elegan (`--surface-canvas: #121212`, `--surface-card: #18181b`) dengan rasio kontras teks tinggi.
2. **Skillungo Signal Gold Palette:** 
   - Tombol aksi utama (*Primary CTA*) menggunakan gradasi emas hangat `linear-gradient(180deg, #FDE047 0%, #F5C542 100%)` dengan bingkai tepi halus `1px solid #EAB308` dan teks charcoal pekat `#18181b` (font-weight 700).
   - Dilengkapi aksen *Title Case* natural, ikon fitur di kiri, dan panah `ChevronRight` tunggal di kanan.
3. **Standar Border Radius Terstruktur:** 
   - `8px` (`--radius-sm`) untuk chip, badge, dan kontrol input.
   - `10px` (`--radius-md`) untuk tombol utama, tab switcher, dan modal compact.
   - `12px` - `16px` (`--radius-lg`) untuk kartu modul dan dialog modal utama.
4. **Prinsip Bebas Clutter (Anti-Clutter Policy):** 
   - Menghindari dot bercahaya neon berlebihan (*no neon glow dots*).
   - Menghindari banner teks uppercase yang berisik (*no uppercase banner clutter*).
   - Mengutamakan hierarki visual jernih dengan 1 aksi utama yang terarah.

---

## System Requirements

Sebelum menjalankan aplikasi secara lokal, pastikan lingkungan pengembangan Anda memenuhi spesifikasi berikut:

- [Node.js](https://nodejs.org/) v18.18.0 atau versi yang lebih baru (rekomendasi LTS v20+)
- npm v9+ (atau pnpm / yarn)
- Akun dan project [Supabase](https://supabase.com/) (Tier gratis sudah sangat mencukupi)

---

## Local Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/haidirwf/vs-tebak.git skillungo
cd skillungo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env.local` di root direktori project:

```bash
cp .env.example .env.local
```

Isi variabel lingkungan dengan kredensial Supabase Anda:

```env
# Supabase Public Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional (Khusus endpoint pembersihan battle basi)
BATTLE_CLEANUP_SECRET=your-cleanup-secret
```

### 4. Setup Database & Seeding (Supabase)

1. Masuk ke dashboard project Supabase Anda di [supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** -> **New query**.
3. Buka file [`supabase/schema_new_complete.sql`](supabase/schema_new_complete.sql), salin seluruh isinya, dan klik **Run**.
4. Skrip tersebut akan otomatis membangun:
   - Tabel `profiles`, `modules`, `user_modules`, `battle_rooms`, `battle_questions`, `daily_quests`, `user_daily_quests`, `vouchers`, `user_vouchers`, serta relasi inventori item RPG.
   - Mengaktifkan Row Level Security (RLS) serta fungsi database PostgreSQL (seperti trigger sinkronisasi profil user dari `auth.users`).
   - Melakukan *seeding* data awal modul pembelajaran dan bank soal kuis battle.

*(Opsional)* Anda juga dapat menjalankan script pembuat akun tester demo:
```bash
node scripts/seed-boost-account.mjs
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka peramban web Anda dan akses:
```text
http://localhost:3000
```

### 6. Build untuk Produksi & Type Checking

Untuk memverifikasi kesiapan bundle rilis dan *type safety*:

```bash
npm run build
npm run start
```

Untuk menjalankan pemeriksaan tipe TypeScript mandiri:
```bash
npx tsc --noEmit
```

---

## Project Directory Structure

```text
skillungo/
├── app/
│   ├── (auth)/                       # Rute otentikasi
│   │   ├── login/page.tsx            # Halaman masuk siswa
│   │   └── register/page.tsx         # Halaman pendaftaran siswa & pemilihan kelas
│   ├── (dashboard)/                  # Rute berotentikasi & dashboard shell
│   │   ├── battle/                   # Arena duel kuis 1v1
│   │   │   ├── [roomId]/             # Ruang tanding real-time (BattleArena.tsx)
│   │   │   ├── computer/             # Mode latihan vs AI Sentinel (PracticeArena.tsx)
│   │   │   └── page.tsx              # Hub aksi battle & daftar room publik
│   │   ├── character/                # Kustomisasi avatar, inventori & stats gear RPG
│   │   │   └── page.tsx              # Halaman manajemen perlengkapan karakter
│   │   ├── dashboard/page.tsx        # Ringkasan progres, daily quests, & modul aktif
│   │   ├── leaderboard/page.tsx      # Papan peringkat nasional & antar sekolah
│   │   ├── modules/                  # Eksplorasi modul pembelajaran
│   │   │   ├── [slug]/page.tsx       # Pembaca materi bab, video, & kuis evaluasi
│   │   │   └── page.tsx              # Katalog modul per kategori
│   │   ├── pelajar/[username]/       # Profil publik siswa yang dapat dibagikan
│   │   │   └── page.tsx              # Showcase avatar, title, & pencapaian siswa
│   │   ├── profile/                  # Pengaturan akun personal & preferensi
│   │   │   └── page.tsx              # Profil pengguna & reset sesi
│   │   ├── shop/                     # Toko penukaran voucher & perlengkapan RPG
│   │   │   └── page.tsx              # Katalog kupon & toko aksesoris gear
│   │   └── layout.tsx                # Dashboard navigation shell & sidebar wrapper
│   ├── api/                          # Next.js Route Handlers
│   │   ├── auth/                     # Endpoint helper autentikasi & sesi
│   │   └── battle/                   # Endpoint aksi battle & pembersihan room
│   ├── favicon.ico                   # App favicon
│   ├── globals.css                   # Core design tokens, theme variables, & reset
│   ├── layout.tsx                    # Root layout & font provider
│   └── page.tsx                      # Landing page publik & showcase platform
├── components/
│   ├── battle/                       # Komponen stage arena & PostBattleReviewModal
│   ├── character/                    # Komponen avatar visual, LevelUp, StreakUp, & BadgeUnlockModal
│   ├── dashboard/                    # Widget analytics 7 hari, HeroBanner, QuickLeaderboard
│   ├── landing/                      # Section showcase landing page publik
│   ├── layout/                       # Sidebar navigasi, Topbar, Navbar, & Mobile drawer
│   ├── onboarding/                   # Dialog pemandu pengguna baru
│   ├── profile/                      # Komponen hero stage & tab profil siswa
│   ├── quest/                        # Kartu pelacak progress daily quest
│   └── ui/                           # Primitif UI (Button, Card, Input, Progress, Modal)
├── lib/
│   ├── auth/                         # Utilitas validasi autentikasi pengguna
│   ├── content/                      # Kurasi materi bab modul pembelajaran
│   ├── game/                         # Rumus kalkulasi XP, level RPG, gear stats, & combat
│   ├── server/                       # Helper query server-side
│   ├── supabase/                     # Supabase client singleton (browser, server, middleware)
│   └── utils.ts                      # Formatters mata uang, kelas utilitas, dan tanggal
├── scripts/                          # Skrip utilitas pengembang & seeding demo
│   ├── generate-favicon.js           # Generator favicon SVG
│   └── seed-boost-account.mjs        # Script seeding akun demo penguji
├── stores/                           # Central Zustand client state & cache
│   ├── battleStore.ts                # State battle realtime & skor ronde
│   ├── contentStore.ts               # In-memory cache modul, quest, voucher, & leaderboard
│   └── userStore.ts                  # State profil aktif, level, & XP pengguna
├── supabase/
│   ├── migrations/                   # Riwayat migrasi skema SQL terpisah
│   ├── demo_boost_account.sql        # Skrip opsional demo akun penguji
│   └── schema_new_complete.sql       # Konsolidasi skema database & seed lengkap
├── types/                            # Definisi TypeScript untuk skema data platform
├── DESIGN.md                         # Pedoman sistem desain & token styling Skillungo
├── next.config.ts                    # Konfigurasi bundler Next.js & memory buffer
├── package.json                      # Daftar dependensi & script runner
└── tsconfig.json                     # Konfigurasi compiler TypeScript
```

---

## Database & Schema Architecture

Database Skillungo dirancang secara terisolasi dan modular di PostgreSQL Supabase:

- **`profiles`**: Menyimpan data identitas siswa, kelas avatar RPG (`warrior`, `mage`, `archer`, `healer`), perolehan total XP, level berjalan, streak harian, metadata sekolah, dan status inventori aktif.
- **`modules` & `user_modules`**: Menyimpan silabus bab modul dalam format JSONB terstruktur, batas durasi, XP reward, dan progres pengerjaan masing-masing siswa (`not_started`, `in_progress`, `completed`).
- **`battle_rooms` & `battle_questions`**: Mengelola status perputaran room battle (`waiting`, `lobby`, `playing`, `finished`), relasi ID pemain 1 & 2, penampung jawaban, skor, dan pool soal kuis.
- **`daily_quests` & `user_daily_quests`**: Template quest harian otomatis dan pelacak progres pemenuhan target misi per tanggal aktif.
- **`vouchers` & `user_vouchers`**: Katalog voucher reward dan buku kas penukaran kode kupon siswa.
- **`xp_logs`**: Riwayat pencatatan perolehan XP harian untuk menggerakkan analitik grafik performa pembelajaran 7 hari.

---

## Security Hardening & Privacy

Platform mengedepankan keamanan data siswa dan integritas permainan:

- **Strict Row Level Security (RLS):** Seluruh tabel database PostgreSQL dilindungi oleh kebijakan RLS. Siswa hanya diizinkan membaca data miliknya dan dilarang memanipulasi skor atau data siswa lain.
- **Perlindungan Data Pribadi Pengguna:** File migrasi lokal, data ekspor riwayat (`*.csv`), file skrip generator, serta file lingkungan rahasia (`.env*`) dieksklusikan secara ketat oleh `.gitignore` sehingga tidak pernah terlacak ke publik repository.
- **Safe Authentication Cookies:** Menggunakan `@supabase/ssr` untuk menangani token JWT autentikasi dengan rotasi otomatis dan mitigasi serangan CSRF/XSS.
- **Database Idempotency & Clean Teardown:** Skrip pembuat skema menggunakan klausul aman (`IF NOT EXISTS`, `CASCADE`) serta trigger pembersihan room battle basi untuk mencegah kebocoran memori pada database realtime.

---

## Deployment Guide

### Deploy ke Vercel (Rekomendasi)

1. Hubungkan repository GitHub Anda ke [Vercel](https://vercel.com).
2. Vercel akan otomatis mendeteksi framework **Next.js**.
3. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase Anda.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Kunci anon publik Supabase Anda.
   - *(Opsional)* `BATTLE_CLEANUP_SECRET`: Token rahasia endpoint pembersihan room.
4. Klik tombol **Deploy**. Aplikasi akan terkompilasi dan siap digunakan secara global dalam hitungan detik.

---

## Contributing

Kontribusi dan saran pengembangan selalu disambut baik! Untuk berkontribusi:

1. Lakukan **Fork** pada repository ini.
2. Buat branch fitur baru Anda: `git checkout -b feature/fitur-keren`.
3. Commit perubahan Anda dengan format [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m 'feat: tambahkan animasi kemenangan battle baru'
   ```
4. Push ke branch Anda: `git push origin feature/fitur-keren`.
5. Buat sebuah **Pull Request** baru.
