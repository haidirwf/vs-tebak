'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Profile } from '@/types'
import { AVATAR_CLASS_STATS, getXpProgress } from '@/lib/game/xp'
import { Flame, Sparkles, MapPin, School } from 'lucide-react'
import { startOfWeek, addDays, format, differenceInCalendarDays, parseISO, isSameDay } from 'date-fns'

interface HeroBannerProps {
    profile: Profile
    modulesCompletedCount: number
    onQuickStart?: () => void
    xpLogs?: Array<{ xp_amount: number; reason: string | null; created_at: string }>
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

export default function HeroBanner({ profile, modulesCompletedCount, xpLogs = [] }: HeroBannerProps) {
    const classStat = AVATAR_CLASS_STATS[profile.avatar_class] || AVATAR_CLASS_STATS['warrior']
    const roleCfg = CLASS_CONFIG[profile.avatar_class] || CLASS_CONFIG['warrior']

    // Calculate XP progress within current level
    let xpInLevel = profile.xp
    for (let l = 1; l < profile.level; l++) {
        xpInLevel -= Math.floor(100 * Math.pow(l, 1.5))
    }
    const currentXpProgress = Math.max(0, xpInLevel)
    const progressPercent = getXpProgress(currentXpProgress, profile.xp_to_next_level)

    // 7-day Duolingo-style streak calendar data
    const weekDays = useMemo(() => {
        const now = new Date()
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Senin = 1

        const activeDates = new Set<string>()
        for (const log of xpLogs) {
            if (log.created_at) {
                activeDates.add(log.created_at.slice(0, 10))
            }
        }

        if (profile.last_active && profile.streak_count > 0) {
            try {
                const lastActiveDate = parseISO(profile.last_active)
                const daysSinceLastActive = differenceInCalendarDays(now, lastActiveDate)
                if (daysSinceLastActive <= 1) {
                    for (let i = 0; i < profile.streak_count; i++) {
                        const d = addDays(lastActiveDate, -i)
                        activeDates.add(format(d, 'yyyy-MM-dd'))
                    }
                }
            } catch {
                // Ignore parse errors
            }
        }

        const daysLabels = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN']
        const days = []

        for (let i = 0; i < 7; i++) {
            const dayDate = addDays(weekStart, i)
            const dateStr = format(dayDate, 'yyyy-MM-dd')
            const isToday = isSameDay(dayDate, now)
            const isPast = dayDate < now && !isToday
            const hasActivity = activeDates.has(dateStr)

            days.push({
                dateStr,
                dayName: daysLabels[i],
                dayNumber: format(dayDate, 'd'),
                isToday,
                isPast,
                hasActivity,
            })
        }

        return days
    }, [profile.last_active, profile.streak_count, xpLogs])

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '24px',
                border: '1px solid var(--surface-border)',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '8px',
            }}
        >

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
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--surface-elevated)',
                                    border: '1px solid var(--surface-border)',
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
                                    bottom: '-4px',
                                    right: '-4px',
                                    backgroundColor: 'var(--color-gold)',
                                    color: '#0a0a0a',
                                    fontWeight: 700,
                                    fontSize: '11px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontFamily: 'var(--font-mono)',
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

                    {/* Kanan: Kalender Streak 7 Hari Duolingo & Total XP */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {/* Kalender 7 Hari Duolingo */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '8px',
                            }}
                        >
                            {weekDays.map((day) => {
                                const isLit = day.hasActivity
                                const isTodayPending = day.isToday && !day.hasActivity

                                return (
                                    <div
                                        key={day.dateStr}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '3px',
                                            minWidth: '32px',
                                        }}
                                    >
                                        {/* Nama Hari */}
                                        <span
                                            style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '9.5px',
                                                fontWeight: day.isToday ? 700 : 500,
                                                color: day.isToday ? 'var(--color-gold)' : 'var(--color-ash)',
                                                letterSpacing: '0.3px',
                                            }}
                                        >
                                            {day.dayName}
                                        </span>

                                        {/* Flame Box Indicator */}
                                        <div
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '5px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: isLit
                                                    ? 'rgba(245, 197, 66, 0.14)'
                                                    : isTodayPending
                                                    ? 'rgba(245, 197, 66, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.02)',
                                                border: isLit
                                                    ? '1px solid rgba(245, 197, 66, 0.45)'
                                                    : isTodayPending
                                                    ? '1.5px dashed var(--color-gold)'
                                                    : '1px solid var(--surface-border)',
                                            }}
                                        >
                                            {isLit ? (
                                                <Flame size={15} fill="var(--color-gold)" style={{ color: 'var(--color-gold)' }} />
                                            ) : isTodayPending ? (
                                                <motion.div
                                                    animate={{ opacity: [0.35, 0.9, 0.35] }}
                                                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                                                    style={{ display: 'flex' }}
                                                >
                                                    <Flame size={14} style={{ color: 'var(--color-gold)' }} />
                                                </motion.div>
                                            ) : day.isPast ? (
                                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-smoke)' }} />
                                            ) : (
                                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                                            )}
                                        </div>

                                        {/* Nomor Tanggal */}
                                        <span
                                            style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '9.5px',
                                                fontWeight: day.isToday ? 700 : 400,
                                                color: day.isToday ? 'var(--color-gold)' : day.hasActivity ? 'var(--color-bone)' : 'var(--color-ash)',
                                            }}
                                        >
                                            {day.dayNumber}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Total XP Badge */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--accent-gold-bg)',
                                border: '1px solid var(--accent-gold-border)',
                                height: 'fit-content',
                            }}
                        >
                            <Sparkles size={18} style={{ color: 'var(--accent-gold)' }} />
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Total XP
                                </div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 800, color: 'var(--accent-gold)' }}>
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
