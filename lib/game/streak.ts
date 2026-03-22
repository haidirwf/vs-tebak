// lib/game/streak.ts — Daily Streak System

import { differenceInCalendarDays, parseISO, format } from 'date-fns'

export interface StreakStatus {
    isActive: boolean
    streakCount: number
    lastActive: string | null
    shouldUpdate: boolean
}

export function checkStreakStatus(lastActive: string | null, currentStreak: number): StreakStatus {
    const today = format(new Date(), 'yyyy-MM-dd')

    if (!lastActive) {
        return {
            // First recorded activity starts streak at day 1.
            isActive: true,
            streakCount: 1,
            lastActive: today,
            shouldUpdate: true,
        }
    }

    const lastDate = parseISO(lastActive)
    const todayDate = parseISO(today)
    const daysDiff = differenceInCalendarDays(todayDate, lastDate)

    if (daysDiff === 0) {
        // Already active today
        return {
            isActive: true,
            streakCount: currentStreak,
            lastActive,
            shouldUpdate: false,
        }
    } else if (daysDiff === 1) {
        // Continue streak
        return {
            isActive: true,
            streakCount: currentStreak + 1,
            lastActive: today,
            shouldUpdate: true,
        }
    } else {
        // Streak broken; start a new active streak today.
        return {
            isActive: true,
            streakCount: 1,
            lastActive: today,
            shouldUpdate: true,
        }
    }
}

export function isStreakActiveToday(lastActive: string | null, currentStreak: number): boolean {
    if (!lastActive || currentStreak <= 0) return false

    const today = format(new Date(), 'yyyy-MM-dd')
    const lastDate = parseISO(lastActive)
    const todayDate = parseISO(today)
    const daysDiff = differenceInCalendarDays(todayDate, lastDate)

    return daysDiff === 0
}

export const STREAK_MILESTONES = [
    { days: 7, badge: 'streak_week', reward: 50, title: 'Seminggu Konsisten' },
    { days: 30, badge: 'streak_month', reward: 200, title: 'Sebulan Setia' },
    { days: 100, badge: 'streak_century', reward: 500, title: 'Legenda' },
]

export function getStreakMilestone(streakCount: number) {
    return STREAK_MILESTONES.filter(m => m.days === streakCount)
}
