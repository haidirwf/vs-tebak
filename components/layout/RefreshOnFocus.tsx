'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const REFRESH_COOLDOWN_MS = 3000

export default function RefreshOnFocus() {
    const router = useRouter()
    const lastRefreshAtRef = useRef(0)

    useEffect(() => {
        const refreshIfAllowed = () => {
            const now = Date.now()
            if (now - lastRefreshAtRef.current < REFRESH_COOLDOWN_MS) return
            lastRefreshAtRef.current = now
            router.refresh()
        }

        const handleVisibility = () => {
            if (document.visibilityState !== 'visible') return
            refreshIfAllowed()
        }

        window.addEventListener('focus', refreshIfAllowed)
        window.addEventListener('online', refreshIfAllowed)
        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            window.removeEventListener('focus', refreshIfAllowed)
            window.removeEventListener('online', refreshIfAllowed)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [router])

    return null
}
