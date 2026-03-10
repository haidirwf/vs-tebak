import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const dynamic = 'force-dynamic'

// POST: Create a new room OR auto-queue for matchmaking
export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as { category?: string; matchmaking?: boolean }
    const category = body.category || 'general'
    const isMatchmaking = body.matchmaking === true

    // If matchmaking mode: find an open room to join first
    if (isMatchmaking) {
        const { data: openRooms } = await supabase
            .from('battles')
            .select('id, room_code')
            .eq('status', 'waiting')
            .eq('category', category)
            .neq('player1_id', user.id) // Don't join your own room
            .is('player2_id', null)
            .order('created_at', { ascending: false })
            .limit(1)

        if (openRooms && openRooms.length > 0) {
            // Join the first open room
            const roomToJoin = openRooms[0]
            const { data: updatedBattleArr, error: joinError } = await supabase
                .from('battles')
                .update({
                    player2_id: user.id,
                    status: 'active',
                    player1_ready: false,
                    player2_ready: false,
                })
                .eq('id', roomToJoin.id)
                .eq('status', 'waiting')
                .is('player2_id', null)
                .select()

            if (!joinError && updatedBattleArr && updatedBattleArr.length > 0) {
                return NextResponse.json({ battle: updatedBattleArr[0], joined: true })
            }
        }
        // No open rooms — create one and wait
    }

    // Generate a unique room code
    let roomCode = ''
    let attempts = 0
    while (attempts < 5) {
        const candidateCode = generateRoomCode()
        const { data: existing } = await supabase
            .from('battles')
            .select('id')
            .eq('room_code', candidateCode)
            .maybeSingle()
        if (!existing) { roomCode = candidateCode; break }
        attempts++
    }
    if (!roomCode) return NextResponse.json({ error: 'Failed to generate room code' }, { status: 500 })

    const { data: battle, error } = await supabase
        .from('battles')
        .insert({
            room_code: roomCode,
            player1_id: user.id,
            status: 'waiting',
            category,
            player1_ready: false,
            player2_ready: false,
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ battle, roomCode })
}

// GET: Look up a room by code and join as player2 if possible
export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const roomCode = searchParams.get('code')
    if (!roomCode) return NextResponse.json({ error: 'Room code required' }, { status: 400 })

    // Use a simple select first (no relational join) to avoid RLS issues
    const { data: battle, error } = await supabase
        .from('battles')
        .select('*')
        .eq('room_code', roomCode.toUpperCase().trim())
        .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!battle) return NextResponse.json({ error: 'Room tidak ditemukan' }, { status: 404 })

    // Join as player 2 if the room is still waiting and the user isn't already in it
    if (battle.status === 'waiting' && !battle.player2_id && battle.player1_id !== user.id) {
        // Attempt to update
        const { data: updatedBattleArr, error: updateError } = await supabase
            .from('battles')
            .update({
                player2_id: user.id,
                status: 'active',
                player1_ready: false,
                player2_ready: false,
            })
            .eq('id', battle.id)
            .eq('status', 'waiting')
            .is('player2_id', null)
            .select('*')

        if (updateError) {
            return NextResponse.json({ error: 'Gagal bergabung ke room: ' + updateError.message }, { status: 500 })
        }

        if (updatedBattleArr && updatedBattleArr.length > 0) {
            return NextResponse.json({ battle: updatedBattleArr[0] })
        }

        return NextResponse.json({ error: 'Room sudah terisi pemain lain' }, { status: 409 })
    }

    // If already active or the user is player1
    return NextResponse.json({ battle })
}
