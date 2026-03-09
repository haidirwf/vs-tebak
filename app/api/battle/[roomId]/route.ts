import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

    const { data: battle } = await supabase
        .from('battles')
        .select('player1_id, status')
        .eq('id', roomId)
        .single()

    if (!battle) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    if (battle.player1_id !== user.id || battle.status !== 'waiting') {
        return NextResponse.json({ error: 'Cannot cancel' }, { status: 403 })
    }

    const { error } = await supabase.from('battles').delete().eq('id', roomId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
