import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { DashboardProvider } from '@/components/layout/DashboardProvider'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { ensureDailyQuestsAndProgress } from '@/lib/game/dailyQuests'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const today = format(new Date(), 'yyyy-MM-dd')

    await ensureDailyQuestsAndProgress(supabase, user.id, today)

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        redirect('/register')
    }

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
