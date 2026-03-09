'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { Profile } from '@/types'
import LevelUpModal from '@/components/character/LevelUpModal'

export function DashboardProvider({
    children,
    profile,
}: {
    children: React.ReactNode
    profile: Profile | null
}) {
    const { setProfile, setLoading, levelUpData, dismissLevelUp } = useUserStore()

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
        </>
    )
}
