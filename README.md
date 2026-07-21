# Skillungo

Skillungo adalah website edukasi berbasis gamifikasi untuk pelajar SMK/SMA Indonesia. Platform ini menggabungkan modul belajar digital, quiz battle 1v1 real-time, leaderboard, serta sistem RPG (level, XP, streak, badge) agar proses belajar lebih interaktif dan kompetitif.

## Deskripsi Website

Website ini dibuat untuk membantu pelajar meningkatkan skill digital lewat pengalaman belajar yang terasa seperti bermain game. Pengguna bisa belajar per modul, bertanding dengan pemain lain, lalu memantau perkembangan belajar melalui dashboard progres.

Fitur utama:
- Modul belajar interaktif
- Battle quiz 1v1 (real-time)
- Leaderboard antar pelajar/sekolah
- Sistem karakter RPG (class, level, XP, badge)
- Daily quest dan streak harian
- Voucher store berbasis poin

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- Zustand

## Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Jalankan development server:

```bash
npm run dev
```

3. Buka di browser:

```text
http://localhost:3000
```

## Environment Variables (contoh)

Buat file `.env.local` lalu isi sesuai kebutuhan:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEMO_EMAIL=demo@skillungo.id
NEXT_PUBLIC_DEMO_PASSWORD=demopassword123
NEXT_PUBLIC_JUDGE_MODE=true
BATTLE_CLEANUP_SECRET=your_cleanup_secret
```


