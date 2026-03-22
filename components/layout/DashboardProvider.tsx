'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { Profile } from '@/types'
import dynamic from 'next/dynamic'
import LevelUpModal from '@/components/character/LevelUpModal'
import StreakUpModal from '@/components/character/StreakUpModal'
import BadgeUnlockModal from '@/components/character/BadgeUnlockModal'
import RefreshOnFocus from '@/components/layout/RefreshOnFocus'

const FirstTimeTutorial = dynamic(() => import('@/components/onboarding/FirstTimeTutorial'), {
    ssr: false,
})

export function DashboardProvider({
    children,
    profile,
}: {
    children: React.ReactNode
    profile: Profile | null
}) {
    const onboardingDisabled = process.env.NEXT_PUBLIC_DISABLE_ONBOARDING === 'true'
    const {
        setProfile,
        setLoading,
        activePopup,
        dismissActivePopup,
    } = useUserStore()

    useEffect(() => {
        setProfile(profile)
        setLoading(false)
    }, [profile, setProfile, setLoading])

    return (
        <>
            <RefreshOnFocus />
            {children}
            {profile && !onboardingDisabled && (
                <FirstTimeTutorial
                    userId={profile.id}
                    isNewUser={profile.xp <= 0 && profile.streak_count <= 0 && profile.level <= 1}
                    blocked={Boolean(activePopup)}
                    forceShow={profile.username === 'pelajar1'}
                />
            )}
            {activePopup?.type === 'level_up' && (
                <LevelUpModal
                    oldLevel={activePopup.data.oldLevel}
                    newLevel={activePopup.data.newLevel}
                    onClose={dismissActivePopup}
                />
            )}
            {activePopup?.type === 'streak_up' && (
                <StreakUpModal
                    oldStreak={activePopup.data.oldStreak}
                    newStreak={activePopup.data.newStreak}
                    onClose={dismissActivePopup}
                />
            )}
            {activePopup?.type === 'badge_unlock' && (
                <BadgeUnlockModal
                    badge={activePopup.data}
                    onClose={dismissActivePopup}
                />
            )}
        </>
    )
}
