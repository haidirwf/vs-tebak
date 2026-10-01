'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface QuickLeaderboardProps {
    currentUserId?: string
    userStreak?: number
}

const CLASS_EMOJIS: Record<string, string> = {
    warrior: '⚔️',
    mage: '🔮',
    archer: '🏹',
    healer: '✨',
}

interface TopPlayerItem {
    rank: number
    username: string
    name: string
    class: string
    xp: string
    school: string
}

const FALLBACK_PLAYERS: TopPlayerItem[] = [
    { rank: 1, username: 'Rayhan_Mage', name: 'Rayhan_Mage', class: '🔮', xp: '18,450', school: 'SMKN 1 Bandung' },
    { rank: 2, username: 'Siti_Dev', name: 'Siti_Dev', class: '⚔️', xp: '16,200', school: 'SMAN 3 Jakarta' },
    { rank: 3, username: 'Budi_Pixel', name: 'Budi_Pixel', class: '🏹', xp: '15,100', school: 'SMK Telkom Malang' },
]

export default function QuickLeaderboard({ userStreak = 0 }: QuickLeaderboardProps) {
    const [players, setPlayers] = useState<TopPlayerItem[]>(FALLBACK_PLAYERS)

    useEffect(() => {
        const supabase = createClient()

        async function fetchTopStudents() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_class, xp, school_name')
                    .order('xp', { ascending: false })
                    .limit(4)

                if (!error && data && data.length > 0) {
                    setPlayers(
                        data.map((p, idx) => ({
                            rank: idx + 1,
                            username: p.username,
                            name: p.username,
                            class: CLASS_EMOJIS[p.avatar_class] || '⚔️',
                            xp: (p.xp || 0).toLocaleString(),
                            school: p.school_name || 'Sekolah Indonesia',
                        }))
                    )
                }
            } catch {
                // Keep fallback players on network error
            }
        }

        fetchTopStudents()
    }, [])

    return (
        <div className="card" style={{ padding: '22px', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(245, 197, 66, 0.12)',
                            border: '1px solid rgba(245, 197, 66, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-gold)',
                            flexShrink: 0,
                        }}
                    >
                        <Trophy size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 500, margin: 0, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Top Hero Pelajar
                        </h3>
                        <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>Peringkat mingguan tertinggi</span>
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
                        whiteSpace: 'nowrap',
                    }}
                >
                    <span>Semua</span>
                    <ChevronRight size={13} />
                </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {players.map((player) => (
                    <Link
                        key={player.rank}
                        href={`/pelajar/${encodeURIComponent(player.username)}`}
                        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                    >
                        <motion.div
                            whileHover={{ x: 3, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 10px',
                                borderRadius: '10px',
                                backgroundColor: '#121212',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                minWidth: 0,
                                cursor: 'pointer',
                                transition: 'background-color 0.15s ease',
                            }}
                        >
                            <span
                                style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '6px',
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

                            <span style={{ fontSize: '16px', flexShrink: 0 }}>{player.class}</span>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12.5px', fontWeight: 500, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {player.name}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {player.school}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-inter)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: 'var(--color-gold)',
                                        backgroundColor: 'rgba(245, 197, 66, 0.1)',
                                        border: '1px solid rgba(245, 197, 66, 0.3)',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {player.xp} XP
                                </span>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
