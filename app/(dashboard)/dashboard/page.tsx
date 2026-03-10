import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CharacterCard from '@/components/character/CharacterCard'
import DailyQuestList from '@/components/quest/DailyQuestList'
import DashboardStats from '@/components/dashboard/DashboardStats'
import RecentActivity from '@/components/dashboard/RecentActivity'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [profileRes, questsRes, userModulesRes, xpLogRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('daily_quests').select('*').eq('date', format(new Date(), 'yyyy-MM-dd')),
        supabase.from('user_modules').select('*, modules(title, category, xp_reward)').eq('user_id', user.id).eq('status', 'completed').order('completed_at', { ascending: false }).limit(5),
        supabase.from('xp_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ])

    const profile = profileRes.data
    const quests = questsRes.data || []
    const completedModules = userModulesRes.data || []

    if (!profile) redirect('/login')

    // Fetch user quest progress
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data: userQuests } = await supabase
        .from('user_daily_quests')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)

    const dateStr = format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Welcome */}
            <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '2px' }}>
                    {dateStr}
                </p>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700 }}>
                    Selamat datang, {profile.username}! 👋
                </h1>
            </div>

            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Character Card */}
                <CharacterCard profile={profile} showStats={true} />

                {/* Stats */}
                <DashboardStats
                    modulesCompleted={completedModules.length}
                    totalXp={profile.xp}
                    streak={profile.streak_count}
                    level={profile.level}
                />
            </div>

            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Daily Quests */}
                <DailyQuestList quests={quests} userQuests={userQuests || []} />

                {/* Recent Activity */}
                <RecentActivity modules={completedModules} xpLogs={xpLogRes.data || []} />
            </div>
        </div>
    )
}
