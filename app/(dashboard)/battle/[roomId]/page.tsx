import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import BattleArena from './BattleArena'
const BATTLE_QUESTION_COUNT = 10

function stableHash(input: string): number {
    let hash = 2166136261
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i)
        hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
}

function createSeededRng(seed: number): () => number {
    let state = seed >>> 0
    return () => {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0
        return state / 4294967296
    }
}

function shuffleBattleQuestionOptions<T extends { options: string[]; correct_option: number; id: string }>(
    question: T,
    seed: string
): T {
    const indexedOptions = question.options.map((opt, idx) => ({ opt, idx }))
    const rng = createSeededRng(stableHash(`${seed}:${question.id}`))

    // Seeded Fisher-Yates to avoid answer position bias.
    for (let i = indexedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        const tmp = indexedOptions[i]
        indexedOptions[i] = indexedOptions[j]
        indexedOptions[j] = tmp
    }

    const options = indexedOptions.map((item) => item.opt)
    const correct_option = indexedOptions.findIndex((item) => item.idx === question.correct_option)

    return {
        ...question,
        options,
        correct_option: correct_option >= 0 ? correct_option : question.correct_option,
    }
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

    // Participant-only access for battle room page
    if (!isPlayer1 && !isPlayer2) {
        redirect('/battle')
    }

    // Primary source: standalone battle_questions (no dependency to modules table).
    let questionPool: Array<{
        id: string
        question_text: string
        options: string[]
        correct_option: number
        difficulty: string
        explanation: string | null
        module_id?: string
    }> = []

    let standaloneQuery = supabase
        .from('battle_questions')
        .select('id, question_text, options, correct_option, difficulty, explanation')
        .eq('is_active', true)

    if (battle.category && battle.category !== 'general') {
        standaloneQuery = standaloneQuery.eq('category', battle.category)
    }

    const { data: standaloneQuestions, error: standaloneError } = await standaloneQuery.limit(200)

    if (!standaloneError && standaloneQuestions && standaloneQuestions.length > 0) {
        questionPool = standaloneQuestions
    } else {
        // Fallback path for legacy schema.
        let legacyQuery = supabase.from('questions').select('*')
        if (battle.category && battle.category !== 'general') {
            const { data: modules } = await supabase.from('modules').select('id').eq('category', battle.category)
            const moduleIds = modules?.map(m => m.id) || []
            if (moduleIds.length > 0) legacyQuery = legacyQuery.in('module_id', moduleIds)
        }
        const { data: legacyQuestions } = await legacyQuery.limit(200)
        questionPool = legacyQuestions || []
    }

    const questions = [...questionPool]
        .sort((a, b) => stableHash(`${roomId}:${a.id}`) - stableHash(`${roomId}:${b.id}`))
        .slice(0, BATTLE_QUESTION_COUNT)
        .map((q) => shuffleBattleQuestionOptions(q, roomId))

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
