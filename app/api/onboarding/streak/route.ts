import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculateLevel } from '@/lib/game/xp'
import { updateQuestProgress } from '@/lib/game/quests'
import { ensureUserBadges } from '@/lib/game/badges'
import { getTodayDateString } from '@/lib/game/streak'

const FTUE_BONUS_XP = 50

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { streakGoalMinutes?: number } = {}
    try {
        body = await request.json()
    } catch {
        // use default
    }

    const goalMinutes = [5, 10, 15].includes(Number(body.streakGoalMinutes))
        ? Number(body.streakGoalMinutes)
        : 10

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // If user already completed streak onboarding, update goal if changed
    if (profile.has_completed_streak_onboarding) {
        if (profile.streak_goal_minutes !== goalMinutes) {
            await supabase
                .from('profiles')
                .update({ streak_goal_minutes: goalMinutes })
                .eq('id', user.id)
        }

        return NextResponse.json({
            success: true,
            alreadyCompleted: true,
            streakGoalMinutes: goalMinutes,
            bonusXp: 0,
            profile: {
                ...profile,
                streak_goal_minutes: goalMinutes,
                has_completed_streak_onboarding: true,
            },
        })
    }

    // Award initial FTUE bonus XP + update profile
    const newTotalXp = (profile.xp || 0) + FTUE_BONUS_XP
    const { level, xpToNext } = calculateLevel(newTotalXp)
    const today = getTodayDateString()

    const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
            has_completed_streak_onboarding: true,
            streak_goal_minutes: goalMinutes,
            xp: newTotalXp,
            level,
            xp_to_next_level: xpToNext,
        })
        .eq('id', user.id)
        .select('*')
        .single()

    if (updateError || !updatedProfile) {
        return NextResponse.json({ error: updateError?.message || 'Failed to update profile' }, { status: 500 })
    }

    // Log XP award
    await supabase.from('xp_logs').insert({
        user_id: user.id,
        xp_amount: FTUE_BONUS_XP,
        reason: 'Bonus FTUE Streak Onboarding (+50 XP)',
    })

    // Trigger quest progress and badges check in background/parallel
    await Promise.allSettled([
        updateQuestProgress(supabase, user.id, 'earn_xp', FTUE_BONUS_XP, today),
        ensureUserBadges(supabase, user.id),
    ])

    return NextResponse.json({
        success: true,
        alreadyCompleted: false,
        streakGoalMinutes: goalMinutes,
        bonusXp: FTUE_BONUS_XP,
        newXp: newTotalXp,
        newLevel: level,
        xpToNext,
        profile: updatedProfile,
    })
}
