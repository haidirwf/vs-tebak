'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Swords,
  BookOpen,
  Zap,
  Trophy,
  Flame,
  LayoutDashboard,
  ChevronRight,
  Shield,
  Star,
  Users,
  Gift,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Gamepad2,
  Clock,
  Award,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'

interface LandingClientProps {
  isLoggedIn: boolean
}

const CLASSES_DATA = [
  {
    id: 'warrior',
    name: 'Warrior',
    title: 'The Code Vanguard',
    emoji: '⚔️',
    color: 'var(--accent-red)',
    borderColor: 'rgba(232, 64, 64, 0.4)',
    tagline: 'Kuat dalam logika, backend, dan problem solving kompleks.',
    stats: [
      { label: 'Logika & Backend', value: 95 },
      { label: 'Ketahanan Debugging', value: 90 },
      { label: 'Kecepatan Algoritma', value: 82 },
      { label: 'Kreativitas Desain', value: 65 },
    ],
    perk: 'Clean Code Slash',
    perkDesc: '+20% bonus XP saat menyelesaikan modul pemrograman dan database.',
    suitable: 'Pelajar SMK RPL/SIJA yang menyukai backend, API, dan problem solving.',
  },
  {
    id: 'mage',
    name: 'Mage',
    title: 'The Design Alchemist',
    emoji: '🔮',
    color: 'var(--accent-cyan)',
    borderColor: 'rgba(0, 212, 255, 0.4)',
    tagline: 'Penyihir visual, mahir estetika UI/UX, dan interaksi pengguna.',
    stats: [
      { label: 'Estetika UI/UX', value: 98 },
      { label: 'Kreativitas Visual', value: 92 },
      { label: 'Logika & Backend', value: 70 },
      { label: 'Ketahanan Debugging', value: 78 },
    ],
    perk: 'Pixel Perfection',
    perkDesc: '+20% bonus XP untuk materi wireframing, prototipe, dan design system.',
    suitable: 'Pelajar SMK DKV/Multimedia & UI designer yang fokus pada user experience.',
  },
  {
    id: 'archer',
    name: 'Archer',
    title: 'The Battle Speedrunner',
    emoji: '🏹',
    color: 'var(--accent-green)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
    tagline: 'Reaksi kilat, unggul dalam duel kuis battle 1v1 dan time-attack.',
    stats: [
      { label: 'Kecepatan Respon', value: 98 },
      { label: 'Akurasi Kuis', value: 90 },
      { label: 'Logika & Backend', value: 80 },
      { label: 'Kreativitas Desain', value: 75 },
    ],
    perk: 'Rapid Arrow Shot',
    perkDesc: 'Double multiplier bonus combo pada mode duel kuis 1v1 real-time.',
    suitable: 'Pelajar kompetitif yang menyukai adu kecepatan kuis dan time-attack.',
  },
  {
    id: 'healer',
    name: 'Healer',
    title: 'The Productivity Sage',
    emoji: '✨',
    color: 'var(--accent-gold)',
    borderColor: 'rgba(245, 197, 66, 0.4)',
    tagline: 'Fokus, konsisten, penguasa manajemen waktu dan daily streak.',
    stats: [
      { label: 'Konsistensi Belajar', value: 99 },
      { label: 'Manajemen Waktu', value: 95 },
      { label: 'Logika & Backend', value: 78 },
      { label: 'Kecepatan Respon', value: 80 },
    ],
    perk: 'Continuous Flow',
    perkDesc: 'Perlindungan streak otomatis (+1 Streak Freeze gratis tiap minggu).',
    suitable: 'Pelajar yang mengutamakan rutinitas belajar teratur dan disiplin konsisten.',
  },
]

const FEATURES_DATA = [
  {
    icon: BookOpen,
    title: 'Modul Interaktif Step-by-Step',
    desc: 'Kurikulum ringkas pemrograman, UI/UX, dan AI modern dengan materi teks padat, tutorial YouTube pilihan, dan kuis cek pemahaman.',
    tag: 'Kurikulum Terpadu',
    color: 'var(--accent-cyan)',
  },
  {
    icon: Zap,
    title: 'Duel Kuis Battle 1v1 Real-Time',
    desc: 'Tantang teman satu sekolah atau cari lawan acak se-Indonesia dalam arena kuis live dengan socket real-time dan combo multiplier.',
    tag: 'Live Multiplayer',
    color: 'var(--accent-red)',
  },
  {
    icon: Trophy,
    title: 'Leaderboard Siswa & Sekolah',
    desc: 'Papan reputasi nasional berdasarkan total XP dan kemenangan battle. Bawa nama sekolahmu mendominasi puncak ranking!',
    tag: 'Kompetisi Nasional',
    color: 'var(--accent-gold)',
  },
  {
    icon: Flame,
    title: 'Daily Streak & Quest Harian',
    desc: 'Misi harian yang diperbarui setiap 24 jam. Bangun konsistensi belajar setiap hari untuk mendapatkan bonus XP dan Gold koin ekstra.',
    tag: 'Gamifikasi Harian',
    color: 'var(--accent-red)',
  },
  {
    icon: Gift,
    title: 'Toko Voucher & Reward Nyata',
    desc: 'Kumpulkan koin dari kemenangan battle dan quest untuk ditukarkan dengan voucher digital nyata di toko hadiah Skillungo.',
    tag: 'Hadiah Riil',
    color: 'var(--accent-gold)',
  },
  {
    icon: Shield,
    title: 'Profil RPG & Koleksi Badge',
    desc: 'Kustomisasi karakter avatar, pantau statistik XP, dan pamerkan lencana pencapaian eksklusif yang kamu buka sepanjang perjalanan.',
    tag: 'Karakter RPG',
    color: 'var(--accent-green)',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Pilih Kelas & Sekolah',
    desc: 'Daftar gratis dalam hitungan detik, tentukan kelas karakter RPG favoritmu, dan pilih sekolah asalmu.',
    icon: Shield,
    color: 'var(--accent-cyan)',
  },
  {
    step: '02',
    title: 'Selesaikan Quest Modul',
    desc: 'Pelajari skill digital esensial lewat modul terstruktur, pelajari teori ringkas, dan selesaikan quiz uji kemampuan.',
    icon: BookOpen,
    color: 'var(--accent-gold)',
  },
  {
    step: '03',
    title: 'Adu Cerdas di Arena 1v1',
    desc: 'Masuki Battle Arena untuk menantang teman atau rival secara real-time. Buktikan siapa yang tercepat dan tertepat!',
    icon: Zap,
    color: 'var(--accent-red)',
  },
  {
    step: '04',
    title: 'Raih Puncak & Tukar Hadiah',
    desc: 'Kumpulkan XP untuk menaikkan level karaktermu, bawa sekolah ke Top 10, dan tukar reward di Voucher Shop.',
    icon: Trophy,
    color: 'var(--accent-green)',
  },
]

const FAQS = [
  {
    q: 'Apakah Skillungo sepenuhnya gratis untuk pelajar?',
    a: 'Ya, Skillungo 100% gratis digunakan oleh pelajar SMK, SMA, maupun MA di seluruh Indonesia. Semua modul belajar, mode kuis 1v1, dan fitur leaderboard dapat diakses tanpa biaya.',
  },
  {
    q: 'Bagaimana cara mendaftarkan sekolah saya di Leaderboard?',
    a: 'Saat mendaftar akun pertama kali, cukup pilih atau masukkan nama sekolahmu. Seluruh XP yang kamu dan teman-teman satu sekolahmu dapatkan akan otomatis terakumulasi ke poin sekolah di leaderboard nasional.',
  },
  {
    q: 'Apakah saya bisa membuat duel kuis khusus bersama teman sekelas?',
    a: 'Tentu saja! Di Battle Arena tersedia fitur "Buat Room Private" dengan kode kamar unik. Kamu cukup membagikan kode 6 digit tersebut kepada temanmu untuk langsung bertanding duel 1v1.',
  },
  {
    q: 'Materi skill digital apa saja yang tersedia di dalam modul?',
    a: 'Skillungo berfokus pada skill masa depan: Web Development (Frontend/Backend/JavaScript), UI/UX Design, Algoritma Pemrograman, dan Produktivitas Digital yang dirancang relevan dengan kebutuhan industri saat ini.',
  },
]

export default function LandingClient({ isLoggedIn }: LandingClientProps) {
  const [selectedClass, setSelectedClass] = useState(CLASSES_DATA[0])
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Interactive Battle Quiz Preview state
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null)
  const [comboCount, setComboCount] = useState(1)

  const handleQuizAnswer = (index: number) => {
    setQuizAnswered(index)
    if (index === 2) {
      setComboCount((prev) => prev + 1)
    }
  }

  return (
    <div className="bg-blueprint-grid" style={{ minHeight: '100vh', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      {/* ── Fixed Header Navbar ── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 197, 66, 0.12)',
              border: '1px solid rgba(245, 197, 66, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(245, 197, 66, 0.2)',
            }}
          >
            <Swords size={20} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              Skill<span style={{ color: 'var(--accent-gold)' }}>ungo</span>
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 212, 255, 0.25)',
              }}
            >
              RPG v2.0
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-only" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <a
            href="#hero"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Beranda
          </a>
          <a
            href="#preview"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Arena Demo
          </a>
          <a
            href="#kelas"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Kelas RPG
          </a>
          <a
            href="#fitur"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Fitur
          </a>
          <a
            href="#faq"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                textDecoration: 'none',
                backgroundColor: 'var(--accent-gold)',
                color: 'var(--bg-primary)',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 16px rgba(245, 197, 66, 0.3)',
              }}
            >
              <LayoutDashboard size={15} /> Dashboard <ChevronRight size={14} />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  backgroundColor: 'var(--accent-gold)',
                  color: 'var(--bg-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 16px rgba(245, 197, 66, 0.25)',
                }}
              >
                Mulai Petualangan <ChevronRight size={14} />
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-only-btn"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '6px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'none',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section
        id="hero"
        style={{
          position: 'relative',
          paddingTop: '130px',
          paddingBottom: '80px',
          paddingLeft: '24px',
          paddingRight: '24px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '960px', margin: '0 auto' }}>
          {/* Dovetail Eyebrow Label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: '20px' }}
          >
            <span
              className="section-eyebrow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                color: 'var(--color-ash)',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-gold)' }} />
              GAMIFIED LEARNING PLATFORM · RPG v2.0
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.12,
              marginBottom: '20px',
              letterSpacing: '-0.01em',
            }}
          >
            Level Up Skill Digitalmu,
            <br />
            <span style={{ color: 'var(--accent-gold)' }}>
              Taklukkan Masa Depan.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 36px',
              lineHeight: 1.7,
            }}
          >
            Platform edukasi berbasis RPG interaktif untuk pelajar SMK dan SMA. Asah skill coding, UI/UX, dan AI modern, bertanding dalam{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Duel Kuis 1v1 Real-time</strong>, jaga{' '}
            <strong style={{ color: 'var(--accent-red)' }}>Daily Streak</strong>, dan bawa nama sekolahmu ke puncak Leaderboard Nasional!
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}
          >
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                style={{
                  padding: '16px 36px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  backgroundColor: 'var(--accent-gold)',
                  color: 'var(--bg-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '17px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 0 24px rgba(245, 197, 66, 0.4)',
                }}
              >
                <LayoutDashboard size={20} /> LANJUT KE DASHBOARD <ChevronRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  style={{
                    padding: '16px 36px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    backgroundColor: 'var(--accent-gold)',
                    color: 'var(--bg-primary)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '17px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 0 24px rgba(245, 197, 66, 0.4)',
                  }}
                >
                  <Swords size={20} /> MULAI PETUALANGAN GRATIS <ChevronRight size={18} />
                </Link>
                <a
                  href="#preview"
                  style={{
                    padding: '16px 30px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Gamepad2 size={18} style={{ color: 'var(--accent-cyan)' }} /> Coba Simulasi Duel 1v1
                </a>
              </>
            )}
          </motion.div>

          {/* Micro Stats Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px',
              padding: '20px 24px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              maxWidth: '840px',
              margin: '0 auto',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 800, color: 'var(--accent-cyan)' }}>10+ Modul</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Coding, Desain, & AI</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 800, color: 'var(--accent-gold)' }}>1v1 Battle</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Duel Kuis Live Multiplayer</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 800, color: 'var(--accent-red)' }}>Daily Streak</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bonus XP & Badge Unik</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 800, color: 'var(--accent-green)' }}>100% Gratis</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Untuk Seluruh Pelajar</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Gameplay Showcase (Live Preview) ── */}
      <section
        id="preview"
        style={{
          padding: '40px 24px 80px',
          maxWidth: '1080px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
            }}
          >
            <Sparkles size={14} /> LIVE GAMEPLAY EXPERIENCE
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
            Sensasi Belajar Layaknya Game RPG Kompetitif
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '580px', margin: '0 auto' }}>
            Coba simulasi interaktif duel kuis di bawah ini. Jawab dengan benar untuk memicu combo XP!
          </p>
        </div>

        {/* Live Arena Simulation Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 212, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          {/* Top Bar of Arena */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              backgroundColor: 'rgba(20, 20, 26, 0.95)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                ARENA DUEL 1v1 · ALGORITMA & JAVASCRIPT
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={14} /> {comboCount > 1 ? `x${comboCount} COMBO!` : 'Siap Bertanding'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--accent-red)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                ⏳ 00:08
              </span>
            </div>
          </div>

          {/* Versus Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: '16px',
              alignItems: 'center',
              padding: '24px 28px',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Player 1 (You) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(232, 64, 64, 0.15)',
                  border: '2px solid var(--accent-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                ⚔️
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700 }}>Kamu (Hero)</span>
                  <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', backgroundColor: 'var(--accent-red)', color: 'var(--bg-primary)', fontWeight: 700 }}>
                    Lv. 12
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SMK Telkom Malang · Warrior</div>
                {/* Health Bar */}
                <div style={{ width: '120px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--accent-green)' }} />
                </div>
              </div>
            </div>

            {/* VS Badge */}
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '18px',
                fontWeight: 900,
                color: 'var(--accent-gold)',
                backgroundColor: 'rgba(245, 197, 66, 0.1)',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(245, 197, 66, 0.3)',
              }}
            >
              VS
            </div>

            {/* Player 2 (Opponent) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px', textAlign: 'right' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', backgroundColor: 'var(--accent-cyan)', color: 'var(--bg-primary)', fontWeight: 700 }}>
                    Lv. 14
                  </span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700 }}>Dina Alchemist</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SMAN 1 Yogyakarta · Mage</div>
                {/* Health Bar */}
                <div style={{ width: '120px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', marginTop: '6px', marginLeft: 'auto', overflow: 'hidden' }}>
                  <div style={{ width: quizAnswered === 2 ? '55%' : '85%', height: '100%', backgroundColor: 'var(--accent-red)', transition: 'width 0.4s' }} />
                </div>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 212, 255, 0.15)',
                  border: '2px solid var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                🔮
              </div>
            </div>
          </div>

          {/* Interactive Question Body */}
          <div style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-gold)' }}>
                RONDE 3 DARI 5
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Klik jawaban yang tepat untuk menyerang:</span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, marginBottom: '20px', lineHeight: 1.4 }}>
              Manakah di antara kode berikut yang mengembalikan nilai boolean bernilai <code style={{ color: 'var(--accent-cyan)', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>true</code>?
            </h3>

            {/* Answer Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { id: 0, text: "typeof NaN === 'number'", correct: true },
                { id: 1, text: "Boolean('') === true", correct: false },
                { id: 2, text: "Array.isArray([]) === true", correct: true },
                { id: 3, text: "'5' === 5", correct: false },
              ].map((opt) => {
                const isSelected = quizAnswered === opt.id
                let bg = 'var(--bg-tertiary)'
                let border = 'var(--border)'
                let textColor = 'var(--text-primary)'

                if (isSelected) {
                  if (opt.correct) {
                    bg = 'rgba(34, 197, 94, 0.15)'
                    border = 'var(--accent-green)'
                    textColor = 'var(--accent-green)'
                  } else {
                    bg = 'rgba(232, 64, 64, 0.15)'
                    border = 'var(--accent-red)'
                    textColor = 'var(--accent-red)'
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleQuizAnswer(opt.id)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '8px',
                      border: `1px solid ${border}`,
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: '13px',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{String.fromCharCode(65 + opt.id)}. <code>{opt.text}</code></span>
                    {isSelected && (opt.correct ? <CheckCircle size={16} /> : <X size={16} />)}
                  </button>
                )
              })}
            </div>

            {/* Result Feedback message */}
            {quizAnswered !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: quizAnswered === 0 || quizAnswered === 2 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(232, 64, 64, 0.1)',
                  border: `1px solid ${quizAnswered === 0 || quizAnswered === 2 ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  {quizAnswered === 0 || quizAnswered === 2
                    ? '⚔️ Serangan Telak Berhasil! +120 XP didapatkan dan health lawan berkurang!'
                    : '🛡️ Salah sasaran! Lawan menangkis seranganmu.'}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                  +120 XP
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── Character Classes Section ── */}
      <section
        id="kelas"
        style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'rgba(20, 20, 26, 0.5)',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.08em' }}>
              RPG ROLE SYSTEM
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
              Pilih Kelas Karakter Petualangmu
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '580px', margin: '0 auto' }}>
              Setiap kelas memiliki spesialisasi statistik, keahlian unik, dan bonus XP untuk mendukung gaya belajarmu.
            </p>
          </div>

          {/* Class Select Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            {CLASSES_DATA.map((cls) => {
              const isSelected = selectedClass.id === cls.id
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  style={{
                    padding: '16px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${isSelected ? cls.color : 'var(--border)'}`,
                    backgroundColor: isSelected ? 'var(--bg-secondary)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isSelected ? `0 0 20px ${cls.borderColor}` : 'none',
                    transition: 'all 0.25s',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{cls.emoji}</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: isSelected ? cls.color : 'var(--text-primary)' }}>
                    {cls.name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{cls.title}</span>
                </button>
              )
            })}
          </div>

          {/* Active Class Showcase Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedClass.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '14px',
                border: `1px solid ${selectedClass.borderColor}`,
                padding: '32px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '32px',
                alignItems: 'center',
                boxShadow: `0 10px 40px -10px ${selectedClass.borderColor}`,
              }}
            >
              {/* Left Column: Avatar & Overview */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: `2px solid ${selectedClass.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                    }}
                  >
                    {selectedClass.emoji}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 800, color: selectedClass.color }}>
                      {selectedClass.name} — {selectedClass.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedClass.tagline}</p>
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Sparkles size={16} style={{ color: selectedClass.color }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: selectedClass.color }}>
                      Perk Spesial: {selectedClass.perk}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {selectedClass.perkDesc}
                  </p>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  🎯 <strong>Rekomendasi:</strong> {selectedClass.suitable}
                </div>
              </div>

              {/* Right Column: Attribute Stat Bars */}
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
                  DISTRIBUSI STATISTIK KELAS
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {selectedClass.stats.map((st) => (
                    <div key={st.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{st.label}</span>
                        <span style={{ fontWeight: 700, color: selectedClass.color }}>{st.value}/100</span>
                      </div>
                      <div style={{ height: '7px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${st.value}%` }}
                          transition={{ duration: 0.5 }}
                          style={{ height: '100%', backgroundColor: selectedClass.color, borderRadius: '4px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── How It Works (Quest Roadmap) ── */}
      <section
        id="cara-kerja"
        style={{
          padding: '80px 24px',
          maxWidth: '1080px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
            QUEST ROADMAP
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
            Cara Kerja Petualangan di Skillungo
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '580px', margin: '0 auto' }}>
            4 langkah sederhana untuk bertransformasi dari pelajar biasa menjadi pahlawan digital berprestasi.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px' }}>
          {HOW_IT_WORKS.map((item, idx) => (
            <div
              key={item.step}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                padding: '28px 22px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '28px',
                  fontWeight: 900,
                  color: 'rgba(255, 255, 255, 0.1)',
                  position: 'absolute',
                  top: '16px',
                  right: '20px',
                }}
              >
                {item.step}
              </div>

              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: `1px solid ${item.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                  marginBottom: '18px',
                }}
              >
                <item.icon size={22} />
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Matrix ── */}
      <section
        id="fitur"
        style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'rgba(20, 20, 26, 0.4)',
        }}
      >
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-red)', letterSpacing: '0.08em' }}>
              POWERFUL CAPABILITIES
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
              Fitur Lengkap untuk Belajar Lebih Seru
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '580px', margin: '0 auto' }}>
              Dirancang dengan perpaduan pedagogi modern dan mekanik game adiktif agar kamu tidak cepat bosan.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px' }}>
            {FEATURES_DATA.map((feat) => (
              <div
                key={feat.title}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: `1px solid ${feat.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: feat.color,
                      }}
                    >
                      <feat.icon size={20} />
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        color: feat.color,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {feat.tag}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section
        id="faq"
        style={{
          padding: '80px 24px',
          maxWidth: '840px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.08em' }}>
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
            Pertanyaan yang Sering Diajukan
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Punya pertanyaan seputar petualangan di Skillungo? Simak penjelasan berikut.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQS.map((faq, i) => {
            const isOpen = activeFaq === i
            return (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '16px',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: isOpen ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.25s',
                    }}
                  />
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 22px 20px',
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '14px',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section
        style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 197, 66, 0.12)',
              border: '1px solid rgba(245, 197, 66, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 24px rgba(245, 197, 66, 0.2)',
            }}
          >
            <Swords size={28} style={{ color: 'var(--accent-gold)' }} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: '14px' }}>
            {isLoggedIn ? 'Karaktermu Sudah Siap Bertanding!' : 'Karaktermu Menunggu di Gerbang Petualangan.'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            {isLoggedIn
              ? 'Lanjutkan progress belajarmu, taklukkan kuis hari ini, dan raih posisi terbaik di Leaderboard!'
              : 'Daftar sekarang secara gratis, bentuk squad sekolahmu, dan jadilah legenda digital berikutnya di Skillungo.'}
          </p>

          <Link
            href={isLoggedIn ? '/dashboard' : '/register'}
            style={{
              padding: '16px 42px',
              borderRadius: '8px',
              textDecoration: 'none',
              backgroundColor: 'var(--accent-gold)',
              color: 'var(--bg-primary)',
              fontFamily: 'var(--font-heading)',
              fontSize: '18px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 0 28px rgba(245, 197, 66, 0.4)',
            }}
          >
            {isLoggedIn ? (
              <>
                <LayoutDashboard size={20} /> BUKA DASHBOARD SEKARANG
              </>
            ) : (
              <>
                <Swords size={20} /> DAFTAR SEKARANG — 100% GRATIS!
              </>
            )}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: '40px 28px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Swords size={18} style={{ color: 'var(--accent-gold)' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Skill<span style={{ color: 'var(--accent-gold)' }}>ungo</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '13px' }}>
            <Link href="/modules" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Modul Belajar</Link>
            <Link href="/battle" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Battle Arena 1v1</Link>
            <Link href="/leaderboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Leaderboard Sekolah</Link>
            <Link href="/voucher" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Toko Voucher</Link>
            <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Masuk Akun</Link>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            © 2026 Skillungo. &quot;Level Up Your Skills, Conquer Your Future&quot; · Platform Gamifikasi Edukasi Pelajar Indonesia.
          </p>
        </div>
      </footer>
    </div>
  )
}
