'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Swords, LayoutDashboard, BookOpen, Zap, Trophy, User, LogOut, ChevronRight, Flame, Ticket } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { getXpProgress } from '@/lib/game/xp'
import { isStreakActiveToday } from '@/lib/game/streak'

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', tour: 'dashboard' },
    { href: '/modules', icon: BookOpen, label: 'Modul', tour: 'modules' },
    { href: '/battle', icon: Swords, label: 'Battle', tour: 'battle' },
    { href: '/voucher', icon: Ticket, label: 'Voucher', tour: 'voucher' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard', tour: 'leaderboard' },
    { href: '/profile', icon: User, label: 'Profil', tour: 'profile' },
]

const CLASS_COLORS: Record<string, string> = {
    warrior: 'var(--accent-red)',
    mage: 'var(--accent-cyan)',
    archer: 'var(--accent-green)',
    healer: 'var(--accent-gold)',
}

const CLASS_EMOJI: Record<string, string> = {
    warrior: '⚔️',
    mage: '🔮',
    archer: '🏹',
    healer: '✨',
}

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { profile } = useUserStore()
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const xpProgress = profile
        ? getXpProgress(profile.xp - getTotalXpAtLevel(profile.level), profile.xp_to_next_level)
        : 0

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    async function handleLogoutWithConfirm() {
        await handleLogout()
    }

    return (
        <aside className="dashboard-sidebar" style={{
            width: '220px', flexShrink: 0,
            backgroundColor: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            height: '100vh', position: 'sticky', top: 0,
        }}>
            {/* Logo */}
            <div className="dashboard-logo-row" style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <Swords size={20} style={{ color: 'var(--accent-gold)' }} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        Skillungo
                    </span>
                </Link>

                {profile && (
                    <div className="dashboard-mobile-actions">
                        {isStreakActiveToday(profile.last_active, profile.streak_count) && (
                            <div
                                className="dashboard-mobile-streak"
                                title={`Streak ${profile.streak_count} hari`}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    borderRadius: '4px',
                                    padding: '5px 8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--accent-red)',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Flame size={12} />
                                {profile.streak_count}
                            </div>
                        )}

                        <Link
                            href="/profile"
                            className="dashboard-mobile-profile"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                padding: '5px 8px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg-tertiary)',
                            }}
                        >
                            <span style={{ fontSize: '14px' }}>{CLASS_EMOJI[profile.avatar_class] || '🎮'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                                <span style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '12px',
                                    color: 'var(--text-primary)',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '90px',
                                }}>
                                    {profile.username}
                                </span>
                                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, lineHeight: 1 }}>
                                    Lv.{profile.level}
                                </span>
                            </span>
                        </Link>

                        <div
                            className="dashboard-mobile-xp"
                            style={{
                                borderRadius: '4px',
                                padding: '5px 8px',
                                border: '1px solid rgba(245,197,66,0.45)',
                                backgroundColor: 'rgba(245,197,66,0.1)',
                                color: 'var(--accent-gold)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '12px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {profile.xp.toLocaleString()} XP
                        </div>
                    </div>
                )}
            </div>

            {/* Character Preview */}
            {profile && (
                <div className="dashboard-character-preview" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '4px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: `1px solid ${CLASS_COLORS[profile.avatar_class] || 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                        }}>
                            {CLASS_EMOJI[profile.avatar_class]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {profile.username}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
                                Level {profile.level} {profile.avatar_class.charAt(0).toUpperCase() + profile.avatar_class.slice(1)}
                            </div>
                        </div>
                    </div>
                    {/* XP Bar */}
                    <div style={{ height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{ height: '100%', backgroundColor: 'var(--accent-gold)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{profile.xp} XP</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lv.{profile.level + 1}</span>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="dashboard-sidebar-nav" style={{ flex: 1, padding: '8px 8px', overflow: 'auto' }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={item.href === '/profile' ? 'dashboard-profile-nav-link' : undefined}
                            style={{ textDecoration: 'none' }}
                        >
                            <motion.div
                                className="dashboard-sidebar-item"
                                whileHover={{ x: 2 }}
                                data-tour={`nav-${item.tour}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 10px', borderRadius: '4px', marginBottom: '2px',
                                    backgroundColor: isActive ? 'rgba(245,197,66,0.1)' : 'transparent',
                                    border: `1px solid ${isActive ? 'rgba(245,197,66,0.3)' : 'transparent'}`,
                                    cursor: 'pointer',
                                }}
                            >
                                <item.icon size={16} style={{ color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)', flexShrink: 0 }} />
                                <span style={{
                                    fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600,
                                    color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                }}>
                                    {item.label}
                                </span>
                                {isActive && <ChevronRight size={12} style={{ color: 'var(--accent-gold)', marginLeft: 'auto' }} />}
                            </motion.div>
                        </Link>
                    )
                })}

                <motion.button
                    className="dashboard-nav-logout"
                    onClick={() => setShowLogoutConfirm(true)}
                    whileHover={{ x: 2 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(232,64,64,0.1)',
                        border: '1px solid rgba(232,64,64,0.4)',
                        color: 'var(--accent-red)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <LogOut size={16} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700 }}>Keluar</span>
                </motion.button>
            </nav>

            {/* Logout */}
            <div className="dashboard-bottom-logout" style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
                <motion.button
                    className="dashboard-sidebar-logout"
                    onClick={() => setShowLogoutConfirm(true)}
                    whileHover={{ x: 2 }}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 10px', borderRadius: '4px', cursor: 'pointer',
                        backgroundColor: 'rgba(232,64,64,0.1)',
                        border: '1px solid rgba(232,64,64,0.4)',
                        color: 'var(--accent-red)',
                    }}
                >
                    <LogOut size={16} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700 }}>Keluar</span>
                </motion.button>
            </div>

            {showLogoutConfirm && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '16px',
                    }}
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div
                        className="card"
                        style={{
                            width: '100%',
                            maxWidth: '360px',
                            padding: '20px',
                            border: '1px solid var(--border)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '18px',
                                fontWeight: 700,
                                marginBottom: '8px',
                            }}
                        >
                            Konfirmasi Keluar
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                            Yakin ingin keluar dari akun ini?
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-secondary)',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Tidak
                            </button>
                            <button
                                onClick={handleLogoutWithConfirm}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(232,64,64,0.45)',
                                    backgroundColor: 'rgba(232,64,64,0.1)',
                                    color: 'var(--accent-red)',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Ya
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}

function getTotalXpAtLevel(level: number): number {
    // Approximate total XP at start of current level
    let total = 0
    for (let l = 1; l < level; l++) {
        total += Math.floor(100 * Math.pow(l, 1.5))
    }
    return total
}
