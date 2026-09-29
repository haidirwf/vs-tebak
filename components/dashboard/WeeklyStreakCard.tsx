'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { startOfWeek, addDays, format, differenceInCalendarDays, parseISO, isSameDay } from 'date-fns'

interface WeeklyStreakCardProps {
    lastActive?: string | null
    streakCount?: number
    xpLogs?: Array<{ xp_amount: number; reason: string | null; created_at: string }>
}

export default function WeeklyStreakCard({
    lastActive = null,
    streakCount = 0,
    xpLogs = [],
}: WeeklyStreakCardProps) {
    const { weekDays, isTodayActive } = useMemo(() => {
        const now = new Date()
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Senin = 1

        const activeDates = new Set<string>();
        for (const log of xpLogs) {
            if (log.created_at) {
                activeDates.add(log.created_at.slice(0, 10))
            }
        }

        if (lastActive && streakCount > 0) {
            try {
                const lastActiveDate = parseISO(lastActive)
                const daysSinceLastActive = differenceInCalendarDays(now, lastActiveDate)
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

        const daysLabels = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN']
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

        return {
            weekDays: days,
            isTodayActive: todayActive,
        }
    }, [lastActive, streakCount, xpLogs])

    return (
        <div
            className="card"
            style={{
                padding: '12px 18px',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
            }}
        >
            {/* Kiri: Streak Header Minimalis */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                    style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '6px',
                        backgroundColor: isTodayActive ? 'rgba(245, 197, 66, 0.12)' : 'var(--surface-elevated)',
                        border: `1px solid ${isTodayActive ? 'rgba(245, 197, 66, 0.35)' : 'var(--surface-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isTodayActive ? 'var(--color-gold)' : 'var(--color-ash)',
                    }}
                >
                    <Flame size={18} fill={isTodayActive ? 'var(--color-gold)' : 'none'} />
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--color-bone)' }}>
                            Streak <strong style={{ color: 'var(--color-gold)' }}>{streakCount} Hari</strong>
                        </span>
                        <span
                            className="section-eyebrow"
                            style={{
                                fontSize: '10px',
                                color: isTodayActive ? 'var(--color-gold)' : 'var(--color-ash)',
                            }}
                        >
                            {isTodayActive ? '• AKTIF' : '• PENDING'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Kanan: Strip Kalender 7 Hari Duolingo Minimalis */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', overflowX: 'auto' }}>
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
                                minWidth: '38px',
                            }}
                        >
                            {/* Nama Hari (SEN, SEL, dst) */}
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    fontWeight: day.isToday ? 700 : 500,
                                    color: day.isToday ? 'var(--color-gold)' : 'var(--color-ash)',
                                    letterSpacing: '0.4px',
                                }}
                            >
                                {day.dayName}
                            </span>

                            {/* Flame Box Indicator */}
                            <motion.div
                                whileHover={{ scale: 1.08 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isLit
                                        ? 'rgba(245, 197, 66, 0.14)'
                                        : isTodayPending
                                        ? 'rgba(245, 197, 66, 0.05)'
                                        : 'var(--surface-elevated)',
                                    border: isLit
                                        ? '1px solid rgba(245, 197, 66, 0.5)'
                                        : isTodayPending
                                        ? '1.5px dashed var(--color-gold)'
                                        : '1px solid var(--surface-border)',
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
                                        <Flame size={17} fill="var(--color-gold)" style={{ color: 'var(--color-gold)' }} />
                                    </motion.div>
                                ) : isTodayPending ? (
                                    <motion.div
                                        animate={{ opacity: [0.35, 0.9, 0.35] }}
                                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <Flame size={15} style={{ color: 'var(--color-gold)' }} />
                                    </motion.div>
                                ) : day.isPast ? (
                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-smoke)' }} />
                                ) : (
                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                                )}
                            </motion.div>

                            {/* Nomor Tanggal (Satu-satunya penampil tanggal) */}
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
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
        </div>
    )
}
