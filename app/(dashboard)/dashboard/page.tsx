import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CharacterCard from '@/components/character/CharacterCard'
import DailyQuestList from '@/components/quest/DailyQuestList'
import DashboardStats from '@/components/dashboard/DashboardStats'
import RecentActivity from '@/components/dashboard/RecentActivity'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { ensureDailyQuestsAndProgress } from '@/lib/game/dailyQuests'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    const today = format(new Date(), 'yyyy-MM-dd')

    await ensureDailyQuestsAndProgress(supabase, user.id, today)

    const [profileRes, questsRes, userModulesRes, xpLogRes, userQuestsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('daily_quests').select('*').eq('date', today),
        supabase.from('user_modules').select('*, modules(title, category, xp_reward)').eq('user_id', user.id).eq('status', 'completed').order('completed_at', { ascending: false }).limit(5),
        supabase.from('xp_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('user_daily_quests').select('*').eq('user_id', user.id).eq('date', today),
    ])

    const profile = profileRes.data
    const quests = questsRes.data || []
    const completedModules = userModulesRes.data || []

    if (!profile) redirect('/login')

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

            <div style={{ marginBottom: '20px' }}>
                <CharacterCard profile={profile} showStats={true} />
            </div>

            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                <div>
                    <div className="card" style={{ padding: '20px' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🎭 Benefit Role
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {[
                                { name: 'Warrior', desc: '+25% XP Modul Coding', color: 'var(--accent-red)', icon: '⚔️' },
                                { name: 'Mage', desc: '+25% XP Modul Desain', color: 'var(--accent-cyan)', icon: '🔮' },
                                { name: 'Archer', desc: '+25% XP Menang Battle', color: 'var(--accent-green)', icon: '🏹' },
                                { name: 'Healer', desc: '+25% XP Modul Produktivitas & Fokus', color: 'var(--accent-gold)', icon: '✨' },
                            ].map(role => (
                                <div key={role.name} style={{
                                    padding: '12px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: '8px',
                                    border: `1px solid ${role.name.toLowerCase() === profile.avatar_class ? role.color : 'var(--border)'}`,
                                    position: 'relative',
                                    opacity: role.name.toLowerCase() === profile.avatar_class ? 1 : 0.6
                                }}>
                                    {role.name.toLowerCase() === profile.avatar_class && (
                                        <div style={{
                                            position: 'absolute', top: '-8px', right: '8px',
                                            backgroundColor: role.color, color: 'white',
                                            fontSize: '8px', padding: '2px 6px', borderRadius: '4px',
                                            fontWeight: 800
                                        }}>AKTIF</div>
                                    )}
                                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>{role.icon}</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: role.color, fontFamily: 'var(--font-heading)' }}>{role.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{role.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <DashboardStats
                        modulesCompleted={completedModules.length}
                        totalXp={profile.xp}
                        streak={profile.streak_count}
                        level={profile.level}
                    />
                </div>

                <div>
                    <DailyQuestList quests={quests} userQuests={userQuestsRes.data || []} />
                </div>

                <div>
                    <RecentActivity modules={completedModules} xpLogs={xpLogRes.data || []} />
                </div>
            </div>
        </div>
    )
}
