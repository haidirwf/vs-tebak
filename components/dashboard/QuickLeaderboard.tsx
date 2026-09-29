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
        <div className="card" style={{ padding: '22px', position: 'relative', overflow: 'hidden', backgroundColor: '#080808', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8.57143px',
                            backgroundColor: 'rgba(255, 72, 0, 0.12)',
                            border: '1px solid rgba(255, 72, 0, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-signal-orange)',
                        }}
                    >
                        <Trophy size={16} />
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 400, margin: 0, color: '#ffffff' }}>
                            Top Hero Nasional
                        </h3>
                        <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>Update Real-Time XP</span>
                    </div>
                </div>

                <Link
                    href="/leaderboard"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--color-signal-orange)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-inter)',
                    }}
                >
                    <span>Semua</span>
                    <ChevronRight size={13} />
                </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {TOP_PLAYERS.map((player) => (
                    <motion.div
                        key={player.rank}
                        whileHover={{ x: 2 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '12px',
                            backgroundColor: '#121212',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <span
                            style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '9999px',
                                backgroundColor: player.rank === 1 ? 'var(--color-signal-orange)' : player.rank === 2 ? '#bfbfbf' : '#808080',
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontFamily: 'var(--font-inter)',
                            }}
                        >
                            {player.rank}
                        </span>

                        <span style={{ fontSize: '16px' }}>{player.class}</span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 500, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {player.name}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-steel)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {player.school}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <span
                                style={{
                                    fontFamily: 'var(--font-inter)',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--color-signal-orange)',
                                    backgroundColor: 'rgba(255, 72, 0, 0.1)',
                                    border: '1px solid rgba(255, 72, 0, 0.3)',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
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
