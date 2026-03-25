import { SupabaseClient } from '@supabase/supabase-js'

type DailyQuestSeed = {
    title: string
    description: string
    quest_type: 'complete_module' | 'win_battle' | 'maintain_streak' | 'earn_xp'
    target_value: number
    xp_reward: number
}

const RECENT_ENSURE_TTL_MS = 60_000
const recentEnsureRuns = new Map<string, number>()

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
    const cacheKey = `${userId}:${today}`
    const now = Date.now()
    const lastRun = recentEnsureRuns.get(cacheKey)
    if (lastRun && now - lastRun < RECENT_ENSURE_TTL_MS) return
    recentEnsureRuns.set(cacheKey, now)

    if (recentEnsureRuns.size > 500) {
        const cutoff = now - RECENT_ENSURE_TTL_MS * 2
        for (const [key, at] of recentEnsureRuns.entries()) {
            if (at < cutoff) recentEnsureRuns.delete(key)
        }
    }

    const parseDate = (value: string) => new Date(`${value}T00:00:00Z`)
    const formatDate = (value: Date) => value.toISOString().slice(0, 10)
    const baseDate = parseDate(today)
    const lowerBound = formatDate(new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000))
    const upperBound = formatDate(new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000))

    const pickEffectiveDate = (rows: Array<{ date: string }>) => {
        if (rows.length === 0) return today
        if (rows.some((r) => r.date === today)) return today
        return [...rows].sort((a, b) => b.date.localeCompare(a.date))[0].date
    }

    // 1) Ensure today's quest templates exist.
    const { data: existingDaily, error: existingDailyError } = await supabase
        .from('daily_quests')
        .select('id, quest_type, date')
        .gte('date', lowerBound)
        .lte('date', upperBound)

    if (existingDailyError) {
        console.error('Failed to read daily_quests:', existingDailyError)
        return
    }

    const existingRows = (existingDaily || []) as Array<{ id: string; quest_type: DailyQuestSeed['quest_type']; date: string }>
    let effectiveDate = pickEffectiveDate(existingRows)
    const existingTypes = new Set(existingRows.filter((q) => q.date === effectiveDate).map((q) => q.quest_type))
    const missingTemplates = DEFAULT_DAILY_QUESTS.filter((q) => !existingTypes.has(q.quest_type))

    if (missingTemplates.length > 0) {
        // IMPORTANT: omit `date` so DB default CURRENT_DATE satisfies RLS policy.
        const payload = missingTemplates.map((q) => ({ ...q }))
        const { error: insertDailyError } = await supabase
            .from('daily_quests')
            .insert(payload)

        // Ignore duplicate race safely, but keep logs for real failures.
        if (insertDailyError && !insertDailyError.message.toLowerCase().includes('duplicate key')) {
            console.error('Failed to seed daily_quests:', insertDailyError.message || insertDailyError.details || insertDailyError)
        }

        // Re-read after best-effort insert to lock onto DB's effective quest date.
        const { data: refreshedDaily } = await supabase
            .from('daily_quests')
            .select('id, quest_type, date')
            .gte('date', lowerBound)
            .lte('date', upperBound)
        const refreshedRows = (refreshedDaily || []) as Array<{ id: string; quest_type: DailyQuestSeed['quest_type']; date: string }>
        if (refreshedRows.length > 0) {
            effectiveDate = pickEffectiveDate(refreshedRows)
        }
    }

    // 2) Ensure user exists in profiles before we touch progress rows.
    const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

    if (profileError) {
        console.error('Failed to confirm profile for daily quests seed:', profileError)
        return
    }

    if (!profileRow) {
        console.warn('Skipping user_daily_quests seed because profile is missing for user:', userId)
        return
    }

    // 2) Ensure user has progress rows for each today's quest.
    const { data: todayQuests, error: todayQuestsError } = await supabase
        .from('daily_quests')
        .select('id')
        .eq('date', effectiveDate)

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
        .eq('date', effectiveDate)

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
            date: effectiveDate,
        }))

    if (missingUserRows.length > 0) {
        const { error: insertUserQuestsError } = await supabase
            .from('user_daily_quests')
            .insert(missingUserRows)

        if (insertUserQuestsError && !insertUserQuestsError.message.toLowerCase().includes('duplicate key')) {
            console.error(
                'Failed to seed user_daily_quests:',
                insertUserQuestsError.message || insertUserQuestsError.details || insertUserQuestsError
            )
        }
    }
}
