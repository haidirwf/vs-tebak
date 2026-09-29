// lib/auth/get-user.ts — Request-deduplicated auth & profile helper using React cache()
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Profile } from '@/types'
import { User } from '@supabase/supabase-js'
import { measureAsync } from '@/lib/utils/timing'
import { extractAuthSessionFromCookies, isSessionExpiringSoon } from '@/lib/auth/token-utils'

/**
 * Deduplicated getAuthenticatedUser.
 * Wrapped in React cache() so multiple components calling this within the same
 * render lifecycle only trigger exactly 1 request to Supabase Auth.
 */
export const getAuthenticatedUser = cache(async (): Promise<User | null> => {
    return measureAsync('auth:getUser (cached)', async () => {
        let allCookies: { name: string; value: string }[] = []
        try {
            const cookieStore = await cookies()
            allCookies = cookieStore.getAll()
        } catch {
            // Ignore jika dipanggil di luar request context
            return null
        }

        const session = extractAuthSessionFromCookies(allCookies)

        // Fast-path: jika tidak ada cookie session yang valid, user dipastikan belum login
        // Return null dalam 0ms tanpa membuat request HTTPS ke Supabase!
        if (!session?.access_token) {
            return null
        }

        // Fast-path: jika token sudah expired secara lokal (0ms)
        // Di Server Component, cookie tidak bisa di-set/di-refresh.
        // Jika token sudah expired, langsung return null daripada memicu retry-loop 25 detik di GoTrueClient!
        if (isSessionExpiringSoon(session, 0)) {
            return null
        }

        const supabase = await createClient()

        // PENTING: Melewatkan `session.access_token` secara eksplisit ke `getUser(jwt)`
        // mem-bypass lock antrian dan auto-refresh retry loop (30s) di internal GoTrueClient,
        // sehingga verifikasi JWT ke Supabase Auth langsung tuntas dalam ~400ms.
        // Dilengkapi dengan timeout 2500ms agar halaman tidak pernah menggantung jika cloud lambat.
        try {
            const getUserPromise = supabase.auth.getUser(session.access_token)
            const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((resolve) =>
                setTimeout(() => resolve({ data: { user: null }, error: new Error('auth:getUser timeout') }), 2500)
            )

            const { data: { user }, error } = await Promise.race([getUserPromise, timeoutPromise])
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

        return (profile as Profile) || null
    }, 400)
})
