// stores/contentStore.ts — Client-side in-memory cache for SPA instant navigation
'use client'

import { create } from 'zustand'
import { Module, UserModule, DailyQuest, UserDailyQuest, XPLog } from '@/types'

export interface LeaderboardUser {
    id: string
    username: string
    full_name: string | null
    school_name: string | null
    city: string | null
    avatar_class: any
    level: number
    xp: number
    streak_count: number
}

export interface SchoolRanking {
    school: string
    city: string
    totalXp: number
    members: number
}

export interface VoucherItem {
    id: string
    name: string
    description: string | null
    xp_cost: number
    voucher_value: number
    stock: number | null
    is_active: boolean
}

export interface RedemptionItem {
    id: string
    voucher_id: string
    code: string
    xp_spent: number
    voucher_value: number
    status: 'issued' | 'redeemed' | 'expired'
    created_at: string
    voucherName: string
}

interface ContentStore {
    // Dashboard Data
    quests: DailyQuest[]
    userQuests: UserDailyQuest[]
    completedModules: any[]
    xpLogs: Array<{ xp_amount: number; reason: string | null; created_at: string }>
    dashboardFetchedAt: number | null

    // Modules Data
    modules: Module[]
    userModules: UserModule[]
    modulesFetchedAt: number | null

    // Leaderboard Data
    allTimeLeaderboard: LeaderboardUser[]
    weeklyLeaderboard: LeaderboardUser[]
    schoolRanking: SchoolRanking[]
    leaderboardFetchedAt: number | null

    // Voucher Data
    vouchers: VoucherItem[]
    voucherHistory: RedemptionItem[]
    vouchersFetchedAt: number | null

    // Profile Detailed Stats
    profileBadges: any[]
    profileCompletedModules: any[]
    profileBattlesWon: number
    profileBattlesTotal: number
    profileStatsFetchedAt: number | null

    // Setters
    setDashboardData: (data: {
        quests: DailyQuest[]
        userQuests: UserDailyQuest[]
        completedModules: any[]
        xpLogs: Array<{ xp_amount: number; reason: string | null; created_at: string }>
    }) => void

    setModulesData: (data: {
        modules: Module[]
        userModules: UserModule[]
    }) => void

    setLeaderboardData: (data: {
        allTime: LeaderboardUser[]
        weekly: LeaderboardUser[]
        schoolRanking: SchoolRanking[]
    }) => void

    setVoucherData: (data: {
        vouchers: VoucherItem[]
        history: RedemptionItem[]
    }) => void

    setProfileStatsData: (data: {
        badges: any[]
        completedModules: any[]
        battlesWon: number
        battlesTotal: number
    }) => void

    // Invalidation
    invalidateDashboard: () => void
    invalidateModules: () => void
    invalidateLeaderboard: () => void
    invalidateVouchers: () => void
    invalidateProfileStats: () => void
}

export const useContentStore = create<ContentStore>((set) => ({
    quests: [],
    userQuests: [],
    completedModules: [],
    xpLogs: [],
    dashboardFetchedAt: null,

    modules: [],
    userModules: [],
    modulesFetchedAt: null,

    allTimeLeaderboard: [],
    weeklyLeaderboard: [],
    schoolRanking: [],
    leaderboardFetchedAt: null,

    vouchers: [],
    voucherHistory: [],
    vouchersFetchedAt: null,

    profileBadges: [],
    profileCompletedModules: [],
    profileBattlesWon: 0,
    profileBattlesTotal: 0,
    profileStatsFetchedAt: null,

    setDashboardData: (data) =>
        set({
            quests: data.quests,
            userQuests: data.userQuests,
            completedModules: data.completedModules,
            xpLogs: data.xpLogs,
            dashboardFetchedAt: Date.now(),
        }),

    setModulesData: (data) =>
        set({
            modules: data.modules,
            userModules: data.userModules,
            modulesFetchedAt: Date.now(),
        }),

    setLeaderboardData: (data) =>
        set({
            allTimeLeaderboard: data.allTime,
            weeklyLeaderboard: data.weekly,
            schoolRanking: data.schoolRanking,
            leaderboardFetchedAt: Date.now(),
        }),

    setVoucherData: (data) =>
        set({
            vouchers: data.vouchers,
            voucherHistory: data.history,
            vouchersFetchedAt: Date.now(),
        }),

    setProfileStatsData: (data) =>
        set({
            profileBadges: data.badges,
            profileCompletedModules: data.completedModules,
            profileBattlesWon: data.battlesWon,
            profileBattlesTotal: data.battlesTotal,
            profileStatsFetchedAt: Date.now(),
        }),

    invalidateDashboard: () => set({ dashboardFetchedAt: null }),
    invalidateModules: () => set({ modulesFetchedAt: null }),
    invalidateLeaderboard: () => set({ leaderboardFetchedAt: null }),
    invalidateVouchers: () => set({ vouchersFetchedAt: null }),
    invalidateProfileStats: () => set({ profileStatsFetchedAt: null }),
}))
