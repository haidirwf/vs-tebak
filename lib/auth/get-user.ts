// lib/auth/get-user.ts — Request-deduplicated auth & profile helper using React cache()
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Profile } from '@/types'
import { User } from '@supabase/supabase-js'
import { measureAsync } from '@/lib/utils/timing'
import { extractAuthSessionFromCookies, isSessionExpiringSoon } from '@/lib/auth/token-utils'
import { checkStreakStatus } from '@/lib/game/streak'

// In-memory server-side cache across requests (survives route navigations within the same worker instance)
interface CachedProfile {
    profile: Profile
    expiresAt: number
}

interface CachedUser {
    user: User
    expiresAt: number
}

const profileMemoryCache = new Map<string, CachedProfile>()
const userMemoryCache = new Map<string, CachedUser>()

const CACHE_TTL_MS = 60_000 // 60 seconds

export function invalidateProfileCache(userId?: string) {
    if (userId) {
        profileMemoryCache.delete(userId)
    } else {
        profileMemoryCache.clear()
    }
}

/**
 * Deduplicated getAuthenticatedUser.
 * Fast-path 1: reads user object directly from cached valid session cookie (0ms).
 * Fast-path 2: reads user object from server-side in-memory cache keyed by access token (0ms).
 * Fallback: fetches from Supabase Auth and caches in memory.
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

        // 2. FAST-PATH: Server in-memory cache jika token masih valid (0ms)
        if (session?.access_token && !isSessionExpiringSoon(session, 10)) {
            const cached = userMemoryCache.get(session.access_token)
            if (cached && Date.now() < cached.expiresAt) {
                return cached.user
            }
        }

        // 3. Fallback: jika token expired atau butuh refresh via server client
        try {
            const supabase = await createClient()
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error || !user) {
                return null
            }
            if (session?.access_token) {
                userMemoryCache.set(session.access_token, {
                    user,
                    expiresAt: Date.now() + CACHE_TTL_MS,
                })
            }
            return user
        } catch {
            return null
        }
    }, 150)
})

/**
 * Deduplicated getAuthenticatedProfile.
 * Fast-path: checks server-side in-memory cache (0ms).
 * Wrapped in React cache() so lookup is executed at most once per request lifecycle.
 */
export const getAuthenticatedProfile = cache(async (explicitUserId?: string): Promise<Profile | null> => {
    return measureAsync('db:getProfile (cached)', async () => {
        let userId = explicitUserId

        if (!userId) {
            const user = await getAuthenticatedUser()
            if (!user) return null
            userId = user.id
        }

        // 1. FAST-PATH: Memory cache check (0ms instead of 300ms network roundtrip to Supabase!)
        const cached = profileMemoryCache.get(userId)
        if (cached && Date.now() < cached.expiresAt) {
            return cached.profile
        }

        const supabase = await createClient()
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()

        if (!profile) return null

        // Sinkronisasi status streak saat login / kunjungan harian
        const streakStatus = checkStreakStatus(profile.last_active, profile.streak_count || 0)
        if (streakStatus.shouldUpdate || profile.last_active !== streakStatus.lastActive) {
            profile.streak_count = streakStatus.streakCount
            profile.last_active = streakStatus.lastActive
            // Async sync ke DB tanpa memblokir rendering
            ;(async () => {
                try {
                    await supabase.from('profiles').update({
                        streak_count: streakStatus.streakCount,
                        last_active: streakStatus.lastActive,
                    }).eq('id', userId)
                } catch (err) {
                    console.error('Failed to sync login streak in DB:', err)
                }
            })()
        }

        const normalizedProfile = (profile as Profile) || null
        if (normalizedProfile) {
            profileMemoryCache.set(userId, {
                profile: normalizedProfile,
                expiresAt: Date.now() + CACHE_TTL_MS,
            })
        }

        return normalizedProfile
    }, 150)
})
