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
  ArrowRight,
  Gamepad2,
  Clock,
  Award,
  ChevronDown,
  Menu,
  X,
  Send,
  Terminal,
  Play,
  Layers,
  Code,
  Compass,
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
    color: '#ff3344',
    accent: '#ff4800',
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
    tileBg: '#ca4e17', // Burnt Orange
  },
  {
    id: 'mage',
    name: 'Mage',
    title: 'The Design Alchemist',
    emoji: '🔮',
    color: '#00d4ff',
    accent: '#ff4800',
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
    tileBg: '#1e1e24',
  },
  {
    id: 'archer',
    name: 'Archer',
    title: 'The Battle Speedrunner',
    emoji: '🏹',
    color: '#08c380',
    accent: '#ff4800',
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
    tileBg: '#11221a',
  },
  {
    id: 'healer',
    name: 'Healer',
    title: 'The Productivity Sage',
    emoji: '✨',
    color: '#ff4800',
    accent: '#ffd900',
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
    tileBg: '#2a1a0f',
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
    desc: 'Tantang teman satu sekolah atau cari lawan acak se-Indonesia dalam arena kuis live dengan socket real-time dan combo multiplier.',
    tag: 'Live Multiplayer',
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

const PROMPT_SUGGESTIONS = [
  'Belajar JavaScript Async/Await',
  'Mulai Duel 1v1 Algoritma',
  'Eksplor UI/UX Wireframing',
  'Jalankan Quest Harian',
]

export default function LandingClient({ isLoggedIn }: LandingClientProps) {
  const [selectedClass, setSelectedClass] = useState(CLASSES_DATA[0])
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Interactive Prompt Composer state
  const [promptInput, setPromptInput] = useState('')
  const [promptSubmitted, setPromptSubmitted] = useState(false)

  // Interactive Battle Quiz Preview state
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null)
  const [comboCount, setComboCount] = useState(1)

  const handleQuizAnswer = (index: number) => {
    setQuizAnswered(index)
    if (index === 0 || index === 2) {
      setComboCount((prev) => prev + 1)
    }
  }

  const handlePromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!promptInput.trim()) return
    setPromptSubmitted(true)
    setTimeout(() => setPromptSubmitted(false), 3000)
  }

  return (
    <div style={{ backgroundColor: 'var(--color-void)', minHeight: '100vh', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      {/* ── Fixed Header Navbar (Floating on Void per Linearity spec) ── */}
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
          padding: '0 32px',
          backgroundColor: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 72, 0, 0.12)',
              border: '1px solid rgba(255, 72, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(255, 72, 0, 0.3)',
            }}
          >
            <Swords size={16} style={{ color: 'var(--color-signal-orange)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '18px',
                fontWeight: 500,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              Skillungo
            </span>
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'var(--font-inter)',
                fontWeight: 600,
                color: 'var(--color-signal-orange)',
                backgroundColor: 'rgba(255, 72, 0, 0.12)',
                padding: '1px 6px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 72, 0, 0.3)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Studio
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Linearity floating text on Void) */}
        <nav className="desktop-only" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <a
            href="#hero"
            style={{ color: 'var(--color-silver)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-silver)')}
          >
            Studio
          </a>
          <a
            href="#preview"
            style={{ color: 'var(--color-silver)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-silver)')}
          >
            Arena Console
          </a>
          <a
            href="#kelas"
            style={{ color: 'var(--color-silver)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-silver)')}
          >
            Roles & Classes
          </a>
          <a
            href="#fitur"
            style={{ color: 'var(--color-silver)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-silver)')}
          >
            Features
          </a>
          <a
            href="#faq"
            style={{ color: 'var(--color-silver)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-silver)')}
          >
            FAQ
          </a>
        </nav>

        {/* Action Buttons (Pill conversion control per Linearity spec) */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="btn-signal-orange"
              style={{
                padding: '8px 18px',
                fontSize: '12px',
                textDecoration: 'none',
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
                  padding: '7px 16px',
                  fontSize: '12px',
                  textDecoration: 'none',
                }}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="btn-signal-orange"
                style={{
                  padding: '8px 18px',
                  fontSize: '12px',
                  textDecoration: 'none',
                }}
              >
                Mulai Gratis <ChevronRight size={13} />
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-only-btn"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '9999px',
              padding: '6px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'none',
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
            backgroundColor: '#050505',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
            style={{ color: 'var(--color-silver)', textDecoration: 'none', fontSize: '14px' }}
          >
            Studio
          </a>
          <a
            href="#preview"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--color-silver)', textDecoration: 'none', fontSize: '14px' }}
          >
            Arena Console
          </a>
          <a
            href="#kelas"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--color-silver)', textDecoration: 'none', fontSize: '14px' }}
          >
            Roles & Classes
          </a>
          <a
            href="#fitur"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--color-silver)', textDecoration: 'none', fontSize: '14px' }}
          >
            Features
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--color-silver)', textDecoration: 'none', fontSize: '14px' }}
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
          {/* Micro Eyebrow Label (10px uppercase, Steel #808080) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: '18px' }}
          >
            <span
              className="micro-eyebrow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--color-steel)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-signal-orange)',
                  boxShadow: '0 0 8px var(--color-signal-orange)',
                }}
              />
              GAMIFIED LEARNING STUDIO · RPG CONSOLE V2.0
            </span>
          </motion.div>

          {/* Main Display Headline (AcidGrotesk / Space Grotesk at weight 400 with -0.01em tracking) */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(32px, 5.2vw, 56px)',
              fontWeight: 400,
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-0.02em',
              color: '#ffffff',
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
              margin: '0 auto 36px',
              lineHeight: 1.65,
              fontWeight: 400,
            }}
          >
            Platform studio gamifikasi untuk pelajar SMK dan SMA Indonesia. Asah skill coding, UI/UX, dan AI modern, bertarung dalam duel kuis real-time, dan bangun reputasi sekolahmu di leaderboard nasional.
          </motion.p>

          {/* ── Linearity Hero Prompt Composer ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{ maxWidth: '640px', margin: '0 auto 36px' }}
          >
            <form onSubmit={handlePromptSubmit} className="hero-prompt-composer">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(202, 78, 23, 0.25)', // Burnt orange brand token
                    border: '1px solid rgba(202, 78, 23, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Terminal size={12} style={{ color: 'var(--color-signal-orange)' }} />
                </div>
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Ketik topik belajarmu: JavaScript, CSS Grid, Figma, atau Duel 1v1..."
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    outline: 'none',
                    fontSize: '13px',
                    color: '#ffffff',
                    width: '100%',
                    fontFamily: 'var(--font-inter)',
                  }}
                />
              </div>

              {/* Prompt Submit Orb (Circular Signal Orange) */}
              <button
                type="submit"
                className="prompt-submit-orb"
                title="Eksplor Modul & Mulai Kuis"
                aria-label="Submit Prompt"
              >
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick Prompt Preset Chips */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginTop: '12px',
              }}
            >
              {PROMPT_SUGGESTIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPromptInput(preset)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '9999px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    color: 'var(--color-steel)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-steel)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>

            {promptSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '10px',
                  fontSize: '12px',
                  color: 'var(--color-signal-orange)',
                }}
              >
                ✨ Modul siap! Masuk atau daftar akun untuk menyimpan progres belajarmu.
              </motion.div>
            )}
          </motion.div>

          {/* Paired Conversion Row (Linearity Spec) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              display: 'flex',
              gap: '14px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '48px',
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
              <>
                <Link
                  href="/register"
                  className="btn-signal-orange"
                  style={{ padding: '12px 28px', fontSize: '13px' }}
                >
                  <Swords size={16} /> MULAI PETUALANGAN GRATIS <ChevronRight size={14} />
                </Link>
                <a
                  href="#preview"
                  className="btn-dark-outline"
                  style={{ padding: '12px 24px', fontSize: '13px' }}
                >
                  <Gamepad2 size={16} style={{ color: 'var(--color-signal-orange)' }} />
                  Buka Console Arena 1v1
                </a>
              </>
            )}
          </motion.div>
        </div>

        {/* ── Linearity Low-Contrast Trust Marquee on Void ── */}
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            paddingTop: '28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-signal-orange)',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '11px',
                color: 'var(--color-steel)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              DIPERCAYA SISWA & KOMUNITAS PENDIDIKAN
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '12px',
              color: 'var(--color-silver)',
              fontWeight: 500,
            }}
          >
            <span>SMK BISA HEBAT</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>/</span>
            <span>RPL & SIJA INDONESIA</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>/</span>
            <span>MULTIMEDIA & DKV</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>/</span>
            <span style={{ color: 'var(--color-signal-orange)' }}>50+ SEKOLAH TERDAFTAR</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              padding: '4px 12px',
              fontSize: '11px',
              color: 'var(--color-silver)',
            }}
          >
            <Play size={10} style={{ color: 'var(--color-signal-orange)' }} /> Interactive Demo
          </div>
        </div>
      </section>

      {/* ── 2. Product Demonstration Panel: Interactive 1v1 Battle Arena ── */}
      <section
        id="preview"
        style={{
          padding: '60px 24px 80px',
          maxWidth: '1120px',
          margin: '0 auto',
          backgroundColor: 'var(--color-void)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="micro-eyebrow" style={{ display: 'block', marginBottom: '8px' }}>
            PRODUCT DEMONSTRATION PANEL
          </span>
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
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-vector-green)',
                  boxShadow: '0 0 8px var(--color-vector-green)',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#ffffff',
                  letterSpacing: '0.04em',
                }}
              >
                LIVE ARENA · ALGORITMA & JAVASCRIPT
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--color-signal-orange)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
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
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 51, 68, 0.3)',
                }}
              >
                00:08s
              </span>
            </div>
          </div>

          {/* Versus Contestant Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: '16px',
              alignItems: 'center',
              padding: '16px 20px',
              borderRadius: '17.1429px',
              backgroundColor: 'rgba(5, 5, 5, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '20px',
            }}
          >
            {/* Player 1 (You) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8.57143px',
                  backgroundColor: 'rgba(255, 72, 0, 0.12)',
                  border: '1px solid rgba(255, 72, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                ⚔️
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>Kamu (Hero)</span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--color-signal-orange)',
                      color: '#ffffff',
                      fontWeight: 600,
                    }}
                  >
                    LV.12
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>SMK Telkom Malang · Warrior</div>
                {/* Health Bar */}
                <div
                  style={{
                    width: '120px',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '9999px',
                    marginTop: '5px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--color-vector-green)' }} />
                </div>
              </div>
            </div>

            {/* VS Pill */}
            <div
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-signal-orange)',
                backgroundColor: 'rgba(255, 72, 0, 0.1)',
                padding: '4px 12px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 72, 0, 0.3)',
                letterSpacing: '0.05em',
              }}
            >
              VS
            </div>

            {/* Player 2 (Opponent) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', textAlign: 'right' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(0, 212, 255, 0.2)',
                      color: '#00d4ff',
                      fontWeight: 600,
                    }}
                  >
                    LV.14
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>Dina Alchemist</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>SMAN 1 Yogyakarta · Mage</div>
                {/* Health Bar */}
                <div
                  style={{
                    width: '120px',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '9999px',
                    marginTop: '5px',
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
                  width: '44px',
                  height: '44px',
                  borderRadius: '8.57143px',
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
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
              borderRadius: '17.1429px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
                color: '#ffffff',
                lineHeight: 1.5,
              }}
            >
              Manakah ekspresi JavaScript yang mengembalikan nilai boolean <code style={{ color: 'var(--color-signal-orange)', backgroundColor: 'rgba(255, 72, 0, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>true</code>?
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
                let bg = 'rgba(255, 255, 255, 0.04)'
                let border = 'rgba(255, 255, 255, 0.1)'
                let textColor = '#ffffff'

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
                  borderRadius: '9999px',
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
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                  color: '#ffffff',
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
                          ? '0 0 16px rgba(255, 72, 0, 0.25)'
                          : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>{cls.emoji}</span>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                            {cls.name}
                          </span>
                          <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-steel)' }}>
                            {cls.title}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '9999px',
                            backgroundColor: isSelected ? 'var(--color-signal-orange)' : 'var(--color-graphite)',
                            boxShadow: isSelected ? '0 0 8px var(--color-signal-orange)' : 'none',
                          }}
                        />
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
                            color: '#ffffff',
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
                        border: '1px solid rgba(255, 255, 255, 0.1)',
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
                          color: '#ffffff',
                          backgroundColor: 'rgba(255, 72, 0, 0.2)',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          border: '1px solid rgba(255, 72, 0, 0.35)',
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
                          <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{st.value}%</span>
                        </div>
                        <div
                          style={{
                            height: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '9999px',
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
                              boxShadow: '0 0 8px rgba(255, 72, 0, 0.4)',
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
                    <strong style={{ color: '#ffffff' }}>Target Profil: </strong>
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
              color: '#ffffff',
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

      {/* ── 5. Features Grid (17.1429px Cards, Hairline Outlines) ── */}
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
                  backgroundColor: 'rgba(8, 8, 8, 0.95)',
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
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
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
                      color: '#ffffff',
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
                  backgroundColor: 'rgba(8, 8, 8, 0.95)',
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
                    color: '#ffffff',
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
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
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
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'var(--color-void)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 72, 0, 0.12)',
              border: '1px solid rgba(255, 72, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: 'var(--shadow-signal-orange)',
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
              color: '#ffffff',
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
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
            <Swords size={16} style={{ color: 'var(--color-signal-orange)' }} />
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '16px',
                fontWeight: 500,
                color: '#ffffff',
              }}
            >
              Skill<span style={{ color: 'var(--color-signal-orange)' }}>ungo</span>
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
            <Link href="/voucher" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
              Toko Voucher
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
