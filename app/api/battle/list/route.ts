import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Passive Cleanup: Hapus room "waiting" yang usianya sudah lebih dari 60 menit
    // Ini membantu membersihkan "Ghost Rooms" secara otomatis.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    await supabase.from('battles')
        .delete()
        .eq('status', 'waiting')
        .lt('created_at', oneHourAgo)

    // 2. Ambil semua battle yang statusnya 'waiting', belum ada player2,
    // dan BUKAN milik user yang sedang request (biar ga main sama diri sendiri)
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
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format data biar gampang dipake frontend
    const formattedRooms = openRooms.map(room => {
        const profs = room.profiles as { username?: string } | Array<{ username?: string }> | null
        return {
            id: room.id,
            room_code: room.room_code,
            category: room.category,
            created_at: room.created_at,
            host_name: Array.isArray(profs) ? profs[0]?.username : profs?.username || 'Unknown',
        }
    })

    return NextResponse.json({ rooms: formattedRooms })
}
