'use client'

import React, { useState } from 'react'
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
  ChevronLeft,
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
  Code,
  Compass,
  Terminal,
  Check,
  Laptop,
  GraduationCap,
  ExternalLink,
  Smartphone,
  Coins,
  Ticket,
} from 'lucide-react'
import CharacterVisual from '@/components/character/CharacterVisual'
import { AvatarClass } from '@/types'

interface LandingClientProps {
  isLoggedIn: boolean
}

const CLASSES_DATA: {
  id: AvatarClass
  name: string
  title: string
  emoji: string
  color: string
  accent: string
  tagline: string
  stats: { label: string; value: number }[]
  perk: string
  perkDesc: string
  suitable: string
  tileBg: string
}[] = [
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

const TECH_TRACK = [
  { name: 'HTML & CSS', icon: '🌐', slug: 'html-css-dasar' },
  { name: 'JavaScript', icon: '⚡', slug: 'javascript-pemula' },
  { name: 'TypeScript', icon: '🔷', slug: 'typescript-dasar' },
  { name: 'React', icon: '⚛️', slug: 'react-dasar-komponen' },
  { name: 'Next.js', icon: '▲', slug: 'nextjs-app-router' },
  { name: 'Tailwind CSS', icon: '🎨', slug: 'tailwind-css' },
  { name: 'Python Dasar', icon: '🐍', slug: 'python-dasar' },
  { name: 'UI/UX Design', icon: '📐', slug: 'ui-ux-design-system' },
  { name: 'SQL & Database', icon: '🗄️', slug: 'sql-database' },
  { name: 'Git & GitHub', icon: '🐙', slug: 'git-github-kolaborasi' },
]

const FAQS = [
  {
    q: 'Apakah Skillungo gratis untuk digunakan?',
    a: 'Ya, Skillungo 100% gratis untuk seluruh pelajar di Indonesia. Kamu bisa mempelajari modul, mengikuti duel kuis battle 1v1, mengklaim quest harian, dan naik ranking tanpa biaya apa pun.',
  },
  {
    q: 'Bagaimana cara kerja sistem duel battle 1v1?',
    a: 'Kamu bisa menantang lawan acak melalui matchmaking atau membuat private room dan membagikan kode ruangan ke temanmu. Pertandingan berlangsung dalam 5 ronde kuis cepat dengan sistem waktu dan combo multiplier.',
  },
  {
    q: 'Apa fungsi pemilihan role karakter (Warrior, Mage, Archer, Healer)?',
    a: 'Setiap role memberikan bonus multiplier XP khusus pada kategori modul dan mode belajar tertentu. Kamu bisa menyesuaikan peran karakter dengan minat dan spesialisasi belajarmu.',
  },
  {
    q: 'Materi apa saja yang tersedia di Skillungo?',
    a: 'Skillungo berfokus pada kompetensi industri digital: Web Development (Frontend & Backend), UI/UX Design System, Algoritma Pemrograman, dan Tool Produktivitas Modern yang relevan dengan standar industri.',
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
    <div
      style={{
        backgroundColor: 'var(--color-void)',
        minHeight: '100vh',
        color: 'var(--text-primary)',
        overflowX: 'hidden',
      }}
    >
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
          padding: '0 clamp(16px, 4vw, 40px)',
          backgroundColor: 'var(--bg-navbar)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
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
              size={18}
              style={{
                color: '#ffffff',
                filter: 'drop-shadow(0 1px 1px rgba(180, 83, 9, 0.4))',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '19px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Skill
            <span
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
        <nav
          className="desktop-only"
          style={{
            display: 'flex',
            gap: '28px',
            alignItems: 'center',
          }}
        >
          <a
            href="#hero"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Beranda
          </a>
          <a
            href="#metode"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Metode Belajar
          </a>
          <a
            href="#keunggulan"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Keunggulan
          </a>
          <a
            href="#battle"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Arena Battle
          </a>
          <a
            href="#leaderboard"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Leaderboard
          </a>
          <a
            href="#faq"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="btn-signal-orange"
              style={{
                padding: '8px 16px',
                fontSize: '12.5px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <LayoutDashboard size={14} /> Buka Dashboard <ChevronRight size={13} />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-dark-outline"
                style={{
                  padding: '7px 14px',
                  fontSize: '12.5px',
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
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <Sparkles size={14} />
                <span>Daftar Gratis</span>
                <ChevronRight size={13} />
              </Link>
            </>
          )}

          {/* Mobile hamburger button */}
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
            aria-label="Toggle menu"
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
            top: '64px',
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
            Beranda
          </a>
          <a
            href="#metode"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            Metode Belajar
          </a>
          <a
            href="#keunggulan"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            Keunggulan
          </a>
          <a
            href="#battle"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            Arena Battle
          </a>
          <a
            href="#leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            Leaderboard
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            FAQ
          </a>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn-signal-orange"
                style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
              >
                <LayoutDashboard size={14} /> Buka Dashboard
              </Link>
            ) : (
              <>
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
                  <Sparkles size={14} /> Daftar Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 1. Hero Section (Duolingo 2-Column Showcase Layout) ── */}
      <section
        id="hero"
        style={{
          position: 'relative',
          paddingTop: '120px',
          paddingBottom: '60px',
          paddingLeft: 'clamp(20px, 4vw, 48px)',
          paddingRight: 'clamp(20px, 4vw, 48px)',
          backgroundColor: 'var(--color-void)',
          borderBottom: '1px solid var(--surface-border)',
          overflow: 'hidden',
        }}
      >
        {/* Subtle cosmic background dust (zero glowing dots) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(245, 197, 66, 0.04) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(56, 189, 248, 0.03) 0%, transparent 60%)',
          }}
        />

        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: 'clamp(36px, 5vw, 64px)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left Column: Big Interactive Focal Visual (Duolingo Globe equivalent -> Hero RPG Arena Stage) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Stage Backdrop Plate */}
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                aspectRatio: '1 / 1',
                borderRadius: '16px',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: 'var(--shadow-card)',
                padding: '24px',
                boxSizing: 'border-box',
              }}
            >
              {/* Floating Badge 1 (Top Left): Daily Streak */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-red)',
                  }}
                >
                  <Flame size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    7 Hari Streak
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>
                    Bonus XP aktif
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge 2 (Top Right): Level Milestone */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(245, 197, 66, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-signal-orange)',
                  }}
                >
                  <Trophy size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Level 12
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>
                    Champion Rank
                  </div>
                </div>
              </motion.div>

              {/* Central Character Visual */}
              <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                <CharacterVisual
                  role={selectedClass.id}
                  size={200}
                  animationState="idle"
                  showAura={true}
                  showRoleBadge={false}
                />
              </div>

              {/* Role Switcher Controls */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  width: '100%',
                  marginTop: 'auto',
                }}
              >
                {CLASSES_DATA.map((cls) => {
                  const isCurrent = selectedClass.id === cls.id
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(cls)}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        borderRadius: '8px',
                        border: isCurrent
                          ? '1px solid var(--color-signal-orange)'
                          : '1px solid var(--surface-border)',
                        backgroundColor: isCurrent
                          ? 'rgba(245, 197, 66, 0.12)'
                          : 'var(--surface-elevated)',
                        color: isCurrent ? 'var(--text-primary)' : 'var(--color-steel)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '13px' }}>{cls.emoji}</span>
                      <span>{cls.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Punchy Headline & Dual Conversion Buttons */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(32px, 4.4vw, 52px)',
                fontWeight: 600,
                lineHeight: 1.18,
                marginBottom: '18px',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Cara seru, interaktif, dan efektif kuasai skill coding & digital!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontSize: '15px',
                color: 'var(--color-fog)',
                lineHeight: 1.65,
                marginBottom: '32px',
                maxWidth: '560px',
              }}
            >
              Platform belajar gamifikasi untuk siswa SMK dan SMA. Taklukkan modul pemrograman, tantang teman dalam duel kuis 1v1 real-time, dan bawa reputasi sekolahmu ke puncak leaderboard nasional.
            </motion.p>

            {/* Dual CTA Button Stack (Duolingo signature action layout) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '380px',
              }}
            >
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="btn-signal-orange"
                    style={{
                      padding: '14px 24px',
                      fontSize: '14px',
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    <LayoutDashboard size={16} /> Buka Dashboard Studio <ChevronRight size={15} />
                  </Link>
                  <Link
                    href="/modules"
                    className="btn-dark-outline"
                    style={{
                      padding: '13px 24px',
                      fontSize: '13.5px',
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    Lanjutkan Belajar Modul
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="btn-signal-orange"
                    style={{
                      padding: '14px 24px',
                      fontSize: '14px',
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    <Swords size={16} /> Mulai Petualangan Gratis <ChevronRight size={15} />
                  </Link>
                  <Link
                    href="/login"
                    className="btn-dark-outline"
                    style={{
                      padding: '13px 24px',
                      fontSize: '13.5px',
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    Saya Sudah Punya Akun
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. Technology & Module Selector Strip (Duolingo Language Bar) ── */}
      <section
        style={{
          borderBottom: '1px solid var(--surface-border)',
          backgroundColor: 'var(--surface-canvas)',
          padding: '14px clamp(16px, 4vw, 40px)',
        }}
      >
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-steel)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Modul Pilihan:
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '2px',
              width: '100%',
            }}
          >
            {TECH_TRACK.map((tech) => (
              <Link
                key={tech.slug}
                href="/modules"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface-card)',
                  border: '1px solid var(--surface-border)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)'
                  e.currentTarget.style.borderColor = 'var(--color-signal-orange)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.borderColor = 'var(--surface-border)'
                }}
              >
                <span>{tech.icon}</span>
                <span>{tech.name}</span>
              </Link>
            ))}
          </div>

          <Link
            href="/modules"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-signal-orange)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Semua Modul <ChevronRight size={13} />
          </Link>
        </div>
      </section>

      {/* ── 3. Section 1: The Intro Hook (Duolingo: Mascot Left, Copy Right) ── */}
      <section
        id="metode"
        style={{
          padding: '80px clamp(20px, 4vw, 48px)',
          maxWidth: '1160px',
          margin: '0 auto',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: ' clamp(36px, 5vw, 64px)',
          }}
        >
          {/* Visual Left: Character Role Profile Card */}
          <div>
            <div
              style={{
                backgroundColor: 'var(--surface-card)',
                borderRadius: '14px',
                border: '1px solid var(--surface-border)',
                padding: '24px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: selectedClass.tileBg,
                    border: `1px solid ${selectedClass.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                  }}
                >
                  {selectedClass.emoji}
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '18px',
                      fontWeight: 600,
                      margin: 0,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {selectedClass.name} — {selectedClass.title}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-steel)' }}>
                    {selectedClass.tagline}
                  </p>
                </div>
              </div>

              {/* Role Perk Block */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--surface-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px',
                }}
              >
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--color-steel)' }}>Role Perk:</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-signal-orange)' }}>
                    {selectedClass.perk}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                    backgroundColor: 'rgba(245, 197, 66, 0.15)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(245, 197, 66, 0.35)',
                    fontWeight: 600,
                  }}
                >
                  +25% XP Bonus
                </span>
              </div>

              {/* Stat Progress Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                {selectedClass.stats.map((st) => (
                  <div key={st.label}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '11.5px',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ color: 'var(--color-silver)' }}>{st.label}</span>
                      <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {st.value}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${st.value}%`,
                          height: '100%',
                          backgroundColor: selectedClass.color,
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--surface-canvas)',
                  border: '1px solid var(--surface-border)',
                  fontSize: '11.5px',
                  color: 'var(--color-fog)',
                }}
              >
                <strong style={{ color: 'var(--text-primary)' }}>Cocok untuk: </strong>
                {selectedClass.suitable}
              </div>
            </div>
          </div>

          {/* Editorial Right: Headline & Key Points */}
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: 600,
                lineHeight: 1.25,
                marginBottom: '16px',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Metode paling seru menguasai skill masa depan
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--color-fog)',
                lineHeight: 1.65,
                marginBottom: '28px',
              }}
            >
              Belajar coding dan desain di Skillungo dirancang layaknya menamatkan quest RPG. Modul bite-sized yang padat teori langsung praktik, tutorial terkurasi, dan kuis cek pemahaman membuatmu terus termotivasi tanpa rasa lelah.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(245, 197, 66, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-signal-orange)',
                    flexShrink: 0,
                  }}
                >
                  <BookOpen size={16} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 600 }}>
                    Bite-Sized & Langsung Praktik
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-fog)', lineHeight: 1.5 }}>
                    Setiap unit berdurasi 5-10 menit. Tanpa materi bertele-tele, langsung fokus pada konsep esensial yang dipakai industri.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan)',
                    flexShrink: 0,
                  }}
                >
                  <Zap size={16} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 600 }}>
                    Sistem RPG & Role Karakter
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-fog)', lineHeight: 1.5 }}>
                    Pilih peran Warrior, Mage, Archer, atau Healer. Nikmati bonus multiplier XP pada modul yang sesuai dengan minat belajarmu.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(34, 197, 94, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-green)',
                    flexShrink: 0,
                  }}
                >
                  <GraduationCap size={16} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 600 }}>
                    100% Gratis untuk Pelajar
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-fog)', lineHeight: 1.5 }}>
                    Seluruh modul, duel kuis, dan quest harian terbuka penuh tanpa biaya langganan atau fitur terkunci berbayar.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/modules"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--color-signal-orange)',
                textDecoration: 'none',
              }}
            >
              Jelajahi Kurikulum Lengkap <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Section 2: "Why you'll love Skillungo" (Duolingo 4-Pillar Grid with Center Device Mockup) ── */}
      <section
        id="keunggulan"
        style={{
          padding: '80px clamp(20px, 4vw, 48px)',
          maxWidth: '1160px',
          margin: '0 auto',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 600,
              marginBottom: '10px',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Kenapa kamu akan menyukai belajar di Skillungo
          </h2>
          <p
            style={{
              color: 'var(--color-fog)',
              fontSize: '15px',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Kombinasi kurikulum industri dan gamifikasi modern yang terbukti efektif menjaga motivasi belajar mandiri.
          </p>
        </div>

        {/* 3-Column Layout: 2 Pillars Left, Device Mockup Center, 2 Pillars Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          {/* Left Column (2 Value Props) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Pillar 1 */}
            <div
              style={{
                padding: '24px',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '14px',
                border: '1px solid var(--surface-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 197, 66, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-signal-orange)',
                  marginBottom: '14px',
                }}
              >
                <Zap size={20} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '17px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--text-primary)',
                }}
              >
                Efektif dan terarah
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-fog)', lineHeight: 1.6 }}>
                Kurikulum terstruktur langsung ke inti konsep. Pelajari logika, arsitektur sintaksis modern, dan langsung implementasikan ke kode nyata.
              </p>
            </div>

            {/* Pillar 2 */}
            <div
              style={{
                padding: '24px',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '14px',
                border: '1px solid var(--surface-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                  marginBottom: '14px',
                }}
              >
                <Compass size={20} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '17px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--text-primary)',
                }}
              >
                Pembelajaran terpersonalisasi
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-fog)', lineHeight: 1.6 }}>
                Pilih peran RPG yang mencerminkan minat karirmu (Warrior, Mage, Archer, Healer) dan nikmati akselerasi XP di spesialisasi pilihanmu.
              </p>
            </div>
          </div>

          {/* Center Column: High-Fidelity Code Console / Terminal Screen */}
          <div
            style={{
              backgroundColor: 'var(--surface-card)',
              borderRadius: '14px',
              border: '1px solid var(--surface-border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Terminal Window Header */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--surface-elevated)',
                borderBottom: '1px solid var(--surface-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#22C55E',
                    display: 'inline-block',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-steel)',
                }}
              >
                lesson-runner.ts
              </span>
              <div style={{ width: '40px' }} />
            </div>

            {/* Code Body */}
            <div
              style={{
                padding: '18px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: 1.7,
                backgroundColor: 'var(--surface-canvas)',
              }}
            >
              <div style={{ color: 'var(--color-steel)' }}>// Quest: Hitung Bonus XP & Streak Multiplier</div>
              <div>
                <span style={{ color: '#38BDF8' }}>function</span>{' '}
                <span style={{ color: '#F5C542' }}>calculateLevelUp</span>
                (xp: <span style={{ color: '#22C55E' }}>number</span>, streak: <span style={{ color: '#22C55E' }}>number</span>) {'{'}
              </div>
              <div style={{ paddingLeft: '16px' }}>
                <span style={{ color: '#38BDF8' }}>const</span> multiplier = streak &gt;= <span style={{ color: '#F5C542' }}>7</span> ? <span style={{ color: '#F5C542' }}>1.5</span> : <span style={{ color: '#F5C542' }}>1.0</span>;
              </div>
              <div style={{ paddingLeft: '16px' }}>
                <span style={{ color: '#38BDF8' }}>return</span> {'{'}
              </div>
              <div style={{ paddingLeft: '32px' }}>
                level: Math.floor(xp / <span style={{ color: '#F5C542' }}>100</span>) + <span style={{ color: '#F5C542' }}>1</span>,
              </div>
              <div style={{ paddingLeft: '32px' }}>
                earnedXp: xp * multiplier,
              </div>
              <div style={{ paddingLeft: '16px' }}>{'}'};</div>
              <div>{'}'}</div>
            </div>

            {/* Test Passed Badge Footnote */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                borderTop: '1px solid rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)' }}>
                <Check size={14} />
                <span style={{ fontWeight: 600 }}>3/3 Tes Unit Lolos</span>
              </div>
              <span style={{ color: 'var(--color-signal-orange)', fontWeight: 600 }}>
                +150 XP Diperoleh
              </span>
            </div>
          </div>

          {/* Right Column (2 Value Props) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Pillar 3 */}
            <div
              style={{
                padding: '24px',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '14px',
                border: '1px solid var(--surface-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-red)',
                  marginBottom: '14px',
                }}
              >
                <Flame size={20} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '17px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--text-primary)',
                }}
              >
                Tetap termotivasi setiap hari
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-fog)', lineHeight: 1.6 }}>
                Bangun rutinitas konsisten dengan daily streak, misi 24 jam, dan perlindungan streak freeze saat kamu membutuhkan istirahat.
              </p>
            </div>

            {/* Pillar 4 */}
            <div
              style={{
                padding: '24px',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '14px',
                border: '1px solid var(--surface-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-green)',
                  marginBottom: '14px',
                }}
              >
                <Swords size={20} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '17px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--text-primary)',
                }}
              >
                Belajar sambil bermain game
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-fog)', lineHeight: 1.6 }}>
                Bosan belajar sendirian? Masuki arena duel kuis 1v1 real-time untuk menguji kecepatan logika dan kombo serangan melawan siswa lain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Alternating Z-Pattern Showcase Rows (Duolingo Distinct Feature Rows) ── */}
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        {/* Row 1: Battle Quiz Arena (Left Visual, Right Copy) */}
        <section
          id="battle"
          style={{
            padding: '80px clamp(20px, 4vw, 48px)',
            borderBottom: '1px solid var(--surface-border)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
              gap: 'clamp(36px, 5vw, 64px)',
            }}
          >
            {/* Left: Interactive 1v1 Battle Arena Quiz Console */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderRadius: '14px',
                  border: '1px solid var(--surface-border)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {/* Console Topbar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '14px',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--surface-border)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Algoritma & JavaScript
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11.5px',
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
                        fontSize: '11px',
                        color: 'var(--accent-red)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      00:08s
                    </span>
                  </div>
                </div>

                {/* Contestants Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--surface-border)',
                    marginBottom: '18px',
                  }}
                >
                  {/* Player 1 (You) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(245, 197, 66, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                      }}
                    >
                      ⚔️
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>Kamu (Hero)</div>
                      <div
                        style={{
                          width: '70px',
                          height: '4px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '4px',
                          marginTop: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ width: '90%', height: '100%', backgroundColor: 'var(--accent-green)' }} />
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-signal-orange)',
                      backgroundColor: 'rgba(245, 197, 66, 0.1)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    VS
                  </span>

                  {/* Player 2 (Opponent) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>Dina Alchemist</div>
                      <div
                        style={{
                          width: '70px',
                          height: '4px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '4px',
                          marginTop: '3px',
                          marginLeft: 'auto',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: quizAnswered === 0 || quizAnswered === 2 ? '45%' : '85%',
                            height: '100%',
                            backgroundColor: 'var(--accent-red)',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                      }}
                    >
                      🔮
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-steel)', marginBottom: '6px' }}>
                    RONDE 3 DARI 5 · Klik jawaban untuk menyerang lawan:
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5 }}>
                    Manakah ekspresi JavaScript yang mengembalikan nilai <code style={{ color: 'var(--color-signal-orange)' }}>true</code>?
                  </div>
                </div>

                {/* Options Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                  {[
                    { id: 0, text: "typeof NaN === 'number'", correct: true },
                    { id: 1, text: "Boolean('') === true", correct: false },
                    { id: 2, text: 'Array.isArray([]) === true', correct: true },
                    { id: 3, text: "'5' === 5", correct: false },
                  ].map((opt) => {
                    const isSelected = quizAnswered === opt.id
                    let bg = 'var(--surface-elevated)'
                    let border = 'var(--surface-border)'
                    let textColor = 'var(--text-primary)'

                    if (isSelected) {
                      if (opt.correct) {
                        bg = 'rgba(34, 197, 94, 0.15)'
                        border = 'var(--accent-green)'
                        textColor = 'var(--accent-green)'
                      } else {
                        bg = 'rgba(239, 68, 68, 0.15)'
                        border = 'var(--accent-red)'
                        textColor = 'var(--accent-red)'
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleQuizAnswer(opt.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${border}`,
                          backgroundColor: bg,
                          color: textColor,
                          fontSize: '12px',
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
                          <strong style={{ color: 'var(--color-steel)', marginRight: '6px' }}>
                            {String.fromCharCode(65 + opt.id)}
                          </strong>
                          <code>{opt.text}</code>
                        </span>
                        {isSelected && (opt.correct ? <CheckCircle size={14} /> : <X size={14} />)}
                      </button>
                    )
                  })}
                </div>

                {/* Feedback */}
                {quizAnswered !== null && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor:
                        quizAnswered === 0 || quizAnswered === 2
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${
                        quizAnswered === 0 || quizAnswered === 2
                          ? 'var(--accent-green)'
                          : 'var(--accent-red)'
                      }`,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      {quizAnswered === 0 || quizAnswered === 2
                        ? '⚔️ Serangan Combo Kena! Health musuh berkurang.'
                        : '🛡️ Kurang tepat! Musuh berhasil menangkis.'}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--color-signal-orange)' }}>
                      +120 XP
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Copy */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(26px, 3.5vw, 36px)',
                  fontWeight: 600,
                  lineHeight: 1.25,
                  marginBottom: '16px',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                Adu ketangkasan logika di Arena Duel 1v1
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--color-fog)',
                  lineHeight: 1.65,
                  marginBottom: '24px',
                }}
              >
                Uji seberapa cepat kemampuan analisismu saat berhadapan dengan waktu. Masuk ke matchmaking publik untuk menantang siswa se-Indonesia, atau buat ruangan private untuk bertanding bersama teman sekelas.
              </p>
              <Link
                href="/battle"
                className="btn-signal-orange"
                style={{ padding: '10px 20px', fontSize: '13px', textDecoration: 'none' }}
              >
                <Swords size={15} /> Coba Arena Duel 1v1 <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Row 2: Learn Anywhere / Modular Roadmap (Left Copy, Right Visual) */}
        <section
          style={{
            padding: '80px clamp(20px, 4vw, 48px)',
            borderBottom: '1px solid var(--surface-border)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
              gap: 'clamp(36px, 5vw, 64px)',
            }}
          >
            {/* Left: Copy */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(26px, 3.5vw, 36px)',
                  fontWeight: 600,
                  lineHeight: 1.25,
                  marginBottom: '16px',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                Belajar kapan saja, di perangkat mana saja
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--color-fog)',
                  lineHeight: 1.65,
                  marginBottom: '24px',
                }}
              >
                Akses materi dari komputer laboratorium sekolah, laptop di rumah, atau ponsel pintarmu saat di perjalanan. Modul dirancang responsif, ringan, dan ramah kuota untuk memudahkan akses belajar mandiri.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                  <Check size={16} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                  <span>Sinkronisasi progres cloud otomatis di seluruh perangkat.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                  <Check size={16} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                  <span>Durasi ringkas 5-10 menit per materi untuk fokus maksimal.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                  <Check size={16} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                  <span>Kuis evaluasi instan di setiap akhir unit pelajaran.</span>
                </div>
              </div>

              <Link
                href="/modules"
                className="btn-signal-orange"
                style={{ padding: '10px 20px', fontSize: '13px', textDecoration: 'none' }}
              >
                <BookOpen size={15} /> Jelajahi Modul Belajar <ChevronRight size={14} />
              </Link>
            </div>

            {/* Right: Curriculum Roadmap Step Mockup */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderRadius: '14px',
                  border: '1px solid var(--surface-border)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-steel)', marginBottom: '14px' }}>
                  ALUR PEMBELAJARAN: WEB DEVELOPMENT
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Step 1 */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--surface-elevated)',
                      border: '1px solid var(--surface-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(34, 197, 94, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-green)',
                        }}
                      >
                        <Check size={13} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>1. Struktur Dokumen HTML</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>Materi teks & video selesai</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>
                      +100 XP
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--surface-elevated)',
                      border: '1px solid var(--surface-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(34, 197, 94, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-green)',
                        }}
                      >
                        <Check size={13} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>2. Styling Selektor CSS Modern</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>Praktik flexbox & grid selesai</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>
                      +120 XP
                    </span>
                  </div>

                  {/* Step 3 (Current Active) */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(245, 197, 66, 0.08)',
                      border: '1px solid rgba(245, 197, 66, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-signal-orange)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0a0a0a',
                          fontWeight: 700,
                          fontSize: '11px',
                        }}
                      >
                        3
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          3. Logika Komponen JavaScript
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-signal-orange)' }}>
                          Sedang dipelajari · Kuis siap
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '10.5px',
                        backgroundColor: 'var(--color-signal-orange)',
                        color: '#0a0a0a',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                      }}
                    >
                      Aktif
                    </span>
                  </div>

                  {/* Step 4 (Locked) */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--surface-canvas)',
                      border: '1px solid var(--surface-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: 0.6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--surface-elevated)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-steel)',
                          fontSize: '11px',
                        }}
                      >
                        4
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>4. Evaluasi Akhir & Sertifikat</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>Terkunci hingga langkah 3 tuntas</div>
                      </div>
                    </div>
                    <Shield size={14} style={{ color: 'var(--color-steel)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Row 3: School Leaderboard (Left Visual, Right Copy) */}
        <section
          id="leaderboard"
          style={{
            padding: '80px clamp(20px, 4vw, 48px)',
            borderBottom: '1px solid var(--surface-border)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
              gap: 'clamp(36px, 5vw, 64px)',
            }}
          >
            {/* Left: Leaderboard Card Mockup */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderRadius: '14px',
                  border: '1px solid var(--surface-border)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--color-steel)', fontWeight: 600 }}>
                      KLASEMEN NASIONAL
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Top Sekolah Pekan Ini
                    </div>
                  </div>
                  <Trophy size={18} style={{ color: 'var(--color-signal-orange)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Rank 1 */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(245, 197, 66, 0.1)',
                      border: '1px solid rgba(245, 197, 66, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>🥇</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>SMK Telkom Malang</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>32 siswa aktif</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-signal-orange)' }}>
                        14,820 XP
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--accent-green)' }}>+1,250 hari ini</div>
                    </div>
                  </div>

                  {/* Rank 2 */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--surface-elevated)',
                      border: '1px solid var(--surface-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>🥈</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>SMAN 1 Yogyakarta</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>28 siswa aktif</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>12,450 XP</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>+980 hari ini</div>
                    </div>
                  </div>

                  {/* Rank 3 */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--surface-elevated)',
                      border: '1px solid var(--surface-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>🥉</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>SMKN 2 Bandung</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>24 siswa aktif</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>10,910 XP</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>+740 hari ini</div>
                    </div>
                  </div>

                  {/* You indicator */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--surface-canvas)',
                      border: '1px dashed var(--surface-border)',
                      fontSize: '11.5px',
                      color: 'var(--color-fog)',
                      textAlign: 'center',
                      marginTop: '4px',
                    }}
                  >
                    🏫 <strong>Sekolahmu:</strong> Selesaikan modul & kuis untuk mendongkrak peringkat sekolahmu!
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Copy */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(26px, 3.5vw, 36px)',
                  fontWeight: 600,
                  lineHeight: 1.25,
                  marginBottom: '16px',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                Bawa nama sekolahmu mendominasi puncak nasional
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--color-fog)',
                  lineHeight: 1.65,
                  marginBottom: '24px',
                }}
              >
                Setiap quest yang kamu selesaikan dan duel kuis yang kamu menangkan otomatis menyumbang poin langsung ke reputasi sekolahmu. Bersainglah secara sehat dengan ribuan siswa dari seluruh penjuru nusantara.
              </p>
              <Link
                href="/leaderboard"
                className="btn-signal-orange"
                style={{ padding: '10px 20px', fontSize: '13px', textDecoration: 'none' }}
              >
                <Trophy size={15} /> Lihat Peringkat Sekolah <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Row 4: Certificate & Digital Portfolio (Left Copy, Right Visual) */}
        <section
          style={{
            padding: '80px clamp(20px, 4vw, 48px)',
            borderBottom: '1px solid var(--surface-border)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
              gap: 'clamp(36px, 5vw, 64px)',
            }}
          >
            {/* Left: Copy */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(26px, 3.5vw, 36px)',
                  fontWeight: 600,
                  lineHeight: 1.25,
                  marginBottom: '16px',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                Validasi kompetensi dengan portofolio & sertifikat
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--color-fog)',
                  lineHeight: 1.65,
                  marginBottom: '24px',
                }}
              >
                Tuntaskan seluruh modul untuk mendapatkan sertifikat digital resmi beserta badge keahlian terverifikasi. Bagikan tautan profil publikmu ke LinkedIn atau lampirkan ke berkas lamaran magang industri.
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <span
                  style={{
                    fontSize: '11.5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--surface-border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  🛡️ ID Verifikasi Unik
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--surface-border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  📜 Sertifikat Digital
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--surface-border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  💼 Profil Siap Kerja
                </span>
              </div>

              <Link
                href="/modules"
                className="btn-signal-orange"
                style={{ padding: '10px 20px', fontSize: '13px', textDecoration: 'none' }}
              >
                <Award size={15} /> Mulai Raih Sertifikat <ChevronRight size={14} />
              </Link>
            </div>

            {/* Right: Verified Certificate Mockup Card */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderRadius: '14px',
                  border: '1px solid rgba(245, 197, 66, 0.35)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-card)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--surface-border)',
                    paddingBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        backgroundColor: 'rgba(245, 197, 66, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-signal-orange)',
                      }}
                    >
                      <Award size={16} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em' }}>
                      SKILLUNGO CERTIFICATE OF COMPLETION
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--accent-green)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    TERVERIFIKASI
                  </span>
                </div>

                <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-steel)', marginBottom: '4px' }}>
                    Diberikan kepada:
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Ahmad Fauzan
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-fog)', marginBottom: '14px' }}>
                    Telah menuntaskan kurikulum kompetensi:
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-signal-orange)',
                      backgroundColor: 'var(--surface-elevated)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      border: '1px solid var(--surface-border)',
                    }}
                  >
                    React & Modern Web Architecture
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--surface-border)',
                    paddingTop: '12px',
                    fontSize: '10.5px',
                    color: 'var(--color-steel)',
                  }}
                >
                  <span>ID: SKL-2026-9482X</span>
                  <span>Terbit: Oktober 2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Row 5: Streak, Quests & Reward Shop (Left Visual, Right Copy) */}
        <section
          style={{
            padding: '80px clamp(20px, 4vw, 48px)',
            borderBottom: '1px solid var(--surface-border)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
              gap: 'clamp(36px, 5vw, 64px)',
            }}
          >
            {/* Left: Gamified Reward Card */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderRadius: '14px',
                  border: '1px solid var(--surface-border)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {/* Streak Bar */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={18} style={{ color: 'var(--accent-red)' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>7 Hari Streak Harian</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>Multiplier XP x1.5 aktif</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--accent-red)',
                    }}
                  >
                    🔥 Terjaga
                  </span>
                </div>

                {/* Quests */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--surface-border)',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Misi Harian (2/3 Selesai)</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-signal-orange)', fontWeight: 600 }}>
                      +50 Koin Gold
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ width: '66%', height: '100%', backgroundColor: 'var(--color-signal-orange)' }} />
                  </div>
                </div>

                {/* Wallet Balance & Coupon Item */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(245, 197, 66, 0.1)',
                    border: '1px solid rgba(245, 197, 66, 0.35)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Gift size={18} style={{ color: 'var(--color-signal-orange)' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Saldo Dompet Petualang</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>Tukarkan voucher & item</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-signal-orange)' }}>
                    1,450 Gold
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Copy */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(26px, 3.5vw, 36px)',
                  fontWeight: 600,
                  lineHeight: 1.25,
                  marginBottom: '16px',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                Kumpulkan koin emas, tukarkan dengan reward nyata
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--color-fog)',
                  lineHeight: 1.65,
                  marginBottom: '24px',
                }}
              >
                Konsistensi belajarmu dihargai secara nyata. Kumpulkan koin emas dari modul dan kemenangan duel kuis, lalu tukarkan di Toko Petualang dengan perlindungan streak freeze, kosmetik avatar, atau voucher diskon kursus lanjutan.
              </p>
              <Link
                href="/shop"
                className="btn-signal-orange"
                style={{ padding: '10px 20px', fontSize: '13px', textDecoration: 'none' }}
              >
                <Gift size={15} /> Kunjungi Toko Petualang <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── 6. Section 4: FAQ (Accordion) ── */}
      <section
        id="faq"
        style={{
          padding: '80px clamp(20px, 4vw, 48px)',
          maxWidth: '860px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 600,
              marginBottom: '8px',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
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
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--surface-border)',
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
                    fontSize: '14.5px',
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
                      fontSize: '13.5px',
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

      {/* ── 7. Section 5: Duolingo Pre-Footer Call to Action Banner ── */}
      <section
        style={{
          borderTop: '1px solid var(--surface-border)',
          borderBottom: '1px solid var(--surface-border)',
          backgroundColor: 'var(--surface-canvas)',
          padding: '80px clamp(20px, 4vw, 48px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 50% 50%, rgba(245, 197, 66, 0.05) 0%, transparent 60%)',
          }}
        />

        <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '44px',
              height: '44px',
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
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 600,
              marginBottom: '14px',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            {isLoggedIn ? 'Karaktermu Siap Masuk Arena.' : 'Mulai Petualangan Skill Digitalmu.'}
          </h2>

          <p
            style={{
              color: 'var(--color-fog)',
              fontSize: '15px',
              maxWidth: '520px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            {isLoggedIn
              ? 'Lanjutkan modul belajar, selesaikan quest harian, dan pertahankan posisi terbaik almamatermu di Leaderboard.'
              : 'Daftar gratis dalam hitungan detik. Kumpulkan XP, kuasai modul coding & desain, dan raih prestasi membanggakan untuk sekolahmu.'}
          </p>

          <Link
            href={isLoggedIn ? '/dashboard' : '/register'}
            className="btn-signal-orange"
            style={{
              padding: '14px 32px',
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-flex',
            }}
          >
            {isLoggedIn ? (
              <>
                <LayoutDashboard size={16} /> Buka Dashboard Studio <ChevronRight size={15} />
              </>
            ) : (
              <>
                <Swords size={16} /> Daftar Gratis Sekarang <ChevronRight size={15} />
              </>
            )}
          </Link>

          <div style={{ marginTop: '16px', fontSize: '11.5px', color: 'var(--color-steel)' }}>
            100% Gratis untuk Pelajar · Tanpa Kartu Kredit
          </div>
        </div>
      </section>

      {/* ── 8. Section 6: Comprehensive Multi-Column Footer (Duolingo Style) ── */}
      <footer
        style={{
          padding: '60px clamp(20px, 4vw, 48px) 36px',
          backgroundColor: 'var(--color-void)',
        }}
      >
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {/* Top Multi-Column Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '36px',
              marginBottom: '48px',
            }}
          >
            {/* Column 1: Brand Info */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Swords size={15} style={{ color: '#ffffff' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700 }}>
                  Skill<span style={{ color: 'var(--color-signal-orange)' }}>ungo</span>
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--color-steel)', lineHeight: 1.6, margin: 0 }}>
                Platform belajar gamifikasi untuk siswa SMK & SMA Indonesia. Asah keahlian digital, taklukkan kuis, dan bangun portofolio masa depan.
              </p>
            </div>

            {/* Column 2: Produk & Fitur */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Produk & Fitur
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                <Link href="/modules" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  Modul Belajar
                </Link>
                <Link href="/battle" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  Arena Duel 1v1
                </Link>
                <Link href="/leaderboard" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  Leaderboard Sekolah
                </Link>
                <Link href="/shop" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  Toko Petualang
                </Link>
                <Link href="/quests" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  Misi Harian
                </Link>
              </div>
            </div>

            {/* Column 3: Modul Populer */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Modul Populer
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                <Link href="/modules" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  HTML & CSS Dasar
                </Link>
                <Link href="/modules" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  JavaScript Modern
                </Link>
                <Link href="/modules" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  React & Next.js
                </Link>
                <Link href="/modules" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  UI/UX Design System
                </Link>
                <Link href="/modules" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  SQL & Basis Data
                </Link>
              </div>
            </div>

            {/* Column 4: Bantuan & Komunitas */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Bantuan & Panduan
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                <a href="#faq" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  FAQ Siswa
                </a>
                <a href="#metode" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  Panduan Belajar
                </a>
                <Link href="/login" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  Masuk Akun
                </Link>
                <Link href="/register" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  Pendaftaran Baru
                </Link>
              </div>
            </div>

            {/* Column 5: Legal & Kebijakan */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Legal & Privasi
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--color-steel)' }}>Ketentuan Layanan</span>
                <span style={{ color: 'var(--color-steel)' }}>Kebijakan Privasi</span>
                <span style={{ color: 'var(--color-steel)' }}>Pedoman Komunitas</span>
                <span style={{ color: 'var(--color-steel)' }}>Keamanan Siswa</span>
              </div>
            </div>
          </div>

          {/* Bottom Divider & Copyright */}
          <div
            style={{
              borderTop: '1px solid var(--surface-border)',
              paddingTop: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '12px',
              color: 'var(--color-steel)',
            }}
          >
            <div>
              © 2026 Skillungo. Seluruh hak cipta dilindungi undang-undang.
            </div>
            <div>
              &quot;Level Up Your Skills, Conquer Your Future&quot; · Duolingo-Structured Edition.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
