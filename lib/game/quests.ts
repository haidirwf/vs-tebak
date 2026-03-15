// lib/game/quests.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { calculateLevel } from '@/lib/game/xp'

export type QuestAction = 'complete_module' | 'win_battle' | 'maintain_streak' | 'earn_xp'

interface DailyQuestRelation {
    id: string
    title: string
    quest_type: QuestAction
    target_value: number
    xp_reward: number
}

interface UserQuestRow {
    id: string
    quest_id: string
    date: string
    current_value: number
    is_completed: boolean
    daily_quests: DailyQuestRelation | DailyQuestRelation[]
}

/**
 * Updates progress for a user's daily quests based on an action.
 * @param supabase Authenticated Supabase client (server-side)
 * @param userId The user's ID
 * @param action The type of quest to update
 * @param increment How much to increment the current_value (default 1)
 */
export async function updateQuestProgress(
    supabase: SupabaseClient,
    userId: string,
    action: QuestAction,
    increment: number = 1,
    today: string = format(new Date(), 'yyyy-MM-dd')
) {
    let awardedXp = 0
    try {
        const { data: userQuests, error: fetchError } = await supabase
            .from('user_daily_quests')
            .select(`
                id,
                quest_id,
                date,
                current_value,
                is_completed,
                daily_quests!inner (
                    id,
                    title,
                    quest_type,
                    target_value,
                    xp_reward
                )
            `)
            .eq('user_id', userId)
            .eq('date', today)
            .eq('is_completed', false)
            .eq('daily_quests.quest_type', action)
            .eq('daily_quests.date', today)

        if (fetchError || !userQuests) return 0

        for (const uq of userQuests as unknown as UserQuestRow[]) {
            const questData = Array.isArray(uq.daily_quests) ? uq.daily_quests[0] : uq.daily_quests
            if (!questData) continue

            const newValue = uq.current_value + increment
            const target = questData.target_value
            const completed = newValue >= target

            await supabase
                .from('user_daily_quests')
                .update({
                    current_value: completed ? target : newValue,
                    is_completed: completed,
                })
                .eq('id', uq.id)

            // If just completed, maybe award bonus XP? 
            // Usually the UI/API handles the quest reward, 
            // but we could also add a separate XP log here if we want it truly automatic.
            if (completed) {
                const xpReward = questData.xp_reward
                if (xpReward > 0) {
                    const gained = await awardQuestXp(
                        supabase,
                        userId,
                        uq.quest_id,
                        xpReward,
                        questData.title || action.replace(/_/g, ' ')
                    )
                    awardedXp += gained
                }
            }
        }
    } catch (e) {
        console.error('Error updating quest progress:', e)
    }
    return awardedXp
}

async function awardQuestXp(
    supabase: SupabaseClient,
    userId: string,
    questId: string,
    amount: number,
    questTitle: string
) {
    const marker = `[dailyquest:${questId}]`

    const { data: existingLog } = await supabase
        .from('xp_logs')
        .select('id')
        .eq('user_id', userId)
        .ilike('reason', `%${marker}%`)
        .limit(1)

    // Idempotent: prevent double reward on race/retry.
    if (existingLog && existingLog.length > 0) return 0

    // Award XP directly in DB to avoid recursive API calls.
    const { data: profile } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', userId)
        .single()

    if (!profile) return 0

    const newTotalXp = profile.xp + amount
    const calc = calculateLevel(newTotalXp)

    await supabase
        .from('profiles')
        .update({
            xp: newTotalXp,
            level: calc.level,
            xp_to_next_level: calc.xpToNext,
        })
        .eq('id', userId)

    await supabase.from('xp_logs').insert({
        user_id: userId,
        xp_amount: amount,
        reason: `Hadiah Quest: ${questTitle} ${marker}`,
    })

    return amount
}
