// stores/userStore.ts — Zustand User State
'use client'
import { create } from 'zustand'
import { Profile } from '@/types'
import { calculateLevel } from '@/lib/game/xp'
import { isStreakActiveToday } from '@/lib/game/streak'

interface BadgeUnlockData {
    id: string
    name: string
    description: string | null
    icon_url: string | null
}

type UserPopup =
    | { type: 'level_up'; data: { oldLevel: number; newLevel: number } }
    | { type: 'streak_up'; data: { oldStreak: number; newStreak: number } }
    | { type: 'badge_unlock'; data: BadgeUnlockData }

interface UserStore {
    profile: Profile | null
    isLoading: boolean
    activePopup: UserPopup | null
    popupQueue: UserPopup[]
    setProfile: (profile: Profile | null) => void
    setLoading: (loading: boolean) => void
    updateXP: (newTotalXp: number, options?: { newStreak?: number; newLastActive?: string | null; earnedBadges?: BadgeUnlockData[] }) => void
    enqueuePopups: (items: UserPopup[]) => void
    dismissActivePopup: () => void
}

export const useUserStore = create<UserStore>((set, get) => ({
    profile: null,
    isLoading: true,
    activePopup: null,
    popupQueue: [],

    setProfile: (incomingProfile) => {
        const { profile: currentProfile } = get()

        if (incomingProfile && currentProfile && incomingProfile.id === currentProfile.id) {
            const autoPopups: UserPopup[] = []
            if (incomingProfile.level > currentProfile.level) {
                autoPopups.push({
                    type: 'level_up',
                    data: { oldLevel: currentProfile.level, newLevel: incomingProfile.level },
                })
            }
            if (
                incomingProfile.streak_count > currentProfile.streak_count &&
                isStreakActiveToday(incomingProfile.last_active, incomingProfile.streak_count)
            ) {
                autoPopups.push({
                    type: 'streak_up',
                    data: { oldStreak: currentProfile.streak_count, newStreak: incomingProfile.streak_count },
                })
            }
            if (autoPopups.length > 0) get().enqueuePopups(autoPopups)
        }

        set({ profile: incomingProfile })
    },
    setLoading: (isLoading) => set({ isLoading }),

    updateXP: (newTotalXp: number, options) => {
        const { profile } = get()
        if (!profile) return

        const oldLevel = profile.level
        const oldStreak = profile.streak_count
        const calc = calculateLevel(newTotalXp)
        const incomingStreak = typeof options?.newStreak === 'number' ? options.newStreak : profile.streak_count
        const incomingLastActive =
            options?.newLastActive !== undefined ? options.newLastActive : profile.last_active
        const queuedPopups: UserPopup[] = []

        if (calc.level > oldLevel) {
            queuedPopups.push({
                type: 'level_up',
                data: { oldLevel, newLevel: calc.level },
            })
        }
        if (incomingStreak > oldStreak && isStreakActiveToday(incomingLastActive, incomingStreak)) {
            queuedPopups.push({
                type: 'streak_up',
                data: { oldStreak, newStreak: incomingStreak },
            })
        }

        const newBadges = options?.earnedBadges || []
        if (newBadges.length > 0) {
            queuedPopups.push(
                ...newBadges.map((badge) => ({
                    type: 'badge_unlock' as const,
                    data: badge,
                }))
            )
        }

        set({
            profile: {
                ...profile,
                xp: newTotalXp,
                level: calc.level,
                xp_to_next_level: calc.xpToNext,
                streak_count: incomingStreak,
                last_active: incomingLastActive,
            },
        })
        if (queuedPopups.length > 0) get().enqueuePopups(queuedPopups)
    },

    enqueuePopups: (items) => {
        if (items.length === 0) return
        set((state) => {
            if (!state.activePopup) {
                return {
                    activePopup: items[0],
                    popupQueue: [...state.popupQueue, ...items.slice(1)],
                }
            }
            return {
                popupQueue: [...state.popupQueue, ...items],
            }
        })
    },
    dismissActivePopup: () =>
        set((state) => {
            if (state.popupQueue.length === 0) {
                return { activePopup: null }
            }
            return {
                activePopup: state.popupQueue[0],
                popupQueue: state.popupQueue.slice(1),
            }
        }),
}))
