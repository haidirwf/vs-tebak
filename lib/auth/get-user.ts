// lib/auth/get-user.ts — Request-deduplicated auth & profile helper using React cache()
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
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
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
            return null
        }
        return user
    })
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
    })
})
