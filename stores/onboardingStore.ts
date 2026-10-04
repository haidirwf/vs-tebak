import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingStore {
    hasCompletedLessonTour: boolean
    setLessonTourCompleted: (completed: boolean) => void
    resetLessonTour: () => void
}

export const useOnboardingStore = create<OnboardingStore>()(
    persist(
        (set) => ({
            hasCompletedLessonTour: false,
            setLessonTourCompleted: (hasCompletedLessonTour) => set({ hasCompletedLessonTour }),
            resetLessonTour: () => set({ hasCompletedLessonTour: false }),
        }),
        {
            name: 'skillungo_onboarding_storage',
        }
    )
)
