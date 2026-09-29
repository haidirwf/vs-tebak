import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import PracticeArena from './PracticeArena'

export default async function BattleComputerPage() {
    const user = await getAuthenticatedUser()
    if (!user) redirect('/login')

    const supabase = await createClient()

    const { data: questionPool } = await supabase
        .from('battle_questions')
        .select('id, category, question_text, options, correct_option, difficulty, explanation')
        .eq('is_active', true)
        .limit(400)

    return <PracticeArena questionPool={questionPool || []} />
}
