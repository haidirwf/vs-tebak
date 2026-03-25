'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const REFRESH_COOLDOWN_MS = 30_000
const STALE_AFTER_HIDDEN_MS = 15_000

export default function RefreshOnFocus() {
    const router = useRouter()
    const lastRefreshAtRef = useRef(0)
    const hiddenAtRef = useRef<number | null>(null)

    useEffect(() => {
        const refreshIfAllowed = () => {
            const now = Date.now()
            if (now - lastRefreshAtRef.current < REFRESH_COOLDOWN_MS) return
            lastRefreshAtRef.current = now
            router.refresh()
        }

        const handleFocus = () => {
            if (hiddenAtRef.current === null) return
            const hiddenDuration = Date.now() - hiddenAtRef.current
            if (hiddenDuration < STALE_AFTER_HIDDEN_MS) return
            refreshIfAllowed()
        }

        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') {
                hiddenAtRef.current = Date.now()
                return
            }
            handleFocus()
        }

        window.addEventListener('focus', handleFocus)
        window.addEventListener('online', refreshIfAllowed)
        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            window.removeEventListener('focus', handleFocus)
            window.removeEventListener('online', refreshIfAllowed)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [router])

    return null
}
