import { createClient } from '@/lib/supabase/server'
import { checkStreakStatus } from '@/lib/game/streak'
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

    const streakStatus = checkStreakStatus(profile.last_active, profile.streak_count || 0)
    let updated = false

    if (streakStatus.shouldUpdate || profile.last_active !== streakStatus.lastActive) {
        updated = true
        await supabase
            .from('profiles')
            .update({
                streak_count: streakStatus.streakCount,
                last_active: streakStatus.lastActive,
            })
            .eq('id', user.id)
    }

    return NextResponse.json({
        streak: streakStatus.streakCount,
        lastActive: streakStatus.lastActive,
        updated,
    })
}
