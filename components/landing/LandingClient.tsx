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
  Shield,
  Gift,
  CheckCircle,
  Sparkles,
  Award,
  ChevronDown,
  Menu,
  X,
  Compass,
  Check,
  Play,
  RotateCcw,
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
  tagline: string
  perk: string
}[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    title: 'The Code Vanguard',
    emoji: '⚔️',
    color: '#EF4444',
    tagline: 'Kuat dalam logika sistem, backend, dan problem solving kompleks.',
    perk: '+25% XP Modul Backend',
  },
  {
    id: 'mage',
    name: 'Mage',
    title: 'The Design Alchemist',
    emoji: '🔮',
    color: '#38BDF8',
    tagline: 'Penyihir estetika visual, tata letak UI/UX, dan interaksi pengguna.',
    perk: '+25% XP Modul UI/UX',
  },
  {
    id: 'archer',
    name: 'Archer',
    title: 'The Battle Speedrunner',
    emoji: '🏹',
    color: '#22C55E',
    tagline: 'Reaksi kilat, unggul dalam duel kuis 1v1 dan arena time-attack.',
    perk: '2x Combo Battle Multiplier',
  },
  {
    id: 'healer',
    name: 'Healer',
    title: 'The Productivity Sage',
    emoji: '✨',
    color: '#F5C542',
    tagline: 'Fokus, konsisten, penguasa manajemen waktu dan daily streak.',
    perk: '+1 Streak Freeze Gratis',
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
    a: 'Ya, Skillungo 100% gratis untuk seluruh pelajar di Indonesia. Kamu bisa mempelajari modul, mengikuti duel kuis battle 1v1, mengklaim quest harian, dan bersaing di leaderboard tanpa biaya apa pun.',
  },
  {
    q: 'Bagaimana cara kerja sistem duel battle 1v1?',
    a: 'Kamu bisa menantang penantang acak melalui matchmaking atau membuat private room dan membagikan kode ke temanmu. Pertandingan berlangsung dalam 5 ronde kuis cepat dengan sistem socket real-time.',
  },
  {
    q: 'Apa fungsi pemilihan role karakter (Warrior, Mage, Archer, Healer)?',
    a: 'Setiap role memberikan bonus multiplier XP khusus pada kategori modul dan mode belajar tertentu sesuai dengan minat karir yang ingin kamu tekuni.',
  },
  {
    q: 'Materi apa saja yang tersedia di Skillungo?',
    a: 'Skillungo berfokus pada skill industri digital praktis: Frontend & Backend Development, UI/UX Design System, Algoritma Pemrograman, dan Tool Produktivitas Modern.',
  },
]

export default function LandingClient({ isLoggedIn }: LandingClientProps) {
  const [selectedClass, setSelectedClass] = useState(CLASSES_DATA[0])
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Interactive Battle Quiz Preview state
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null)
  const [comboCount, setComboCount] = useState(1)
  const [enemyHp, setEnemyHp] = useState(85)
  const [floatingXp, setFloatingXp] = useState(false)
  const [isEnemyHurt, setIsEnemyHurt] = useState(false)

  // Interactive Terminal Runner state
  const [isRunningCode, setIsRunningCode] = useState(false)
  const [codeRunSuccess, setCodeRunSuccess] = useState(false)

  const handleQuizAnswer = (index: number) => {
    setQuizAnswered(index)
    if (index === 0 || index === 2) {
      // Correct answer animation
      setComboCount((prev) => prev + 1)
      setIsEnemyHurt(true)
      setEnemyHp((prev) => Math.max(prev - 35, 15))
      setFloatingXp(true)
      setTimeout(() => setIsEnemyHurt(false), 500)
      setTimeout(() => setFloatingXp(false), 1600)
    }
  }

  const resetQuiz = () => {
    setQuizAnswered(null)
    setComboCount(1)
    setEnemyHp(85)
    setFloatingXp(false)
    setIsEnemyHurt(false)
  }

  const handleRunCode = () => {
    setIsRunningCode(true)
    setCodeRunSuccess(false)
    setTimeout(() => {
      setIsRunningCode(false)
      setCodeRunSuccess(true)
    }, 800)
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
            Arena Duel
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
            Fitur Utama
          </a>
          <a
            href="#prestasi"
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
            Prestasi & Sertifikat
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
            href="#battle"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            Arena Duel
          </a>
          <a
            href="#keunggulan"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            Fitur Utama
          </a>
          <a
            href="#prestasi"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
          >
            Prestasi & Sertifikat
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

      {/* ── 1. Hero Section (Duolingo 2-Column with Animated Floating Stage) ── */}
      <section
        id="hero"
        style={{
          position: 'relative',
          paddingTop: 'clamp(130px, 15vh, 165px)',
          paddingBottom: 'clamp(70px, 9vh, 105px)',
          paddingLeft: 'clamp(20px, 4vw, 48px)',
          paddingRight: 'clamp(20px, 4vw, 48px)',
          backgroundColor: 'var(--color-void)',
          borderBottom: '1px solid var(--surface-border)',
          overflow: 'hidden',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Subtle atmospheric ambient glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 25% 40%, rgba(245, 197, 66, 0.06) 0%, transparent 60%), radial-gradient(circle at 75% 60%, rgba(56, 189, 248, 0.05) 0%, transparent 55%)',
          }}
        />

        <div
          style={{
            maxWidth: '1240px',
            width: '100%',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            alignItems: 'center',
            gap: 'clamp(44px, 6vw, 80px)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left Column: Animated RPG Hero Arena Stage */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '470px',
                aspectRatio: '1 / 1',
                borderRadius: '18px',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: 'var(--shadow-card)',
                padding: '28px',
                boxSizing: 'border-box',
              }}
            >
              {/* Floating Badge 1: Daily Streak (Smooth perpetual bobbing animation) */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '10px',
                  padding: '9px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-red)',
                  }}
                >
                  <Flame size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    7 Hari Streak
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--color-steel)' }}>
                    Bonus XP Aktif
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge 2: Level Milestone (Alternating bobbing animation) */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '10px',
                  padding: '9px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(245, 197, 66, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-signal-orange)',
                  }}
                >
                  <Trophy size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Level 12
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--color-steel)' }}>
                    Champion Rank
                  </div>
                </div>
              </motion.div>

              {/* Character Visual with Gentle Idle Floating Motion */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ marginTop: '22px', marginBottom: '12px' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedClass.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CharacterVisual
                      role={selectedClass.id}
                      size={230}
                      animationState="idle"
                      showAura={true}
                      showRoleBadge={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Role Switcher Controls */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  width: '100%',
                  marginTop: 'auto',
                }}
              >
                {CLASSES_DATA.map((cls) => {
                  const isCurrent = selectedClass.id === cls.id
                  return (
                    <motion.button
                      key={cls.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedClass(cls)}
                      style={{
                        flex: 1,
                        padding: '8px 6px',
                        borderRadius: '8px',
                        border: isCurrent
                          ? '1px solid var(--color-signal-orange)'
                          : '1px solid var(--surface-border)',
                        backgroundColor: isCurrent
                          ? 'rgba(245, 197, 66, 0.12)'
                          : 'var(--surface-elevated)',
                        color: isCurrent ? 'var(--text-primary)' : 'var(--color-steel)',
                        cursor: 'pointer',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'border-color 0.15s ease, background-color 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>{cls.emoji}</span>
                      <span>{cls.name}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Punchy Headline & Conversion CTAs */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(36px, 5.2vw, 58px)',
                fontWeight: 600,
                lineHeight: 1.15,
                marginBottom: '20px',
                letterSpacing: '-0.025em',
                color: 'var(--text-primary)',
              }}
            >
              Cara seru, interaktif, dan efektif kuasai skill coding & digital!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontSize: '16px',
                color: 'var(--color-fog)',
                lineHeight: 1.7,
                marginBottom: '36px',
                maxWidth: '600px',
              }}
            >
              Platform belajar gamifikasi untuk siswa SMK dan SMA. Taklukkan modul pemrograman bite-sized, tantang teman dalam duel kuis 1v1 real-time, dan bawa reputasi sekolahmu ke puncak leaderboard nasional.
            </motion.p>

            {/* Dual CTA Button Stack */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '400px',
              }}
            >
              {isLoggedIn ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/dashboard"
                    className="btn-signal-orange"
                    style={{
                      padding: '16px 28px',
                      fontSize: '15px',
                      textAlign: 'center',
                      textDecoration: 'none',
                      width: '100%',
                    }}
                  >
                    <LayoutDashboard size={16} /> Buka Dashboard <ChevronRight size={15} />
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/register"
                      className="btn-signal-orange"
                      style={{
                        padding: '16px 28px',
                        fontSize: '15px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        width: '100%',
                      }}
                    >
                      <Swords size={16} /> Mulai Petualangan Gratis <ChevronRight size={15} />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/login"
                      className="btn-dark-outline"
                      style={{
                        padding: '15px 28px',
                        fontSize: '14.5px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        width: '100%',
                      }}
                    >
                      Saya Sudah Punya Akun
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. Technology & Module Selector Strip (Interactive Ticker) ── */}
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
              <motion.div
                key={tech.slug}
                whileHover={{ y: -2 }}
                style={{ flexShrink: 0 }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--surface-border)',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  <span>{tech.icon}</span>
                  <span>{tech.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Flagship Showcase: 1v1 Battle Arena (Animated & Playable Demo) ── */}
      <section
        id="battle"
        style={{
          padding: '80px clamp(20px, 4vw, 48px)',
          maxWidth: '1160px',
          margin: '0 auto',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: 'clamp(36px, 5vw, 64px)',
          }}
        >
          {/* Left: Playable Interactive Quiz Console with Dynamic Animations */}
          <div style={{ position: 'relative' }}>
            {/* Floating XP Gain Badge Animation */}
            <AnimatePresence>
              {floatingXp && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -28, scale: 1.15 }}
                  exit={{ opacity: 0, y: -45 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    top: '30%',
                    right: '18%',
                    zIndex: 20,
                    backgroundColor: 'var(--color-signal-orange)',
                    color: '#0a0a0a',
                    fontWeight: 800,
                    fontSize: '13px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(245, 197, 66, 0.4)',
                    pointerEvents: 'none',
                  }}
                >
                  +120 XP ⚡
                </motion.div>
              )}
            </AnimatePresence>

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
                  {/* Bouncing combo counter on hit */}
                  <motion.span
                    key={comboCount}
                    initial={{ scale: 1 }}
                    animate={{ scale: comboCount > 1 ? [1, 1.25, 1] : 1 }}
                    transition={{ duration: 0.3 }}
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
                  </motion.span>
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

              {/* Contestants Row with Enemy Shake Animation */}
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
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(245, 197, 66, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                    }}
                  >
                    ⚔️
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>Kamu (Hero)</div>
                    <div
                      style={{
                        width: '76px',
                        height: '4px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        marginTop: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--accent-green)' }} />
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

                {/* Player 2 (Opponent with Shake on hit) */}
                <motion.div
                  animate={isEnemyHurt ? { x: [-4, 4, -4, 4, 0] } : {}}
                  transition={{ duration: 0.35 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'right' }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>Dina Alchemist</div>
                    <div
                      style={{
                        width: '76px',
                        height: '4px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        marginTop: '3px',
                        marginLeft: 'auto',
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        animate={{ width: `${enemyHp}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          backgroundColor: 'var(--accent-red)',
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: isEnemyHurt ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    🔮
                  </div>
                </motion.div>
              </div>

              {/* Question */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-steel)', marginBottom: '6px' }}>
                  RONDE 3 DARI 5 · Klik jawaban benar untuk melancarkan serangan:
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5 }}>
                  Manakah ekspresi JavaScript yang mengembalikan nilai boolean <code style={{ color: 'var(--color-signal-orange)' }}>true</code>?
                </div>
              </div>

              {/* Options Grid with Micro-Interactions */}
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
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                    </motion.button>
                  )
                })}
              </div>

              {/* Feedback and Reset Button */}
              {quizAnswered !== null ? (
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
                      ? '⚔️ Serangan Kombo Kena! Health musuh berkurang.'
                      : '🛡️ Kurang tepat! Seranganmu berhasil ditangkis.'}
                  </span>
                  <button
                    onClick={resetQuiz}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RotateCcw size={12} /> Coba Lagi
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: Editorial Copy */}
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
              Adu ketangkasan logika di Arena Duel 1v1
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--color-fog)',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Uji kecepatan analisis dan refleks analisismu di bawah tekanan waktu. Masuk ke arena matchmaking publik untuk bertanding dengan siswa se-Indonesia, atau buat room private untuk adu pintar bersama kawan satu kelas.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── 4. Core Pillars & Interactive Code Console ── */}
      <section
        id="keunggulan"
        style={{
          padding: '80px clamp(20px, 4vw, 48px)',
          maxWidth: '1160px',
          margin: '0 auto',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
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
        </motion.div>

        {/* 3-Column: 2 Pillars Left, Console Center, 2 Pillars Right */}
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
            <motion.div
              whileHover={{ y: -3 }}
              style={{
                padding: '24px',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '14px',
                border: '1px solid var(--surface-border)',
                boxShadow: 'var(--shadow-card)',
                transition: 'border-color 0.2s',
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
                Kurikulum disusun ringkas langsung ke inti konsep. Pelajari sintaksis modern dan segera implementasikan ke kode nyata.
              </p>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div
              whileHover={{ y: -3 }}
              style={{
                padding: '24px',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '14px',
                border: '1px solid var(--surface-border)',
                boxShadow: 'var(--shadow-card)',
                transition: 'border-color 0.2s',
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
                Pilih role RPG yang mencerminkan minat karirmu dan raih bonus pengali XP di materi spesialisasi pilihanmu.
              </p>
            </motion.div>
          </div>

          {/* Center Column: Interactive Code Console with Runnable Snippet */}
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
              <button
                onClick={handleRunCode}
                disabled={isRunningCode}
                style={{
                  backgroundColor: 'rgba(245, 197, 66, 0.15)',
                  border: '1px solid rgba(245, 197, 66, 0.4)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  color: 'var(--color-signal-orange)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600,
                }}
              >
                <Play size={10} /> {isRunningCode ? 'Menjalankan...' : 'Jalankan'}
              </button>
            </div>

            {/* Code Body with Blinking Cursor Animation */}
            <div
              style={{
                padding: '18px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: 1.7,
                backgroundColor: 'var(--surface-canvas)',
              }}
            >
              <div style={{ color: 'var(--color-steel)' }}>// Quest: Validasi Algoritma & Streak</div>
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
              <div style={{ paddingLeft: '16px' }}>
                {'}'};
                {/* Blinking animated cursor */}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '13px',
                    backgroundColor: 'var(--color-signal-orange)',
                    marginLeft: '4px',
                    verticalAlign: 'middle',
                  }}
                />
              </div>
              <div>{'}'}</div>
            </div>

            {/* Runner Feedback Footnote */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: codeRunSuccess ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.06)',
                borderTop: '1px solid rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                transition: 'background-color 0.3s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)' }}>
                <Check size={14} />
                <span style={{ fontWeight: 600 }}>
                  {codeRunSuccess ? 'Tes Unit Berhasil Dijalankan!' : '3/3 Tes Unit Lolos'}
                </span>
              </div>
              <span style={{ color: 'var(--color-signal-orange)', fontWeight: 600 }}>
                +150 XP Diperoleh
              </span>
            </div>
          </div>

          {/* Right Column (2 Value Props) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Pillar 3 */}
            <motion.div
              whileHover={{ y: -3 }}
              style={{
                padding: '24px',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '14px',
                border: '1px solid var(--surface-border)',
                boxShadow: 'var(--shadow-card)',
                transition: 'border-color 0.2s',
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
                Bangun rutinitas konsisten dengan daily streak, misi 24 jam, dan perlindungan freeze agar progres belajarmu tidak terputus.
              </p>
            </motion.div>

            {/* Pillar 4 */}
            <motion.div
              whileHover={{ y: -3 }}
              style={{
                padding: '24px',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '14px',
                border: '1px solid var(--surface-border)',
                boxShadow: 'var(--shadow-card)',
                transition: 'border-color 0.2s',
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. Consolidated Flagship Showcase: Leaderboard & Verified Certificate ── */}
      <section
        id="prestasi"
        style={{
          padding: '80px clamp(20px, 4vw, 48px)',
          maxWidth: '1160px',
          margin: '0 auto',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4vw, 38px)',
              fontWeight: 600,
              marginBottom: '10px',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Prestasi sekolah & sertifikat kompetensi industri
          </h2>
          <p
            style={{
              color: 'var(--color-fog)',
              fontSize: '15px',
              maxWidth: '620px',
              margin: '0 auto',
            }}
          >
            Setiap XP yang kamu peroleh membanggakan nama almamatermu dan menghasilkan portofolio digital yang terverifikasi.
          </p>
        </motion.div>

        {/* 2 Equal Focused Cards: School Leaderboard & Verified Certificate */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Card A: School Leaderboard */}
          <motion.div
            whileHover={{ y: -3 }}
            style={{
              backgroundColor: 'var(--surface-card)',
              borderRadius: '14px',
              border: '1px solid var(--surface-border)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                {/* Rank 1 */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(245, 197, 66, 0.1)',
                    border: '1px solid rgba(245, 197, 66, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px' }}>🥇</span>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>SMK Telkom Malang</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--color-steel)' }}>32 siswa aktif</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-signal-orange)' }}>
                    14,820 XP
                  </span>
                </div>

                {/* Rank 2 */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--surface-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px' }}>🥈</span>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>SMAN 1 Yogyakarta</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--color-steel)' }}>28 siswa aktif</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 600 }}>12,450 XP</span>
                </div>

                {/* Rank 3 */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--surface-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px' }}>🥉</span>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>SMKN 2 Bandung</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--color-steel)' }}>24 siswa aktif</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 600 }}>10,910 XP</span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--surface-border)',
                  paddingTop: '12px',
                  fontSize: '11.5px',
                  color: 'var(--color-steel)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Peringkat diperbarui otomatis</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Musim Aktif</span>
              </div>
            </div>
          </motion.div>

          {/* Card B: Verified Certificate */}
          <motion.div
            whileHover={{ y: -3 }}
            style={{
              backgroundColor: 'var(--surface-card)',
              borderRadius: '14px',
              border: '1px solid rgba(245, 197, 66, 0.35)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
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
                  <Award size={18} style={{ color: 'var(--color-signal-orange)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>
                    SERTIFIKAT KELULUSAN RESMI
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

              <div style={{ textAlign: 'center', padding: '10px 0 14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-steel)', marginBottom: '3px' }}>
                  Diberikan kepada siswa:
                </div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Ahmad Fauzan
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-fog)', marginBottom: '12px' }}>
                  Telah menuntaskan kurikulum kompetensi:
                </div>
                <div
                  style={{
                    fontSize: '13px',
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
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--surface-border)',
                paddingTop: '12px',
                fontSize: '11px',
                color: 'var(--color-steel)',
              }}
            >
              <span>ID: SKL-2026-9482X</span>
              <span>Terbit: Otomatis saat modul selesai</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 6. FAQ (Accordion) ── */}
      <section
        id="faq"
        style={{
          padding: '80px clamp(20px, 4vw, 48px)',
          maxWidth: '860px',
          margin: '0 auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
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
        </motion.div>

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

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 7. Pre-Footer Call to Action Banner ── */}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 1 }}
        >
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

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
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
                  <LayoutDashboard size={16} /> Buka Dashboard <ChevronRight size={15} />
                </>
              ) : (
                <>
                  <Swords size={16} /> Daftar Gratis Sekarang <ChevronRight size={15} />
                </>
              )}
            </Link>
          </motion.div>

          <div style={{ marginTop: '16px', fontSize: '11.5px', color: 'var(--color-steel)' }}>
            100% Gratis untuk Pelajar · Tanpa Kartu Kredit
          </div>
        </motion.div>
      </section>

      {/* ── 8. Comprehensive Multi-Column Footer ── */}
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
              </div>
            </div>

            {/* Column 4: Bantuan & Panduan */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Bantuan & Panduan
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                <a href="#faq" style={{ color: 'var(--color-silver)', textDecoration: 'none' }}>
                  FAQ Siswa
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
              &quot;Level Up Your Skills, Conquer Your Future&quot; · Dynamic & Streamlined Edition.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
