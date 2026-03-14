import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { DashboardProvider } from '@/components/layout/DashboardProvider'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkStreakStatus } from '@/lib/game/streak'
import { format } from 'date-fns'
import { ensureDailyQuestsAndProgress } from '@/lib/game/dailyQuests'
import { updateQuestProgress } from '@/lib/game/quests'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const today = format(new Date(), 'yyyy-MM-dd')

    const { data: streakProfile, error: streakProfileError } = await supabase
        .from('profiles')
        .select('streak_count, last_active')
        .eq('id', user.id)
        .maybeSingle()

    if (streakProfileError) {
        console.error('Failed to load profile before seeding daily quests:', streakProfileError)
        redirect('/register')
    }

    if (!streakProfile) {
        redirect('/register')
    }

    await ensureDailyQuestsAndProgress(supabase, user.id, today)

    if (streakProfile) {
        const streakStatus = checkStreakStatus(streakProfile.last_active, streakProfile.streak_count)
        if (streakStatus.shouldUpdate) {
            await supabase
                .from('profiles')
                .update({
                    streak_count: streakStatus.streakCount,
                    last_active: today,
                })
                .eq('id', user.id)
        }

        if (streakStatus.isActive) {
            await updateQuestProgress(supabase, user.id, 'maintain_streak', streakStatus.streakCount, today)
        }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <DashboardProvider profile={profile}>
            <div className="dashboard-shell" style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
                <Sidebar />
                <div className="dashboard-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div className="dashboard-topbar">
                        <Navbar />
                    </div>
                    <main className="dashboard-content" style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--bg-primary)' }}>
                        {children}
                    </main>
                </div>
            </div>
        </DashboardProvider>
    )
}
