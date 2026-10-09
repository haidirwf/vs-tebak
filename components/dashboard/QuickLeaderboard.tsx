'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useContentStore } from '@/stores/contentStore'

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

function getInitialPlayers(): TopPlayerItem[] {
    const cached = useContentStore.getState().allTimeLeaderboard
    if (cached && cached.length > 0) {
        return cached.slice(0, 4).map((p, idx) => ({
            rank: idx + 1,
            username: p.username,
            name: p.full_name || p.username,
            class: CLASS_EMOJIS[p.avatar_class] || '⚔️',
            xp: (p.xp || 0).toLocaleString(),
            school: p.school_name || 'Sekolah Indonesia',
        }))
    }
    return FALLBACK_PLAYERS
}

function QuickLeaderboard({ userStreak = 0 }: QuickLeaderboardProps) {
    const [players, setPlayers] = useState<TopPlayerItem[]>(getInitialPlayers)

    useEffect(() => {
        const { allTimeLeaderboard, leaderboardFetchedAt } = useContentStore.getState()
        if (allTimeLeaderboard && allTimeLeaderboard.length > 0 && leaderboardFetchedAt && (Date.now() - leaderboardFetchedAt < 60_000)) {
            // Already fresh from content store cache
            return
        }

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
        <div className="card" style={{ padding: '22px', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--accent-gold-bg)',
                            border: '1px solid var(--accent-gold-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-gold-text)',
                            flexShrink: 0,
                        }}
                    >
                        <Trophy size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Top Hero Pelajar
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Peringkat mingguan tertinggi</span>
                    </div>
                </div>

                <Link
                    href="/leaderboard"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--color-gold-text)',
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
                            whileHover={{ x: 2 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '9px 12px',
                                borderRadius: '10px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                                minWidth: 0,
                                cursor: 'pointer',
                                transition: 'background-color 0.15s ease, border-color 0.15s ease',
                            }}
                        >
                            <span
                                style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '6px',
                                    backgroundColor: player.rank === 1 ? 'var(--brand-primary)' : player.rank === 2 ? '#d4d4d8' : '#e4e4e7',
                                    border: player.rank === 1 ? '1px solid var(--brand-primary-border)' : '1px solid transparent',
                                    color: player.rank === 1 ? 'var(--brand-primary-text)' : '#4a4b4c',
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
                                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {player.name}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {player.school}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-inter)',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: 'var(--color-gold-text)',
                                        backgroundColor: 'var(--accent-gold-bg)',
                                        border: '1px solid var(--accent-gold-border)',
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

export default React.memo(QuickLeaderboard)

