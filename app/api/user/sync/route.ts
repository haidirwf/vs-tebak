// app/api/user/sync/route.ts — Background sync endpoint (isolated from RSC render lifecycle)
import { createClient } from '@/lib/supabase/server'
import { ensureDailyQuestsAndProgress } from '@/lib/game/dailyQuests'
import { getTodayDateString, shouldResetStreak } from '@/lib/game/streak'
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

        // Verifikasi dan reset streak jika sudah mati
        const { data: profile } = await supabase
            .from('profiles')
            .select('streak_count, last_active')
            .eq('id', user.id)
            .maybeSingle()

        let streakReset = false
        if (profile && profile.streak_count > 0 && shouldResetStreak(profile.last_active, profile.streak_count)) {
            await supabase
                .from('profiles')
                .update({ streak_count: 0 })
                .eq('id', user.id)
            streakReset = true
        }

        return NextResponse.json({ ok: true, streakReset, syncedAt: new Date().toISOString() })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('Background user sync error:', message)
        return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
}
