'use client'

import { motion } from 'framer-motion'
import { Profile } from '@/types'
import { AVATAR_CLASS_STATS, getXpProgress } from '@/lib/game/xp'
import { Flame } from 'lucide-react'
import { isStreakActiveToday } from '@/lib/game/streak'

interface CharacterCardProps {
    profile: Profile
    showStats?: boolean
}

const CLASS_COLORS: Record<string, string> = {
    warrior: 'var(--accent-red)',
    mage: 'var(--accent-cyan)',
    archer: 'var(--accent-green)',
    healer: 'var(--accent-gold)',
}

export default function CharacterCard({ profile, showStats = true }: CharacterCardProps) {
    const classStat = AVATAR_CLASS_STATS[profile.avatar_class]
    const accentColor = CLASS_COLORS[profile.avatar_class]

    // Calculate XP progress within current level
    let xpInLevel = profile.xp
    for (let l = 1; l < profile.level; l++) {
        xpInLevel -= Math.floor(100 * Math.pow(l, 1.5))
    }
    const xpProgress = getXpProgress(Math.max(0, xpInLevel), profile.xp_to_next_level)

    return (
        <div className="card" style={{ padding: '20px', border: `1px solid ${accentColor}22` }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
                {/* Avatar */}
                <div style={{
                    width: '64px', height: '64px', borderRadius: '4px', flexShrink: 0,
                    backgroundColor: 'var(--bg-tertiary)',
                    border: `2px solid ${accentColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', position: 'relative',
                }}>
                    {classStat.emoji}
                    {/* Level badge */}
                    <div style={{
                        position: 'absolute', bottom: '-8px', right: '-8px',
                        backgroundColor: accentColor, color: 'var(--bg-primary)',
                        borderRadius: '3px', padding: '1px 5px',
                        fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 700,
                    }}>
                        {profile.level}
                    </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, marginBottom: '2px' }}>
                        {profile.username}
                    </div>
                    <div style={{ fontSize: '12px', color: accentColor, fontWeight: 600, marginBottom: '4px' }}>
                        {classStat.label} — Level {profile.level}
                    </div>
                    {profile.school_name && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {profile.school_name}, {profile.city}
                        </div>
                    )}
                </div>

                {/* Streak */}
                {isStreakActiveToday(profile.last_active, profile.streak_count) && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        backgroundColor: 'rgba(232,64,64,0.1)', border: '1px solid rgba(232,64,64,0.3)',
                        borderRadius: '4px', padding: '4px 8px',
                    }}>
                        <Flame size={12} style={{ color: 'var(--accent-red)' }} />
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--accent-red)' }}>
                            {profile.streak_count}
                        </span>
                    </div>
                )}
            </div>

            {/* XP Bar */}
            <div style={{ marginBottom: showStats ? '16px' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        XP Progress
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                        {Math.max(0, xpInLevel)} / {profile.xp_to_next_level} XP
                    </span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        style={{ height: '100%', backgroundColor: 'var(--accent-gold)', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ textAlign: 'right', marginTop: '3px', fontSize: '10px', color: 'var(--text-muted)' }}>
                    {xpProgress}% ke Level {profile.level + 1}
                </div>
            </div>

            {/* Stats */}
            {showStats && (
                <div className="four-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                        { label: 'STR', value: classStat.str },
                        { label: 'INT', value: classStat.int },
                        { label: 'AGI', value: classStat.agi },
                        { label: 'WIS', value: classStat.wis },
                    ].map((stat) => (
                        <div key={stat.label} style={{
                            backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', padding: '8px',
                            textAlign: 'center', border: '1px solid var(--border)',
                        }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{stat.label}</div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: accentColor }}>
                                {stat.value + Math.floor(profile.level / 3)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
