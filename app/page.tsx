import Link from 'next/link'
import { Swords, BookOpen, Zap, Trophy, Users, ChevronRight, Star, Flame, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const FEATURES = [
  {
    icon: <BookOpen size={24} />,
    title: 'Modul Interaktif',
    desc: 'Pelajari coding, desain, dan produktivitas lewat konten step-by-step yang engaging.',
    color: 'var(--accent-cyan)',
  },
  {
    icon: <Zap size={24} />,
    title: 'Battle Quiz 1v1',
    desc: 'Tantang temanmu atau cari lawan acak dalam quiz real-time yang seru dan kompetitif.',
    color: 'var(--accent-red)',
  },
  {
    icon: <Trophy size={24} />,
    title: 'Leaderboard Nasional',
    desc: 'Kompetisi seru antar pelajar dan antar sekolah se-Indonesia. Buktikan sekolahmu terbaik!',
    color: 'var(--accent-gold)',
  },
  {
    icon: <Star size={24} />,
    title: 'Karakter RPG',
    desc: 'Pilih kelas karaktermu (Warrior, Mage, Archer, Healer) dan naik level seiring belajarmu.',
    color: 'var(--accent-green)',
  },
  {
    icon: <Flame size={24} />,
    title: 'Daily Streak',
    desc: 'Jaga semangat belajar dengan sistem streak harian. Raih badge dan bonus XP khusus!',
    color: 'var(--accent-red)',
  },
  {
    icon: <Users size={24} />,
    title: 'Komunitas Pelajar',
    desc: 'Bergabung dengan ribuan pelajar SMK/SMA seluruh Indonesia dalam satu platform.',
    color: 'var(--accent-cyan)',
  },
]

const CLASSES = [
  { name: 'Warrior', emoji: '⚔️', desc: 'Kuat dalam coding', color: 'var(--accent-red)' },
  { name: 'Mage', emoji: '🔮', desc: 'Mahir desain', color: 'var(--accent-cyan)' },
  { name: 'Archer', emoji: '🏹', desc: 'Cepat di battle', color: 'var(--accent-green)' },
  { name: 'Healer', emoji: '✨', desc: 'Bijak & produktif', color: 'var(--accent-gold)' },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', overflow: 'auto', paddingTop: '72px' }}>
      {/* Navbar */}
      <nav className="landing-nav" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px', borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-secondary)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Swords size={22} style={{ color: 'var(--accent-gold)' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--accent-gold)' }}>
            Skillungo
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <Link href="/dashboard" style={{
              padding: '8px 18px', borderRadius: '4px', textDecoration: 'none',
              backgroundColor: 'var(--accent-gold)', color: 'var(--bg-primary)',
              fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}>
              <LayoutDashboard size={14} /> Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" style={{
                padding: '8px 18px', borderRadius: '4px', textDecoration: 'none',
                backgroundColor: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
              }}>
                Masuk
              </Link>
              <Link href="/register" style={{
                padding: '8px 18px', borderRadius: '4px', textDecoration: 'none',
                backgroundColor: 'var(--accent-gold)', color: 'var(--bg-primary)',
                fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700,
              }}>
                Daftar Gratis
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero" style={{ padding: '80px 48px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px',
          backgroundColor: 'rgba(245,197,66,0.1)', border: '1px solid rgba(245,197,66,0.3)',
          borderRadius: '4px', padding: '6px 14px',
        }}>
          <Swords size={12} style={{ color: 'var(--accent-gold)' }} />
          <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
            FICPACT CUP 2026 · WEB DEVELOPMENT
          </span>
        </div>

        <h1 className="landing-hero-title" style={{
          fontFamily: 'var(--font-heading)', fontSize: '56px', fontWeight: 700,
          lineHeight: 1.1, marginBottom: '16px', maxWidth: '800px', margin: '0 auto 16px',
        }}>
          Level Up Your Skills,<br />
          <span style={{ color: 'var(--accent-gold)' }}>Conquer Your Future</span>
        </h1>

        <p style={{
          color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '560px',
          margin: '0 auto 32px', lineHeight: 1.7,
        }}>
          Platform edukasi berbasis RPG untuk pelajar SMK/SMA Indonesia. Belajar skill digital, battle quiz 1v1, dan kompetisi leaderboard antar sekolah!
        </p>

        <div className="landing-cta-row" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {isLoggedIn ? (
            <Link href="/dashboard" style={{
              padding: '14px 32px', borderRadius: '4px', textDecoration: 'none',
              backgroundColor: 'var(--accent-gold)', color: 'var(--bg-primary)',
              fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}>
              <LayoutDashboard size={16} /> KE DASHBOARD <ChevronRight size={16} />
            </Link>
          ) : (
            <>
              <Link href="/register" style={{
                padding: '14px 32px', borderRadius: '4px', textDecoration: 'none',
                backgroundColor: 'var(--accent-gold)', color: 'var(--bg-primary)',
                fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}>
                MULAI PETUALANGAN <ChevronRight size={16} />
              </Link>
              <Link href="/login" style={{
                padding: '14px 32px', borderRadius: '4px', textDecoration: 'none',
                backgroundColor: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '15px',
              }}>
                Sudah punya akun
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Character Class Preview */}
      <section className="landing-section" style={{ padding: '60px 48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
            Pilih Kelasmu
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Setiap kelas punya skill unik yang mendukung gaya belajarmu
          </p>
        </div>
        <div className="landing-class-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
          {CLASSES.map((cls) => (
            <div key={cls.name} style={{
              backgroundColor: 'var(--bg-secondary)', border: `1px solid ${cls.color}33`,
              borderRadius: '4px', padding: '24px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{cls.emoji}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: cls.color, marginBottom: '4px' }}>
                {cls.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{cls.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-section" style={{ padding: '60px 48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
            Fitur Unggulan
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Semua yang kamu butuhkan untuk belajar menjadi menyenangkan
          </p>
        </div>
        <div className="landing-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
          {FEATURES.map((feature) => (
            <div key={feature.title} style={{
              backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '4px', padding: '24px',
            }}>
              <div style={{ color: feature.color, marginBottom: '12px' }}>{feature.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
                {feature.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="landing-section" style={{ padding: '60px 48px', borderBottom: '1px solid var(--border)' }}>
        <div className="landing-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          {[
            { value: '10+', label: 'Modul Belajar', color: 'var(--accent-cyan)' },
            { value: '4', label: 'Kelas Karakter', color: 'var(--accent-gold)' },
            { value: '1v1', label: 'Battle Real-time', color: 'var(--accent-red)' },
            { value: '∞', label: 'Potensimu', color: 'var(--accent-green)' },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '40px', fontWeight: 700, color: stat.color, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta" style={{ padding: '80px 48px', textAlign: 'center' }}>
        <h2 className="landing-cta-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '40px', fontWeight: 700, marginBottom: '12px' }}>
          {isLoggedIn ? 'Petualanganmu Menanti!' : 'Siap Memulai Petualangan?'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          {isLoggedIn
            ? 'Lanjutkan perjalanan belajarmu dan raih level selanjutnya!'
            : 'Bergabunglah gratis dan mulai perjalanan belajarmu hari ini!'}
        </p>
        <Link href={isLoggedIn ? '/dashboard' : '/register'} style={{
          padding: '16px 48px', borderRadius: '4px', textDecoration: 'none',
          backgroundColor: 'var(--accent-gold)', color: 'var(--bg-primary)',
          fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: '10px',
        }}>
          {isLoggedIn
            ? <><LayoutDashboard size={20} /> LANJUT BELAJAR</>
            : <><Swords size={20} /> DAFTAR SEKARANG — GRATIS!</>}
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer" style={{ padding: '24px 48px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <Swords size={16} style={{ color: 'var(--accent-gold)' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-gold)', fontSize: '16px' }}>Skillungo</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          © 2026 Skillungo · FICPACT CUP 2026 · &quot;Level Up Your Skills, Conquer Your Future&quot;
        </p>
      </footer>
    </div>
  )
}
