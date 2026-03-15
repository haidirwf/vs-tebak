'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { Profile } from '@/types'
import LevelUpModal from '@/components/character/LevelUpModal'
import StreakUpModal from '@/components/character/StreakUpModal'
import BadgeUnlockModal from '@/components/character/BadgeUnlockModal'

export function DashboardProvider({
    children,
    profile,
}: {
    children: React.ReactNode
    profile: Profile | null
}) {
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
            {children}
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
