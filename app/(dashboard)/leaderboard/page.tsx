import { createClient } from '@/lib/supabase/server'
import LeaderboardClient from './LeaderboardClient'

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const [allTimeRes, weeklyRes] = await Promise.all([
        supabase.from('profiles').select('id, username, full_name, school_name, city, avatar_class, level, xp, streak_count')
            .order('xp', { ascending: false }).limit(100),
        supabase.from('profiles').select('id, username, full_name, school_name, city, avatar_class, level, xp, streak_count')
            .order('streak_count', { ascending: false }).limit(50),
    ])

    // Group by school
    const allUsers = allTimeRes.data || []
    const schoolMap: Record<string, { school: string; city: string; totalXp: number; members: number }> = {}
    allUsers.forEach(u => {
        if (u.school_name) {
            if (!schoolMap[u.school_name]) schoolMap[u.school_name] = { school: u.school_name, city: u.city || '', totalXp: 0, members: 0 }
            schoolMap[u.school_name].totalXp += u.xp
            schoolMap[u.school_name].members++
        }
    })
    const schoolRanking = Object.values(schoolMap).sort((a, b) => b.totalXp - a.totalXp)

    return (
        <LeaderboardClient
            allTime={allUsers}
            weekly={weeklyRes.data || []}
            schoolRanking={schoolRanking}
            currentUserId={user?.id || null}
        />
    )
}
