# DESIGN_REF.md: Skilvul Course Design System Reference

Dokumentasi token desain hasil ekstraksi dari: [Skilvul - React Dasar](https://skilvul.com/courses/react-dasar/).

---

## 1. Backgrounds & Surfaces

| Token / Role | Hex / Value | Penggunaan |
| :--- | :--- | :--- |
| **Page Base / Pure White** | `#ffffff` (`--skilvul-colors-white`) | Background dasar halaman & kontainer utama |
| **Surface Alt / Off-White** | `#fafafa` (`--skilvul-colors-gray-50`) | Section selang-seling, latar netral |
| **Light Gray Surface** | `#f4f4f5` (`--skilvul-colors-gray-100`) | Kontainer silabus/modul, sub-card list |
| **Light Gray Accent** | `#eff2f6` (`--skilvul-colors-skilvul-lightGray`) | Background info callout, hover card state |
| **Subtle Tint (Blue)** | `#f8fcff` (`--skilvul-colors-skilvul-blue-50`) | Highlight modul aktif / unit lesson terpilih |
| **Subtle Tint (Yellow/Amber)** | `#fffcf8` (`--skilvul-colors-skilvul-yellow-50`) | Badge info, peringatan, label catatan |

---

## 2. Corner Radii & Edges

| Token | Nilai CSS | Penerapan Komponen |
| :--- | :--- | :--- |
| `--skilvul-radii-none` | `0px` | Divider edge, tab header flat |
| `--skilvul-radii-sm` | `0.125rem` (`2px`) | Checkbox, mini badge |
| `--skilvul-radii-base` | `0.25rem` (`4px`) | Input field form, code snippet block |
| `--skilvul-radii-md` | `0.375rem` (`6px`) | Tag kategori kecil, item baris kurikulum |
| **`--skilvul-radii-lg`** | **`0.5rem` (`8px`)** | **Default card silabus, tombol aksi utama (CTA)** |
| **`--skilvul-radii-xl`** | **`0.75rem` (`12px`)** | **Card utama overview modul, dialog modal, panel kursus** |
| `--skilvul-radii-2xl` | `1rem` (`16px`) | Hero wrapper banner, floating cards |
| `--skilvul-radii-full` | `9999px` | Avatar lingkaran, progress pill track, chips |

*Borders*:
- Standard border: `1px solid #e4e4e7` (`--skilvul-colors-gray-200`)
- Subtle border: `1px solid #cbd5e1` (`--skilvul-colors-blueGray-300`)

---

## 3. Brand Colors & Text Hierarchy (Skillungo Theme Adaptations)

### Primary Brand (Skillungo Gold Palette)
- **Primary / Signal Gold**: `#F5C542` (`--color-gold` / `--color-signal-orange`) - CTA utama, skor, tombol aksi, dan piala
- **Gold Hover / Ember**: `#EAB308` (`--color-ember` / `--color-gold-hover`) - State hover & active tombol emas
- **Gold Soft BG**: `rgba(245, 197, 66, 0.10)` (`--accent-gold-bg`) - Background badge status, chip, highlight
- **Gold Subtle Border**: `rgba(245, 197, 66, 0.35)` (`--accent-gold-border`) - Border aktif dan kartu reward
- **Warm Amber**: `#D97706` (`--color-burnt-orange`) - Aksen sekunder hangat
- **Electric Yellow**: `#FDE047` (`--color-electric-yellow`) - Kilau visual level-up & streak

### Dark Surfaces & Canvas (Skillungo Neutrals)
- **Void Canvas (Background Dasar)**: `#0a0a0a` (`--surface-canvas`)
- **Card Surface (Kartu Konten)**: `#141414` (`--surface-card`)
- **Elevated Surface (Dropdown / Hover)**: `#1e1e1e` (`--surface-elevated`)
- **Border / Edge Utama**: `#313131` (`--surface-border`)
- **Border Subtle**: `rgba(255, 255, 255, 0.08)` (`--surface-border-subtle`)

### RPG Semantic & Class Colors
- **Warrior / Danger / Error**: `#EF4444` (`--accent-red`) | BG: `rgba(239, 68, 68, 0.10)` | Border: `rgba(239, 68, 68, 0.28)`
- **Mage / Info / Mana / Quiz**: `#38BDF8` (`--accent-cyan`) | BG: `rgba(56, 189, 248, 0.10)` | Border: `rgba(56, 189, 248, 0.28)`
- **Archer / Speed / Success**: `#22C55E` (`--accent-green`) | BG: `rgba(34, 197, 94, 0.10)` | Border: `rgba(34, 197, 94, 0.28)`
- **Healer / Warning / XP**: `#F5C542` (`--accent-gold`) | BG: `rgba(245, 197, 66, 0.10)` | Border: `rgba(245, 197, 66, 0.35)`

### Typography Text Contrast
- **Text Primary (White)**: `#FFFFFF` (`--text-primary`) - Heading, judul modul, teks CTA
- **Text Silver**: `#BFBFBF` (`--text-silver`) - Subjudul, nav link
- **Text Fog (Secondary)**: `#999999` (`--text-secondary`) - Teks isi materi, paragraf pendukung
- **Text Steel (Muted)**: `#808080` (`--text-muted`) - Label non-aktif, info waktu, placeholder
- **Text Ash**: `#A7A7A7` (`--color-ash`) - Metadata ukuran kecil / badge teks secondary

---

## 4. Typography System

- **Heading Font**: `'CeraGR-Bold', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Body Font**: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Mono Font**: `SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- **Type Scale**:
  - `sm`: `0.875rem` (`14px`)
  - `md`: `1rem` (`16px`)
  - `lg`: `1.125rem` (`18px`)
  - `xl`: `1.25rem` (`20px`)
  - `2xl`: `1.5rem` (`24px`)
  - `3xl`: `1.875rem` (`30px`)

---

## 5. Shadows & Elevation

- **Card Base (`sm`)**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **Card Interactive / Hover (`base`)**: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`
- **Floating / Sticky Bar (`md`)**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **Modal / Dropdown (`lg`)**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **Focus Outline**: `0 0 0 3px rgba(66, 153, 225, 0.6)`
