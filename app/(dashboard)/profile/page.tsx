import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CharacterCard from '@/components/character/CharacterCard'
import { Trophy, BookOpen, Zap, Target } from 'lucide-react'
import { ensureUserBadges } from '@/lib/game/badges'
import BadgeIcon from '@/components/character/BadgeIcon'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    await ensureUserBadges(supabase, user.id)

    const [profileRes, badgesRes, completedRes, battlesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_badges').select('*, badges(*)').eq('user_id', user.id),
        supabase.from('user_modules').select('*, modules(title, category)').eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('battles').select('*').or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`).eq('status', 'finished'),
    ])

    const profile = profileRes.data
    if (!profile) redirect('/login')

    const badges = badgesRes.data || []
    const completedModules = completedRes.data || []
    const battles = battlesRes.data || []
    const battlesWon = battles.filter(b => b.winner_id === user.id).length

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <CharacterCard profile={profile} showStats={true} />

                {/* Detailed Stats */}
                <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                        Statistik Lengkap
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { label: 'Modul Diselesaikan', value: completedModules.length, icon: <BookOpen size={14} />, color: 'var(--accent-cyan)' },
                            { label: 'Battle Dimainkan', value: battles.length, icon: <Zap size={14} />, color: 'var(--accent-red)' },
                            { label: 'Battle Dimenangi', value: battlesWon, icon: <Trophy size={14} />, color: 'var(--accent-gold)' },
                            { label: 'Winrate Battle', value: battles.length ? `${Math.round((battlesWon / battles.length) * 100)}%` : '0%', icon: <Target size={14} />, color: 'var(--accent-green)' },
                        ].map((stat) => (
                            <div key={stat.label} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 12px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: stat.color }}>
                                    {stat.icon}
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stat.label}</span>
                                </div>
                                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                    🏅 Badge & Achievement ({badges.length})
                </h3>
                {badges.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        Belum ada badge. Selesaikan quest dan battle untuk mendapatkan badge!
                    </p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                        {badges.map((ub) => (
                            <div key={ub.id} style={{
                                backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                                borderRadius: '4px', padding: '12px', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '4px', lineHeight: 1 }}>
                                    <BadgeIcon icon={ub.badges?.icon_url} size={24} />
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-gold)' }}>{ub.badges?.name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Modules */}
            <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                    📚 Modul Selesai ({completedModules.length})
                </h3>
                {completedModules.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Belum ada modul yang diselesaikan. Mulai belajar sekarang!</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                        {completedModules.map((um) => (
                            <div key={um.id} style={{
                                padding: '10px 12px', borderRadius: '4px',
                                backgroundColor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}>
                                <span style={{ color: 'var(--accent-green)' }}>✓</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                                    {(um as Record<string, unknown> & { modules?: { title: string } }).modules?.title || 'Modul'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
