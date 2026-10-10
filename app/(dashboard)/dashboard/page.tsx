'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GameLobbyStage from '@/components/dashboard/GameLobbyStage'
import DailyQuestList from '@/components/quest/DailyQuestList'
import RecentActivity from '@/components/dashboard/RecentActivity'
import QuickLeaderboard from '@/components/dashboard/QuickLeaderboard'
import LearningAnalytics from '@/components/dashboard/LearningAnalytics'
import { format } from 'date-fns'
import { useUserStore } from '@/stores/userStore'
import { useContentStore } from '@/stores/contentStore'
import { createClient } from '@/lib/supabase/client'
import { Module, UserModule } from '@/types'

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
        modules,
        userModules,
        setModulesData,
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

                // Fetch modules and user_modules in parallel if not yet cached
                const shouldFetchModules = !modules || modules.length === 0
                const modulesPromise = shouldFetchModules
                    ? Promise.all([
                        supabase
                            .from('modules')
                            .select('id, slug, title, description, category, difficulty, xp_reward, duration_minutes, is_published, created_at')
                            .eq('is_published', true)
                            .order('created_at'),
                        supabase
                            .from('user_modules')
                            .select('id, user_id, module_id, status, progress_percent, completed_at, xp_granted_at')
                            .eq('user_id', user.id),
                    ])
                    : null

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

                // Hydrate modules in content store if fetched
                if (modulesPromise) {
                    const [modRes, userModRes] = await modulesPromise
                    if (modRes.data) {
                        setModulesData({
                            modules: modRes.data as Module[],
                            userModules: (userModRes.data || []) as UserModule[],
                        })
                    }
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
    }, [today, dashboardFetchedAt, setDashboardData, setModulesData, modules, router])

    return (
        <div className="responsive-page" style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', minWidth: 0, paddingBottom: '32px' }}>
            {/* 1. Game Lobby Stage & Trio Action Deck */}
            {profile ? (
                <GameLobbyStage
                    profile={profile}
                    modulesCompletedCount={completedModules.length}
                    xpLogs={xpLogs}
                    modules={modules}
                    userModules={userModules}
                />
            ) : (
                <div
                    className="card"
                    style={{
                        height: '280px',
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '14px',
                    }}
                />
            )}

            {/* 2. Header Seksi & Grid Dua Kolom Gamified (Misi & Aktivitas) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', marginBottom: '-8px', padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '4px', height: '18px', borderRadius: '2px', backgroundColor: 'var(--brand-primary)' }} />
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        Misi Harian & Aktivitas Petualang
                    </h2>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Pembaruan Realtime
                </span>
            </div>

            <div className="two-col-grid" style={{ display: 'grid', gap: '24px', alignItems: 'start', width: '100%', minWidth: 0 }}>
                {/* Kolom Kiri: Misi Harian & Aktivitas XP Terbaru */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', minWidth: 0 }}>
                    <DailyQuestList quests={quests} userQuests={userQuests} />
                    <RecentActivity modules={completedModules} xpLogs={xpLogs} />
                </div>

                {/* Kolom Kanan: Diagram Analisa & Top Hero Leaderboard */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', minWidth: 0 }}>
                    <LearningAnalytics
                        completedModules={completedModules}
                        xpLogs={xpLogs}
                        totalXp={profile?.xp || 0}
                        level={profile?.level || 1}
                    />
                    <QuickLeaderboard
                        currentUserId={profile?.id}
                        userStreak={profile?.streak_count}
                    />
                </div>
            </div>
        </div>
    )
}
