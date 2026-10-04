'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { Profile } from '@/types'
import dynamic from 'next/dynamic'
import LevelUpModal from '@/components/character/LevelUpModal'
import StreakUpModal from '@/components/character/StreakUpModal'
import BadgeUnlockModal from '@/components/character/BadgeUnlockModal'
import RefreshOnFocus from '@/components/layout/RefreshOnFocus'

const CharacterCreationModal = dynamic(() => import('@/components/character/CharacterCreationModal'), {
    ssr: false,
})

const StreakOnboardingModal = dynamic(() => import('@/components/onboarding/StreakOnboardingModal'), {
    ssr: false,
})

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

    // Seed user store profile synchronously if empty so child pages have profile on initial render
    const storeProfile = useUserStore.getState().profile
    if (profile && !storeProfile) {
        useUserStore.setState({ profile, isLoading: false })
    }

    const [hasCompletedCreation, setHasCompletedCreation] = useState(false)
    const [hasCompletedStreakModal, setHasCompletedStreakModal] = useState(false)

    // Akun baru maupun akun lama yang belum menyelesaikan kustomisasi karakter wajib melalui CharacterCreationModal
    const activeProfile = useUserStore((s) => s.profile) || profile
    const needsCharacterCreation = Boolean(
        activeProfile && !activeProfile.character_created && !hasCompletedCreation
    )
    const [showCharacterModal, setShowCharacterModal] = useState(needsCharacterCreation)

    const showStreakModal = Boolean(
        activeProfile &&
        (activeProfile.character_created || hasCompletedCreation) &&
        !activeProfile.has_completed_streak_onboarding &&
        !hasCompletedStreakModal &&
        !showCharacterModal
    )

    useEffect(() => {
        setProfile(profile)
        setLoading(false)
        if (profile && !profile.character_created && !hasCompletedCreation) {
            setShowCharacterModal(true)
        }

        // Trigger background user/quest sync non-blocking (throttled to 5 mins)
        if (profile?.id && typeof window !== 'undefined') {
            const cacheKey = `sq:sync:${profile.id}`
            const lastSync = sessionStorage.getItem(cacheKey)
            const now = Date.now()
            if (!lastSync || now - Number(lastSync) > 300_000) {
                sessionStorage.setItem(cacheKey, String(now))
                fetch('/api/user/sync', { method: 'POST' })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data?.ok && data?.streakUpdated && typeof data.streakCount === 'number') {
                            const { profile: currentProfile, setProfile } = useUserStore.getState()
                            if (currentProfile && (currentProfile.streak_count !== data.streakCount || currentProfile.last_active !== data.lastActive)) {
                                setProfile({
                                    ...currentProfile,
                                    streak_count: data.streakCount,
                                    last_active: data.lastActive,
                                })
                            }
                        }
                    })
                    .catch(() => {
                        // Ignore background sync errors
                    })
            }
        }
    }, [profile, setProfile, setLoading, hasCompletedCreation])

    return (
        <>
            {/* <RefreshOnFocus /> dinonaktifkan agar tidak memicu hard server refresh saat fokus window */}
            {children}
            {profile && (
                <CharacterCreationModal
                    isOpen={showCharacterModal}
                    profile={activeProfile || profile}
                    onComplete={() => {
                        setHasCompletedCreation(true)
                        setShowCharacterModal(false)
                    }}
                />
            )}
            {activeProfile && showStreakModal && (
                <StreakOnboardingModal
                    isOpen={showStreakModal}
                    profile={activeProfile}
                    onComplete={() => {
                        setHasCompletedStreakModal(true)
                    }}
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
