import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/server/rateLimit'

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateKey = `battle:list:${getRateLimitIdentifier(request, user.id)}`
    const rate = checkRateLimit({ key: rateKey, limit: 60, windowMs: 60_000 })
    if (!rate.ok) {
        return NextResponse.json({
            error: 'Terlalu banyak request list room. Coba lagi sebentar.',
            retry_after_ms: rate.retryAfterMs,
        }, { status: 429 })
    }

    // 1. Bersihkan ghost rooms: room berstatus 'waiting' yang sudah lebih dari 3 menit ditinggalkan host
    const staleThreshold = new Date(Date.now() - 3 * 60 * 1000).toISOString()
    await supabase
        .from('battles')
        .delete()
        .eq('status', 'waiting')
        .lt('created_at', staleThreshold)

    // 2. Ambil hanya battle berstatus 'waiting' aktif (dibuat dalam 3 menit terakhir),
    // belum ada player2, dan BUKAN milik user yang sedang request
    const { data: openRooms, error } = await supabase
        .from('battles')
        .select(`
            id,
            room_code,
            category,
            created_at,
            player1_id,
            profiles!battles_player1_id_fkey (
                username
            )
        `)
        .eq('status', 'waiting')
        .is('player2_id', null)
        .neq('player1_id', user.id)
        .gte('created_at', staleThreshold)
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format data biar gampang dipake frontend
    const formattedRooms = (openRooms || []).map(room => {
        const profs = room.profiles as { username?: string } | Array<{ username?: string }> | null
        return {
            id: room.id,
            room_code: room.room_code,
            category: room.category,
            created_at: room.created_at,
            host_name: Array.isArray(profs) ? profs[0]?.username : profs?.username || 'Unknown',
        }
    })

    return NextResponse.json(
        { rooms: formattedRooms },
        {
            headers: {
                'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            },
        }
    )
}
