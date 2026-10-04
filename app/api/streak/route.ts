import { createClient } from '@/lib/supabase/server'
import { getEffectiveStreak, shouldResetStreak } from '@/lib/game/streak'
import { NextResponse } from 'next/server'

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('streak_count, last_active')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    let currentStreak = profile.streak_count || 0
    let updated = false

    if (currentStreak > 0 && shouldResetStreak(profile.last_active, currentStreak)) {
        currentStreak = 0
        updated = true
        await supabase
            .from('profiles')
            .update({ streak_count: 0 })
            .eq('id', user.id)
    }

    return NextResponse.json({
        streak: getEffectiveStreak(profile.last_active, currentStreak),
        lastActive: profile.last_active,
        updated,
    })
}
