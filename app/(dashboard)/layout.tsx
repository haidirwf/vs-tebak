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

    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile) {
        // Coba auto-provision profile dari user metadata jika akun auth ada tapi row profile belum terbuat
        const meta = user.user_metadata || {}
        const fallbackUsername = meta.username || user.email?.split('@')[0] || `hero_${user.id.slice(0, 5)}`
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                username: fallbackUsername,
                full_name: meta.full_name || fallbackUsername,
                school_name: meta.school_name || 'Sekolah Indonesia',
                city: meta.city || 'Indonesia',
                avatar_class: meta.avatar_class || 'warrior',
            }, { onConflict: 'id' })
            .select('*')
            .maybeSingle()

        if (newProfile) {
            profile = newProfile
        } else {
            console.error('Failed to auto-create profile:', insertError)
            // Redirect ke login dengan param reason agar middleware tidak mengarahkan balik ke dashboard
            redirect('/login?reason=profile_missing')
        }
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
