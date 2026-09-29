'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeroBanner from '@/components/dashboard/HeroBanner'
import DailyQuestList from '@/components/quest/DailyQuestList'
import RecentActivity from '@/components/dashboard/RecentActivity'
import QuickLeaderboard from '@/components/dashboard/QuickLeaderboard'
import LearningAnalytics from '@/components/dashboard/LearningAnalytics'
import WeeklyStreakCard from '@/components/dashboard/WeeklyStreakCard'
import { format } from 'date-fns'
import { useUserStore } from '@/stores/userStore'
import { useContentStore } from '@/stores/contentStore'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
    const router = useRouter()
    const { profile } = useUserStore()
    const {
        quests,
        userQuests,
        completedModules,
        xpLogs,
        dashboardFetchedAt,
        setDashboardData,
    } = useContentStore()

    const [isFetching, setIsFetching] = useState(!dashboardFetchedAt)
    const today = format(new Date(), 'yyyy-MM-dd')

    useEffect(() => {
        const supabase = createClient()

        async function fetchDashboard() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setIsFetching(false)
                return
            }

            try {
                const t0 = performance.now()
                const { data: rpcData, error: rpcError } = await supabase
                    .rpc('get_dashboard_summary', { p_user_id: user.id, p_today: today })

                if (!rpcError && rpcData) {
                    if (process.env.NODE_ENV !== 'production') {
                        console.log(`[PERF] Dashboard RPC (1 roundtrip): ${(performance.now() - t0).toFixed(1)}ms`)
                    }
                    setDashboardData({
                        quests: rpcData.quests || [],
                        userQuests: rpcData.user_quests || [],
                        completedModules: rpcData.completed_modules || [],
                        xpLogs: rpcData.xp_logs || [],
                    })
                } else {
                    // Graceful fallback to parallel PostgREST queries
                    if (process.env.NODE_ENV !== 'production' && rpcError) {
                        console.warn('[PERF] Falling back to parallel PostgREST queries:', rpcError.message)
                    }
                    const [questsRes, userModulesRes, xpLogRes, userQuestsRes] = await Promise.all([
                        supabase
                            .from('daily_quests')
                            .select('id, title, description, quest_type, target_value, xp_reward, date')
                            .eq('date', today),
                        supabase
                            .from('user_modules')
                            .select('completed_at, modules(title, category, xp_reward)')
                            .eq('user_id', user.id)
                            .eq('status', 'completed')
                            .order('completed_at', { ascending: false })
                            .limit(5),
                        supabase
                            .from('xp_logs')
                            .select('xp_amount, reason, created_at')
                            .eq('user_id', user.id)
                            .order('created_at', { ascending: false })
                            .limit(10),
                        supabase
                            .from('user_daily_quests')
                            .select('id, user_id, quest_id, current_value, is_completed, date')
                            .eq('user_id', user.id)
                            .eq('date', today),
                    ])

                    setDashboardData({
                        quests: questsRes.data || [],
                        userQuests: userQuestsRes.data || [],
                        completedModules: userModulesRes.data || [],
                        xpLogs: xpLogRes.data || [],
                    })
                }
            } catch (err) {
                console.error('Error loading dashboard data:', err)
            } finally {
                setIsFetching(false)
            }
        }

        // Cache 60 seconds stale-while-revalidate
        const isStale = !dashboardFetchedAt || Date.now() - dashboardFetchedAt > 60_000
        if (isStale) {
            fetchDashboard()
        } else {
            setIsFetching(false)
        }
    }, [today, dashboardFetchedAt, setDashboardData, router])

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Header Hero Banner (Profil, Avatar, Kelas RPG, Level Progress) */}
            {profile && (
                <HeroBanner
                    profile={profile}
                    modulesCompletedCount={completedModules.length}
                />
            )}

            {/* 2. Strip Kalender Streak 7 Hari Bergaya Duolingo di Atas */}
            <WeeklyStreakCard
                lastActive={profile?.last_active}
                streakCount={profile?.streak_count}
                xpLogs={xpLogs}
            />

            {/* 3. Diagram Analisa Pembelajaran (Grafik Bar XP 7 Hari & Penguasaan Kategori Modul) */}
            <div>
                <LearningAnalytics
                    completedModules={completedModules}
                    xpLogs={xpLogs}
                    totalXp={profile?.xp || 0}
                    level={profile?.level || 1}
                />
            </div>

            {/* 4. Grid Dua Kolom Utama (Quest Harian & Aktivitas di Kiri, Top Hero Leaderboard di Kanan) */}
            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '20px', alignItems: 'start' }}>
                {/* Kolom Kiri: Quest Harian & Aktivitas XP Terbaru */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <DailyQuestList quests={quests} userQuests={userQuests} />
                    <RecentActivity modules={completedModules} xpLogs={xpLogs} />
                </div>

                {/* Kolom Kanan: Top Hero Leaderboard */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <QuickLeaderboard
                        currentUserId={profile?.id}
                        userStreak={profile?.streak_count}
                    />
                </div>
            </div>
        </div>
    )
}
