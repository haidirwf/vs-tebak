// lib/auth/get-user.ts — Request-deduplicated auth & profile helper using React cache()
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Profile } from '@/types'
import { User } from '@supabase/supabase-js'
import { measureAsync } from '@/lib/utils/timing'

/**
 * Deduplicated getAuthenticatedUser.
 * Wrapped in React cache() so multiple components calling this within the same
 * render lifecycle only trigger exactly 1 request to Supabase Auth.
 */
export const getAuthenticatedUser = cache(async (): Promise<User | null> => {
    return measureAsync('auth:getUser (cached)', async () => {
        try {
            const cookieStore = await cookies()
            const allCookies = cookieStore.getAll()
            const hasAuthCookie = allCookies.some(
                c => c.name.includes('auth-token') && c.value.length > 20
            )
            // Fast-path: jika tidak ada cookie auth sama sekali, user dipastikan belum login
            // Return null dalam 0ms tanpa membuat request HTTPS ke Supabase!
            if (!hasAuthCookie) {
                return null
            }
        } catch {
            // Ignore jika dipanggil di luar request context
        }

        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
            return null
        }
        return user
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
