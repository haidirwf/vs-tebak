'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame, Check, ChevronRight, Award } from 'lucide-react'
import Link from 'next/link'
import { startOfWeek, addDays, format, differenceInCalendarDays, parseISO, isSameDay } from 'date-fns'

interface WeeklyStreakCardProps {
    lastActive?: string | null
    streakCount?: number
    xpLogs?: Array<{ xp_amount: number; reason: string | null; created_at: string }>
}

const MILESTONES = [
    { target: 7, title: 'Seminggu Konsisten', reward: 50 },
    { target: 14, title: 'Dua Pekan Juara', reward: 100 },
    { target: 30, title: 'Sebulan Penuh', reward: 250 },
    { target: 60, title: 'Dua Bulan Tangguh', reward: 500 },
    { target: 100, title: 'Legenda 100 Hari', reward: 1000 },
]

export default function WeeklyStreakCard({
    lastActive = null,
    streakCount = 0,
    xpLogs = [],
}: WeeklyStreakCardProps) {
    const { weekDays, isTodayActive, nextMilestone, milestoneProgress } = useMemo(() => {
        const now = new Date()
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Senin = 1

        // Kumpulkan tanggal yang memiliki aktivitas XP nyata
        const activeDates = new Set<string>();
        for (const log of xpLogs) {
            if (log.created_at) {
                activeDates.add(log.created_at.slice(0, 10))
            }
        }

        // Sinkronisasi tanggal dari streak_count mundur dari lastActive
        if (lastActive && streakCount > 0) {
            try {
                const lastActiveDate = parseISO(lastActive)
                const daysSinceLastActive = differenceInCalendarDays(now, lastActiveDate)

                // Hanya hitung jika lastActive hari ini (0) atau kemarin (1)
                if (daysSinceLastActive <= 1) {
                    for (let i = 0; i < streakCount; i++) {
                        const d = addDays(lastActiveDate, -i)
                        activeDates.add(format(d, 'yyyy-MM-dd'))
                    }
                }
            } catch {
                // Ignore parse errors
            }
        }

        const todayStr = format(now, 'yyyy-MM-dd')
        const todayActive = activeDates.has(todayStr)

        const daysLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
        const days = []

        for (let i = 0; i < 7; i++) {
            const dayDate = addDays(weekStart, i)
            const dateStr = format(dayDate, 'yyyy-MM-dd')
            const isToday = isSameDay(dayDate, now)
            const isPast = dayDate < now && !isToday
            const isFuture = dayDate > now && !isToday
            const hasActivity = activeDates.has(dateStr)

            days.push({
                dateStr,
                dayName: daysLabels[i],
                dayNumber: format(dayDate, 'd'),
                isToday,
                isPast,
                isFuture,
                hasActivity,
            })
        }

        // Cari milestone berikutnya
        const currentStreak = streakCount || 0
        const next = MILESTONES.find(m => m.target > currentStreak) || MILESTONES[MILESTONES.length - 1]
        const prevTarget = MILESTONES.slice().reverse().find(m => m.target <= currentStreak)?.target || 0
        const range = next.target - prevTarget
        const progress = range > 0 ? Math.min(100, Math.round(((currentStreak - prevTarget) / range) * 100)) : 100

        return {
            weekDays: days,
            isTodayActive: todayActive,
            nextMilestone: next,
            milestoneProgress: progress,
        }
    }, [lastActive, streakCount, xpLogs])

    return (
        <div
            className="card"
            style={{
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
            }}
        >
            {/* Header: Judul & Status Badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                    <span className="section-eyebrow" style={{ display: 'block', marginBottom: '4px', color: 'var(--color-ash)' }}>
                        KONSISTENSI BELAJAR
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(245, 197, 66, 0.1)',
                                border: '1px solid rgba(245, 197, 66, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-gold)',
                            }}
                        >
                            <Flame size={18} />
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--color-bone)', margin: 0 }}>
                            Streak <span style={{ color: 'var(--color-gold)' }}>{streakCount} Hari</span>
                        </h3>
                    </div>
                </div>

                {/* Status Pill */}
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        backgroundColor: isTodayActive ? 'rgba(245, 197, 66, 0.1)' : 'var(--surface-elevated)',
                        border: `1px solid ${isTodayActive ? 'rgba(245, 197, 66, 0.35)' : 'var(--surface-border)'}`,
                        color: isTodayActive ? 'var(--color-gold)' : 'var(--color-ash)',
                    }}
                >
                    {isTodayActive ? (
                        <>
                            <Check size={12} style={{ color: 'var(--color-gold)' }} />
                            <span>Menyala Hari Ini</span>
                        </>
                    ) : (
                        <>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', display: 'inline-block' }} />
                            <span>Perlu Aktivitas</span>
                        </>
                    )}
                </div>
            </div>

            {/* Motivational Text */}
            <p style={{ fontSize: '13px', color: 'var(--color-ash)', marginBottom: '18px', lineHeight: 1.5 }}>
                {isTodayActive
                    ? 'Luar biasa! Apimu sudah menyala hari ini. Selesaikan kuis atau modul lagi besok untuk mempertahankan apinya.'
                    : 'Apimu belum menyala hari ini! Selesaikan 1 modul belajar atau duel kuis untuk menyalakan api hari ini.'}
            </p>

            {/* ── 7-Day Duolingo-style Streak Calendar Strip ── */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '6px',
                    padding: '12px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--surface-border)',
                    marginBottom: '18px',
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
                                gap: '6px',
                            }}
                        >
                            {/* Nama Hari */}
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    fontWeight: day.isToday ? 700 : 500,
                                    textTransform: 'uppercase',
                                    color: day.isToday ? 'var(--color-gold)' : 'var(--color-ash)',
                                    letterSpacing: '0.4px',
                                }}
                            >
                                {day.dayName}
                            </span>

                            {/* Flame / Status Indicator Circle */}
                            <motion.div
                                whileHover={{ scale: 1.08 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    backgroundColor: isLit
                                        ? 'rgba(245, 197, 66, 0.14)'
                                        : isTodayPending
                                        ? 'rgba(245, 197, 66, 0.05)'
                                        : 'var(--surface-card)',
                                    border: isLit
                                        ? '1px solid rgba(245, 197, 66, 0.5)'
                                        : isTodayPending
                                        ? '1.5px dashed var(--color-gold)'
                                        : day.isPast
                                        ? '1px solid var(--surface-border)'
                                        : '1px dashed rgba(255, 255, 255, 0.1)',
                                    color: isLit
                                        ? 'var(--color-gold)'
                                        : isTodayPending
                                        ? 'var(--color-gold)'
                                        : 'var(--color-mist)',
                                }}
                            >
                                {isLit ? (
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: [1, 1.12, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <Flame size={20} fill="var(--color-gold)" style={{ color: 'var(--color-gold)' }} />
                                    </motion.div>
                                ) : isTodayPending ? (
                                    <motion.div
                                        animate={{ opacity: [0.4, 0.9, 0.4] }}
                                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <Flame size={18} style={{ color: 'var(--color-gold)' }} />
                                    </motion.div>
                                ) : day.isPast ? (
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-smoke)' }} />
                                ) : (
                                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-mist)' }}>
                                        {day.dayNumber}
                                    </span>
                                )}
                            </motion.div>

                            {/* Tanggal / Penanda "Hari Ini" */}
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    color: day.isToday ? 'var(--color-gold)' : 'var(--color-mist)',
                                    fontWeight: day.isToday ? 600 : 400,
                                }}
                            >
                                {day.isToday ? 'Hari Ini' : day.dayNumber}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* ── Milestone Progress & Action Link ── */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--surface-border)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-ash)' }}>
                        <Award size={14} style={{ color: 'var(--color-gold)' }} />
                        <span>Target: <strong style={{ color: 'var(--color-bone)' }}>{nextMilestone.title} ({nextMilestone.target} Hari)</strong></span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-gold)' }}>
                        +{nextMilestone.reward} XP
                    </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '4px', backgroundColor: 'var(--surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${milestoneProgress}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ height: '100%', backgroundColor: 'var(--color-gold)', borderRadius: '2px' }}
                    />
                </div>

                {!isTodayActive && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <Link
                            href="/modules"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                color: 'var(--color-gold)',
                                textDecoration: 'none',
                                fontWeight: 500,
                            }}
                        >
                            <span>Nyalakan sekarang di Modul</span>
                            <ChevronRight size={13} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
