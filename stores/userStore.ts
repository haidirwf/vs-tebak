// stores/userStore.ts — Zustand User State
'use client'
import { create } from 'zustand'
import { Profile } from '@/types'
import { calculateLevel } from '@/lib/game/xp'

interface BadgeUnlockData {
    id: string
    name: string
    description: string | null
    icon_url: string | null
}

interface UserStore {
    profile: Profile | null
    isLoading: boolean
    levelUpData: { oldLevel: number; newLevel: number } | null
    streakUpData: { oldStreak: number; newStreak: number } | null
    badgeUnlockData: BadgeUnlockData | null
    badgeUnlockQueue: BadgeUnlockData[]
    setProfile: (profile: Profile | null) => void
    setLoading: (loading: boolean) => void
    updateXP: (newTotalXp: number, options?: { newStreak?: number; earnedBadges?: BadgeUnlockData[] }) => void
    dismissLevelUp: () => void
    dismissStreakUp: () => void
    dismissBadgeUnlock: () => void
}

export const useUserStore = create<UserStore>((set, get) => ({
    profile: null,
    isLoading: true,
    levelUpData: null,
    streakUpData: null,
    badgeUnlockData: null,
    badgeUnlockQueue: [],

    setProfile: (incomingProfile) => {
        const { profile: currentProfile } = get()

        // Trigger level-up modal when profile is refreshed with a higher level.
        if (
            incomingProfile &&
            currentProfile &&
            incomingProfile.id === currentProfile.id &&
            incomingProfile.level > currentProfile.level
        ) {
            set({
                profile: incomingProfile,
                levelUpData: { oldLevel: currentProfile.level, newLevel: incomingProfile.level },
                streakUpData:
                    incomingProfile.streak_count > currentProfile.streak_count
                        ? { oldStreak: currentProfile.streak_count, newStreak: incomingProfile.streak_count }
                        : null,
            })
            return
        }

        if (
            incomingProfile &&
            currentProfile &&
            incomingProfile.id === currentProfile.id &&
            incomingProfile.streak_count > currentProfile.streak_count
        ) {
            set({
                profile: incomingProfile,
                streakUpData: { oldStreak: currentProfile.streak_count, newStreak: incomingProfile.streak_count },
            })
            return
        }

        set({ profile: incomingProfile })
    },
    setLoading: (isLoading) => set({ isLoading }),

    updateXP: (newTotalXp: number, options) => {
        const { profile, badgeUnlockData, badgeUnlockQueue } = get()
        if (!profile) return

        const oldLevel = profile.level
        const oldStreak = profile.streak_count
        const calc = calculateLevel(newTotalXp)
        const incomingStreak = typeof options?.newStreak === 'number' ? options.newStreak : profile.streak_count

        if (calc.level > oldLevel) {
            set({ levelUpData: { oldLevel, newLevel: calc.level } })
        }
        if (incomingStreak > oldStreak) {
            set({ streakUpData: { oldStreak, newStreak: incomingStreak } })
        }

        const newBadges = options?.earnedBadges || []
        if (newBadges.length > 0) {
            if (!badgeUnlockData) {
                set({
                    badgeUnlockData: newBadges[0],
                    badgeUnlockQueue: [...badgeUnlockQueue, ...newBadges.slice(1)],
                })
            } else {
                set({
                    badgeUnlockQueue: [...badgeUnlockQueue, ...newBadges],
                })
            }
        }

        set({
            profile: {
                ...profile,
                xp: newTotalXp,
                level: calc.level,
                xp_to_next_level: calc.xpToNext,
                streak_count: incomingStreak,
            },
        })
    },

    dismissLevelUp: () => set({ levelUpData: null }),
    dismissStreakUp: () => set({ streakUpData: null }),
    dismissBadgeUnlock: () => {
        const { badgeUnlockQueue } = get()
        if (badgeUnlockQueue.length === 0) {
            set({ badgeUnlockData: null })
            return
        }
        set({
            badgeUnlockData: badgeUnlockQueue[0],
            badgeUnlockQueue: badgeUnlockQueue.slice(1),
        })
    },
}))
