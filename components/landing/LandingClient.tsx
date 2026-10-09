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
  Sparkles,
  Clock,
  Award,
  ChevronDown,
  Menu,
  X,
  Layers,
  Code,
  Compass,
  Terminal,
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
    color: '#EF4444',
    accent: '#EF4444',
    tagline: 'Kuat dalam logika sistem, arsitektur backend, dan problem solving kompleks.',
    stats: [
      { label: 'Logika & Backend', value: 95 },
      { label: 'Ketahanan Debugging', value: 90 },
      { label: 'Kecepatan Algoritma', value: 82 },
      { label: 'Kreativitas Desain', value: 65 },
    ],
    perk: 'Clean Code Slash',
    perkDesc: '+25% bonus XP saat menyelesaikan modul pemrograman dan basis data.',
    suitable: 'Pelajar SMK RPL/SIJA yang menyukai backend, database SQL, dan API engineering.',
    tileBg: 'rgba(239, 68, 68, 0.08)',
  },
  {
    id: 'mage',
    name: 'Mage',
    title: 'The Design Alchemist',
    emoji: '🔮',
    color: '#38BDF8',
    accent: '#38BDF8',
    tagline: 'Penyihir estetika visual, tata letak UI/UX, dan interaksi pengguna kelas dunia.',
    stats: [
      { label: 'Estetika UI/UX', value: 98 },
      { label: 'Kreativitas Visual', value: 92 },
      { label: 'Logika & Backend', value: 70 },
      { label: 'Ketahanan Debugging', value: 78 },
    ],
    perk: 'Pixel Perfection',
    perkDesc: '+25% bonus XP untuk materi wireframing, design system, dan prototipe.',
    suitable: 'Pelajar SMK DKV/Multimedia & UI designer yang fokus pada user experience.',
    tileBg: 'rgba(56, 189, 248, 0.08)',
  },
  {
    id: 'archer',
    name: 'Archer',
    title: 'The Battle Speedrunner',
    emoji: '🏹',
    color: '#22C55E',
    accent: '#22C55E',
    tagline: 'Reaksi kilat, unggul dalam duel kuis battle 1v1 dan arena time-attack.',
    stats: [
      { label: 'Kecepatan Respon', value: 98 },
      { label: 'Akurasi Kuis', value: 90 },
      { label: 'Logika & Backend', value: 80 },
      { label: 'Kreativitas Desain', value: 75 },
    ],
    perk: 'Rapid Arrow Shot',
    perkDesc: 'Double multiplier bonus combo pada mode duel kuis 1v1 real-time.',
    suitable: 'Pelajar kompetitif yang menyukai adu kecepatan kuis dan time-attack.',
    tileBg: 'rgba(34, 197, 94, 0.08)',
  },
  {
    id: 'healer',
    name: 'Healer',
    title: 'The Productivity Sage',
    emoji: '✨',
    color: '#F5C542',
    accent: '#EAB308',
    tagline: 'Fokus, konsisten, penguasa manajemen waktu dan daily streak tanpa henti.',
    stats: [
      { label: 'Konsistensi Belajar', value: 99 },
      { label: 'Manajemen Waktu', value: 95 },
      { label: 'Logika & Backend', value: 78 },
      { label: 'Kecepatan Respon', value: 80 },
    ],
    perk: 'Continuous Flow',
    perkDesc: 'Perlindungan streak otomatis (+1 Streak Freeze gratis tiap minggu).',
    suitable: 'Pelajar yang mengutamakan rutinitas belajar teratur dan disiplin konsisten.',
    tileBg: 'rgba(245, 197, 66, 0.08)',
  },
]

const FEATURES_DATA = [
  {
    icon: BookOpen,
    title: 'Modul Interaktif Step-by-Step',
    desc: 'Kurikulum ringkas pemrograman, UI/UX, dan AI modern dengan materi teks padat, tutorial YouTube pilihan, dan kuis cek pemahaman.',
    tag: 'Kurikulum Terpadu',
    accent: 'var(--color-signal-orange)',
  },
  {
    icon: Zap,
    title: 'Duel Kuis Battle 1v1 Real-Time',
    desc: 'Tantang teman satu sekolah atau cari lawan acak se-Indonesia dalam arena kuis interaktif dengan socket real-time dan combo multiplier.',
    tag: 'Multiplayer Real-Time',
    accent: 'var(--accent-red)',
  },
  {
    icon: Trophy,
    title: 'Leaderboard Siswa & Sekolah',
    desc: 'Papan reputasi nasional berdasarkan total XP dan kemenangan battle. Bawa nama sekolahmu mendominasi puncak ranking!',
    tag: 'Kompetisi Nasional',
    accent: 'var(--color-signal-orange)',
  },
  {
    icon: Flame,
    title: 'Daily Streak & Quest Harian',
    desc: 'Misi harian yang diperbarui setiap 24 jam. Bangun konsistensi belajar setiap hari untuk mendapatkan bonus XP dan Gold koin ekstra.',
    tag: 'Gamifikasi Harian',
    accent: 'var(--accent-red)',
  },
  {
    icon: Gift,
    title: 'Toko Voucher & Reward Nyata',
    desc: 'Tukarkan Gold yang kamu kumpulkan dari modul dan battle dengan kupon diskon kursus, merchandise, atau voucher menarik.',
    tag: 'Reward Store',
    accent: 'var(--color-electric-yellow)',
  },
  {
    icon: Shield,
    title: 'Sertifikat & Profil Kompetensi',
    desc: 'Profil portofolio publik yang memamerkan badge pencapaian, level hero, dan rekam jejak penyelesaian modul yang valid.',
    tag: 'Portofolio Digital',
    accent: 'var(--accent-green)',
  },
]

const FAQS = [
  {
    q: 'Apakah Skillungo gratis untuk digunakan?',
    a: 'Ya, Skillungo 100% gratis untuk seluruh pelajar di Indonesia. Kamu bisa mempelajari modul, mengikuti duel kuis battle 1v1, mengklaim quest harian, dan naik ranking tanpa biaya.',
  },
  {
    q: 'Bagaimana cara kerja sistem duel battle 1v1?',
    a: 'Kamu bisa menantang lawan acak secara matchmaking atau membuat private room dan membagikan kode ruangan ke temanmu. Pertandingan berlangsung dalam 5 ronde kuis cepat dengan sistem waktu dan combo multiplier.',
  },
  {
    q: 'Apa fungsi pemilihan kelas karakter (Warrior, Mage, Archer, Healer)?',
    a: 'Setiap kelas memberikan bonus multiplier XP khusus pada kategori modul dan mode belajar tertentu. Kamu bisa menyesuaikan kelas dengan passion dan fokus belajarmu.',
  },
  {
    q: 'Materi apa saja yang tersedia di Skillungo?',
    a: 'Skillungo berfokus pada skill industri digital: Web Development (Frontend/Backend/JavaScript), UI/UX Design, Algoritma Pemrograman, dan Produktivitas Modern yang dirancang relevan dengan kebutuhan industri saat ini.',
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
    if (index === 0 || index === 2) {
      setComboCount((prev) => prev + 1)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-void)', minHeight: '100vh', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      {/* Fixed Header Navbar */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(12px, 3vw, 32px)',
          backgroundColor: 'var(--bg-navbar)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', flexShrink: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
              border: '1px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
              flexShrink: 0,
            }}
          >
            <Swords
              size={16}
              style={{
                color: '#ffffff',
                filter: 'drop-shadow(0 1px 1px rgba(180, 83, 9, 0.4))',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Skill<span
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
              }}
            >
              ungo
            </span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-only" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <a
            href="#hero"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Studio
          </a>
          <a
            href="#preview"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Arena Console
          </a>
          <a
            href="#kelas"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Roles & Classes
          </a>
          <a
            href="#fitur"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Features
          </a>
          <a
            href="#faq"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="btn-signal-orange"
              style={{
                padding: '7px 14px',
                fontSize: '12px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <LayoutDashboard size={14} /> Dashboard <ChevronRight size={13} />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-dark-outline"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="btn-signal-orange"
                style={{
                  padding: '7px 13px',
                  fontSize: '12px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>Daftar</span>
                <span className="desktop-only">
                  &nbsp;Gratis
                </span>
                <ChevronRight size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '2px' }} />
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-only-btn"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'none',
              flexShrink: 0,
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--surface-canvas)',
            borderBottom: '1px solid var(--surface-border)',
            padding: '20px 24px',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            Studio
          </a>
          <a
            href="#preview"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            Arena Console
          </a>
          <a
            href="#kelas"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            Roles & Classes
          </a>
          <a
            href="#fitur"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            Features
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            FAQ
          </a>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <Link
              href="/login"
              className="btn-dark-outline"
              style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="btn-signal-orange"
              style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
            >
              Daftar
            </Link>
          </div>
        </div>
      )}

      {/* ── 1. Centered Black Hero (Exact Linearity Spec) ── */}
      <section
        id="hero"
        style={{
          position: 'relative',
          paddingTop: '140px',
          paddingBottom: '60px',
          paddingLeft: '24px',
          paddingRight: '24px',
          textAlign: 'center',
          overflow: 'hidden',
          backgroundColor: 'var(--color-void)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1040px', margin: '0 auto' }}>
          {/* Main Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(32px, 5.2vw, 56px)',
              fontWeight: 500,
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Level Up Skill Digitalmu.
            <br />
            <span style={{ position: 'relative', display: 'inline-block' }}>
              Taklukkan Masa Depan.
              {/* Spectrum Rail underline beneath emphasized line */}
              <span
                className="spectrum-rail-line"
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '10%',
                  right: '10%',
                  height: '2px',
                }}
              />
            </span>
          </motion.h1>

          {/* Supporting Subtitle (Fog #999999, Inter 14-15px) */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: '15px',
              color: 'var(--color-fog)',
              maxWidth: '640px',
              margin: '0 auto 32px',
              lineHeight: 1.65,
              fontWeight: 400,
            }}
          >
            Platform studio gamifikasi untuk pelajar SMK dan SMA Indonesia. Asah skill coding, UI/UX, dan AI modern, bertarung dalam duel kuis real-time, dan bangun reputasi sekolahmu di leaderboard nasional.
          </motion.p>

          {/* Conversion Button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn-signal-orange"
                style={{ padding: '12px 28px', fontSize: '13px' }}
              >
                <LayoutDashboard size={16} /> BUKA DASHBOARD STUDIO <ChevronRight size={14} />
              </Link>
            ) : (
              <Link
                href="/register"
                className="btn-signal-orange"
                style={{ padding: '12px 28px', fontSize: '13px' }}
              >
                <Swords size={16} /> MULAI PETUALANGAN GRATIS <ChevronRight size={14} />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── 2. Interactive 1v1 Battle Arena ── */}
      <section
        id="preview"
        style={{
          padding: '40px 24px 80px',
          maxWidth: '1120px',
          margin: '0 auto',
          backgroundColor: 'var(--color-void)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '32px',
              fontWeight: 400,
              marginBottom: '10px',
              letterSpacing: '-0.015em',
            }}
          >
            Console Arena: Duel Kuis 1v1 Real-Time
          </h2>
          <p style={{ color: 'var(--color-fog)', fontSize: '14px', maxWidth: '560px', margin: '0 auto' }}>
            Uji kecepatan logika dan ketepatan analisismu melawan siswa lain. Klik opsi jawaban di bawah untuk melancarkan serangan combo!
          </p>
        </div>

        {/* Linearity Frosted Product Demonstration Panel (25.7143px radius) */}
        <div className="product-demo-panel">
          {/* Panel Chrome Topbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              marginBottom: '20px',
              borderBottom: '1px solid var(--surface-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Algoritma & JavaScript
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--color-signal-orange)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Flame size={14} /> {comboCount > 1 ? `x${comboCount} COMBO!` : 'Active Round'}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--accent-red)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 51, 68, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 51, 68, 0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                00:08s
              </span>
            </div>
          </div>

          {/* Versus Contestant Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--surface-elevated)',
              border: '1px solid var(--surface-border)',
              marginBottom: '20px',
              minWidth: 0,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Player 1 (You) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 197, 66, 0.12)',
                  border: '1px solid rgba(245, 197, 66, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                }}
              >
                ⚔️
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Kamu (Hero)
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-signal-orange)',
                      color: '#0a0a0a',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    LV.12
                  </span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--color-steel)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  SMK Telkom Malang
                </div>
                {/* Health Bar */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '100px',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    marginTop: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--color-vector-green)' }} />
                </div>
              </div>
            </div>

            {/* VS Badge */}
            <div
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--color-signal-orange)',
                backgroundColor: 'rgba(245, 197, 66, 0.1)',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(245, 197, 66, 0.3)',
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}
            >
              VS
            </div>

            {/* Player 2 (Opponent) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', minWidth: 0, flex: 1, textAlign: 'right' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 212, 255, 0.2)',
                      color: '#00d4ff',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    LV.14
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Dina Alchemist
                  </span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--color-steel)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  SMAN 1 Yogyakarta
                </div>
                {/* Health Bar */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '100px',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    marginTop: '4px',
                    marginLeft: 'auto',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: quizAnswered === 0 || quizAnswered === 2 ? '52%' : '84%',
                      height: '100%',
                      backgroundColor: 'var(--accent-red)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                }}
              >
                🔮
              </div>
            </div>
          </div>

          {/* Interactive Question Card */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--color-carbon)',
              borderRadius: '12px',
              border: '1px solid var(--surface-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', color: 'var(--color-signal-orange)', fontWeight: 600, letterSpacing: '1px' }}>
                ROUND 3 OF 5
              </span>
              <span style={{ color: 'var(--color-steel)' }}>•</span>
              <span style={{ fontSize: '11px', color: 'var(--color-steel)' }}>Pilih opsi yang benar untuk menyerang lawan:</span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '16px',
                fontWeight: 500,
                marginBottom: '18px',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}
            >
              Manakah ekspresi JavaScript yang mengembalikan nilai boolean <code style={{ color: 'var(--color-gold)', backgroundColor: 'rgba(245, 197, 66, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>true</code>?
            </h3>

            {/* Answer Options Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              {[
                { id: 0, text: "typeof NaN === 'number'", correct: true },
                { id: 1, text: "Boolean('') === true", correct: false },
                { id: 2, text: "Array.isArray([]) === true", correct: true },
                { id: 3, text: "'5' === 5", correct: false },
              ].map((opt) => {
                const isSelected = quizAnswered === opt.id
                let bg = 'var(--surface-elevated)'
                let border = 'var(--surface-border)'
                let textColor = 'var(--text-primary)'

                if (isSelected) {
                  if (opt.correct) {
                    bg = 'rgba(8, 195, 128, 0.15)'
                    border = 'var(--color-vector-green)'
                    textColor = 'var(--color-vector-green)'
                  } else {
                    bg = 'rgba(255, 51, 68, 0.15)'
                    border = 'var(--accent-red)'
                    textColor = 'var(--accent-red)'
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleQuizAnswer(opt.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: `1px solid ${border}`,
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: '13px',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>
                      <strong style={{ color: 'var(--color-steel)', marginRight: '8px' }}>{String.fromCharCode(65 + opt.id)}</strong>
                      <code>{opt.text}</code>
                    </span>
                    {isSelected && (opt.correct ? <CheckCircle size={15} /> : <X size={15} />)}
                  </button>
                )
              })}
            </div>

            {/* Result Feedback message */}
            {quizAnswered !== null && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: quizAnswered === 0 || quizAnswered === 2 ? 'rgba(8, 195, 128, 0.12)' : 'rgba(255, 51, 68, 0.12)',
                  border: `1px solid ${quizAnswered === 0 || quizAnswered === 2 ? 'var(--color-vector-green)' : 'var(--accent-red)'}`,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  {quizAnswered === 0 || quizAnswered === 2
                    ? '⚔️ Serangan Combo Berhasil! Health lawan berkurang drastis.'
                    : '🛡️ Salah sasaran! Lawan berhasil menangkis seranganmu.'}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--color-signal-orange)' }}>
                  +120 XP
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. Asymmetric Workflow & Roles Section (Exact Linearity Spec) ── */}
      <section
        id="kelas"
        style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--surface-border)',
          borderBottom: '1px solid var(--surface-border)',
          backgroundColor: 'var(--color-void)',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          {/* Asymmetric 3-part layout: Copy on left, Role chips in center, Frosted Panel on right */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '36px',
              alignItems: 'start',
            }}
          >
            {/* Left: Headline & Editorial Context */}
            <div>
              <span className="micro-eyebrow" style={{ display: 'block', marginBottom: '10px' }}>
                RPG WORKFLOW & CLASS ARCHITECTURE
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '38px',
                  fontWeight: 400,
                  lineHeight: 1.15,
                  marginBottom: '16px',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                Pilih Role.
                <br />
                Kuasai Domain Belajarmu.
              </h2>
              <p
                style={{
                  color: 'var(--color-fog)',
                  fontSize: '14px',
                  lineHeight: 1.65,
                  marginBottom: '24px',
                }}
              >
                Setiap karakter memiliki spesialisasi statistik, peran unik di battle arena, dan pengali XP untuk memandu akselerasi skill digitalmu di SMK/SMA.
              </p>

              {/* Four Outlined Role Chips (Linearity Spec) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {CLASSES_DATA.map((cls) => {
                  const isSelected = selectedClass.id === cls.id
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(cls)}
                      className={`role-selector-chip ${isSelected ? 'active' : ''}`}
                      style={{
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        border: isSelected
                          ? '1px solid var(--color-signal-orange)'
                          : '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: isSelected
                          ? '0 0 16px rgba(245, 197, 66, 0.25)'
                          : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>{cls.emoji}</span>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {cls.name}
                          </span>
                          <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-steel)' }}>
                            {cls.title}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: isSelected ? 'var(--color-signal-orange)' : 'var(--color-steel)',
                          }}
                        >
                          {isSelected ? 'Aktif' : 'Pilih'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right: Linearity Frosted Product Demonstration Panel */}
            <div className="product-demo-panel">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedClass.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Campaign Asset Tile inside panel (Linearity Spec) */}
                  <div
                    className="campaign-asset-tile"
                    style={{
                      padding: '20px',
                      marginBottom: '20px',
                      backgroundColor: selectedClass.tileBg,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8.57143px',
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '26px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                        }}
                      >
                        {selectedClass.emoji}
                      </div>
                      <div>
                        <h3
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '20px',
                            fontWeight: 400,
                            margin: 0,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {selectedClass.name} — {selectedClass.title}
                        </h3>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-silver)' }}>
                          {selectedClass.tagline}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8.57143px',
                        backgroundColor: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid var(--surface-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>Role Perk:</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-signal-orange)' }}>
                          {selectedClass.perk}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-primary)',
                          backgroundColor: 'rgba(245, 197, 66, 0.2)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(245, 197, 66, 0.35)',
                        }}
                      >
                        +25% XP Bonus
                      </span>
                    </div>
                  </div>

                  {/* Stat Progress Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {selectedClass.stats.map((st) => (
                      <div key={st.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--color-silver)' }}>{st.label}</span>
                          <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{st.value}%</span>
                        </div>
                        <div
                          style={{
                            height: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${st.value}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            style={{
                              height: '100%',
                              backgroundColor: 'var(--color-signal-orange)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '12px',
                      color: 'var(--color-fog)',
                    }}
                  >
                    <strong style={{ color: 'var(--text-primary)' }}>Target Profil: </strong>
                    {selectedClass.suitable}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Centered Editorial Statement with Spectrum Rail Underline (Linearity Spec) ── */}
      <section
        style={{
          padding: '90px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--color-void)',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <span className="micro-eyebrow" style={{ display: 'block', marginBottom: '14px' }}>
            EDUCATIONAL EXCELLENCE
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4.5vw, 45px)',
              fontWeight: 400,
              lineHeight: 1.25,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '24px',
            }}
          >
            Satu ekosistem belajar gamifikasi untuk mencetak talenta digital Indonesia{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              yang siap industri.
              <span
                className="spectrum-rail-line"
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  left: 0,
                  right: 0,
                  height: '2px',
                }}
              />
            </span>
          </h2>
          <p style={{ color: 'var(--color-fog)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
            Dari fondasi logika pemrograman hingga arsitektur UI modern, setiap materi dirancang ringkas, aplikatif, dan memicu motivasi belajar intrinsik melalui mekanika game.
          </p>
        </div>
      </section>

      {/* ── 5. Features Grid (12px Cards, Hairline Outlines) ── */}
      <section
        id="fitur"
        style={{
          padding: '80px 24px',
          maxWidth: '1120px',
          margin: '0 auto',
          backgroundColor: 'var(--color-void)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="micro-eyebrow" style={{ display: 'block', marginBottom: '8px' }}>
            STUDIO CAPABILITIES
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '32px',
              fontWeight: 400,
              marginBottom: '8px',
              letterSpacing: '-0.015em',
            }}
          >
            Fitur Utama Ekosistem Skillungo
          </h2>
          <p style={{ color: 'var(--color-fog)', fontSize: '14px' }}>
            Dirancang khusus untuk mendukung ritme belajar mandiri dan kompetisi sekolah.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {FEATURES_DATA.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="card hover-lift"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--surface-card)',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--surface-elevated)',
                        border: '1px solid var(--surface-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: feat.accent,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--color-steel)',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {feat.tag}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '18px',
                      fontWeight: 400,
                      marginBottom: '8px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-fog)', lineHeight: 1.6 }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 6. FAQ Section ── */}
      <section
        id="faq"
        style={{
          padding: '80px 24px',
          maxWidth: '820px',
          margin: '0 auto',
          backgroundColor: 'var(--color-void)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="micro-eyebrow" style={{ display: 'block', marginBottom: '8px' }}>
            HELP & DOCUMENTATION
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '32px',
              fontWeight: 400,
              marginBottom: '8px',
              letterSpacing: '-0.015em',
            }}
          >
            Pertanyaan yang Sering Diajukan
          </h2>
          <p style={{ color: 'var(--color-fog)', fontSize: '14px' }}>
            Informasi lengkap seputar mekanisme belajar dan duel di Skillungo.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQS.map((faq, i) => {
            const isOpen = activeFaq === i
            return (
              <div
                key={i}
                className="card"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-inter)',
                    fontSize: '14px',
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    style={{
                      color: isOpen ? 'var(--color-signal-orange)' : 'var(--color-steel)',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                    }}
                  />
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 20px 18px',
                      fontSize: '13px',
                      color: 'var(--color-fog)',
                      lineHeight: 1.65,
                      borderTop: '1px solid var(--surface-border)',
                      paddingTop: '12px',
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

      {/* ── 7. Final Call to Action on Void ── */}
      <section
        style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--surface-border)',
          backgroundColor: 'var(--color-void)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 197, 66, 0.12)',
              border: '1px solid rgba(245, 197, 66, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Swords size={22} style={{ color: 'var(--color-signal-orange)' }} />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 400,
              marginBottom: '12px',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            {isLoggedIn ? 'Karaktermu Siap Masuk Arena.' : 'Mulai Petualangan Skill Digitalmu.'}
          </h2>
          <p
            style={{
              color: 'var(--color-fog)',
              fontSize: '14px',
              maxWidth: '500px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            {isLoggedIn
              ? 'Lanjutkan modul belajar, selesaikan quest harian, dan pertahankan posisi terbaik di Leaderboard.'
              : 'Daftar gratis dalam hitungan detik. Kumpulkan XP, kuasai modul coding & desain, dan raih prestasi untuk sekolahmu.'}
          </p>

          <Link
            href={isLoggedIn ? '/dashboard' : '/register'}
            className="btn-signal-orange"
            style={{
              padding: '14px 34px',
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            {isLoggedIn ? (
              <>
                <LayoutDashboard size={18} /> BUKA DASHBOARD STUDIO
              </>
            ) : (
              <>
                <Swords size={18} /> DAFTAR GRATIS SEKARANG <ChevronRight size={16} />
              </>
            )}
          </Link>
        </div>
      </section>

      {/* ── 8. Footer (Floating text on Void per Linearity spec) ── */}
      <footer
        style={{
          padding: '36px 32px',
          borderTop: '1px solid var(--surface-border)',
          backgroundColor: 'var(--color-void)',
        }}
      >
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                border: '1px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
                flexShrink: 0,
              }}
            >
              <Swords
                size={14}
                style={{
                  color: '#ffffff',
                  filter: 'drop-shadow(0 1px 1px rgba(180, 83, 9, 0.4))',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Skill<span
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
                ungo
              </span>
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: '12px',
            }}
          >
            <Link href="/modules" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
              Modul Belajar
            </Link>
            <Link href="/battle" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
              Battle Arena 1v1
            </Link>
            <Link href="/leaderboard" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
              Leaderboard Sekolah
            </Link>
            <Link href="/shop" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
              Toko Petualang
            </Link>
            <Link href="/login" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
              Masuk Akun
            </Link>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--color-steel)' }}>
            © 2026 Skillungo. &quot;Level Up Your Skills, Conquer Your Future&quot; · Glowing Studio Console Edition.
          </p>
        </div>
      </footer>
    </div>
  )
}
