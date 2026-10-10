'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
    const router = useRouter()
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

    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back()
        } else {
            router.push('/dashboard')
        }
    }

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

                if (profileData.username) {
                    router.replace(`/pelajar/${encodeURIComponent(profileData.username)}`)
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
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Pahlawan Tidak Ditemukan
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '24px' }}>
                    Profil pelajar atau pahlawan yang kamu cari tidak tersedia atau belum terdaftar di Skillungo.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={handleBack}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--surface-elevated)',
                            border: '1px solid var(--surface-border)',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}
                    >
                        <ArrowLeft size={14} />
                        <span>Kembali</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Navigation Back */}
            <div style={{ marginBottom: '20px' }}>
                <button
                    type="button"
                    onClick={handleBack}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--text-secondary)',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        padding: '6px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--surface-elevated)',
                        border: '1px solid var(--surface-border)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease, color 0.15s ease',
                    }}
                >
                    <ArrowLeft size={14} />
                    <span>Kembali</span>
                </button>
            </div>

            {/* Unified RPG Profile Arena */}
            <ProfileHeroStage
                profile={targetProfile}
                completedModulesCount={completedModules.length}
                battlesTotal={battlesTotal}
                battlesWon={battlesWon}
                badges={badges}
                completedModules={completedModules}
                isOwnProfile={isOwnProfile}
            />
        </div>
    )
}
