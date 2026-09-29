// app/api/user/sync/route.ts — Background sync endpoint (isolated from RSC render lifecycle)
import { createClient } from '@/lib/supabase/server'
import { ensureDailyQuestsAndProgress } from '@/lib/game/dailyQuests'
import { format } from 'date-fns'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        }

        const today = format(new Date(), 'yyyy-MM-dd')
        await ensureDailyQuestsAndProgress(supabase, user.id, today)

        return NextResponse.json({ ok: true, syncedAt: new Date().toISOString() })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('Background user sync error:', message)
        return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
}
