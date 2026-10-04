// app/api/user/sync/route.ts — Background sync endpoint (isolated from RSC render lifecycle)
import { createClient } from '@/lib/supabase/server'
import { ensureDailyQuestsAndProgress } from '@/lib/game/dailyQuests'
import { getTodayDateString, checkStreakStatus } from '@/lib/game/streak'
import { updateQuestProgress } from '@/lib/game/quests'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        }

        const today = getTodayDateString()
        await ensureDailyQuestsAndProgress(supabase, user.id, today)

        // Sinkronisasi status streak saat login/kunjungan harian
        const { data: profile } = await supabase
            .from('profiles')
            .select('streak_count, last_active')
            .eq('id', user.id)
            .maybeSingle()

        let streakUpdated = false
        let newStreak = profile?.streak_count || 0
        let newLastActive = profile?.last_active || null

        if (profile) {
            const streakStatus = checkStreakStatus(profile.last_active, profile.streak_count || 0)
            if (streakStatus.shouldUpdate || profile.last_active !== streakStatus.lastActive) {
                await supabase
                    .from('profiles')
                    .update({
                        streak_count: streakStatus.streakCount,
                        last_active: streakStatus.lastActive,
                    })
                    .eq('id', user.id)
                streakUpdated = true
                newStreak = streakStatus.streakCount
                newLastActive = streakStatus.lastActive

                try {
                    await updateQuestProgress(supabase, user.id, 'maintain_streak', streakStatus.streakCount, today)
                } catch {
                    // Ignore quest error
                }
            }
        }

        return NextResponse.json({
            ok: true,
            streakUpdated,
            streakCount: newStreak,
            lastActive: newLastActive,
            syncedAt: new Date().toISOString()
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('Background user sync error:', message)
        return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
}
