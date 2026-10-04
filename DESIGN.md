# Design System & Styling Guidelines: Skillungo (VS-Tebak)

Dokumen ini berisi pedoman sistem desain, tipografi, token warna, aturan sudut border-radius (rounded), serta standar UI/UX untuk platform **Skillungo** (VS-Tebak).

---

## 1. Moderation & Corner Radius Standard (Border-Radius Guidelines)

### Basic Principle
Website ini menggunakan sudut rectangle/kontainer yang **moderat** — tidak terlalu rounded (seperti pil/kapsul `9999px` atau `25px+` yang sangat bulat) dan tidak terlalu kotak/sharp (`0px` atau `2px`). Sudut rounded lembut ini memberikan kesan modern, bersih, presisi, dan proporsional.

### Radius Token Scale
- **`--radius-sm` / `8px`**: Gunakan untuk elemen mikro seperti chip status, badge kecil, avatar mini, tag, atau sub-elemen internal.
- **`--radius-md` / `10px`**: Gunakan untuk kontrol UI standar seperti tombol (Button), input form, select dropdown, tab trigger, dan kartu aksi mini.
- **`--radius-lg` / `12px`**: Gunakan untuk kartu utama (Card), panel dialog/modal, hero banner container, dan penampung konten utama.
- **`--radius-xl` / `16px`**: Digunakan hanya pada container makro terluar jika dibutuhkan (maksimal 16px).

### Specific Component Radius Rules
| Component Category | Class / Token | Border Radius Value | Notes |
| :--- | :--- | :--- | :--- |
| **Buttons (`.btn`, `Button`)** | `rounded-lg` / `rounded-[10px]` | `10px` | Menghindari `rounded-full` (kapsul ekstrim) untuk tombol UI standar. |
| **Cards & Panels (`Card`, `.card`)** | `rounded-xl` / `rounded-[12px]` | `12px` | Menggantikan nilai ekstrim sebelumnya (`17.14px` / `25.71px`). |
| **Inputs & Selects (`Input`, `Select`)** | `rounded-lg` / `rounded-[10px]` | `10px` | Nyaman untuk area fokus input form. |
| **Badges & Pills (`Badge`)** | `rounded-md` / `rounded-[8px]` | `8px` | Menghindari `rounded-4xl` / `rounded-full` yang berlebihan. |
| **Dialogs & Modals (`Dialog`)** | `rounded-xl` / `rounded-[12px]` | `12px` | Sudut lembut untuk popover/dialog. |
| **Role Selector / Tabs** | `rounded-lg` / `rounded-[10px]` | `10px` | Segar dan mudah diklik. |

---

## 2. Typography & Fonts

Diimpor secara global melalui Google Fonts di `app/layout.tsx`:

- **Inter**: Font sans-serif utama untuk antarmuka umum, bodi teks, navigasi, dan tombol.
- **Space Grotesk / Acid Grotesk**: Font display/heading untuk judul bab, hero section, dan angka skor.
- **JetBrains Mono**: Font monospace untuk kode unik room (`#CODE`), ID teknis, timer, dan data metrik angka.

```css
:root {
  --font-inter: 'Inter', system-ui, -apple-system, sans-serif;
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

---

## 3. Color Tokens & Theme Architecture

Menggunakan estetika Dark Mode dengan aksen emas/gold untuk pengalaman bertema cyber/RPG yang elegan.

### Achromatic Base Colors
- **Void Canvas (`--color-void`)**: `#0a0a0a` (Latar belakang utama aplikasi)
- **Card Surface (`--color-near-black`)**: `#141414` (Latar belakang kartu/panel)
- **Elevated Surface (`--color-iron`)**: `#1e1e1e` (Hover state, popover, control background)
- **Borders & Dividers (`--surface-border`)**: `#313131` / `rgba(255, 255, 255, 0.12)`

### Primary Accent (Gold Brand)
- **Gold Primary**: `#F5C542`
- **Gold Hover / Ember**: `#EAB308`
- **Gold Soft Background**: `rgba(245, 197, 66, 0.10)`
- **Gold Subtle Border**: `rgba(245, 197, 66, 0.35)`

### Semantic Status Colors
- **Red (Warrior / Error)**: `#EF4444`
- **Cyan (Mage / Info)**: `#38BDF8`
- **Green (Archer / Success)**: `#22C55E`
- **Yellow/Gold (Healer / Warning)**: `#F5C542`

---

## 4. Design Bans & Strict Rules (Dilarang Dalam UI)

1. **STRICT BAN: Extreme Capsule Pills (`rounded-full` berlebihan)**
   - Dilarang menggunakan tombol atau badge dengan sudut pil kapsul membulat ekstrim (`rounded-full` / `9999px`) untuk tombol utama dan status label umum, kecuali untuk avatar bulat atau dot indikator terkontrol.
2. **STRICT BAN: Dot Bulat Bersinar (Glowing Dots)**
   - Dilarang menambahkan dot bulat bersinar (`width: 8px, height: 8px, borderRadius: 9999px, boxShadow: 0 0 8px...`).
3. **STRICT BAN: Banner Teks Uppercase Mencolok**
   - Dilarang menggunakan banner topbar uppercase dengan tracking sangat renggang yang mengganggu (misal: "MENUNGGU PENANTANG BATTLE 1V1"). Gunakan Sentence case natural.
4. **STRICT BAN: Merge ke Main Tanpa Perintah Explicit**
   - Mengikuti panduan agen, dilarang merge atau commit langsung tanpa instruksi.

---

## 5. UI Layout & Responsiveness Principles

- **Mobile First & Compact Spacing**: Padding dan margin yang responsif (`p-3 sm:p-4 md:p-6`).
- **No Overlapping / Clipping**: Pastikan `box-sizing: border-box` dan `min-w-0` digunakan agar teks dan kartu tidak terpotong pada layar seluler (360px–430px).
- **Interactive Feedback**: Semua tombol dan elemen interaktif memberikan respon mikro-interaksi (*hover lift*, *active scale 0.98*).
