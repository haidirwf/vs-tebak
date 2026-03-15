import { SupabaseClient } from '@supabase/supabase-js'

type BadgeRow = {
    id: string
    name: string
    description: string | null
    icon_url: string | null
    condition_type: 'level' | 'streak' | 'battles_won' | 'modules_completed'
    condition_value: number
}

export type EarnedBadge = {
    id: string
    name: string
    description: string | null
    icon_url: string | null
}

export async function ensureUserBadges(supabase: SupabaseClient, userId: string): Promise<EarnedBadge[]> {
    const [profileRes, modulesRes, battlesRes, badgesRes, existingRes] = await Promise.all([
        supabase.from('profiles').select('level, streak_count').eq('id', userId).single(),
        supabase.from('user_modules').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
        supabase.from('battles').select('id', { count: 'exact', head: true }).eq('winner_id', userId).eq('status', 'finished'),
        supabase.from('badges').select('id, name, description, icon_url, condition_type, condition_value'),
        supabase.from('user_badges').select('badge_id').eq('user_id', userId),
    ])

    if (!profileRes.data || !badgesRes.data) return []

    const metrics = {
        level: Number(profileRes.data.level || 0),
        streak: Number(profileRes.data.streak_count || 0),
        modules_completed: Number(modulesRes.count || 0),
        battles_won: Number(battlesRes.count || 0),
    }

    const owned = new Set((existingRes.data || []).map((row) => row.badge_id))
    const toInsert = (badgesRes.data as BadgeRow[])
        .filter((badge) => !owned.has(badge.id))
        .filter((badge) => {
            const value = metrics[badge.condition_type] ?? 0
            return value >= Number(badge.condition_value || 0)
        })
        .map((badge) => ({
            user_id: userId,
            badge_id: badge.id,
        }))

    if (toInsert.length === 0) return []

    const { error } = await supabase.from('user_badges').insert(toInsert)
    if (error) {
        // Ignore duplicate race; unique(user_id, badge_id) handles idempotency.
        if (!String(error.message || '').toLowerCase().includes('duplicate')) {
            console.error('Failed to insert earned badges:', error)
        }
        return []
    }

    const insertedIds = new Set(toInsert.map((b) => b.badge_id))
    return (badgesRes.data as BadgeRow[])
        .filter((badge) => insertedIds.has(badge.id))
        .map((badge) => ({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon_url: badge.icon_url,
        }))
}
