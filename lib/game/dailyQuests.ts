import { SupabaseClient } from '@supabase/supabase-js'

type DailyQuestSeed = {
    title: string
    description: string
    quest_type: 'complete_module' | 'win_battle' | 'maintain_streak' | 'earn_xp'
    target_value: number
    xp_reward: number
}

const DEFAULT_DAILY_QUESTS: DailyQuestSeed[] = [
    {
        title: 'Pelajar Rajin',
        description: 'Selesaikan 1 chapter modul hari ini',
        quest_type: 'complete_module',
        target_value: 1,
        xp_reward: 30,
    },
    {
        title: 'Petarung Sejati',
        description: 'Menangkan 1 battle quiz',
        quest_type: 'win_battle',
        target_value: 1,
        xp_reward: 40,
    },
    {
        title: 'Konsisten',
        description: 'Pertahankan streak harianmu',
        quest_type: 'maintain_streak',
        target_value: 1,
        xp_reward: 50,
    },
    {
        title: 'XP Hunter',
        description: 'Kumpulkan 100 XP hari ini',
        quest_type: 'earn_xp',
        target_value: 100,
        xp_reward: 35,
    },
]

export async function ensureDailyQuestsAndProgress(
    supabase: SupabaseClient,
    userId: string,
    today: string
) {
    // 1) Ensure today's quest templates exist.
    const { data: existingDaily, error: existingDailyError } = await supabase
        .from('daily_quests')
        .select('id, quest_type')
        .eq('date', today)

    if (existingDailyError) {
        console.error('Failed to read daily_quests:', existingDailyError)
        return
    }

    const existingTypes = new Set((existingDaily || []).map((q) => q.quest_type))
    const missingTemplates = DEFAULT_DAILY_QUESTS.filter((q) => !existingTypes.has(q.quest_type))

    if (missingTemplates.length > 0) {
        const payload = missingTemplates.map((q) => ({ ...q, date: today }))
        const { error: insertDailyError } = await supabase
            .from('daily_quests')
            .insert(payload)

        // Ignore duplicate race safely, but keep logs for real failures.
        if (insertDailyError && !insertDailyError.message.toLowerCase().includes('duplicate key')) {
            console.error('Failed to seed daily_quests:', insertDailyError)
        }
    }

    // 2) Ensure user has progress rows for each today's quest.
    const { data: todayQuests, error: todayQuestsError } = await supabase
        .from('daily_quests')
        .select('id')
        .eq('date', today)

    if (todayQuestsError) {
        console.error('Failed to read today quests:', todayQuestsError)
        return
    }
    if (!todayQuests || todayQuests.length === 0) return

    const questIds = todayQuests.map((q) => q.id)
    const { data: existingUserRows, error: existingUserRowsError } = await supabase
        .from('user_daily_quests')
        .select('quest_id')
        .eq('user_id', userId)
        .eq('date', today)

    if (existingUserRowsError) {
        console.error('Failed to read user_daily_quests:', existingUserRowsError)
        return
    }

    const existingQuestIds = new Set((existingUserRows || []).map((r) => r.quest_id))
    const missingUserRows = questIds
        .filter((questId) => !existingQuestIds.has(questId))
        .map((questId) => ({
            user_id: userId,
            quest_id: questId,
            current_value: 0,
            is_completed: false,
            date: today,
        }))

    if (missingUserRows.length > 0) {
        const { error: insertUserQuestsError } = await supabase
            .from('user_daily_quests')
            .insert(missingUserRows)

        if (insertUserQuestsError && !insertUserQuestsError.message.toLowerCase().includes('duplicate key')) {
            console.error('Failed to seed user_daily_quests:', insertUserQuestsError)
        }
    }
}
