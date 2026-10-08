'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
    Swords,
    LayoutDashboard,
    BookOpen,
    Trophy,
    User,
    LogOut,
    ChevronRight,
    Flame,
    Shield,
    ShoppingBag,
} from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { getXpProgress, calculateLevel } from '@/lib/game/xp'
import { getEffectiveStreak, isStreakPendingToday } from '@/lib/game/streak'
import ThemeToggle from '@/components/layout/ThemeToggle'

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/modules', icon: BookOpen, label: 'Modul' },
    { href: '/battle', icon: Swords, label: 'Battle' },
    { href: '/character', icon: Shield, label: 'Karakter' },
    { href: '/shop', icon: ShoppingBag, label: 'Toko' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { href: '/profile', icon: User, label: 'Profil' },
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

    const effectiveStreak = profile ? getEffectiveStreak(profile.last_active, profile.streak_count) : 0
    const isPendingStreak = profile ? isStreakPendingToday(profile.last_active, profile.streak_count) : false

    const xpCalc = profile ? calculateLevel(profile.xp) : null
    const xpProgress = xpCalc ? getXpProgress(xpCalc.currentXp, xpCalc.xpToNext) : 0

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <aside
            className="dashboard-sidebar"
            style={{
                width: '240px',
                flexShrink: 0,
                backgroundColor: 'var(--surface-canvas)',
                borderRight: '1px solid var(--surface-border)',
                height: '100vh',
                position: 'sticky',
                top: 0,
            }}
        >
            {/* Logo */}
            <div
                className="dashboard-logo-row"
                style={{
                    padding: '20px 16px 16px',
                    borderBottom: '1px solid var(--surface-border)',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Link
                    href="/dashboard"
                    prefetch={true}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                    }}
                >
                    <div
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(245, 197, 66, 0.15)',
                            border: '1px solid rgba(245, 197, 66, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Swords size={16} style={{ color: 'var(--color-gold)' }} />
                    </div>
                    <span
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '18px',
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Skill<span style={{ color: 'var(--color-gold)' }}>ungo</span>
                    </span>
                </Link>
            </div>

            {/* Character Preview */}
            {profile && (
                <div
                    className="dashboard-character-preview"
                    style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--surface-border)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: `1px solid ${CLASS_COLORS[profile.avatar_class] || 'var(--surface-border)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                            }}
                        >
                            {CLASS_EMOJI[profile.avatar_class] || '🎮'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-inter)',
                                        fontWeight: 500,
                                        fontSize: '13px',
                                        color: 'var(--text-primary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {profile.username}
                                </div>
                                {effectiveStreak > 0 && (
                                    <span
                                        title={
                                            isPendingStreak
                                                ? `Streak ${effectiveStreak} hari (belum aktif hari ini)`
                                                : `Streak ${effectiveStreak} hari`
                                        }
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '2px',
                                            borderRadius: '6px',
                                            padding: '1px 5px',
                                            border: isPendingStreak
                                                ? '1px dashed var(--accent-red-border)'
                                                : '1px solid var(--accent-red-border)',
                                            backgroundColor: 'var(--accent-red-bg)',
                                            color: 'var(--accent-red)',
                                            fontFamily: 'var(--font-inter)',
                                            fontSize: '10px',
                                            fontWeight: 600,
                                            lineHeight: 1,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <Flame size={10} />
                                        {effectiveStreak}
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-gold)' }}>
                                Level {profile.level}{' '}
                                {profile.avatar_class.charAt(0).toUpperCase() + profile.avatar_class.slice(1)}
                            </div>
                        </div>
                    </div>
                    {/* XP Bar */}
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
                            animate={{ width: `${xpProgress}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{ height: '100%', backgroundColor: 'var(--color-gold)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>
                            {profile.xp.toLocaleString()} XP
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>
                            Lv.{profile.level + 1}
                        </span>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav
                className="dashboard-sidebar-nav"
                style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}
            >
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            style={{ textDecoration: 'none', position: 'relative', display: 'block' }}
                        >
                            <motion.div
                                className="dashboard-sidebar-item"
                                whileHover={{ x: 3 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    marginBottom: '4px',
                                    backgroundColor: isActive
                                        ? 'rgba(245, 197, 66, 0.12)'
                                        : 'transparent',
                                    border: `1px solid ${isActive ? 'rgba(245, 197, 66, 0.35)' : 'transparent'}`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebarActiveBar"
                                        style={{
                                            position: 'absolute',
                                            left: '4px',
                                            width: '3px',
                                            height: '14px',
                                            borderRadius: '4px',
                                            backgroundColor: 'var(--color-gold)',
                                        }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Icon
                                        size={16}
                                        style={{
                                            color: isActive ? 'var(--color-gold)' : 'var(--color-silver)',
                                            flexShrink: 0,
                                        }}
                                    />
                                </div>

                                <span
                                    style={{
                                        fontFamily: 'var(--font-inter)',
                                        fontSize: '13px',
                                        fontWeight: isActive ? 500 : 400,
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    }}
                                >
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div
                                        style={{
                                            marginLeft: 'auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <ChevronRight size={13} style={{ color: 'var(--color-gold)' }} />
                                    </div>
                                )}
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Actions: ThemeToggle & Logout */}
            <div
                className="dashboard-bottom-logout"
                style={{
                    padding: '12px 10px',
                    borderTop: '1px solid var(--surface-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}
            >
                <ThemeToggle />
                <motion.button
                    className="dashboard-sidebar-logout"
                    onClick={() => setShowLogoutConfirm(true)}
                    whileHover={{ scale: 1.01 }}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255, 51, 68, 0.08)',
                        border: '1px solid rgba(255, 51, 68, 0.25)',
                        color: 'var(--accent-red)',
                    }}
                >
                    <LogOut size={14} />
                    <span
                        style={{
                            fontFamily: 'var(--font-inter)',
                            fontSize: '12px',
                            fontWeight: 500,
                        }}
                    >
                        Keluar
                    </span>
                </motion.button>
            </div>

            {/* Modal Logout */}
            {showLogoutConfirm && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '16px',
                        overflow: 'hidden',
                        touchAction: 'none',
                        overscrollBehavior: 'none',
                    }}
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div
                        className="card"
                        style={{
                            width: '100%',
                            maxWidth: '360px',
                            padding: '24px',
                            backgroundColor: '#0c0c0c',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '12px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '18px',
                                fontWeight: 400,
                                marginBottom: '8px',
                                color: '#ffffff',
                            }}
                        >
                            Konfirmasi Keluar
                        </h3>
                        <p style={{ color: 'var(--color-fog)', fontSize: '13px', marginBottom: '20px' }}>
                            Yakin ingin keluar dari akun studio ini?
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="btn-dark-outline"
                                style={{
                                    flex: 1,
                                    padding: '8px 14px',
                                    fontSize: '12px',
                                    justifyContent: 'center',
                                }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    flex: 1,
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 51, 68, 0.4)',
                                    backgroundColor: 'rgba(255, 51, 68, 0.15)',
                                    color: 'var(--accent-red)',
                                    fontFamily: 'var(--font-inter)',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}
