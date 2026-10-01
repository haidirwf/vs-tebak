'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ProfileHeroStage from '@/components/profile/ProfileHeroStage'
import BadgeIcon from '@/components/character/BadgeIcon'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'
import { Profile } from '@/types'

interface PublicProfilePageProps {
    params: Promise<{ id: string }>
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
    const resolvedParams = use(params)
    const targetUserId = resolvedParams.id

    const currentUser = useUserStore((s) => s.profile)
    const isOwnProfile = currentUser?.id === targetUserId

    const [targetProfile, setTargetProfile] = useState<Profile | null>(null)
    const [badges, setBadges] = useState<any[]>([])
    const [completedModules, setCompletedModules] = useState<any[]>([])
    const [battlesTotal, setBattlesTotal] = useState(0)
    const [battlesWon, setBattlesWon] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        const supabase = createClient()

        async function fetchPublicProfile() {
            setIsLoading(true)
            setNotFound(false)

            try {
                // Fetch target user profile
                const { data: profileData, error: profileErr } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', targetUserId)
                    .maybeSingle()

                if (profileErr || !profileData) {
                    setNotFound(true)
                    setIsLoading(false)
                    return
                }

                setTargetProfile(profileData as Profile)

                // Fetch badges, modules, and battles concurrently
                const [badgesRes, completedRes, battlesRes] = await Promise.all([
                    supabase.from('user_badges').select('id, badges(name, icon_url)').eq('user_id', targetUserId),
                    supabase.from('user_modules').select('id, modules(title)').eq('user_id', targetUserId).eq('status', 'completed'),
                    supabase.from('battles').select('winner_id').or(`player1_id.eq.${targetUserId},player2_id.eq.${targetUserId}`).eq('status', 'finished'),
                ])

                const rawBadges = badgesRes.data || []
                const rawCompleted = completedRes.data || []
                const rawBattles = battlesRes.data || []

                setBadges(
                    rawBadges.map((ub: any) => ({
                        id: ub.id,
                        badge: Array.isArray(ub.badges) ? ub.badges[0] : ub.badges,
                    }))
                )

                setCompletedModules(
                    rawCompleted.map((um: any) => ({
                        id: um.id,
                        module: Array.isArray(um.modules) ? um.modules[0] : um.modules,
                    }))
                )

                setBattlesTotal(rawBattles.length)
                setBattlesWon(rawBattles.filter((b) => b.winner_id === targetUserId).length)
            } catch (err) {
                console.error('Error loading public profile:', err)
                setNotFound(true)
            } finally {
                setIsLoading(false)
            }
        }

        if (targetUserId) {
            fetchPublicProfile()
        }
    }, [targetUserId])

    if (isLoading) {
        return (
            <div className="responsive-page" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <div className="sq-skeleton" style={{ width: '90px', height: '32px', borderRadius: '8px' }} />
                </div>
                <div className="sq-skeleton" style={{ height: '360px', borderRadius: '16px', marginBottom: '20px' }} />
                <div className="sq-skeleton" style={{ height: '200px', borderRadius: '16px' }} />
            </div>
        )
    }

    if (notFound || !targetProfile) {
        return (
            <div className="responsive-page" style={{ padding: '48px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '14px' }}>🔍</div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                    Pahlawan Tidak Ditemukan
                </h2>
                <p style={{ color: 'var(--color-steel)', fontSize: '13px', lineHeight: 1.5, marginBottom: '24px' }}>
                    Profil pelajar atau pahlawan yang kamu cari tidak tersedia atau belum terdaftar di Skillungo.
                </p>
                <Link
                    href="/leaderboard"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        backgroundColor: '#F5C542',
                        color: '#0a0a0a',
                        fontWeight: 600,
                        fontSize: '13px',
                        textDecoration: 'none',
                    }}
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Leaderboard</span>
                </Link>
            </div>
        )
    }

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Navigation Back */}
            <div style={{ marginBottom: '20px' }}>
                <Link
                    href="/leaderboard"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'color 0.15s ease',
                    }}
                >
                    <ArrowLeft size={14} />
                    <span>Leaderboard</span>
                </Link>
            </div>

            {/* Header Title */}
            <div style={{ marginBottom: '24px', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '4px', color: '#ffffff' }}>
                        👤 Profil {targetProfile.username}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                        {isOwnProfile
                            ? 'Ini adalah profil publikmu yang dapat dilihat oleh seluruh penantang di leaderboard.'
                            : `Melihat atribut tempur RPG dan rekam jejak capaian ${targetProfile.username}.`}
                    </p>
                </div>

                {isOwnProfile && (
                    <Link
                        href="/profile"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '8px 14px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(245, 197, 66, 0.12)',
                            border: '1px solid rgba(245, 197, 66, 0.35)',
                            color: 'var(--color-gold)',
                            textDecoration: 'none',
                        }}
                    >
                        <span>Kelola Profil Saya</span>
                        <ArrowRight size={13} />
                    </Link>
                )}
            </div>

            {/* Hero Stage & RPG Combat Attributes */}
            <ProfileHeroStage
                profile={targetProfile}
                completedModulesCount={completedModules.length}
                battlesTotal={battlesTotal}
                battlesWon={battlesWon}
                isOwnProfile={isOwnProfile}
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
                        {badges.length} Terbuka
                    </div>
                </div>

                {badges.length === 0 ? (
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
                            Belum ada lencana yang terbuka untuk pahlawan ini.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                        {badges.map((ub: any, idx: number) => (
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
                        {completedModules.length} Modul
                    </div>
                </div>

                {completedModules.length === 0 ? (
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
                            Belum ada modul yang diselesaikan.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                        {completedModules.map((um: any, mIdx: number) => (
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
