// stores/focusStore.ts — Zustand Focus Timer State
'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FocusStore {
    isActive: boolean
    timeLeft: number
    isFinished: boolean
    sessionsCount: number
    
    startTimer: () => void
    pauseTimer: () => void
    resetTimer: () => void
    tick: () => void
    finishSession: () => void
}

const INITIAL_TIME = 25 * 60 // 25 minutes

export const useFocusStore = create<FocusStore>()(
    persist(
        (set, get) => ({
            isActive: false,
            timeLeft: INITIAL_TIME,
            isFinished: false,
            sessionsCount: 0,

            startTimer: () => set({ isActive: true, isFinished: false }),
            pauseTimer: () => set({ isActive: false }),
            resetTimer: () => set({ 
                isActive: false, 
                timeLeft: INITIAL_TIME, 
                isFinished: false 
            }),
            
            tick: () => {
                const { timeLeft, isActive } = get()
                if (isActive && timeLeft > 0) {
                    set({ timeLeft: timeLeft - 1 })
                } else if (isActive && timeLeft === 0) {
                    get().finishSession()
                }
            },

            finishSession: () => set((state) => ({
                isActive: false,
                isFinished: true,
                timeLeft: INITIAL_TIME,
                sessionsCount: state.sessionsCount + 1
            })),
        }),
        {
            name: 'focus-storage',
            partialize: (state) => ({ sessionsCount: state.sessionsCount }),
        }
    )
)
