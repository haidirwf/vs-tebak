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
        levelUpData,
        streakUpData,
        badgeUnlockData,
        dismissLevelUp,
        dismissStreakUp,
        dismissBadgeUnlock,
    } = useUserStore()

    useEffect(() => {
        setProfile(profile)
        setLoading(false)
    }, [profile, setProfile, setLoading])

    return (
        <>
            {children}
            {levelUpData && (
                <LevelUpModal
                    oldLevel={levelUpData.oldLevel}
                    newLevel={levelUpData.newLevel}
                    onClose={dismissLevelUp}
                />
            )}
            {streakUpData && (
                <StreakUpModal
                    oldStreak={streakUpData.oldStreak}
                    newStreak={streakUpData.newStreak}
                    onClose={dismissStreakUp}
                />
            )}
            {badgeUnlockData && (
                <BadgeUnlockModal
                    badge={badgeUnlockData}
                    onClose={dismissBadgeUnlock}
                />
            )}
        </>
    )
}
