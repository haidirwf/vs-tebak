'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const CLASS_EMOJIS: Record<string, string> = { warrior: '⚔️', mage: '🔮', archer: '🏹', healer: '✨' }
const CLASS_COLORS: Record<string, string> = {
    warrior: 'var(--accent-red)', mage: 'var(--accent-cyan)', archer: 'var(--accent-green)', healer: 'var(--accent-gold)'
}

interface LeaderboardUser {
    id: string
    username: string
    full_name: string | null
    school_name: string | null
    city: string | null
    avatar_class: string
    level: number
    xp: number
    streak_count: number
}

interface SchoolEntry {
    school: string
    city: string
    totalXp: number
    members: number
}

interface LeaderboardClientProps {
    allTime: LeaderboardUser[]
    weekly: LeaderboardUser[]
    schoolRanking: SchoolEntry[]
    currentUserId: string | null
}

type Tab = 'all' | 'weekly' | 'school'

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }

export default function LeaderboardClient({ allTime, weekly, schoolRanking, currentUserId }: LeaderboardClientProps) {
    const [tab, setTab] = useState<Tab>('all')

    const tabs: { key: Tab; label: string }[] = [
        { key: 'all', label: 'All Time' },
        { key: 'weekly', label: 'Streak King' },
        { key: 'school', label: 'Per Sekolah' },
    ]

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
                    🏆 Leaderboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Ranking terbaik pelajar Indonesia</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {tabs.map(t => (
                    <button key={t.key} type="button" aria-pressed={tab === t.key} onClick={() => setTab(t.key)} style={{
                        padding: '8px 18px', borderRadius: '4px', cursor: 'pointer',
                        backgroundColor: tab === t.key ? 'rgba(245,197,66,0.1)' : 'var(--bg-secondary)',
                        border: `1px solid ${tab === t.key ? 'var(--accent-gold)' : 'var(--border)'}`,
                        color: tab === t.key ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600,
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* All Time / Weekly */}
            {(tab === 'all' || tab === 'weekly') && (
                <div className="card">
                    {(tab === 'all' ? allTime : weekly).map((user, i) => {
                        const isMe = user.id === currentUserId
                        return (
                            <motion.div key={user.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                    borderBottom: i < (tab === 'all' ? allTime : weekly).length - 1 ? '1px solid var(--border)' : 'none',
                                    backgroundColor: isMe ? 'rgba(245,197,66,0.05)' : 'transparent',
                                }}>
                                {/* Rank */}
                                <div style={{ width: '32px', textAlign: 'center', flexShrink: 0 }}>
                                    {MEDAL[i] ? (
                                        <span style={{ fontSize: '18px' }}>{MEDAL[i]}</span>
                                    ) : (
                                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                            {i + 1}
                                        </span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '4px', flexShrink: 0,
                                    backgroundColor: 'var(--bg-tertiary)',
                                    border: `1px solid ${CLASS_COLORS[user.avatar_class] || 'var(--border)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                                }}>
                                    {CLASS_EMOJIS[user.avatar_class] || '🎮'}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{
                                            fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700,
                                            color: isMe ? 'var(--accent-gold)' : 'var(--text-primary)',
                                        }}>
                                            {user.username}
                                        </span>
                                        {isMe && <span style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: 600 }}>YOU</span>}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {user.school_name || 'Sekolah tidak diisi'}{user.city ? `, ${user.city}` : ''}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                                        Lv.{user.level}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {tab === 'all' ? `${user.xp.toLocaleString()} XP` : `${user.streak_count} hari 🔥`}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                    {(tab === 'all' ? allTime : weekly).length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                            Belum ada data leaderboard
                        </div>
                    )}
                </div>
            )}

            {/* School Ranking */}
            {tab === 'school' && (
                <div className="card">
                    {schoolRanking.map((school, i) => (
                        <motion.div key={school.school} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                                borderBottom: i < schoolRanking.length - 1 ? '1px solid var(--border)' : 'none',
                            }}>
                            <div style={{ width: '32px', textAlign: 'center' }}>
                                {MEDAL[i] ? <span style={{ fontSize: '18px' }}>{MEDAL[i]}</span> :
                                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-muted)', fontSize: '14px' }}>{i + 1}</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700 }}>{school.school}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{school.city} · {school.members} siswa</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                                    {school.totalXp.toLocaleString()} XP
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {schoolRanking.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                            Belum ada data sekolah
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
