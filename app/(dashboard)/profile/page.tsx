'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProfileHeroStage from '@/components/profile/ProfileHeroStage'
import { useUserStore } from '@/stores/userStore'
import { useContentStore } from '@/stores/contentStore'
import { createClient } from '@/lib/supabase/client'
import { ensureUserBadges } from '@/lib/game/badges'

export default function ProfilePage() {
    const router = useRouter()
    const { profile } = useUserStore()
    const {
        profileBadges,
        profileCompletedModules,
        profileBattlesWon,
        profileBattlesTotal,
        profileStatsFetchedAt,
        setProfileStatsData,
    } = useContentStore()

    const [isLoading, setIsLoading] = useState(!profileStatsFetchedAt)

    useEffect(() => {
        const supabase = createClient()

        async function fetchProfileData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setIsLoading(false)
                return
            }

            try {
                await ensureUserBadges(supabase, user.id)

                const [badgesRes, completedRes, battlesRes] = await Promise.all([
                    supabase.from('user_badges').select('id, badges(name, icon_url)').eq('user_id', user.id),
                    supabase.from('user_modules').select('id, modules(title)').eq('user_id', user.id).eq('status', 'completed'),
                    supabase.from('battles').select('winner_id').or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`).eq('status', 'finished'),
                ])

                const completedModules = completedRes.data || []
                const battles = battlesRes.data || []
                const battlesWon = battles.filter((b: any) => b.winner_id === user.id).length
                const rawBadges = (badgesRes.data || []).map((ub: any) => ({
                    id: ub.id,
                    badge: Array.isArray(ub.badges) ? ub.badges[0] : ub.badges,
                }))
                const seenBadgeNames = new Set<string>()
                const normalizedBadges = rawBadges.filter((ub: any) => {
                    if (!ub.badge?.name) return false
                    if (seenBadgeNames.has(ub.badge.name)) return false
                    seenBadgeNames.add(ub.badge.name)
                    return true
                })
                const normalizedCompletedModules = completedModules.map((um: any) => ({
                    id: um.id,
                    module: Array.isArray(um.modules) ? um.modules[0] : um.modules,
                }))

                setProfileStatsData({
                    badges: normalizedBadges,
                    completedModules: normalizedCompletedModules,
                    battlesWon,
                    battlesTotal: battles.length,
                })
            } catch (err) {
                console.error('Error loading profile stats:', err)
            } finally {
                setIsLoading(false)
            }
        }

        const isStale = !profileStatsFetchedAt || Date.now() - profileStatsFetchedAt > 60_000
        if (isStale) {
            fetchProfileData()
        } else {
            setIsLoading(false)
        }
    }, [profileStatsFetchedAt, setProfileStatsData, router])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (!profile || isLoading) {
        return (
            <div className="responsive-page" style={{ padding: '24px', maxWidth: '1160px', margin: '0 auto' }}>
                <div className="sq-skeleton" style={{ height: '110px', borderRadius: '16px', marginBottom: '20px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    <div className="sq-skeleton" style={{ height: '420px', borderRadius: '16px' }} />
                    <div className="sq-skeleton" style={{ height: '420px', borderRadius: '16px' }} />
                </div>
            </div>
        )
    }

    return (
        <div className="responsive-page" style={{ padding: '20px 24px 36px', maxWidth: '1160px', margin: '0 auto' }}>
            {/* Unified RPG Profile Arena */}
            <ProfileHeroStage
                profile={profile}
                completedModulesCount={profileCompletedModules.length}
                battlesTotal={profileBattlesTotal}
                battlesWon={profileBattlesWon}
                badges={profileBadges}
                completedModules={profileCompletedModules}
                isOwnProfile={true}
                onSignOut={handleSignOut}
            />
        </div>
    )
}
