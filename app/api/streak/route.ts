import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkStreakStatus } from '@/lib/game/streak'
import { format } from 'date-fns'
import { ensureDailyQuestsAndProgress } from '@/lib/game/dailyQuests'
import { updateQuestProgress } from '@/lib/game/quests'

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    await ensureDailyQuestsAndProgress(supabase, user.id, today)

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
            last_active: today,
        }).eq('id', user.id)
    }

    if (streakStatus.isActive) {
        await updateQuestProgress(supabase, user.id, 'maintain_streak', streakStatus.streakCount, today)
    }

    return NextResponse.json({
        streak: streakStatus.streakCount,
        isActive: streakStatus.isActive,
        updated: streakStatus.shouldUpdate,
    })
}
