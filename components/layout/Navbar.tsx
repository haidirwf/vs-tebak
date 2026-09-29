'use client'

import { usePathname } from 'next/navigation'
import { Flame, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { isStreakActiveToday } from '@/lib/game/streak'
import ThemeToggle from '@/components/layout/ThemeToggle'

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/modules': 'Modul Belajar',
    '/battle': 'Battle Arena',
    '/voucher': 'Toko Voucher',
    '/leaderboard': 'Leaderboard',
    '/profile': 'Profil',
}

export default function Navbar() {
    const pathname = usePathname()
    const { profile } = useUserStore()

    const title = Object.entries(PAGE_TITLES).find(([key]) =>
        key === pathname || pathname.startsWith(key + '/')
    )?.[1] || 'Skillungo'

    return (
        <header
            className="dashboard-navbar"
            style={{
                height: '56px',
                backgroundColor: 'rgba(20, 20, 20, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }}
        >
            {/* Animasi Title saat rute berpindah */}
            <div style={{ position: 'relative', overflow: 'hidden', height: '28px', display: 'flex', alignItems: 'center' }}>
                <AnimatePresence mode="wait">
                    <motion.h2
                        key={title}
                        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="dashboard-navbar-title"
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            margin: 0,
                            letterSpacing: '0.02em',
                        }}
                    >
                        {title}
                    </motion.h2>
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
                            padding: '4px 10px',
                            borderRadius: '6px',
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
                            <Flame size={15} style={{ color: 'var(--accent-red)' }} />
                        </motion.div>
                        <span
                            style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: 'var(--accent-red)',
                                fontFamily: 'var(--font-heading)',
                                letterSpacing: '0.02em',
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
                        whileHover={{ scale: 1.05, borderColor: 'var(--accent-gold)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        style={{
                            backgroundColor: 'var(--accent-gold-bg)',
                            border: '1px solid var(--accent-gold-border)',
                            borderRadius: '6px',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 700,
                            color: 'var(--accent-gold)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'default',
                            boxShadow: '0 2px 8px rgba(245, 197, 66, 0.08)',
                        }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ display: 'inline-flex' }}
                        >
                            <Sparkles size={13} style={{ color: 'var(--accent-gold)' }} />
                        </motion.div>
                        <span>{profile.xp.toLocaleString()} XP</span>
                    </motion.div>
                )}

                {/* Theme Toggle (Disembunyikan sementara, hapus komentar untuk mengaktifkan kembali) */}
                {/* <ThemeToggle /> */}
            </div>
        </header>
    )
}
