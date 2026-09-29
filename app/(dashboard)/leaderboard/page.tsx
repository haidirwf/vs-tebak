'use client'

import { useEffect, useState } from 'react'
import LeaderboardClient from './LeaderboardClient'
import { useUserStore } from '@/stores/userStore'
import { useContentStore, LeaderboardUser, SchoolRanking } from '@/stores/contentStore'
import { createClient } from '@/lib/supabase/client'

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
                        .select('id, username, full_name, school_name, city, avatar_class, level, xp, streak_count')
                        .order('xp', { ascending: false })
                        .limit(100),
                    supabase
                        .from('profiles')
                        .select('id, username, full_name, school_name, city, avatar_class, level, xp, streak_count')
                        .order('streak_count', { ascending: false })
                        .limit(50),
                    supabase
                        .rpc('get_school_rankings', { p_limit: 20 }),
                ])

                const allUsers = (allTimeRes.data || []) as LeaderboardUser[]
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
                    weekly: (weeklyRes.data || []) as LeaderboardUser[],
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
            <div className="responsive-page" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
                <div className="sq-skeleton" style={{ height: '36px', width: '220px', marginBottom: '20px' }} />
                <div className="card" style={{ padding: '20px' }}>
                    <div className="sq-skeleton" style={{ height: '40px', marginBottom: '16px' }} />
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="sq-skeleton" style={{ height: '48px', marginBottom: '8px' }} />
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
