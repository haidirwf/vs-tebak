import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function cancelWaitingRoom(roomId: string, userId: string) {
    const supabase = await createClient()

    const { data: battle } = await supabase
        .from('battles')
        .select('player1_id, status')
        .eq('id', roomId)
        .single()

    if (!battle) return { status: 404 as const, body: { error: 'Room not found' } }
    if (battle.player1_id !== userId || battle.status !== 'waiting') {
        return { status: 403 as const, body: { error: 'Cannot cancel' } }
    }

    const { error } = await supabase.from('battles').delete().eq('id', roomId)
    if (error) return { status: 500 as const, body: { error: error.message } }

    return { status: 200 as const, body: { success: true } }
}

// GET: Return battle status for polling
export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ roomId: string }> }
) {
    const { roomId } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: battle, error } = await supabase
        .from('battles')
        .select('id, status, player2_id')
        .eq('id', roomId)
        .single()

    if (error || !battle) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

    return NextResponse.json({ status: battle.status, player2_id: battle.player2_id })
}

// DELETE: Cancel and delete a waiting room (creator only)
export async function DELETE(
    _request: NextRequest,
    context: { params: Promise<{ roomId: string }> }
) {
    const { roomId } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await cancelWaitingRoom(roomId, user.id)
    return NextResponse.json(result.body, { status: result.status })
}

// POST: same as DELETE, used by navigator.sendBeacon cleanup on page leave.
export async function POST(
    _request: NextRequest,
    context: { params: Promise<{ roomId: string }> }
) {
    const { roomId } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await cancelWaitingRoom(roomId, user.id)
    return NextResponse.json(result.body, { status: result.status })
}
