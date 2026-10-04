// lib/game/streak.ts — Daily Streak System

import { differenceInCalendarDays, parseISO, format } from 'date-fns'

export interface StreakStatus {
    isActive: boolean
    streakCount: number
    lastActive: string | null
    shouldUpdate: boolean
}

export function getTodayDateString(): string {
    try {
        return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
    } catch {
        return format(new Date(), 'yyyy-MM-dd')
    }
}

/**
 * Menghitung selisih hari kalender antara hari ini dan tanggal terakhir aktif.
 * Mengembalikan Infinity jika lastActive tidak ada atau invalid.
 */
export function getDaysSinceLastActive(lastActive: string | null): number {
    if (!lastActive) return Infinity

    try {
        const todayStr = getTodayDateString()
        const lastDateStr = lastActive.slice(0, 10)
        const todayDate = parseISO(todayStr)
        const lastDate = parseISO(lastDateStr)
        return differenceInCalendarDays(todayDate, lastDate)
    } catch {
        return Infinity
    }
}

/**
 * Menentukan apakah streak sudah harus di-reset ke 0 karena melewatkan minimal 1 hari penuh.
 */
export function shouldResetStreak(lastActive: string | null, currentStreak: number): boolean {
    if (currentStreak <= 0) return false
    const daysDiff = getDaysSinceLastActive(lastActive)
    return daysDiff > 1
}

/**
 * Mengambil jumlah streak efektif.
 * Jika user melewatkan 1 hari atau lebih (daysDiff > 1), streak otomatis dianggap MATI (0).
 */
export function getEffectiveStreak(lastActive: string | null, currentStreak: number): number {
    if (!lastActive || currentStreak <= 0) return 0
    if (shouldResetStreak(lastActive, currentStreak)) return 0
    return currentStreak
}

/**
 * Menentukan apakah streak masih hidup (aktif hari ini ATAU aktif kemarin dan menunggu aksi hari ini).
 */
export function isStreakAlive(lastActive: string | null, currentStreak: number): boolean {
    return getEffectiveStreak(lastActive, currentStreak) > 0
}

/**
 * Menentukan apakah user sudah menyelesaikan aktivitas streak HARI INI.
 */
export function isStreakActiveToday(lastActive: string | null, currentStreak: number): boolean {
    if (!lastActive || currentStreak <= 0) return false
    const daysDiff = getDaysSinceLastActive(lastActive)
    return daysDiff <= 0
}

/**
 * Menentukan apakah streak masih hidup dari kemarin tapi BELUM ada aktivitas hari ini.
 */
export function isStreakPendingToday(lastActive: string | null, currentStreak: number): boolean {
    if (!lastActive || currentStreak <= 0) return false
    const daysDiff = getDaysSinceLastActive(lastActive)
    return daysDiff === 1
}

export function checkStreakStatus(lastActive: string | null, currentStreak: number): StreakStatus {
    const today = getTodayDateString()

    if (!lastActive) {
        return {
            // Aktivitas pertama memulai streak di hari ke-1.
            isActive: true,
            streakCount: 1,
            lastActive: today,
            shouldUpdate: true,
        }
    }

    const daysDiff = getDaysSinceLastActive(lastActive)

    if (daysDiff <= 0) {
        // Sudah aktif hari ini
        const effectiveCount = Math.max(1, currentStreak)
        return {
            isActive: true,
            streakCount: effectiveCount,
            lastActive,
            shouldUpdate: currentStreak !== effectiveCount,
        }
    } else if (daysDiff === 1) {
        // Melanjutkan streak dari kemarin
        const baseStreak = currentStreak > 0 ? currentStreak : 0
        return {
            isActive: true,
            streakCount: baseStreak + 1,
            lastActive: today,
            shouldUpdate: true,
        }
    } else {
        // Streak mati/terputus; mulai streak baru hari ini = 1.
        return {
            isActive: true,
            streakCount: 1,
            lastActive: today,
            shouldUpdate: true,
        }
    }
}

export const STREAK_MILESTONES = [
    { days: 7, badge: 'streak_week', reward: 50, title: 'Seminggu Konsisten' },
    { days: 30, badge: 'streak_month', reward: 200, title: 'Sebulan Setia' },
    { days: 100, badge: 'streak_century', reward: 500, title: 'Legenda' },
]

export function getStreakMilestone(streakCount: number) {
    return STREAK_MILESTONES.filter(m => m.days === streakCount)
}
