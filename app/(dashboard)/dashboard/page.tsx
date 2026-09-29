'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import CharacterCard from '@/components/character/CharacterCard'
import DailyQuestList from '@/components/quest/DailyQuestList'
import DashboardStats from '@/components/dashboard/DashboardStats'
import RecentActivity from '@/components/dashboard/RecentActivity'
import QuickActions from '@/components/dashboard/QuickActions'
import MotivationQuote from '@/components/dashboard/MotivationQuote'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { isStreakActiveToday } from '@/lib/game/streak'
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
                    // Graceful fallback to parallel Promise.all jika RPC belum dimigrasi
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

    const activeStreakCount = profile && isStreakActiveToday(profile.last_active, profile.streak_count)
        ? profile.streak_count
        : 0

    const dateStr = format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Welcome */}
            <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '2px' }}>
                    {dateStr}
                </p>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700 }}>
                    Selamat datang{profile ? `, ${profile.username}` : ''}! 👋
                </h1>
            </div>

            {profile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                    <CharacterCard profile={profile} showStats={true} />
                    <QuickActions />
                    <MotivationQuote />
                </div>
            )}

            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                <div>
                    <div className="card" style={{ padding: '20px' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🎭 Benefit Role
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {[
                                { name: 'Warrior', desc: '+25% XP Modul Coding', color: 'var(--accent-red)', bg: 'var(--accent-red-bg)', icon: '⚔️' },
                                { name: 'Mage', desc: '+25% XP Modul Desain', color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-bg)', icon: '🔮' },
                                { name: 'Archer', desc: '+25% XP Menang Battle', color: 'var(--accent-green)', bg: 'var(--accent-green-bg)', icon: '🏹' },
                                { name: 'Healer', desc: '+25% XP Modul Produktivitas', color: 'var(--accent-gold)', bg: 'var(--accent-gold-bg)', icon: '✨' },
                            ].map(role => {
                                const isCurrent = role.name.toLowerCase() === profile?.avatar_class
                                return (
                                    <div key={role.name} style={{
                                        padding: '12px',
                                        backgroundColor: isCurrent ? role.bg : 'var(--bg-secondary)',
                                        borderRadius: '8px',
                                        border: `1px solid ${isCurrent ? role.color : 'var(--border)'}`,
                                        position: 'relative',
                                        opacity: isCurrent ? 1 : 0.7
                                    }}>
                                        {isCurrent && (
                                            <div style={{
                                                position: 'absolute', top: '-8px', right: '8px',
                                                backgroundColor: role.color, color: '#FFFFFF',
                                                fontSize: '8px', padding: '2px 6px', borderRadius: '4px',
                                                fontWeight: 800
                                            }}>AKTIF</div>
                                        )}
                                        <div style={{ fontSize: '18px', marginBottom: '4px' }}>{role.icon}</div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: role.color, fontFamily: 'var(--font-heading)' }}>{role.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{role.desc}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div>
                    <DashboardStats
                        modulesCompleted={completedModules.length}
                        totalXp={profile?.xp || 0}
                        streak={activeStreakCount}
                        level={profile?.level || 1}
                    />
                </div>

                <div>
                    <DailyQuestList quests={quests} userQuests={userQuests} />
                </div>

                <div>
                    <RecentActivity modules={completedModules} xpLogs={xpLogs} />
                </div>
            </div>
        </div>
    )
}
