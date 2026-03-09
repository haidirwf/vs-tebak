import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { DashboardProvider } from '@/components/layout/DashboardProvider'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <DashboardProvider profile={profile}>
            <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Navbar />
                    <main style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--bg-primary)' }}>
                        {children}
                    </main>
                </div>
            </div>
        </DashboardProvider>
    )
}
