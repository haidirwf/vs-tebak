import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/battle/cleanup
// Intended for scheduled jobs (cron) with BATTLE_CLEANUP_SECRET.
export async function POST(request: NextRequest) {
    const secret = process.env.BATTLE_CLEANUP_SECRET
    const authHeader = request.headers.get('authorization')

    if (secret) {
        if (authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized cleanup request' }, { status: 401 })
        }
    } else {
        // Local/dev fallback: only authenticated users can trigger when secret is not configured.
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const supabase = await createClient()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: deleted, error } = await supabase
        .from('battles')
        .delete()
        .eq('status', 'waiting')
        .lt('created_at', oneHourAgo)
        .select('id')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        deleted_count: deleted?.length || 0,
    })
}

