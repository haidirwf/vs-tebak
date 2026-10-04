// lib/auth/get-user.ts — Request-deduplicated auth & profile helper using React cache()
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Profile } from '@/types'
import { User } from '@supabase/supabase-js'
import { measureAsync } from '@/lib/utils/timing'
import { extractAuthSessionFromCookies, isSessionExpiringSoon } from '@/lib/auth/token-utils'
import { shouldResetStreak } from '@/lib/game/streak'

/**
 * Deduplicated getAuthenticatedUser.
 * Fast-path: reads user object directly from cached valid session cookie (0ms),
 * avoiding slow redundant HTTPS roundtrips to Supabase Auth on every page navigation.
 */
export const getAuthenticatedUser = cache(async (): Promise<User | null> => {
    return measureAsync('auth:getUser (cached)', async () => {
        let allCookies: { name: string; value: string }[] = []
        try {
            const cookieStore = await cookies()
            allCookies = cookieStore.getAll()
        } catch {
            return null
        }

        const session = extractAuthSessionFromCookies(allCookies)

        // 1. FAST-PATH: Jika token masih valid (> 10s) dan user object tersedia di cookie session (0ms)
        if (session?.user && session?.access_token && !isSessionExpiringSoon(session, 10)) {
            return session.user
        }

        // 2. Fallback: jika token expired atau butuh refresh via server client
        try {
            const supabase = await createClient()
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error || !user) {
                return null
            }
            return user
        } catch {
            return null
        }
    }, 500)
})

/**
 * Deduplicated getAuthenticatedProfile.
 * Wrapped in React cache() so profile lookup is executed at most once per render lifecycle.
 */
export const getAuthenticatedProfile = cache(async (explicitUserId?: string): Promise<Profile | null> => {
    return measureAsync('db:getProfile (cached)', async () => {
        const supabase = await createClient()
        let userId = explicitUserId

        if (!userId) {
            const user = await getAuthenticatedUser()
            if (!user) return null
            userId = user.id
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()

        if (!profile) return null

        // Jika streak sudah mati (melewatkan minimal 1 hari penuh), reset streak_count ke 0
        if (profile.streak_count > 0 && shouldResetStreak(profile.last_active, profile.streak_count)) {
            profile.streak_count = 0
            // Async sync ke DB tanpa memblokir rendering
            ;(async () => {
                try {
                    await supabase.from('profiles').update({ streak_count: 0 }).eq('id', userId)
                } catch (err) {
                    console.error('Failed to reset dead streak in DB:', err)
                }
            })()
        }

        return (profile as Profile) || null
    }, 400)
})
