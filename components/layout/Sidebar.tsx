'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Swords, LayoutDashboard, BookOpen, Zap, Trophy, User, LogOut, ChevronRight } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { getXpProgress } from '@/lib/game/xp'

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/modules', icon: BookOpen, label: 'Modul' },
    { href: '/battle', icon: Zap, label: 'Battle' },
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

    const xpProgress = profile
        ? getXpProgress(profile.xp - getTotalXpAtLevel(profile.level), profile.xp_to_next_level)
        : 0

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <aside style={{
            width: '220px', flexShrink: 0,
            backgroundColor: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            height: '100vh', position: 'sticky', top: 0,
        }}>
            {/* Logo */}
            <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <Swords size={20} style={{ color: 'var(--accent-gold)' }} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        SkillQuest
                    </span>
                </Link>
            </div>

            {/* Character Preview */}
            {profile && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
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
            <nav style={{ flex: 1, padding: '8px 8px', overflow: 'auto' }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    return (
                        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ x: 2 }}
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
            </nav>

            {/* Logout */}
            <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
                <motion.button
                    onClick={handleLogout}
                    whileHover={{ x: 2 }}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 10px', borderRadius: '4px', cursor: 'pointer',
                        backgroundColor: 'transparent', border: 'none', color: 'var(--text-secondary)',
                    }}
                >
                    <LogOut size={16} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600 }}>Keluar</span>
                </motion.button>
            </div>
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
