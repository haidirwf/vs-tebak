'use client'

import { usePathname } from 'next/navigation'
import {
    Flame,
    Sparkles,
    LayoutDashboard,
    BookOpen,
    Swords,
    Ticket,
    Trophy,
    User,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { isStreakActiveToday } from '@/lib/game/streak'
import ThemeToggle from '@/components/layout/ThemeToggle'

const PAGE_CONFIG: Record<string, { title: string; icon: any; color: string }> = {
    '/dashboard': { title: 'Dashboard', icon: LayoutDashboard, color: 'var(--accent-gold)' },
    '/modules': { title: 'Modul Belajar', icon: BookOpen, color: 'var(--accent-cyan)' },
    '/battle': { title: 'Battle Arena', icon: Swords, color: 'var(--accent-red)' },
    '/voucher': { title: 'Toko Voucher', icon: Ticket, color: 'var(--accent-gold)' },
    '/leaderboard': { title: 'Leaderboard', icon: Trophy, color: 'var(--accent-green)' },
    '/profile': { title: 'Profil', icon: User, color: 'var(--accent-cyan)' },
}

export default function Navbar() {
    const pathname = usePathname()
    const { profile } = useUserStore()

    const activeConfig = Object.entries(PAGE_CONFIG).find(([key]) =>
        key === pathname || pathname.startsWith(key + '/')
    )?.[1] || { title: 'Skillungo', icon: LayoutDashboard, color: 'var(--accent-gold)' }

    const Icon = activeConfig.icon

    return (
        <motion.header
            key={pathname}
            initial={{ opacity: 0.85, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="dashboard-navbar"
            style={{
                height: '56px',
                backgroundColor: 'rgba(0, 0, 0, 0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
            }}
        >
            {/* Ambient subtle glow line saat pindah halaman */}
            <motion.div
                initial={{ scaleX: 0, opacity: 1 }}
                animate={{ scaleX: 1, opacity: [1, 0.8, 0] }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                style={{
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent 0%, ${activeConfig.color} 40%, var(--accent-gold) 70%, transparent 100%)`,
                    transformOrigin: 'left',
                    pointerEvents: 'none',
                }}
            />

            {/* Animasi Title & Icon saat rute berpindah */}
            <div style={{ position: 'relative', overflow: 'hidden', height: '32px', display: 'flex', alignItems: 'center' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, x: -16, filter: 'blur(6px)', scale: 0.96 }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)', scale: 1 }}
                        exit={{ opacity: 0, x: 16, filter: 'blur(6px)', scale: 0.96 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <motion.div
                            initial={{ rotate: -15, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                backgroundColor: `${activeConfig.color}15`,
                                border: `1px solid ${activeConfig.color}35`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: activeConfig.color,
                                boxShadow: `0 0 12px ${activeConfig.color}25`,
                            }}
                        >
                            <Icon size={16} />
                        </motion.div>

                        <h2
                            className="dashboard-navbar-title"
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '17px',
                                fontWeight: 400,
                                color: 'var(--text-primary)',
                                margin: 0,
                                letterSpacing: '-0.015em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            {activeConfig.title}
                        </h2>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="dashboard-navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Streak Badge with pulsing flame */}
                {profile && isStreakActiveToday(profile.last_active, profile.streak_count) && (
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            backgroundColor: 'var(--accent-red-bg)',
                            border: '1px solid var(--accent-red-border)',
                            cursor: 'default',
                        }}
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, -6, 6, 0],
                            }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Flame size={14} style={{ color: 'var(--accent-red)' }} />
                        </motion.div>
                        <span
                            style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: 'var(--accent-red)',
                                fontFamily: 'var(--font-inter)',
                            }}
                        >
                            {profile.streak_count} Hari
                        </span>
                    </motion.div>
                )}

                {/* XP Badge with shimmer & micro-interaction */}
                {profile && (
                    <motion.div
                        className="dashboard-navbar-xp"
                        whileHover={{ scale: 1.05, borderColor: 'var(--color-signal-orange)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        style={{
                            backgroundColor: 'rgba(255, 72, 0, 0.1)',
                            border: '1px solid rgba(255, 72, 0, 0.35)',
                            borderRadius: '9999px',
                            padding: '4px 14px',
                            fontSize: '12px',
                            fontFamily: 'var(--font-inter)',
                            fontWeight: 500,
                            color: 'var(--color-signal-orange)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'default',
                            boxShadow: '0 0 14px rgba(255, 72, 0, 0.15)',
                        }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ display: 'inline-flex' }}
                        >
                            <Sparkles size={12} style={{ color: 'var(--color-signal-orange)' }} />
                        </motion.div>
                        <span>{profile.xp.toLocaleString()} XP</span>
                    </motion.div>
                )}

                {/* Theme Toggle (Disembunyikan sementara, hapus komentar untuk mengaktifkan kembali) */}
                {/* <ThemeToggle /> */}
            </div>
        </motion.header>
    )
}
