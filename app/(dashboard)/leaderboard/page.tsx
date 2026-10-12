'use client'

import { useEffect, useState } from 'react'
import LeaderboardClient from './LeaderboardClient'
import { useUserStore } from '@/stores/userStore'
import { useContentStore, LeaderboardUser, SchoolRanking } from '@/stores/contentStore'
import { createClient } from '@/lib/supabase/client'
import { getEffectiveStreak } from '@/lib/game/streak'

export default function LeaderboardPage() {
    const { profile } = useUserStore()
    const {
        allTimeLeaderboard,
        weeklyLeaderboard,
        schoolRanking,
        leaderboardFetchedAt,
        setLeaderboardData,
    } = useContentStore()

    const [isLoading, setIsLoading] = useState(!leaderboardFetchedAt)

    useEffect(() => {
        const supabase = createClient()

        async function fetchLeaderboard() {
            try {
                const [allTimeRes, weeklyRes, schoolRpcRes] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('id, username, full_name, school_name, city, avatar_class, level, xp, streak_count, last_active')
                        .order('xp', { ascending: false })
                        .limit(100),
                    supabase
                        .from('profiles')
                        .select('id, username, full_name, school_name, city, avatar_class, level, xp, streak_count, last_active')
                        .order('streak_count', { ascending: false })
                        .limit(50),
                    supabase
                        .rpc('get_school_rankings', { p_limit: 20 }),
                ])

                const rawAll = (allTimeRes.data || []) as LeaderboardUser[]
                const allUsers: LeaderboardUser[] = rawAll.map((u) => ({
                    ...u,
                    streak_count: getEffectiveStreak(u.last_active || null, u.streak_count || 0),
                }))

                const rawWeekly = (weeklyRes.data || []) as LeaderboardUser[]
                const weeklyUsers: LeaderboardUser[] = rawWeekly
                    .map((u) => ({
                        ...u,
                        streak_count: getEffectiveStreak(u.last_active || null, u.streak_count || 0),
                    }))
                    .sort((a, b) => b.streak_count - a.streak_count)

                let computedSchoolRanking: SchoolRanking[] = []

                if (schoolRpcRes.data && Array.isArray(schoolRpcRes.data) && schoolRpcRes.data.length > 0) {
                    computedSchoolRanking = (schoolRpcRes.data as any[]).map((s) => ({
                        school: s.school || 'Sekolah Indonesia',
                        city: s.city || 'Indonesia',
                        totalXp: Number(s.totalXp ?? s.totalxp ?? 0),
                        members: Number(s.members ?? 0),
                    }))
                }

                if (computedSchoolRanking.length === 0) {
                    const schoolMap: Record<string, { school: string; city: string; totalXp: number; members: number }> = {}
                    allUsers.forEach((u) => {
                        if (u.school_name) {
                            if (!schoolMap[u.school_name]) {
                                schoolMap[u.school_name] = { school: u.school_name, city: u.city || '', totalXp: 0, members: 0 }
                            }
                            schoolMap[u.school_name].totalXp += (u.xp || 0)
                            schoolMap[u.school_name].members++
                        }
                    })
                    computedSchoolRanking = Object.values(schoolMap).sort((a, b) => b.totalXp - a.totalXp)
                }

                setLeaderboardData({
                    allTime: allUsers,
                    weekly: weeklyUsers,
                    schoolRanking: computedSchoolRanking,
                })
            } catch (err) {
                console.error('Error loading leaderboard:', err)
            } finally {
                setIsLoading(false)
            }
        }

        const isStale = !leaderboardFetchedAt || Date.now() - leaderboardFetchedAt > 60_000
        if (isStale) {
            fetchLeaderboard()
        } else {
            setIsLoading(false)
        }
    }, [leaderboardFetchedAt, setLeaderboardData])

    if (isLoading && allTimeLeaderboard.length === 0) {
        return (
            <div className="responsive-page" style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '36px' }}>
                {/* Header Skeleton */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                        <div className="sq-skeleton" style={{ width: '44px', height: '44px', borderRadius: '10px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div className="sq-skeleton" style={{ height: '24px', width: '200px', borderRadius: '6px' }} />
                            <div className="sq-skeleton" style={{ height: '14px', width: '280px', borderRadius: '4px' }} />
                        </div>
                    </div>

                    {/* Stats Strip Skeleton */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="sq-skeleton" style={{ height: '60px', borderRadius: '10px' }} />
                        ))}
                    </div>
                </div>

                {/* Tabs & Search Skeleton */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '22px' }}>
                    <div className="sq-skeleton" style={{ height: '38px', width: '280px', borderRadius: '10px' }} />
                    <div className="sq-skeleton" style={{ height: '38px', width: '220px', borderRadius: '8px' }} />
                </div>

                {/* Podium Skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', alignItems: 'flex-end', marginBottom: '24px' }}>
                    <div className="sq-skeleton" style={{ height: '180px', borderRadius: '12px' }} />
                    <div className="sq-skeleton" style={{ height: '210px', borderRadius: '12px' }} />
                    <div className="sq-skeleton" style={{ height: '180px', borderRadius: '12px' }} />
                </div>

                {/* List Skeleton */}
                <div className="card" style={{ padding: '16px', borderRadius: '12px' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="sq-skeleton" style={{ height: '48px', marginBottom: i < 5 ? '8px' : 0, borderRadius: '8px' }} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <LeaderboardClient
            allTime={allTimeLeaderboard}
            weekly={weeklyLeaderboard}
            schoolRanking={schoolRanking}
            currentUserId={profile?.id || null}
        />
    )
}
