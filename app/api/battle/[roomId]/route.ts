import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/server/rateLimit'

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
    request: NextRequest,
    context: { params: Promise<{ roomId: string }> }
) {
    const { roomId } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rateKey = `battle:poll:${getRateLimitIdentifier(request, user.id)}:${roomId}`
    const rate = checkRateLimit({ key: rateKey, limit: 180, windowMs: 60_000 })
    if (!rate.ok) {
        return NextResponse.json({
            error: 'Polling terlalu cepat. Coba lagi sebentar.',
            retry_after_ms: rate.retryAfterMs,
        }, { status: 429 })
    }

    const { data: battle, error } = await supabase
        .from('battles')
        .select('id, status, player1_id, player2_id')
        .eq('id', roomId)
        .single()

    if (error || !battle) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    const isParticipant = battle.player1_id === user.id || battle.player2_id === user.id
    if (!isParticipant) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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

// PATCH: Fallback finalize (used when host finalization is missed due disconnect/race)
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ roomId: string }> }
) {
    const { roomId } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rateKey = `battle:finalize:${getRateLimitIdentifier(request, user.id)}:${roomId}`
    const rate = checkRateLimit({ key: rateKey, limit: 20, windowMs: 60_000 })
    if (!rate.ok) {
        return NextResponse.json({
            error: 'Finalisasi terlalu cepat. Coba lagi sebentar.',
            retry_after_ms: rate.retryAfterMs,
        }, { status: 429 })
    }

    const body = await request.json() as { myScore?: number; opponentScore?: number }
    const myScore = Number(body.myScore)
    const opponentScore = Number(body.opponentScore)
    if (!Number.isFinite(myScore) || !Number.isFinite(opponentScore) || myScore < 0 || opponentScore < 0) {
        return NextResponse.json({ error: 'Invalid score payload' }, { status: 400 })
    }

    const { data: battle, error } = await supabase
        .from('battles')
        .select('id, status, player1_id, player2_id, player1_score, player2_score, winner_id')
        .eq('id', roomId)
        .single()

    if (error || !battle) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    const isParticipant = battle.player1_id === user.id || battle.player2_id === user.id
    if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (battle.status === 'finished') {
        return NextResponse.json({
            success: true,
            alreadyFinalized: true,
            battle: {
                id: battle.id,
                status: battle.status,
                player1_score: battle.player1_score,
                player2_score: battle.player2_score,
                winner_id: battle.winner_id,
            },
        })
    }

    if (!battle.player1_id || !battle.player2_id) {
        return NextResponse.json({ error: 'Battle not ready for finalize' }, { status: 409 })
    }

    const isPlayer1 = battle.player1_id === user.id
    const incomingP1 = isPlayer1 ? myScore : opponentScore
    const incomingP2 = isPlayer1 ? opponentScore : myScore
    const player1Score = Math.max(Number(battle.player1_score || 0), Math.floor(incomingP1))
    const player2Score = Math.max(Number(battle.player2_score || 0), Math.floor(incomingP2))
    const winnerId =
        player1Score === player2Score
            ? null
            : player1Score > player2Score
                ? battle.player1_id
                : battle.player2_id

    const { data: updated, error: updateError } = await supabase
        .from('battles')
        .update({
            status: 'finished',
            player1_score: player1Score,
            player2_score: player2Score,
            winner_id: winnerId,
        })
        .eq('id', roomId)
        .neq('status', 'finished')
        .select('id, status, player1_score, player2_score, winner_id')
        .maybeSingle()

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    if (!updated) {
        const { data: finalBattle } = await supabase
            .from('battles')
            .select('id, status, player1_score, player2_score, winner_id')
            .eq('id', roomId)
            .single()

        return NextResponse.json({ success: true, battle: finalBattle })
    }

    return NextResponse.json({ success: true, battle: updated })
}
