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
            className="product-demo-panel"
            style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '28px',
                border: '1px solid var(--surface-border)',
                backgroundColor: 'var(--surface-card)',
                borderRadius: '25.7143px',
                boxShadow: 'var(--shadow-panel)',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', position: 'relative', zIndex: 1 }}>
                {/* Main Profile Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        {/* Avatar Frame */}
                        <div style={{ position: 'relative' }}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                style={{
                                    width: '74px',
                                    height: '74px',
                                    borderRadius: '17.1429px',
                                    backgroundColor: '#161616',
                                    border: '1px solid rgba(255, 255, 255, 0.14)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '34px',
                                    cursor: 'default',
                                }}
                            >
                                {classStat.emoji}
                            </motion.div>
                            {/* Level Badge Pill */}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    right: '-4px',
                                    backgroundColor: 'var(--color-gold)',
                                    color: '#0a0a0a',
                                    fontWeight: 600,
                                    fontSize: '11px',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    fontFamily: 'var(--font-inter)',
                                    letterSpacing: '0.04em',
                                    boxShadow: 'var(--shadow-gold)',
                                    border: '1px solid rgba(245, 197, 66, 0.4)',
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
                                        fontSize: '26px',
                                        fontWeight: 400,
                                        margin: 0,
                                        color: '#ffffff',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {profile.username}
                                </h1>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        fontFamily: 'var(--font-inter)',
                                        color: roleCfg.color,
                                        backgroundColor: roleCfg.bg,
                                        border: `1px solid ${roleCfg.border}`,
                                        padding: '2px 10px',
                                        borderRadius: '9999px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    {classStat.label}
                                </span>
                            </div>

                            <p style={{ margin: '4px 0 8px', fontSize: '13px', color: 'var(--color-fog)' }}>
                                {roleCfg.desc} • <span style={{ color: roleCfg.color, fontWeight: 500 }}>{roleCfg.roleBonus}</span>
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--color-steel)' }}>
                                {profile.school_name && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <School size={13} style={{ color: 'var(--color-gold)' }} />
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        {/* Kalender 7 Hari Duolingo */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                backgroundColor: '#141414',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '17.1429px',
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
                                            gap: '4px',
                                            minWidth: '32px',
                                        }}
                                    >
                                        {/* Nama Hari */}
                                        <span
                                            style={{
                                                fontFamily: 'var(--font-inter)',
                                                fontSize: '10px',
                                                fontWeight: day.isToday ? 600 : 400,
                                                color: day.isToday ? 'var(--color-signal-orange)' : 'var(--color-steel)',
                                                letterSpacing: '0.5px',
                                            }}
                                        >
                                            {day.dayName}
                                        </span>

                                        {/* Flame Box Indicator */}
                                        <div
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '8.57143px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: isLit
                                                    ? 'rgba(245, 197, 66, 0.15)'
                                                    : isTodayPending
                                                    ? 'rgba(245, 197, 66, 0.06)'
                                                    : 'rgba(255, 255, 255, 0.03)',
                                                border: isLit
                                                    ? '1px solid rgba(245, 197, 66, 0.5)'
                                                    : isTodayPending
                                                    ? '1.5px dashed var(--color-gold)'
                                                    : '1px solid rgba(255, 255, 255, 0.08)',
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
                                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-steel)' }} />
                                            ) : (
                                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                                            )}
                                        </div>

                                        {/* Nomor Tanggal */}
                                        <span
                                            style={{
                                                fontFamily: 'var(--font-inter)',
                                                fontSize: '10px',
                                                fontWeight: day.isToday ? 600 : 400,
                                                color: day.isToday ? 'var(--color-gold)' : day.hasActivity ? '#ffffff' : 'var(--color-steel)',
                                            }}
                                        >
                                            {day.dayNumber}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Total XP Badge Pill */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 16px',
                                borderRadius: '9999px',
                                backgroundColor: 'rgba(245, 197, 66, 0.1)',
                                border: '1px solid rgba(245, 197, 66, 0.35)',
                                height: 'fit-content',
                                boxShadow: '0 0 16px rgba(245, 197, 66, 0.15)',
                            }}
                        >
                            <Sparkles size={16} style={{ color: 'var(--color-gold)' }} />
                            <div>
                                <div style={{ fontSize: '9px', color: 'var(--color-steel)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    TOTAL XP
                                </div>
                                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600, color: 'var(--color-gold)' }}>
                                    {profile.xp.toLocaleString()} XP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar & Quick Stats Strip */}
                <div style={{ backgroundColor: '#141414', borderRadius: '17.1429px', padding: '16px 20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-inter)', color: '#ffffff', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                LEVEL PROGRESSION
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--color-steel)' }}>
                                ({currentXpProgress.toLocaleString()} / {profile.xp_to_next_level.toLocaleString()} XP)
                            </span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: roleCfg.color, fontFamily: 'var(--font-inter)' }}>
                            {progressPercent}% Menuju Level {profile.level + 1}
                        </span>
                    </div>

                    <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            style={{
                                height: '100%',
                                background: `linear-gradient(90deg, ${roleCfg.color} 0%, var(--color-gold) 100%)`,
                                boxShadow: `0 0 12px ${roleCfg.color}60`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
