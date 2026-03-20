## Demo Login (Untuk Juri)

Tambahkan kredensial demo di `.env.local`:

```bash
NEXT_PUBLIC_DEMO_EMAIL=demo@skillungo.id
NEXT_PUBLIC_DEMO_PASSWORD=demopassword123
```

Setelah itu, di halaman login akan muncul tombol:
- `Isi Akun Demo`
- `Masuk Akun Demo`

Untuk reset akun demo ke kondisi user baru daftar (XP/streak/progress nol), jalankan:

- [demo_boost_account.sql](/home/idal/sekolajh/lombacuy1/supabase/demo_boost_account.sql)

Pastikan email di variabel `v_email` dalam SQL tersebut sama dengan akun demo yang kamu pakai.

## Optimasi Performa (Mode Penjurian)

Set environment variable ini di Vercel agar animasi/transisi berat dinonaktifkan saat penjurian:

```bash
NEXT_PUBLIC_JUDGE_MODE=true
```

Checklist deploy performa:

1. Gunakan `Production Deployment` (bukan Preview) saat demo utama.
2. Set env di Vercel:
   - `NEXT_PUBLIC_DEMO_EMAIL`
   - `NEXT_PUBLIC_DEMO_PASSWORD`
   - `NEXT_PUBLIC_JUDGE_MODE=true`
3. Redeploy setelah mengubah env.
4. Jalankan SQL reset demo user sebelum penjurian:
   - [demo_boost_account.sql](/home/idal/sekolajh/lombacuy1/supabase/demo_boost_account.sql)
5. Uji cepat Lighthouse mobile (target aman):
   - LCP < 2.5s
   - CLS < 0.1
   - INP < 200ms

## Demo Runbook 90 Detik (Untuk Juri)

Urutan demo yang disarankan:

1. Login akun demo (1 klik isi akun + 1 klik masuk).
2. Buka dashboard: tunjukkan level, XP, streak, dan quest harian.
3. Masuk battle mode (matchmaking / room).
4. Menang 1 ronde battle.
5. Kembali ke dashboard: tunjukkan kenaikan XP, log aktivitas, dan progres quest.

Catatan:
- Fokus ke outcome terukur (XP naik, quest update, rank/level berubah), bukan banyaknya fitur.
- Simpan 1 skenario fallback: jika matchmaking timeout, pindah ke `Vs Computer`.

## Scheduled Cleanup Room (Ghost Room)

Endpoint cleanup dipisah dari list room agar endpoint list tetap read-only:

- `POST /api/battle/cleanup`

Gunakan secret di server:

```bash
BATTLE_CLEANUP_SECRET=isi_secret_unik
```

Panggil dengan header:

```bash
Authorization: Bearer <BATTLE_CLEANUP_SECRET>
```

Disarankan dijalankan terjadwal setiap 5-10 menit via cron.

## Smoke Test Sebelum Demo

Checklist cepat:

1. Login demo berhasil.
2. Dashboard load < 2 detik di jaringan normal.
3. Create room + join room berhasil.
4. Matchmaking timeout menampilkan opsi retry/kembali.
5. Battle selesai dan XP bertambah sesuai hasil (win/draw/loss).
6. Activity log tidak menampilkan marker internal (mis. `[battle:...]`).

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
