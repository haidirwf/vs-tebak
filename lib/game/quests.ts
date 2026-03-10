// lib/game/quests.ts
import { SupabaseClient } from '@supabase/supabase-js'

export type QuestAction = 'complete_module' | 'win_battle' | 'maintain_streak' | 'earn_xp'

interface DailyQuestRelation {
    id: string
    target_value: number
    xp_reward: number
}

interface UserQuestRow {
    id: string
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
    increment: number = 1
) {
    try {
        // Find active daily quests of this type for today
        // Note: In a real app, 'today' should be handled carefully with timezones.
        // For now, we'll look for user_daily_quests that aren't completed yet.
        const { data: userQuests, error: fetchError } = await supabase
            .from('user_daily_quests')
            .select(`
                id,
                current_value,
                is_completed,
                daily_quests!inner (
                    id,
                    target_value,
                    xp_reward
                )
            `)
            .eq('user_id', userId)
            .eq('is_completed', false)
            .eq('daily_quests.quest_type', action)

        if (fetchError || !userQuests) return

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
                    await awardQuestXp(supabase, userId, xpReward, action)
                }
            }
        }
    } catch (e) {
        console.error('Error updating quest progress:', e)
    }
}

async function awardQuestXp(supabase: SupabaseClient, userId: string, amount: number, action: string) {
    // Award XP directly in DB to avoid recursive API calls
    const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .single()

    if (!profile) return

    const newTotalXp = profile.xp + amount
    // Note: We'd normally use calculateLevel from lib/game/xp here
    // but simplified for this internal helper. 
    // In production, we'd import the shared logic.
    
    await supabase.from('profiles').update({ xp: newTotalXp }).eq('id', userId)
    await supabase.from('xp_logs').insert({
        user_id: userId,
        xp_amount: amount,
        reason: `Hadiah Quest: ${action.replace('_', ' ')}`,
    })
}
