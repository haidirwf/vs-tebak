'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ProfileHeroStage from '@/components/profile/ProfileHeroStage'
import BadgeIcon from '@/components/character/BadgeIcon'
import { ArrowRight } from 'lucide-react'
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
            <div className="responsive-page" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
                <div className="sq-skeleton" style={{ height: '360px', borderRadius: '16px', marginBottom: '20px' }} />
                <div className="sq-skeleton" style={{ height: '200px', borderRadius: '16px' }} />
            </div>
        )
    }

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header Title */}
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '4px', color: '#ffffff' }}>
                    👤 Profil Pahlawan
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                    Identitas pahlawan, atribut tempur RPG, dan rekam jejak prestasimu.
                </p>
            </div>

            {/* Hero Stage & RPG Combat Attributes */}
            <ProfileHeroStage
                profile={profile}
                completedModulesCount={profileCompletedModules.length}
                battlesTotal={profileBattlesTotal}
                battlesWon={profileBattlesWon}
            />

            {/* Badges & Achievements Section */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                style={{
                    backgroundColor: '#141414',
                    border: '1px solid #282828',
                    borderRadius: '16px',
                    padding: '22px',
                    marginBottom: '20px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                            🏅 Lencana & Prestasi
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--color-steel)', margin: '2px 0 0' }}>
                            Pencapaian dari modul belajar, streak harian, dan duel arena
                        </p>
                    </div>
                    <div
                        style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--accent-gold)',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            padding: '4px 10px',
                            borderRadius: '8px',
                        }}
                    >
                        {profileBadges.length} Terbuka
                    </div>
                </div>

                {profileBadges.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '32px 20px',
                            backgroundColor: 'rgba(255, 255, 255, 0.015)',
                            borderRadius: '12px',
                            border: '1px dashed #282828',
                        }}
                    >
                        <p style={{ color: 'var(--color-steel)', fontSize: '13px', margin: 0 }}>
                            Belum ada lencana yang terbuka. Selesaikan modul dan menangkan battle untuk meraih lencana pertamamu!
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                        {profileBadges.map((ub: any, idx: number) => (
                            <motion.div
                                key={ub.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + idx * 0.03 }}
                                whileHover={{ scale: 1.03, y: -2 }}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.025)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    borderRadius: '10px',
                                    padding: '14px 12px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ fontSize: '26px', marginBottom: '6px', lineHeight: 1 }}>
                                    <BadgeIcon icon={ub.badge?.icon_url} size={28} />
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', lineHeight: 1.3 }}>
                                    {ub.badge?.name}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Completed Modules Section */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.28 }}
                style={{
                    backgroundColor: '#141414',
                    border: '1px solid #282828',
                    borderRadius: '16px',
                    padding: '22px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                            📚 Modul Pembelajaran Selesai
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--color-steel)', margin: '2px 0 0' }}>
                            Daftar materi pembelajaran yang telah berhasil dituntaskan
                        </p>
                    </div>
                    <div
                        style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--accent-green)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.25)',
                            padding: '4px 10px',
                            borderRadius: '8px',
                        }}
                    >
                        {profileCompletedModules.length} Modul
                    </div>
                </div>

                {profileCompletedModules.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '32px 20px',
                            backgroundColor: 'rgba(255, 255, 255, 0.015)',
                            borderRadius: '12px',
                            border: '1px dashed #282828',
                        }}
                    >
                        <p style={{ color: 'var(--color-steel)', fontSize: '13px', margin: '0 0 10px 0' }}>
                            Belum ada modul yang diselesaikan. Asah kemampuanmu dan raih XP belajar sekarang!
                        </p>
                        <Link
                            href="/modules"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'var(--color-primary-light)',
                                textDecoration: 'none',
                            }}
                        >
                            <span>Jelajahi Modul Belajar</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                        {profileCompletedModules.map((um: any, mIdx: number) => (
                            <motion.div
                                key={um.id}
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + mIdx * 0.02 }}
                                whileHover={{ x: 2 }}
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(34, 197, 94, 0.04)',
                                    border: '1px solid rgba(34, 197, 94, 0.18)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}
                            >
                                <span style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '14px' }}>✓</span>
                                <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 500, lineHeight: 1.35 }}>
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
