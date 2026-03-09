import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkStreakStatus } from '@/lib/game/streak'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('streak_count, last_active')
        .eq('id', user.id)
        .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const streakStatus = checkStreakStatus(profile.last_active, profile.streak_count)

    if (streakStatus.shouldUpdate) {
        await supabase.from('profiles').update({
            streak_count: streakStatus.streakCount,
            last_active: format(new Date(), 'yyyy-MM-dd'),
        }).eq('id', user.id)
    }

    return NextResponse.json({
        streak: streakStatus.streakCount,
        isActive: streakStatus.isActive,
        updated: streakStatus.shouldUpdate,
    })
}
