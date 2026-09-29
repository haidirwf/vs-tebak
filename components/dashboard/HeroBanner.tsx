'use client'

import { motion } from 'framer-motion'
import { Profile } from '@/types'
import { AVATAR_CLASS_STATS, getXpProgress } from '@/lib/game/xp'
import { Flame, Shield, Sparkles, MapPin, School, Swords, BookOpen, Star } from 'lucide-react'
import { isStreakActiveToday } from '@/lib/game/streak'
import Link from 'next/link'

interface HeroBannerProps {
    profile: Profile
    modulesCompletedCount: number
    onQuickStart?: () => void
}

const CLASS_CONFIG: Record<string, { color: string; bg: string; border: string; desc: string; roleBonus: string; icon: string }> = {
    warrior: {
        color: 'var(--accent-red)',
        bg: 'var(--accent-red-bg)',
        border: 'var(--accent-red-border)',
        desc: 'Pejuang Kode & Logika Algoritma',
        roleBonus: '+25% XP Modul Coding',
        icon: '⚔️',
    },
    mage: {
        color: 'var(--accent-cyan)',
        bg: 'var(--accent-cyan-bg)',
        border: 'var(--accent-cyan-border)',
        desc: 'Penyihir UI/UX & Kreativitas Digital',
        roleBonus: '+25% XP Modul Desain',
        icon: '🔮',
    },
    archer: {
        color: 'var(--accent-green)',
        bg: 'var(--accent-green-bg)',
        border: 'var(--accent-green-border)',
        desc: 'Pemanah Presisi & Penguasa Duel PvP',
        roleBonus: '+25% XP Menang Battle',
        icon: '🏹',
    },
    healer: {
        color: 'var(--accent-gold)',
        bg: 'var(--accent-gold-bg)',
        border: 'var(--accent-gold-border)',
        desc: 'Penyokong Produktivitas & Konsistensi',
        roleBonus: '+25% XP Modul Produktivitas',
        icon: '✨',
    },
}

export default function HeroBanner({ profile, modulesCompletedCount }: HeroBannerProps) {
    const classStat = AVATAR_CLASS_STATS[profile.avatar_class] || AVATAR_CLASS_STATS['warrior']
    const roleCfg = CLASS_CONFIG[profile.avatar_class] || CLASS_CONFIG['warrior']
    const isStreakActive = isStreakActiveToday(profile.last_active, profile.streak_count)

    // Calculate XP progress within current level
    let xpInLevel = profile.xp
    for (let l = 1; l < profile.level; l++) {
        xpInLevel -= Math.floor(100 * Math.pow(l, 1.5))
    }
    const currentXpProgress = Math.max(0, xpInLevel)
    const progressPercent = getXpProgress(currentXpProgress, profile.xp_to_next_level)

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`card glow-${profile.avatar_class}`}
            style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '24px',
                border: `1px solid ${roleCfg.color}40`,
                background: `linear-gradient(135deg, var(--bg-secondary) 0%, ${roleCfg.color}08 100%)`,
                borderRadius: '12px',
            }}
        >
            {/* Background Ambient Glow Orbs */}
            <div
                style={{
                    position: 'absolute',
                    top: '-60px',
                    right: '-40px',
                    width: '240px',
                    height: '240px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${roleCfg.color}25 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                    pointerEvents: 'none',
                }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
                {/* Main Profile Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        {/* Avatar Frame */}
                        <div style={{ position: 'relative' }}>
                            <motion.div
                                whileHover={{ scale: 1.06, rotate: 2 }}
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    border: `2px solid ${roleCfg.color}`,
                                    boxShadow: `0 4px 20px ${roleCfg.color}35`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '34px',
                                    cursor: 'default',
                                }}
                            >
                                {classStat.emoji}
                            </motion.div>
                            {/* Level Badge */}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '-6px',
                                    right: '-6px',
                                    backgroundColor: roleCfg.color,
                                    color: '#000000',
                                    fontWeight: 900,
                                    fontSize: '11px',
                                    padding: '2px 7px',
                                    borderRadius: '6px',
                                    fontFamily: 'var(--font-heading)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                    letterSpacing: '0.04em',
                                }}
                            >
                                LV.{profile.level}
                            </div>
                        </div>

                        {/* Hero Titles & Metadata */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <h1
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '24px',
                                        fontWeight: 800,
                                        margin: 0,
                                        color: 'var(--text-primary)',
                                        letterSpacing: '0.01em',
                                    }}
                                >
                                    {profile.username}
                                </h1>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-heading)',
                                        color: roleCfg.color,
                                        backgroundColor: roleCfg.bg,
                                        border: `1px solid ${roleCfg.border}`,
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    {classStat.label}
                                </span>
                            </div>

                            <p style={{ margin: '3px 0 6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                {roleCfg.desc} • <span style={{ color: roleCfg.color, fontWeight: 600 }}>{roleCfg.roleBonus}</span>
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                {profile.school_name && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <School size={13} style={{ color: 'var(--accent-gold)' }} />
                                        <span>{profile.school_name}</span>
                                    </div>
                                )}
                                {profile.city && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={13} style={{ color: 'var(--accent-cyan)' }} />
                                        <span>{profile.city}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Streak & Level Info Pills */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isStreakActive && (
                            <motion.div
                                whileHover={{ scale: 1.04 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--accent-red-bg)',
                                    border: '1px solid var(--accent-red-border)',
                                }}
                            >
                                <Flame size={18} style={{ color: 'var(--accent-red)' }} />
                                <div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                                        Streak
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 800, color: 'var(--accent-red)' }}>
                                        {profile.streak_count} Hari
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--accent-gold-bg)',
                                border: '1px solid var(--accent-gold-border)',
                            }}
                        >
                            <Sparkles size={18} style={{ color: 'var(--accent-gold)' }} />
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Total XP
                                </div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                                    {profile.xp.toLocaleString()} XP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar & Quick Stats Strip */}
                <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                                LEVEL PROGRESSION
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                ({currentXpProgress.toLocaleString()} / {profile.xp_to_next_level.toLocaleString()} XP)
                            </span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: roleCfg.color, fontFamily: 'var(--font-heading)' }}>
                            {progressPercent}% Menuju Level {profile.level + 1}
                        </span>
                    </div>

                    <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            style={{
                                height: '100%',
                                background: `linear-gradient(90deg, ${roleCfg.color} 0%, var(--accent-gold) 100%)`,
                                boxShadow: `0 0 12px ${roleCfg.color}60`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
