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
    { href: '/dashboard', iconUrl: '/favicons/dashboard.svg', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/modules', iconUrl: '/favicons/modules.svg', icon: BookOpen, label: 'Modul' },
    { href: '/battle', iconUrl: '/favicons/battle.svg', icon: Swords, label: 'Battle' },
    { href: '/character', iconUrl: '/favicons/character.svg', icon: Shield, label: 'Karakter' },
    { href: '/shop', iconUrl: '/favicons/shop.svg', icon: ShoppingBag, label: 'Toko' },
    { href: '/leaderboard', iconUrl: '/favicons/leaderboard.svg', icon: Trophy, label: 'Leaderboard' },
    { href: '/profile', iconUrl: '/favicons/profile.svg', icon: User, label: 'Profil' },
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
                backgroundColor: 'var(--surface-card)',
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
                    padding: '18px 16px 14px',
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
                        gap: '9px',
                        textDecoration: 'none',
                        flexShrink: 0,
                    }}
                >
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
            </div>

            {/* Character Preview */}
            {profile && (
                <div
                    className="dashboard-character-preview"
                    style={{
                        padding: '12px 14px',
                        borderBottom: '1px solid var(--surface-border)',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'var(--surface-canvas)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '10px',
                            padding: '10px 11px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '8px' }}>
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: `1.5px solid ${CLASS_COLORS[profile.avatar_class] || 'var(--surface-border)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                                    flexShrink: 0,
                                }}
                            >
                                {CLASS_EMOJI[profile.avatar_class] || '🎮'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 700,
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
                                                fontWeight: 700,
                                                lineHeight: 1,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            <Flame size={10} />
                                            {effectiveStreak}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                        Level {profile.level}
                                    </span>
                                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>•</span>
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            color: CLASS_COLORS[profile.avatar_class] || 'var(--text-primary)',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {profile.avatar_class.charAt(0).toUpperCase() + profile.avatar_class.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* XP Bar */}
                        <div
                            style={{
                                height: '5px',
                                backgroundColor: 'var(--surface-elevated)',
                                borderRadius: '9999px',
                                overflow: 'hidden',
                                border: '1px solid var(--surface-border)',
                            }}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${xpProgress}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)',
                                    borderRadius: '9999px',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                                {profile.xp.toLocaleString()} XP
                            </span>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                                Lv.{profile.level + 1}
                            </span>
                        </div>
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
                                        ? 'var(--accent-gold-bg)'
                                        : 'transparent',
                                    border: `1px solid ${isActive ? 'var(--accent-gold-border)' : 'transparent'}`,
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
                                            backgroundColor: 'var(--brand-primary)',
                                        }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '24px',
                                        height: '24px',
                                        flexShrink: 0,
                                    }}
                                >
                                    <img
                                        src={item.iconUrl}
                                        alt={item.label}
                                        width={22}
                                        height={22}
                                        style={{
                                            width: '22px',
                                            height: '22px',
                                            objectFit: 'contain',
                                            opacity: isActive ? 1 : 0.75,
                                            filter: isActive ? 'drop-shadow(0 1px 6px rgba(245, 197, 66, 0.4))' : 'none',
                                            transition: 'all 0.15s ease',
                                        }}
                                    />
                                </div>

                                <span
                                    style={{
                                        fontFamily: 'var(--font-inter)',
                                        fontSize: '13px',
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
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
                                        <ChevronRight size={13} style={{ color: 'var(--accent-gold-text)' }} />
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
                        backgroundColor: 'var(--surface-elevated)',
                        border: '1px solid var(--surface-border)',
                        color: 'var(--text-secondary)',
                        transition: 'all 0.15s ease',
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
                        className="modal-dialog-card"
                        style={{
                            width: '100%',
                            maxWidth: '360px',
                            padding: '24px',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-modal)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '18px',
                                fontWeight: 600,
                                marginBottom: '8px',
                                color: 'var(--text-primary)',
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
