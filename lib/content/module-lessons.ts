import { LessonStep, Question } from '@/types'

export const MODULE_LESSONS_MAP: Record<string, LessonStep[]> = {
    // =========================================================================
    // 1. CODING: HTML & CSS Dasar
    // =========================================================================
    'html-css-dasar': [
        {
            id: 'html-fondasi-anatomi',
            title: 'Fondasi Web & Anatomi Dokumen HTML5',
            type: 'text',
            content: `HTML (*Hypertext Markup Language*) adalah bahasa markah standar yang menjadi fondasi dan kerangka struktural bagi seluruh situs web di internet. HTML bertindak layaknya rangka baja pada gedung bertingkat; tanpa HTML, peramban (*browser*) tidak memiliki konten dasar untuk ditampilkan.

## Cara Kerja Web & Peran HTML
Ketika kamu mengetikkan alamat web di peramban, terjadi alur komunikasi standar:
1. **HTTP Request**: Peramban mengirimkan permintaan berkas ke komputer server.
2. **Server Response**: Server membalas dengan mengirimkan dokumen kode HTML, lembar gaya CSS, dan skrip JavaScript.
3. **DOM Parsing**: Peramban membaca tag HTML dari atas ke bawah, lalu membangun *Document Object Model* (DOM) untuk dirender menjadi antarmuka visual di layar.

## Anatomi Standar Dokumen HTML5
Setiap dokumen web modern diawali dengan deklarasi \`<!DOCTYPE html>\` yang memberi tahu peramban agar menerapkan mode standar W3C terbaru.

Contoh kerangka lengkap berkas HTML5:
\`\`\`html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Akademi Koding Skillungo</title>
</head>
<body>
  <h1>Selamat Datang di Dunia Web Development</h1>
  <p>Mulai petualangan kodingmu dari memahami struktur kode HTML5.</p>
</body>
</html>
\`\`\`

### Fungsi Elemen Kunci di Bagian \`<head>\`
- **\`<html lang="id">\`**: Menentukan bahasa utama dokumen (Bahasa Indonesia), membantu mesin pencari dan teknologi pembaca layar (*screen reader*).
- **\`<meta charset="UTF-8">\`**: Menetapkan pengkodean karakter universal agar simbol khusus, huruf aksen, dan emoji dapat ditampilkan tanpa eror (*mojibake*).
- **\`<meta name="viewport" content="width=device-width, initial-scale=1.0">\`**: Sangat krusial untuk responsivitas! Memastikan skala halaman menyesuaikan lebar fisik layar perangkat pengguna (ponsel, tablet, atau desktop).
- **\`<title>\`**: Menentukan teks judul tab pada peramban dan cuplikan tautan hasil pencarian Google.

## Anatomi Elemen HTML: Tag, Konten, & Atribut
Elemen HTML pada umumnya terdiri dari tiga komponen utama:
\`\`\`html
<p class="adventurer-bio" id="bio-utama">Petualang tangguh penakluk tantangan kode!</p>
\`\`\`
1. **Tag Pembuka (\`<p ...>\`)**: Menandai awal elemen dan memuat **atribut** tambahan seperti \`class\` dan \`id\`.
2. **Konten**: Informasi teks atau elemen bersarang yang berada di antara tag pembuka dan penutup.
3. **Tag Penutup (\`</p>\`)**: Menandai akhir elemen dengan garis miring penutup (\`/\`).

### Elemen Kosong (Void Elements)
Beberapa elemen tidak memiliki pasangan tag penutup karena tidak membungkus teks konten secara langsung, melainkan menyematkan data dari luar:
- **\`<img src="..." alt="...">\`**: Menyisipkan berkas gambar.
- **\`<br>\`**: Membuat jeda baris baru (*line break*).
- **\`<hr>\`**: Membuat garis pemisah horizontal tematik.
- **\`<input type="text">\`**: Menyediakan kolom isian data bagi pengguna.`,
        },
        {
            id: 'html-tipografi-teks-list',
            title: 'Hierarki Heading, Format Teks, & Pengorganisasian List',
            type: 'text',
            content: `Menyusun konten dengan hirarki visual yang jelas sangat penting agar pengguna dapat membaca (*scanning*) materi dengan nyaman dan mesin pencari (SEO) dapat mengindeks halaman secara akurat.

## Hierarki Judul (\`<h1>\` sampai \`<h6>\`)
HTML menyediakan enam tingkatan heading:
- **\`<h1>\`**: Judul utama paling penting dari seluruh halaman. **Aturan baku SEO**: Gunakan hanya satu tag \`<h1>\` per halaman dokumen!
- **\`<h2>\`**: Subjudul bab utama atau nama section besar.
- **\`<h3>\`**: Sub-bagian di bawah \`<h2>\`.
- **\`<h4>\` s/d \`<h6>\`**: Judul tingkat lanjut untuk konten yang sangat rinci atau bersarang.

\`\`\`html
<h1>Panduan Lengkap Front-End Developer</h1>
<h2>Bab 1: Dasar HTML5</h2>
<h3>1.1 Anatomi Elemen Teks</h3>
\`\`\`

## Pemformatan Teks Semantik
Hindari pemformatan teks murni dekoratif lama. Gunakan elemen yang memiliki bobot makna semantik:
- **\`<strong>\`**: Memberikan penekanan penting secara mendesak (tampil tebal). Sangat diperhatikan oleh peramban dan pembaca layar tunanetra.
- **\`<em>\`**: Memberikan penekanan intonasi bacaan (*emphasis*, tampil miring).
- **\`<mark>\`**: Menandai atau menyorot teks penting (tampil berlatar kuning stabilo).
- **\`<code>\`**: Menampilkan potongan sintaks kode komputer dalam font monospace.
- **\`<blockquote cite="...">\`**: Membungkus kutipan panjang dari sumber eksternal.

\`\`\`html
<p>
  Pastikan kamu <strong>selalu menyimpan berkas kode</strong> sebelum melakukan refresh pada peramban.
  Ketikkan perintah <code>npm run dev</code> untuk memulai server lokal.
</p>
\`\`\`

## Pengorganisasian List (Daftar Terstruktur)
HTML menyediakan 3 varian daftar untuk mengelompokkan butir informasi:

### 1. Unordered List (\`<ul>\`)
Digunakan untuk kumpulan butir yang urutan posisinya tidak memiliki makna kronologis (ditampilkan dengan simbol buletin/titik):
\`\`\`html
<ul>
  <li>Editor Kode (Visual Studio Code)</li>
  <li>Peramban Web (Google Chrome)</li>
  <li>Terminal Bash / Zsh</li>
</ul>
\`\`\`

### 2. Ordered List (\`<ol>\`)
Digunakan untuk urutan langkah terstruktur, resep, atau panduan tutorial bertahap (ditampilkan dengan angka penomoran otomatis 1, 2, 3):
\`\`\`html
<ol>
  <li>Tuliskan kerangka HTML dasar.</li>
  <li>Tautkan lembar gaya CSS eksternal.</li>
  <li>Buka berkas di peramban untuk melihat hasil.</li>
</ol>
\`\`\`

### 3. Description List (\`<dl>\`)
Digunakan untuk daftar pasangan istilah (\`<dt>\`) dan deskripsi penjelasannya (\`<dd>\`):
\`\`\`html
<dl>
  <dt>HTML</dt>
  <dd>Bahasa markah untuk menyusun struktur kerangka situs web.</dd>
  <dt>CSS</dt>
  <dd>Lembar gaya untuk menghias estetika warna, ukuran, dan tata letak visual.</dd>
</dl>
\`\`\``,
        },
        {
            id: 'html-semantik-aksesibilitas',
            title: 'Elemen Semantik HTML5 & Aksesibilitas Modern (a11y)',
            type: 'text',
            content: `Sebelum era HTML5, pengembang web terbiasa menumpuk ratusan tag umum tanpa makna (fenomena dikenal sebagai *"div soup"*), seperti \`<div class="header">\`, \`<div id="sidebar">\`, atau \`<div class="footer">\`.

HTML5 memodernisasi cara kita mengkode dengan memperkenalkan **elemen semantik** — tag yang memiliki makna eksplisit bagi manusia, peramban, bot mesin pencari, dan teknologi asistif.

## Peta Arsitektur Halaman Semantik
Berikut tata letak standar rancangan web modern menggunakan elemen semantik:
\`\`\`html
<body>
  <header>
    <nav>...</nav>
  </header>

  <main>
    <article>
      <section>...</section>
      <section>...</section>
    </article>
    <aside>...</aside>
  </main>

  <footer>...</footer>
</body>
\`\`\`

## Memahami Fungsi Masing-Masing Tag Semantik
1. **\`<header>\`**: Bagian kepala halaman atau pengantar artikel, biasanya memuat logo, judul situs, atau metadata pengarang.
2. **\`<nav>\`**: Penampung blok navigasi utama (menu tautan navigasi web).
3. **\`<main>\`**: Konten sentral dan unik dari sebuah halaman web. **Aturan**: Hanya boleh ada satu \`<main>\` dalam satu dokumen HTML, dan tidak boleh berada di dalam \`<header>\` atau \`<footer>\`.
4. **\`<article>\`**: Komponen konten mandiri yang dapat didistribusikan secara independen (contoh: postingan artikel berita, kartu ulasan, atau kartu produk toko online).
5. **\`<section>\`**: Pengelompokan konten tematik dari sebuah halaman, umumnya selalu diawali dengan judul heading (\`<h2>\` atau \`<h3>\`).
6. **\`<aside>\`**: Konten sampingan yang melengkapi konten utama secara tidak langsung (contoh: widget sidebar, artikel terkait, atau kutipan pendukung).
7. **\`<footer>\`**: Kaki halaman yang memuat hak cipta, informasi kontak, tautan kebijakan privasi, atau peta situs.

## Aksesibilitas Web (Accessibility / a11y)
Aksesibilitas adalah prinsip memastikan bahwa situs web dapat dinikmati oleh semua kalangan, termasuk pengguna penyandang disabilitas yang mengandalkan pembaca layar (*screen reader*).

### Praktik Aksesibilitas Wajib:
- **Atribut \`alt\` pada Gambar**: Tag \`<img>\` wajib menyertakan atribut \`alt\` yang mendeskripsikan isi visual gambar secara padat dan bermakna. Jika gambar murni bersifat dekorasi latar, beri nilai kosong (\`alt=""\`).
- **Heading Terurut Rapi**: Jangan melompati tingkatan heading (misal dari \`<h1>\` langsung melompat ke \`<h4>\`) karena pengguna screen reader bernavigasi lewat daftar heading.
- **Kontras Teks Cukup**: Pastikan rasio kontras warna teks terhadap warna latar memenuhi standar WCAG (minimal 4.5:1 untuk teks normal).`,
        },
        {
            id: 'html-media-tautan',
            title: 'Media Grafis, Tautan Hiperteks, & Atribut Global',
            type: 'text',
            content: `Kekuatan utama World Wide Web terletak pada kemampuan menghubungkan dokumen satu dengan dokumen lain (*hyperlink*) serta menyajikan media grafis kaya rupa.

## Menautkan Dokumen dengan Tag \`<a>\` (Anchor)
Tag jangkar \`<a>\` menggunakan atribut \`href\` (*hypertext reference*) untuk menentukan alamat tujuan:

\`\`\`html
<!-- 1. Tautan Eksternal Aman -->
<a href="https://skillungo.id" target="_blank" rel="noopener noreferrer">
  Kunjungi Skillungo Academy
</a>

<!-- 2. Tautan Relatif Internal -->
<a href="/modules/html-css-dasar">
  Buka Modul HTML
</a>

<!-- 3. Tautan Bookmark ID (Pindah ke Bagian Tertentu) -->
<a href="#kontak-kami">
  Lompat ke Formulir Kontak
</a>

<!-- 4. Tautan Interaksi Perangkat -->
<a href="mailto:support@skillungo.id">Kirim Email Bantuan</a>
<a href="tel:+628123456789">Hubungi Hotline</a>
\`\`\`

> **Catatan Keamanan**: Saat menggunakan \`target="_blank"\` (membuka tab baru), selalu tambahkan atribut \`rel="noopener noreferrer"\` untuk mencegah celah keamanan *reverse tab-nabbing* di mana tab baru dapat mengakses objek peramban halaman asal.

## Menampilkan Gambar Web Modern (\`<img>\`)
\`\`\`html
<figure>
  <img 
    src="/images/hero-banner.webp" 
    alt="Ilustrasi petualang koding sedang menatap layar laptop futuristik"
    width="800" 
    height="450"
    loading="lazy"
  >
  <figcaption>Gambar 1.1: Suasana belajar gamified di akademi digital.</figcaption>
</figure>
\`\`\`

### Panduan Gambar Berkualitas Tinggi:
- **Format Modern**: Gunakan format gambar terkompresi seperti **WebP** atau **AVIF** untuk menghemat bandwidth hingga 30-50% dibandingkan PNG atau JPEG konvensional.
- **Atribut \`loading="lazy"\`**: Menginstruksikan peramban agar hanya mengunduh gambar saat pengguna menggulir mendekati posisi gambar tersebut (*lazy loading* native).
- **Semantik \`<figure>\` dan \`<figcaption>\`**: Menggabungkan gambar dengan takarir teks keterangannya secara semantik.

## Atribut Global Penting pada HTML
Atribut global dapat diterapkan pada hampir seluruh elemen HTML:
- **\`id\`**: Penanda identitas unik elemen (tidak boleh ada dua elemen dengan \`id\` yang sama persis di satu halaman).
- **\`class\`**: Penanda klasifikasi gaya yang dapat dipakai bersama oleh banyak elemen untuk styling CSS.
- **\`title\`**: Menampilkan balon teks tooltip kecil saat kursor mouse diarahkan di atas elemen.
- **\`data-*\`**: Atribut kustom untuk menyimpan metadata internal yang dapat diakses oleh skrip JavaScript (contoh: \`data-level="5"\`).`,
        },
        {
            id: 'html-form-validasi',
            title: 'Formulir Interaktif, Kontrol Input, & Validasi Native',
            type: 'text',
            content: `Formulir merupakan jembatan interaksi dua arah antara pengguna dan aplikasi web — mulai dari pendaftaran akun, kuis evaluasi, hingga pembayaran digital.

## Struktur Dasar Elemen \`<form>\`
\`\`\`html
<form action="/api/register" method="POST">
  <div class="form-group">
    <label for="username-input">Nama Pengguna:</label>
    <input 
      type="text" 
      id="username-input" 
      name="username" 
      placeholder="Masukkan username petualang"
      required 
      minlength="3" 
      maxlength="20"
    >
  </div>

  <div class="form-group">
    <label for="email-input">Alamat Email:</label>
    <input 
      type="email" 
      id="email-input" 
      name="email" 
      placeholder="nama@email.com"
      required
    >
  </div>

  <button type="submit">Daftar Sekarang</button>
</form>
\`\`\`

### Hubungan Wajib Antara \`<label>\` dan \`<input>\`
Perhatikan atribut \`for="..."\` pada tag \`<label>\` yang bernilai sama persis dengan atribut \`id="..."\` pada tag \`<input>\`.
Keuntungan besarnya: Saat pengguna mengklik teks label, kursor pengetikan akan otomatis terfokus ke dalam kolom input terkait. Hal ini sangat mempermudah pengguna ponsel dengan layar sentuh kecil!

## Beragam Tipe Elemen \`<input>\`
HTML5 menyediakan puluhan tipe kontrol input bawaan:
- **\`type="text"\`**: Isian teks umum satu baris.
- **\`type="email"\`**: Memvalidasi format alamat email otomatis (harus memuat tanda \`@\` dan domain).
- **\`type="password"\`**: Menyembunyikan karakter yang diketikkan menjadi bulatan sensor.
- **\`type="number"\`**: Hanya menerima angka numerik, dapat dikombinasikan dengan atribut \`min="1"\`, \`max="100"\`, dan \`step="5"\`.
- **\`type="checkbox"\`**: Kotak centang pilihan majemuk (pengguna dapat memilih lebih dari satu opsi).
- **\`type="radio"\`**: Pilihan tunggal eksklusif. **Kunci**: Semua tombol radio dalam satu grup wajib memiliki nilai atribut \`name\` yang sama persis!
- **\`type="date"\`**: Pemilih tanggal dengan kalender interaktif bawaan peramban.

## Elemen Formulir Non-Input
- **\`<textarea rows="4" cols="50">\`**: Kotak teks multibaris untuk pesan panjang, ulasan, atau bio pengguna.
- **\`<select>\` dan \`<option>\`**: Menu pilihan dropdown tarik-turun.
- **\`<button type="submit">\`**: Tombol pemicu pengiriman data formulir.

## Validasi Formulir Native HTML5
Tanpa sebaris pun kode JavaScript, peramban dapat menolak pengiriman formulir jika data tidak sesuai aturan:
- **\`required\`**: Mencegah pengiriman jika kolom masih kosong.
- **\`minlength\` / \`maxlength\`**: Membatasi jumlah minimum dan maksimum karakter.
- **\`pattern="[A-Za-z0-9]+"\`**: Validasi ekspresi reguler (Regex) untuk pola karakter tertentu.`,
        },
        {
            id: 'html-css-video',
            title: 'Video Pembelajaran: Panduan Visual HTML5 & CSS3 dari Nol',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=3U1AhjEf7DM',
        },
        {
            id: 'css-sintaks-selektor-spesifisitas',
            title: 'Arsitektur CSS: Selektor, Cascading, & Spesifisitas',
            type: 'text',
            content: `CSS (*Cascading Style Sheets*) adalah bahasa pendamping HTML yang bertugas mengatur estetika visual: tata warna, dimensi ukuran, tipografi, dan komposisi ruang antarmuka.

## Tiga Cara Menyematkan CSS ke Dokumen HTML
1. **Inline Style**: Dituliskan langsung di dalam atribut elemen (\`<h1 style="color: red;">\`). *Sangat tidak disarankan* untuk produksi karena mengotori berkas HTML dan sulit dirawat.
2. **Internal Style**: Dituliskan di dalam tag \`<style>\` pada bagian \`<head>\`. Cocok untuk prototipe cepat satu berkas.
3. **External Stylesheet**: Dituliskan pada berkas \`.css\` terpisah lalu ditautkan via tag \`<link rel="stylesheet" href="style.css">\`. **Standar industri profesional** karena memisahkan struktur isi (*content*) dari tampilan gaya (*presentation*).

## Anatomi Aturan CSS (CSS Rule)
Sebuah aturan CSS terdiri dari **selektor** dan **blok deklarasi**:
\`\`\`css
/* Selektor menargetkan class kartu */
.card-profile {
  background-color: #1e293b; /* Deklarasi: Properti dan Nilai */
  border-radius: 12px;
  padding: 20px;
}
\`\`\`

## Ragam Selektor CSS Modern
- **Selektor Universal (\`*\`)**: Menargetkan seluruh elemen tanpa terkecuali.
- **Selektor Elemen/Tag**: Menargetkan tag tertentu (contoh: \`p { line-height: 1.6; }\`).
- **Selektor Class (\`.\`)**: Menargetkan elemen dengan atribut class (contoh: \`.btn-primary\`). Fleksibel dan dapat digunakan berulang.
- **Selektor ID (\`#\`)**: Menargetkan elemen dengan atribut ID unik (contoh: \`#navbar-main\`).
- **Grouping Selector (\`,\`)**: Menggabungkan beberapa selektor dengan gaya sama (contoh: \`h1, h2, h3 { color: #f8fafc; }\`).
- **Descendant Selector (Spasi)**: Menargetkan elemen anak di dalam induk tertentu (contoh: \`.card p\` memilih seluruh \`<p>\` yang ada di dalam elemen \`.card\`).
- **Direct Child Selector (\`>\`)**: Menargetkan anak langsung (satu generasi persis di bawahnya).

## Memahami Cascading & Perhitungan Spesifisitas
Kata *"Cascading"* berarti aturan gaya mengalir dari atas ke bawah. Bila ada dua aturan yang bersaing menargetkan elemen yang sama, peramban menggunakan kalkulasi **spesifisitas** (bobot kekuatan selektor):

1. **Inline Style**: Bobot 1000 poin.
2. **ID Selector (\`#id\`)**: Bobot 100 poin.
3. **Class, Atribut, & Pseudo-class (\`.class\`, \`:hover\`)**: Bobot 10 poin.
4. **Elemen & Pseudo-element (\`h1\`, \`::before\`)**: Bobot 1 poin.

> **Peringatan Penting**: Hindari penggunaan \`!important\` untuk memaksakan gaya CSS! Penyalahgunaan \`!important\` merusak alur cascading alami dan membuat kode di masa mendatang sangat sulit diperbaiki.`,
        },
        {
            id: 'css-warna-tipografi-unit',
            title: 'Sistem Warna, Tipografi Modern, & Satuan Ukuran (px vs rem)',
            type: 'text',
            content: `Kualitas desain antarmuka ditentukan oleh pemilihan palet warna yang harmonis dan tipografi yang mudah dibaca (*legible*).

## Model Pewarnaan pada CSS
Peramban modern mendukung beragam format pewarnaan:
\`\`\`css
:root {
  /* 1. Hexadecimal (#RRGGBB) */
  --brand-gold: #f59e0b;

  /* 2. RGB & RGBA (Red, Green, Blue, Alpha/Transparansi) */
  --surface-card: rgba(30, 41, 59, 0.95);

  /* 3. HSL (Hue, Saturation, Lightness) — Sangat intuitif untuk variasi warna */
  --accent-cyan: hsl(190, 95%, 50%);
}
\`\`\`

### Variabel CSS (CSS Custom Properties)
Deklarasikan warna tema di dalam blok \`:root\` agar dapat digunakan kembali di seluruh berkas dan mudah diubah saat mengimplementasikan mode gelap/terang:
\`\`\`css
.btn-action {
  background-color: var(--brand-gold);
  color: #0f172a;
}
\`\`\`

## Satuan Ukuran CSS: Absolut vs Relatif
Memilih satuan ukuran yang tepat adalah kunci rancangan web yang adaptif dan inklusif:

### 1. Satuan Absolut (\`px\`)
- Menetapkan ukuran piksel fisik tetap di layar.
- **Kapan digunakan**: Cocok untuk ketebalan garis tepi border (\`1px\`), radius sudut (\`8px\`), atau bayangan kartu (\`box-shadow\`).

### 2. Satuan Relatif (\`rem\` & \`em\`)
- **\`rem\` (Root EM)**: Relatif terhadap ukuran font akar dokumen (\`<html>\`). Bawaan standar peramban adalah \`1rem = 16px\`.
  - Jika pengguna tunanetra memperbesar preferensi font di pengaturan sistem perambannya dari 16px menjadi 24px, seluruh layout bertanda \`rem\` akan membesar secara proporsional!
- **\`em\`**: Relatif terhadap ukuran font elemen induk langsungnya (*parent element*).

> **Rekomendasi Terbaik**: Selalu gunakan satuan **\`rem\`** untuk properti \`font-size\`, \`margin\`, dan \`padding\` layout utama agar situsmu ramah aksesibilitas!

## Pengaturan Tipografi Profesional
\`\`\`css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;       /* Setara 16px */
  line-height: 1.65;     /* Jarak antar-baris yang nyaman untuk membaca */
  color: #334155;
  letter-spacing: -0.01em;
}

h1, h2, h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  line-height: 1.25;
  color: #0f172a;
}
\`\`\``,
        },
        {
            id: 'css-box-model-display',
            title: 'CSS Box Model, Nilai Display, & Pengendalian Dimensi',
            type: 'text',
            content: `Semua elemen yang kamu lihat pada halaman web pada hakikatnya adalah sebuah kotak empat persegi (*box*). Memahami Box Model adalah fondasi paling esensial untuk menguasai tata letak CSS.

## 4 Lapisan CSS Box Model
Mulai dari lapisan paling dalam ke lapisan terluar:
1. **Content**: Area inti tempat teks, gambar, atau elemen anak berada.
2. **Padding**: Ruang nafas bagian dalam (antara konten teks dan garis border).
3. **Border**: Garis tepi pembatas yang mengelilingi padding dan konten.
4. **Margin**: Ruang kosong transparan di luar elemen yang memisahkannya dari elemen-elemen tetangga.

## Penyelamat Tata Letak: \`box-sizing: border-box\`
Secara bawaan (\`content-box\`), jika kamu memberi elemen lebar \`300px\` lalu menambahkan \`padding: 20px\` dan \`border: 2px\`, lebar fisik total elemen di layar akan membengkak menjadi \`344px\` (\`300 + 20 + 20 + 2 + 2\`). Hal ini sering menyebabkan tata letak pecah atau bergeser berantakan!

Dengan menerapkan **CSS Reset Universal**:
\`\`\`css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
\`\`\`
Peramban akan secara otomatis menghitung padding dan border **ke dalam** lebar yang ditentukan. Jika kamu menetapkan lebar \`300px\`, maka lebarnya akan tetap pas \`300px\`!

## Karakteristik Nilai Properti \`display\`
- **\`display: block\`**: Elemen mengambil lebar penuh 100% dari induknya dan selalu memaksa baris baru (contoh bawaan: \`<div>\`, \`<p>\`, \`<h1>\`, \`<section>\`).
- **\`display: inline\`**: Elemen mengalir berdampingan sebaris dengan teks. **Perhatian**: Elemen inline tidak dapat diatur \`width\`, \`height\`, atau margin atas-bawah (contoh bawaan: \`<span>\`, \`<a>\`, \`<strong>\`).
- **\`display: inline-block\`**: Elemen tetap mengalir sebaris, namun properti \`width\`, \`height\`, dan \`padding\` tetap dihormati secara penuh.
- **\`display: none\`**: Menghilangkan elemen dari tampilan dan struktur alur dokumen sepenuhnya (berbeda dengan \`visibility: hidden\` yang tetap menyisakan ruang kosong).

## Trik Meratakan Konten di Tengah Layar
Untuk membuat kartu atau wadah penampung berada tepat di tengah secara horizontal:
\`\`\`css
.container {
  max-width: 1140px; /* Batas lebar maksimum */
  margin: 0 auto;    /* 0 untuk atas-bawah, auto untuk kiri-kanan */
  padding: 0 16px;   /* Ruang nafas aman di layar ponsel */
}
\`\`\``,
        },
        {
            id: 'css-flexbox-tata-letak',
            title: 'Tata Letak Modern: Flexbox 1D & Desain Komponen',
            type: 'text',
            content: `Sebelum kehadiran Flexbox (*Flexible Box Layout*), pengembang terpaksa menggunakan teknik kuno yang rumit seperti \`float\`, \`clear: both\`, atau manipulasi \`table\`. Flexbox menyederhanakan penyusunan tata letak satu dimensi (baris atau kolom) secara elegan dan fleksibel.

## Konsep Induk & Anak (Container vs Items)
Flexbox bekerja dengan sistem hubungan dua pihak:
1. **Flex Container**: Elemen pembungkus yang diberi deklarasi \`display: flex;\`.
2. **Flex Items**: Elemen-elemen anak yang berada langsung di dalam container tersebut.

## Dua Sumbu Utama Flexbox
- **Main Axis (Sumbu Utama)**: Arah utama aliran item (bawaannya adalah horizontal dari kiri ke kanan bila \`flex-direction: row\`).
- **Cross Axis (Sumbu Silang)**: Sumbu yang tegak lurus dengan sumbu utama (vertikal bila alirannya baris).

## Properti untuk Flex Container
\`\`\`css
.navbar {
  display: flex;
  flex-direction: row;            /* row (horizontal) atau column (vertikal) */
  justify-content: space-between; /* Distribusi sepanjang sumbu utama (Main Axis) */
  align-items: center;            /* Perataan sepanjang sumbu silang (Cross Axis) */
  gap: 16px;                      /* Jarak bersih antar elemen tanpa perlu margin */
  flex-wrap: wrap;                /* Mengizinkan baris baru jika layar sempit */
}
\`\`\`

### Memahami Pilihan \`justify-content\`:
- **\`flex-start\`**: Semua item merapat ke awal sumbu.
- **\`center\`**: Semua item berkumpul di tengah-tengah.
- **\`flex-end\`**: Semua item merapat ke akhir sumbu.
- **\`space-between\`**: Item pertama di tepi kiri paling ujung, item terakhir di tepi kanan paling ujung, sisa ruang dibagi rata di antaranya.
- **\`space-evenly\`**: Semua celah antar-item dan celah ke dinding tepi memiliki ukuran yang sama persis.

## Properti untuk Flex Items (Anak)
\`\`\`css
.nav-search {
  flex: 1; /* Otomatis membesar mengisi sisa ruang kosong yang tersedia */
}

.profile-badge {
  flex-shrink: 0; /* Menolak untuk menyusut atau gepeng meskipun ruang sempit */
  align-self: flex-start; /* Mengabaikan align-items induk untuk dirinya sendiri */
}
\`\`\`

### Studi Kasus: Trik Meratakan Tengah Sempurna
Memposisikan elemen tepat di tengah-tengah kotak penampung (baik horizontal maupun vertikal) yang dahulu terkenal sulit, kini hanya butuh 3 baris kode CSS:
\`\`\`css
.hero-banner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
\`\`\``,
        },
        {
            id: 'css-media-queries-responsive',
            title: 'Responsive Web Design, Media Queries, & Mobile-First',
            type: 'text',
            content: `Saat ini lebih dari 60% lalu lintas internet global berasal dari perangkat seluler pintar (*smartphone*). Desain Web Responsif (*Responsive Web Design* / RWD) memastikan situs web tampil proporsional, nyaman dibaca, dan mudah disentuh di segala ukuran resolusi layar.

## Tiga Pilar Desain Web Responsif
1. **Viewport Meta Tag**: Wajib ada di \`<head>\` HTML agar skala layar ponsel tidak mengecil seperti perangko.
2. **Fluid Layout & Satuan Fleksibel**: Menggunakan persentase (\`%\`), Flexbox, CSS Grid, serta fungsi matematis modern seperti \`clamp()\`.
3. **CSS Media Queries**: Aturan bersyarat yang menerapkan gaya CSS spesifik berdasarkan karakteristik perangkat (terutama lebar layar).

## Filosofi Desain Mobile-First
**Mobile-First** adalah standar industri modern di mana kamu menuliskan gaya dasar untuk tampilan ponsel pintar terlebih dahulu tanpa media query, lalu menambahkan aturan \`@media (min-width: ...)\` untuk memperluas tata letak saat layar semakin lebar (tablet dan desktop).

Mengapa pendekatan \`min-width\` lebih unggul daripada \`max-width\`?
- Beban muat kode di ponsel lebih ringan dan cepat.
- Logika aturan CSS bertambah secara aditif (*progressive enhancement*) alih-alih menimpa ulang gaya berulang kali.

\`\`\`css
/* 1. GAYA DASAR: Layar Ponsel Pintar (< 640px) */
.card-grid {
  display: flex;
  flex-direction: column; /* 1 kartu per baris di HP */
  gap: 16px;
  padding: 16px;
}

/* 2. TABLET: Mulai dari lebar layar 640px ke atas */
@media (min-width: 640px) {
  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 2 kartu berdampingan */
    gap: 20px;
    padding: 24px;
  }
}

/* 3. DESKTOP / LAPTOP: Mulai dari lebar layar 1024px ke atas */
@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr); /* 3 kartu berdampingan */
    max-width: 1140px;
    margin: 0 auto;
  }
}
\`\`\`

## Media Grafis Responsif
Pastikan gambar atau video tidak meluber keluar dari batas layar pengguna:
\`\`\`css
img, video {
  max-width: 100%;
  height: auto;
  display: block;
}
\`\`\`

Dengan menerapkan Box Model, Flexbox, dan Media Queries Mobile-First, kamu siap membangun antarmuka web modern yang tangguh di semua perangkat!`,
        },
        {
            id: 'html-css-challenge',
            title: 'Tantangan Koding: Membangun Kartu Profil Petualang Responsif',
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
} `,
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
        {
            id: 'q-html-6',
            question_text: 'Bagaimana cara menghubungkan elemen <label> dengan <input> agar ketika teks label diklik, kursor otomatis fokus ke kolom input?',
            options: [
                'Menyamakan nilai atribut for pada <label> dengan atribut id pada <input>',
                'Menyamakan nilai atribut name pada kedua elemen',
                'Menempatkan atribut class yang sama pada <label> dan <input>',
                'Menggunakan atribut target pada <label>',
            ],
            correct_option: 0,
            difficulty: 'beginner',
            explanation: 'Atribut for pada <label> harus bernilai identik dengan atribut id pada <input> untuk mengaitkan interaksi klik secara otomatis.',
        },
        {
            id: 'q-html-7',
            question_text: 'Mengapa pengembang web modern sangat dianjurkan menggunakan satuan "rem" untuk font-size daripada "px"?',
            options: [
                'Mendukung aksesibilitas karena otomatis berskala mengikuti preferensi zoom font pengguna di browser',
                'Mempercepat waktu muat render CSS di peramban',
                'Mencegah teks agar tidak bisa disalin oleh pengguna lain',
                'Mengubah teks secara otomatis menjadi huruf kapital',
            ],
            correct_option: 0,
            difficulty: 'intermediate',
            explanation: 'Satuan rem berbasis pada ukuran font root (<html>), sehingga saat pengguna dengan gangguan penglihatan mengubah ukuran font dasar di browsernya, seluruh layout ikut membesar secara proporsional.',
        },
        {
            id: 'q-html-8',
            question_text: 'Dalam metodologi Mobile-First Responsive Design, pendekatan apakah yang digunakan saat menuliskan CSS Media Queries?',
            options: [
                'Menuliskan gaya dasar untuk ponsel pintar, lalu menggunakan @media (min-width: ...) untuk layar yang lebih besar',
                'Menuliskan gaya desktop terlebih dahulu, lalu menggunakan @media (max-width: ...) untuk mempersempit layar',
                'Membuat berkas CSS yang berbeda untuk setiap ukuran layar secara terpisah',
                'Menggunakan inline style di setiap elemen HTML agar tidak terpengaruh resolusi',
            ],
            correct_option: 0,
            difficulty: 'intermediate',
            explanation: 'Filosofi Mobile-First menuliskan gaya dasar ponsel pintar secara alami, kemudian memperkaya tata letak dengan aturan aditif @media (min-width: ...) saat layar melebar ke ukuran tablet dan desktop.',
        },
    ],
}

export function getCuratedQuestionsForModule(slug: string): Question[] | null {
    return MODULE_QUESTIONS_MAP[slug] || null
}
