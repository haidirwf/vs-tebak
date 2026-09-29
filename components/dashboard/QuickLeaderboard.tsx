'use client'

import { motion } from 'framer-motion'
import { Trophy, Flame, Zap, Award, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface QuickLeaderboardProps {
    currentUserId?: string
    userStreak?: number
}

// Sample top rankers preview for dashboard activity
const TOP_PLAYERS = [
    { rank: 1, name: 'Rayhan_Mage', class: '🔮', xp: '18,450', school: 'SMKN 1 Bandung' },
    { rank: 2, name: 'Siti_Dev', class: '⚔️', xp: '16,200', school: 'SMAN 3 Jakarta' },
    { rank: 3, name: 'Budi_Pixel', class: '🏹', xp: '15,100', school: 'SMK Telkom Malang' },
]

export default function QuickLeaderboard({ userStreak = 0 }: QuickLeaderboardProps) {
    return (
        <div className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--accent-gold-bg)',
                            border: '1px solid var(--accent-gold-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-gold)',
                        }}
                    >
                        <Trophy size={16} />
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, margin: 0 }}>
                            Top Hero Nasional
                        </h3>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Update Real-Time XP</span>
                    </div>
                </div>

                <Link
                    href="/leaderboard"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--accent-gold)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-heading)',
                    }}
                >
                    <span>Semua</span>
                    <ChevronRight size={14} />
                </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {TOP_PLAYERS.map((player) => (
                    <motion.div
                        key={player.rank}
                        whileHover={{ x: 3 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border)',
                        }}
                    >
                        <span
                            style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: player.rank === 1 ? 'var(--accent-gold)' : player.rank === 2 ? '#94A3B8' : '#D97706',
                                color: '#000000',
                                fontSize: '11px',
                                fontWeight: 900,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontFamily: 'var(--font-heading)',
                            }}
                        >
                            {player.rank}
                        </span>

                        <span style={{ fontSize: '16px' }}>{player.class}</span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {player.name}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {player.school}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <span
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    color: 'var(--accent-gold)',
                                    backgroundColor: 'rgba(245, 197, 66, 0.1)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                }}
                            >
                                {player.xp} XP
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
