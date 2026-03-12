import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PracticeArena from './PracticeArena'

export const dynamic = 'force-dynamic'

export default async function BattleComputerPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: questionPool } = await supabase
        .from('battle_questions')
        .select('id, category, question_text, options, correct_option, difficulty, explanation')
        .eq('is_active', true)
        .limit(400)

    return <PracticeArena questionPool={questionPool || []} />
}

