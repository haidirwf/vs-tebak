'use client'

import { usePathname } from 'next/navigation'
import { Flame } from 'lucide-react'
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
        <header className="dashboard-navbar" style={{
            height: '56px', backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', position: 'sticky', top: 0, zIndex: 10,
        }}>
            <h2 className="dashboard-navbar-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {title}
            </h2>

            <div className="dashboard-navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Streak */}
                {profile && isStreakActiveToday(profile.last_active, profile.streak_count) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Flame size={14} style={{ color: 'var(--accent-red)' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-red)', fontFamily: 'var(--font-heading)' }}>
                            {profile.streak_count}
                        </span>
                    </div>
                )}

                {/* XP */}
                {profile && (
                    <div className="dashboard-navbar-xp" style={{
                        backgroundColor: 'rgba(245,197,66,0.1)', border: '1px solid rgba(245,197,66,0.3)',
                        borderRadius: '4px', padding: '4px 10px',
                        fontSize: '12px', fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--accent-gold)',
                    }}>
                        {profile.xp.toLocaleString()} XP
                    </div>
                )}

                {/* Theme Toggle */}
                <ThemeToggle />
            </div>
        </header>
    )
}
