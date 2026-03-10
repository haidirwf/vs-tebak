import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import BattleArena from './BattleArena'

export const dynamic = 'force-dynamic'
const BATTLE_QUESTION_COUNT = 10

function stableHash(input: string): number {
    let hash = 2166136261
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i)
        hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
}

interface PageProps {
    params: Promise<{ roomId: string }>
}

export default async function BattleRoomPage({ params }: PageProps) {
    const { roomId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [battleRes, userProfileRes] = await Promise.all([
        supabase.from('battles').select('*').eq('id', roomId).single(),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])

    if (!battleRes.data) notFound()
    if (!userProfileRes.data) redirect('/login')

    const battle = battleRes.data
    const isPlayer1 = battle.player1_id === user.id
    const isPlayer2 = battle.player2_id === user.id

    // Reject if room is already active/finished and user isn't one of the players
    if (battle.status !== 'waiting' && !isPlayer1 && !isPlayer2) {
        redirect('/battle')
    }

    // Fetch a larger pool first, then shuffle to avoid repetitive question order.
    let questionsQuery = supabase.from('questions').select('*')
    if (battle.category && battle.category !== 'general') {
        const { data: modules } = await supabase.from('modules').select('id').eq('category', battle.category)
        const moduleIds = modules?.map(m => m.id) || []
        if (moduleIds.length > 0) questionsQuery = questionsQuery.in('module_id', moduleIds)
    }
    const { data: questionPool } = await questionsQuery.limit(200)
    const questions = [...(questionPool || [])]
        .sort((a, b) => stableHash(`${roomId}:${a.id}`) - stableHash(`${roomId}:${b.id}`))
        .slice(0, BATTLE_QUESTION_COUNT)

    // Fetch opponent profile
    const opponentId = isPlayer1 ? battle.player2_id : battle.player1_id
    let opponent = null
    if (opponentId) {
        const { data } = await supabase.from('profiles').select('*').eq('id', opponentId).single()
        opponent = data
    }

    return (
        <BattleArena
            battle={battle}
            questions={questions}
            currentUser={userProfileRes.data}
            opponent={opponent}
        />
    )
}
