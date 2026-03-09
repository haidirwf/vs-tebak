// stores/userStore.ts — Zustand User State
'use client'
import { create } from 'zustand'
import { Profile } from '@/types'
import { calculateLevel } from '@/lib/game/xp'

interface UserStore {
    profile: Profile | null
    isLoading: boolean
    levelUpData: { oldLevel: number; newLevel: number } | null
    setProfile: (profile: Profile | null) => void
    setLoading: (loading: boolean) => void
    updateXP: (newTotalXp: number) => void
    dismissLevelUp: () => void
}

export const useUserStore = create<UserStore>((set, get) => ({
    profile: null,
    isLoading: true,
    levelUpData: null,

    setProfile: (profile) => set({ profile }),
    setLoading: (isLoading) => set({ isLoading }),

    updateXP: (newTotalXp: number) => {
        const { profile } = get()
        if (!profile) return

        const oldLevel = profile.level
        const calc = calculateLevel(newTotalXp)

        if (calc.level > oldLevel) {
            set({ levelUpData: { oldLevel, newLevel: calc.level } })
        }

        set({
            profile: {
                ...profile,
                xp: newTotalXp,
                level: calc.level,
                xp_to_next_level: calc.xpToNext,
            },
        })
    },

    dismissLevelUp: () => set({ levelUpData: null }),
}))
