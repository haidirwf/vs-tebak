'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CharacterCard from '@/components/character/CharacterCard'
import { Trophy, BookOpen, Zap, Target } from 'lucide-react'
import BadgeIcon from '@/components/character/BadgeIcon'
import { useUserStore } from '@/stores/userStore'
import { useContentStore } from '@/stores/contentStore'
import { createClient } from '@/lib/supabase/client'
import { ensureUserBadges } from '@/lib/game/badges'

export default function ProfilePage() {
    const router = useRouter()
    const { profile } = useUserStore()
    const {
        profileBadges,
        profileCompletedModules,
        profileBattlesWon,
        profileBattlesTotal,
        profileStatsFetchedAt,
        setProfileStatsData,
    } = useContentStore()

    const [isLoading, setIsLoading] = useState(!profileStatsFetchedAt)

    useEffect(() => {
        const supabase = createClient()

        async function fetchProfileData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setIsLoading(false)
                return
            }

            try {
                await ensureUserBadges(supabase, user.id)

                const [badgesRes, completedRes, battlesRes] = await Promise.all([
                    supabase.from('user_badges').select('id, badges(name, icon_url)').eq('user_id', user.id),
                    supabase.from('user_modules').select('id, modules(title)').eq('user_id', user.id).eq('status', 'completed'),
                    supabase.from('battles').select('winner_id').or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`).eq('status', 'finished'),
                ])

                const badges = badgesRes.data || []
                const completedModules = completedRes.data || []
                const battles = battlesRes.data || []
                const battlesWon = battles.filter((b) => b.winner_id === user.id).length

                const normalizedBadges = badges.map((ub: any) => ({
                    id: ub.id,
                    badge: Array.isArray(ub.badges) ? ub.badges[0] : ub.badges,
                }))
                const normalizedCompletedModules = completedModules.map((um: any) => ({
                    id: um.id,
                    module: Array.isArray(um.modules) ? um.modules[0] : um.modules,
                }))

                setProfileStatsData({
                    badges: normalizedBadges,
                    completedModules: normalizedCompletedModules,
                    battlesWon,
                    battlesTotal: battles.length,
                })
            } catch (err) {
                console.error('Error loading profile stats:', err)
            } finally {
                setIsLoading(false)
            }
        }

        const isStale = !profileStatsFetchedAt || Date.now() - profileStatsFetchedAt > 60_000
        if (isStale) {
            fetchProfileData()
        } else {
            setIsLoading(false)
        }
    }, [profileStatsFetchedAt, setProfileStatsData, router])

    if (!profile) {
        return (
            <div className="responsive-page" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
                <div className="sq-skeleton" style={{ height: '180px', marginBottom: '20px' }} />
                <div className="sq-skeleton" style={{ height: '240px' }} />
            </div>
        )
    }

    const winrate = profileBattlesTotal > 0
        ? `${Math.round((profileBattlesWon / profileBattlesTotal) * 100)}%`
        : '0%'

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
                    <CharacterCard profile={profile} showStats={false} />
                </motion.div>

                {/* Detailed Stats */}
                <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                    className="card"
                    style={{ padding: '20px' }}
                >
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                        Statistik Lengkap
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { label: 'Modul Diselesaikan', value: profileCompletedModules.length, icon: <BookOpen size={14} />, color: 'var(--accent-cyan)' },
                            { label: 'Battle Dimainkan', value: profileBattlesTotal, icon: <Zap size={14} />, color: 'var(--accent-red)' },
                            { label: 'Battle Dimenangi', value: profileBattlesWon, icon: <Trophy size={14} />, color: 'var(--accent-gold)' },
                            { label: 'Winrate Battle', value: winrate, icon: <Target size={14} />, color: 'var(--accent-green)' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + i * 0.05 }}
                                whileHover={{ x: 3 }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 12px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: stat.color }}>
                                    {stat.icon}
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stat.label}</span>
                                </div>
                                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Badges */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="card"
                style={{ padding: '20px', marginBottom: '20px' }}
            >
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                    🏅 Badge & Achievement ({profileBadges.length})
                </h3>
                {profileBadges.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        Belum ada badge. Selesaikan quest dan battle untuk mendapatkan badge!
                    </p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                        {profileBadges.map((ub: any, idx: number) => (
                            <motion.div
                                key={ub.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.25 + idx * 0.04 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="hover-lift"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--accent-gold)33',
                                    borderRadius: '6px', padding: '12px', textAlign: 'center', cursor: 'pointer',
                                }}
                            >
                                <div style={{ fontSize: '24px', marginBottom: '4px', lineHeight: 1 }}>
                                    <BadgeIcon icon={ub.badge?.icon_url} size={24} />
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-gold)' }}>{ub.badge?.name}</div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Completed Modules */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3 }}
                className="card"
                style={{ padding: '20px' }}
            >
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                    📚 Modul Selesai ({profileCompletedModules.length})
                </h3>
                {profileCompletedModules.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Belum ada modul yang diselesaikan. Mulai belajar sekarang!</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                        {profileCompletedModules.map((um: any, mIdx: number) => (
                            <motion.div
                                key={um.id}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.35 + mIdx * 0.03 }}
                                whileHover={{ x: 2 }}
                                style={{
                                    padding: '10px 12px', borderRadius: '4px',
                                    backgroundColor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}
                            >
                                <span style={{ color: 'var(--accent-green)' }}>✓</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                                    {um.module?.title || 'Modul'}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
