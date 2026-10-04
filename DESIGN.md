# Design System & Styling Guidelines: Skillungo (VS-Tebak)

Dokumen ini merupakan pedoman komprehensif sistem desain, arsitektur warna, tipografi, token sudut *border-radius*, spesifikasi komponen, tata letak responsif, serta aturan larangan (*design bans*) untuk seluruh antarmuka platform **Skillungo** (VS-Tebak).

---

## 1. Filosofi & Estetika Utama (Aesthetic Core)

Skillungo mengusung estetika **Cyber-Dark Linearity Studio Console** — sebuah antarmuka presisi bertema gelap (*sparse black workspace*) yang menggabungkan kesederhanaan industrial, garis *hairline* yang bersih, serta aksen warna emas/gold (*Gold Brand Signal*) yang elegan untuk pengalaman belajar berbasis *RPG (Role-Playing Game)*.

### Prinsip Utama Desain
1. **Presisi & Kejernihan Kontras**: Menggunakan latar belakang gelap (*Void Canvas `#0a0a0a`*) dengan permukaan kartu berpaut tinggi (*Near-Black Surface `#141414`*) serta tipografi putih kontras tinggi untuk kenyamanan membaca jangka panjang.
2. **Keseimbangan Moderat (*Moderate Rounding*)**: Menghindari sudut kotak tajam (`0px`) yang kaku maupun sudut kapsul bulat ekstrim (`9999px`) yang kekanak-kanakan. Menggunakan sudut lembut terukur (`8px`–`12px`) untuk kesan modern, bersih, dan profesional.
3. **Pemberian Sinyal Aksen Emas (*Gold Signal Accents*)**: Aksen warna emas (`#F5C542`) dialokasikan secara strategis untuk elemen aksi utama (CTA), skor, indikator pencapaian, dan item spesial.
4. **Sentuhan RPG Tonal & Fungsional**: Setiap kelas RPG (*Warrior*, *Mage*, *Archer*, *Healer*) memiliki aksen warna semantik spesifik yang diterapkan secara halus melalui batas tonal (*tonal borders*) dan latar belakang transparan.

---

## 2. Arsitektur & Token Warna (Color Tokens)

Sistem warna diatur secara terstruktur melalui variabel CSS pada `app/globals.css` dan dikonfigurasi pada Tailwind CSS v4.

### A. Latar Belakang & Permukaan Netral (Achromatic Base Colors)
| Nama Token | Variabel CSS | Nilai Hex / RGBA | Peruntukan / Penggunaan |
| :--- | :--- | :--- | :--- |
| **Void Canvas** | `--color-void` / `--surface-canvas` | `#0a0a0a` | Latar belakang utama seluruh aplikasi / kanvas tingkat 0. |
| **Card Surface** | `--color-near-black` / `--surface-card` | `#141414` | Permukaan kartu, panel konten, dan kontainer tingkat 1. |
| **Elevated Surface** | `--color-iron` / `--surface-elevated` | `#1e1e1e` | Panel melayang, state *hover*, dropdown, dan kontrol tingkat 2. |
| **Slate Border** | `--color-slate-edge` / `--surface-border` | `#313131` | Garis pembatas (divider), border kartu, dan bingkai input. |
| **Subtle Border** | `--surface-border-subtle` | `rgba(255, 255, 255, 0.08)` | Garis pemisah internal yang lebih lembut. |
| **Frosted Surface** | `--surface-frosted` | `rgba(255, 255, 255, 0.05)` | Latar belakang tombol netral (*ghost/secondary*). |

### B. Aksen Utama Brand (Gold Accent Palette)
| Nama Token | Variabel CSS | Nilai Hex / RGBA | Peruntukan / Penggunaan |
| :--- | :--- | :--- | :--- |
| **Gold Primary** | `--color-gold` / `--color-signal-orange` | `#F5C542` | Warna utama brand, tombol CTA utama, skor, & piala. |
| **Gold Hover / Ember** | `--color-ember` / `--color-gold-hover` | `#EAB308` | State *hover* dan *active* tombol utama emas. |
| **Gold Soft BG** | `--accent-gold-bg` | `rgba(245, 197, 66, 0.10)` | Latar belakang badge status, chip, dan highlight. |
| **Gold Subtle Border** | `--accent-gold-border` | `rgba(245, 197, 66, 0.35)` | Bingkai tipis kartu emas dan penanda aktif. |
| **Warm Amber** | `--color-burnt-orange` | `#D97706` | Aksen hangat dan pencapaian menengah. |
| **Electric Yellow** | `--color-electric-yellow` | `#FDE047` | Halo glow dan kilau visual level-up. |

### C. Kontras Tipografi Teks (Text Contrast Tokens)
| Nama Token | Variabel CSS | Nilai Hex | Peruntukan / Penggunaan |
| :--- | :--- | :--- | :--- |
| **Text Primary** | `--text-primary` / `--color-white` | `#FFFFFF` | Judul utama, teks tombol, dan informasi penting. |
| **Text Silver** | `--text-silver` / `--color-silver` | `#BFBFBF` | Teks navigasi, subjudul, dan deskripsi sekunder. |
| **Text Fog** | `--text-secondary` / `--color-fog` | `#999999` | Teks pendukung paragraf dan isi modul. |
| **Text Steel** | `--text-muted` / `--color-steel` | `#808080` | Label tidak aktif, placeholder input, dan eyebrow text. |
| **Text Ash** | `--color-ash` | `#A7A7A7` | Metadata ukuran kecil, info waktu, dan bantuan mikro. |

### D. Warna Semantik & Kelas Karakter RPG (RPG Class & Status Colors)
| Kelas / Status | Variabel CSS | Hex Utama | RGBA Background | RGBA Border | Role RPG / Makna |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Warrior / Error** | `--accent-red` | `#EF4444` | `rgba(239, 68, 68, 0.10)` | `rgba(239, 68, 68, 0.28)` | Kelas Warrior, Status Salah/Batal, Serangan. |
| **Mage / Info** | `--accent-cyan` | `#38BDF8` | `rgba(56, 189, 248, 0.10)` | `rgba(56, 189, 248, 0.28)` | Kelas Mage, Info/Petunjuk, Mana (MP), Quiz. |
| **Archer / Success** | `--accent-green` | `#22C55E` | `rgba(34, 197, 94, 0.10)` | `rgba(34, 197, 94, 0.28)` | Kelas Archer, Status Benar/Sukses, Speed. |
| **Healer / Warning** | `--accent-gold` | `#F5C542` | `rgba(245, 197, 66, 0.10)` | `rgba(245, 197, 66, 0.35)` | Kelas Healer, Peringatan, Pemulihan, XP. |

---

## 3. Tipografi & Font System

Diimpor secara teroptimasi menggunakan `next/font/google` pada `app/layout.tsx`:

- **Inter (`--font-inter`)**: Font sans-serif untuk antarmuka umum, bodi teks, form, tombol, dan navigasi.
- **Space Grotesk (`--font-acidgrotesk` / `--font-heading`)**: Font display berkarakter modern untuk judul utama (H1-H3), hero section, nama modul, dan nilai skor.
- **JetBrains Mono (`--font-jetbrains-mono` / `--font-mono`)**: Font monospace untuk kode room (`#CODE`), timer hitung mundur, ID teknis, dan metrik angka.

### Skala Tipografi & Hirarki Teks
```css
:root {
  --font-inter: 'Inter', system-ui, -apple-system, sans-serif;
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

| Elemen / Kelas | Font Family | Size (Desktop) | Size (Mobile) | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Heading 1 (`h1`)** | Space Grotesk | `34px` | `22px` | `400` | `1.15` | `-0.02em` |
| **Heading 2 (`h2`)** | Space Grotesk | `28px` | `18px` | `400` | `1.20` | `-0.015em` |
| **Heading 3 (`h3`)** | Space Grotesk | `20px` | `15px` | `400` | `1.25` | `-0.01em` |
| **Eyebrow Label (`.section-eyebrow`)** | Inter | `10px` | `10px` | `500` / `600` | `1.4` | `1.5px` (UPPERCASE) |
| **Body Paragraph (`p`)** | Inter | `14px` | `13px` | `400` | `1.5` | `-0.15px` |
| **Room Code / Monospace** | JetBrains Mono | `32px` | `26px` | `800` | `1.0` | `4px` - `6px` |

---

## 4. Standar Sudut Border-Radius (Shape Scale)

Skillungo menerapkan aturan kelengkungan sudut yang **moderat** secara ketat untuk menjaga kerapian antarmuka.

### Skala Token Radius
- **`--radius-sm` (`8px`)**: Digunakan untuk elemen mikro (badge kecil, chip status, avatar mini, tag kategori, indikator level).
- **`--radius-md` (`10px`)**: Digunakan untuk kontrol UI standar (tombol utama/sekunder, input form, select dropdown, role selector chip, tab trigger, tombol opsi kuis).
- **`--radius-lg` (`12px`)**: Digunakan untuk kartu utama (`Card`), panel produk/hero, dialog/modal, kontainer room battle, dan kartu modul.
- **`--radius-xl` (`16px`)**: Digunakan khusus untuk kontainer makro terluar atau modal khusus (maksimal `16px`).
- **`--radius-full` (`9999px`)**: Khusus digunakan untuk avatar bulat, submit orb melingkar, dan dot indikator terkontrol. **Dilarang digunakan pada tombol biasa atau label status umum.**

### Matriks Aturan Komponen
| Kategori Komponen | Token Radius | Nilai Pixel | Contoh Penerapan |
| :--- | :--- | :--- | :--- |
| **Buttons (`.btn`, `.btn-gold`)** | `--radius-md` | `10px` | `.btn-gold`, `.btn-secondary`, `.btn-ghost` |
| **Cards & Panels (`.card`)** | `--radius-lg` | `12px` | Modul card, Leaderboard card, Quest card |
| **Inputs & Selects (`input`, `select`)** | `--radius-md` | `10px` | Form login, input pencarian, join room input |
| **Badges & Tags (`Badge`)** | `--radius-sm` | `8px` | Badge status role, tag kategori modul |
| **Dialogs & Modals (`Dialog`)** | `--radius-lg` | `12px` | Modal penukaran voucher, popover konfirmasi |
| **Role Selector / Tabs** | `--radius-md` | `10px` | `.role-selector-chip`, `.nav-pill` |
| **Avatar & Submit Orb** | `--radius-full` | `9999px` | Avatar profil, `.prompt-submit-orb` |

---

## 5. Spacing, Blueprint Grid & Efek Elevasi

### A. Sistem Spacing (Skala Kelipatan 4px)
Pengaturan jarak (*padding* dan *margin*) mengikuti unit dasar 4px:
- `4px` (`--spacing-4`)
- `8px` (`--spacing-8`)
- `12px` (`--spacing-12`)
- `16px` (`--spacing-16`)
- `24px` (`--spacing-24`)
- `56px` (`--spacing-56`)
- `168px` (`--spacing-168`)

### B. Background Blueprint Grid (`.bg-blueprint-grid`)
Kanvas utama aplikasi dapat dilengkapi latar matriks cetak biru (*blueprint grid*) berukuran `64px x 64px` dengan garis halus `rgba(255, 255, 255, 0.025)` di atas warna `#0a0a0a`.

### C. Elevasi & Bayangan (Shadows & Focus Ring)
- **Focus Ring**: `0 0 0 2px rgba(245, 197, 66, 0.45), 0 0 10px rgba(245, 197, 66, 0.25)` (Dipicu saat input/tombol difokuskan).
- **Shadow Gold Signal**: `0 0 22px rgba(245, 197, 66, 0.42), 0 0 8px rgba(245, 197, 66, 0.28)` (Digunakan pada CTA emas utama).
- **Shadow Subtle Border**: `rgba(245, 197, 66, 0.3) 0px 0px 0px 1px inset`
- **Shadow Modal**: `0 20px 48px rgba(0, 0, 0, 0.8)`

---

## 6. Spesifikasi Komponen UI Utama

### A. Tombol (Buttons)
- **Tombol Emas Utama (`.btn-gold` / `.btn-primary` / `.btn-signal-orange`)**:
  - Background: `#F5C542`, Teks: `#0a0a0a` (Font Inter 600, 13px).
  - Border-radius: `10px`, Border: `1px solid rgba(245, 197, 66, 0.4)`.
  - Box-shadow: Gold glow.
- **Tombol Sekunder / Dark Outline (`.btn-secondary` / `.btn-ghost` / `.btn-dark-outline`)**:
  - Background: `rgba(255, 255, 255, 0.05)`, Teks: `#FFFFFF` (Font Inter 500, 13px).
  - Border-radius: `10px`, Border: `1px solid rgba(255, 255, 255, 0.16)`.
- **Orb Submit Melingkar (`.prompt-submit-orb`)**:
  - Ukuran: `38px x 38px`, Border-radius: `9999px`, Background: `#F5C542`.

### B. Kartu & Panel (Cards & Containers)
- **Kartu Standar (`.card`)**:
  - Background: `#141414`, Border: `1px solid #313131`, Border-radius: `12px`.
  - Hover state: Border berubah menjadi `rgba(255, 255, 255, 0.22)`.
- **Kartu Tonal RPG**:
  - `.glow-warrior`: Border `rgba(239, 68, 68, 0.45)`, BG `rgba(239, 68, 68, 0.05)`.
  - `.glow-mage`: Border `rgba(56, 189, 248, 0.45)`, BG `rgba(56, 189, 248, 0.05)`.
  - `.glow-archer`: Border `rgba(34, 197, 94, 0.45)`, BG `rgba(34, 197, 94, 0.05)`.
  - `.glow-healer`: Border `rgba(245, 197, 66, 0.45)`, BG `rgba(245, 197, 66, 0.05)`.
- **Kartu Kupon Voucher (`.ticket-card`)**:
  - Border putus-putus (`1px dashed #313131`) dengan dua *semicircle notch* di bagian tengah kiri dan kanan (`::before`, `::after`).

### C. Input Form & Select
- Background: `#141414`, Border: `1px solid #313131`, Border-radius: `10px`.
- Padding: `10px 16px`, Font-size: `14px` (pada desktop).
- Focus State: Border `#F5C542` + Focus Ring Gold.
- **Aturan Khusus Seluler**: `font-size: 16px !important` pada layar `<768px` untuk mencegah peramban iOS/Android melakukan *auto-zoom* saat fokus input.

### D. Elemen Arena Battle Real-Time
- **Kartu Kode Room (`.battle-room-code-card`)**:
  - Background `rgba(245, 197, 66, 0.08)`, Border `rgba(245, 197, 66, 0.35)`, Border-radius `12px`.
  - Teks Kode: Font JetBrains Mono 800, ukuran `32px` (Mobile `26px`), tracking `4px`–`6px`, warna `#F5C542`.
- **Barisan Versus (`.battle-versus-row`)**:
  - Tata letak grid 3 kolom (Pemain 1 - VS Badge - Pemain 2) pada panel `#1e1e1e` dengan border-radius `12px`.

---

## 7. Aturan Larangan & Pembatasan Desain Ketat (Strict Design Bans)

Untuk menjaga estetika profesional, rapi, dan konsisten, aplikasi **DILARANG KERAS** menggunakan pola visual berikut:

1. **DILARANG: Pil Status Kapsul Ekstrim (`rounded-full` Berlebihan)**
   - Dilarang menggunakan `rounded-full` / `9999px` untuk tombol UI utama, kartu, atau label status umum. Gunakan `--radius-md` (`10px`) atau `--radius-sm` (`8px`).
2. **DILARANG: Dot Bulat Bersinar (*Glowing Dots*)**
   - Dilarang membuat elemen dot bulat bersinar (contoh: `width: 8px, height: 8px, borderRadius: 9999px, boxShadow: 0 0 8px...` warna hijau, kuning, oranye, atau lainnya).
3. **DILARANG: Banner Teks UPPERCASE Mencolok**
   - Dilarang menggunakan banner topbar teks UPPERCASE mencolok dengan *letter-spacing* sangat renggang yang mengganggu konsentrasi (seperti "MENUNGGU PENANTANG BATTLE 1V1"). Gunakan tipografi natural (*Sentence case*).
4. **DILARANG: Direct Merge ke Main / Git Push Tanpa Instruksi Eksplisit**
   - Mengikuti panduan alur kerja agen, dilarang melakukang merge ke branch `main` atau menjalankan `git push` tanpa instruksi eksplisit dari pengguna.
5. **DILARANG: Over-Information & Redundansi Elemen Kartu (Card Clutter & Duplicate Affordances)**
   - Dilarang menumpuk terlalu banyak penanda teks dan visual yang menduplikasi maksud yang sama dalam satu kartu aksi (misalnya: ikon + badge + panah atas + subjudul + deskripsi + divider + tombol CTA bawah + panah bawah).
   - Kartu aksi harus mengutamakan kejernihan informasi (*content-first*): cukup 1 ikon tematik, 1 penunjuk arah tunggal (*single action arrow*), 1 judul aksi tegas, dan 1 deskripsi singkat (maksimal 2 baris). Hindari pengulangan teks yang sama di badge, judul, subjudul, dan CTA.

---

## 8. Tata Letak Responsif, Mobile-First & Pengalaman Sentuh

1. **Breakpoints Responsif**:
   - Mobile: `< 640px` (Grid 1 kolom, padding ringkas `12px`–`14px`, tombol penuh lebar).
   - Tablet: `640px` – `1024px` (Grid 2 kolom, padding `20px`).
   - Desktop: `> 1024px` (Grid multi-kolom, sidebar kaku `270px`, container maks `1280px`).
2. **Stage Battle Fullscreen Non-Scrollable (`.battle-fullscreen-stage`)**:
   - Pada mode duel real-time (`/battle/[roomId]`), panggung aplikasi dikunci penuh (`100dvh`, `overflow: hidden`, `touch-action: none`, `overscroll-behavior: none`) untuk mencegah layar memantul atau bergeser saat pengguna menekan pilihan kuis secara cepat.
3. **Modal Containment (`.modal-overlay`)**:
   - Pengisi latar modal dikunci posisi `fixed` dengan z-index `1000` dan batas tinggi maksimum `94dvh`.
4. **Respon Mikro-Interaksi (`.hover-lift`)**:
   - Semua elemen interaktif memberikan umpan balik halus melalui `transform: translateY(-2px)` dan transisi warna border `0.2s ease`.
