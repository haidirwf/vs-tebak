'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Profile } from '@/types'
import { useUserStore } from '@/stores/userStore'
import { Flame, Sparkles, Check, ArrowRight, ShieldCheck, Trophy, Target, Loader2 } from 'lucide-react'
import { battleSounds } from '@/lib/game/battle-sounds'

interface StreakOnboardingModalProps {
    isOpen: boolean
    profile: Profile
    onComplete?: () => void
}

type GoalOption = {
    minutes: number
    label: string
    tagline: string
    badge: string
}

const GOAL_OPTIONS: GoalOption[] = [
    {
        minutes: 5,
        label: 'Santai',
        tagline: '5 menit/hari · Cocok untuk pemula agar rutin membaca & latihan',
        badge: 'Pengenalan Ringkas',
    },
    {
        minutes: 10,
        label: 'Reguler',
        tagline: '10 menit/hari · Keseimbangan ideal pemahaman & pengerjaan kuis',
        badge: 'Rekomendasi Utama',
    },
    {
        minutes: 15,
        label: 'Intensif',
        tagline: '15 menit/hari · Akselerasi penuh penguasaan modul & arena duel',
        badge: 'Akselerasi Skill',
    },
]

export default function StreakOnboardingModal({
    isOpen,
    profile,
    onComplete,
}: StreakOnboardingModalProps) {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
    const [selectedMinutes, setSelectedMinutes] = useState<number>(profile.streak_goal_minutes || 10)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [claimedBonus, setClaimedBonus] = useState(false)
    const [rewardXpAmount, setRewardXpAmount] = useState<number>(50)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    async function handleConfirmGoalAndClaim() {
        setIsSubmitting(true)
        setError(null)

        try {
            const res = await fetch('/api/onboarding/streak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ streakGoalMinutes: selectedMinutes }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                setError(data.error || 'Gagal menyimpan target streak.')
                setIsSubmitting(false)
                return
            }

            if (data.profile) {
                useUserStore.getState().setProfile(data.profile)
            } else if (typeof data.newXp === 'number') {
                useUserStore.getState().updateXP(data.newXp)
            }

            setRewardXpAmount(data.bonusXp || 50)
            setClaimedBonus(true)
            setIsSubmitting(false)
            setStep(3)

            // Micro sound effect celebration
            try {
                battleSounds.playVictory()
            } catch {
                // Ignore audio context lock
            }
        } catch (e: any) {
            setError(e.message || 'Terjadi kesalahan jaringan.')
            setIsSubmitting(false)
        }
    }

    function handleFinishOnboarding() {
        onComplete?.()
    }

    return (
        <AnimatePresence>
            <div
                className="modal-overlay"
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.88)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    overflow: 'hidden',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{
                        width: '100%',
                        maxWidth: '520px',
                        padding: '24px',
                        borderRadius: '16px',
                        backgroundColor: '#141414',
                        border: '1px solid #313131',
                        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
                        position: 'relative',
                    }}
                >
                    {/* Step Indicators */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                style={{
                                    flex: 1,
                                    height: '4px',
                                    borderRadius: '2px',
                                    backgroundColor: s <= step ? 'var(--accent-gold)' : '#282828',
                                    transition: 'background-color 0.3s ease',
                                }}
                            />
                        ))}
                    </div>

                    {/* STEP 1: THE HOOK */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                {/* Mascot / Avatar Badge */}
                                <div
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto 16px',
                                        borderRadius: '16px',
                                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                        border: '1.5px solid rgba(245, 158, 11, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '42px',
                                    }}
                                >
                                    🦉
                                </div>

                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                        color: 'var(--accent-gold)',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        marginBottom: '10px',
                                    }}
                                >
                                    <Sparkles size={13} />
                                    <span>Selamat Datang di Skillungo</span>
                                </div>

                                <h2
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '22px',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        margin: '0 0 10px 0',
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    Nyalakan Api Kebiasaan Belajar
                                </h2>

                                <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.6, margin: 0 }}>
                                    Kunci utama menjadi ahli di bidang IT, Desain, dan Bisnis bukanlah belajar marathon semalaman, melainkan <strong style={{ color: '#ffffff' }}>konsistensi kecil setiap hari</strong> melalui <strong style={{ color: 'var(--accent-gold)' }}>Streak Harian 🔥</strong>.
                                </p>
                            </div>

                            {/* Key Highlights */}
                            <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        backgroundColor: '#181818',
                                        border: '1px solid #282828',
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '8px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                            color: '#ef4444',
                                        }}
                                    >
                                        <Flame size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                                            Pertahankan Api Streak Harian
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            Selesaikan minimal 1 sesi atau kuis harian untuk menjaga nyala api
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        backgroundColor: '#181818',
                                        border: '1px solid #282828',
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '8px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                            color: 'var(--accent-gold)',
                                        }}
                                    >
                                        <Trophy size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                                            Raih Pengali Bonus XP & Lencana
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            Makin panjang streak milikmu, makin besar bonus XP yang kamu peroleh
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                style={{
                                    width: '100%',
                                    padding: '12px 20px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: 'var(--accent-gold)',
                                    color: 'var(--bg-primary)',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                            >
                                <span>Pilih Komitmen Target Harian</span>
                                <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: STREAK GOAL SELECTION */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(0, 212, 255, 0.12)',
                                        border: '1px solid rgba(0, 212, 255, 0.3)',
                                        color: 'var(--accent-cyan)',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        marginBottom: '10px',
                                    }}
                                >
                                    <Target size={13} />
                                    <span>Pilih Target Komitmen</span>
                                </div>

                                <h2
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        margin: '0 0 6px 0',
                                    }}
                                >
                                    Berapa lama kamu ingin latihan tiap hari?
                                </h2>

                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                                    Kamu bisa mengubah target ini kapan saja melalui menu pengaturan profil.
                                </p>
                            </div>

                            {/* Options List */}
                            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                                {GOAL_OPTIONS.map((opt) => {
                                    const isSelected = selectedMinutes === opt.minutes
                                    return (
                                        <button
                                            key={opt.minutes}
                                            type="button"
                                            onClick={() => setSelectedMinutes(opt.minutes)}
                                            style={{
                                                padding: '14px 16px',
                                                borderRadius: '12px',
                                                border: `1.5px solid ${isSelected ? 'var(--accent-gold)' : '#282828'}`,
                                                backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.08)' : '#181818',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span
                                                        style={{
                                                            fontFamily: 'var(--font-heading)',
                                                            fontSize: '15px',
                                                            fontWeight: 700,
                                                            color: isSelected ? 'var(--accent-gold)' : '#ffffff',
                                                        }}
                                                    >
                                                        {opt.label} ({opt.minutes} Menit / Hari)
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: '10px',
                                                            fontWeight: 600,
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            backgroundColor: isSelected
                                                                ? 'rgba(245, 158, 11, 0.2)'
                                                                : 'rgba(255, 255, 255, 0.06)',
                                                            color: isSelected ? 'var(--accent-gold)' : 'var(--text-muted)',
                                                        }}
                                                    >
                                                        {opt.badge}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                                    {opt.tagline}
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    border: `2px solid ${isSelected ? 'var(--accent-gold)' : '#444'}`,
                                                    backgroundColor: isSelected ? 'var(--accent-gold)' : 'transparent',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    marginLeft: '12px',
                                                }}
                                            >
                                                {isSelected && <Check size={12} color="#000" strokeWidth={3} />}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            {error && (
                                <div
                                    style={{
                                        color: 'var(--accent-red)',
                                        fontSize: '12px',
                                        marginBottom: '14px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        textAlign: 'center',
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid #282828',
                                        backgroundColor: '#181818',
                                        color: 'var(--text-secondary)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Kembali
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={handleConfirmGoalAndClaim}
                                    style={{
                                        flex: 1,
                                        padding: '12px 20px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        backgroundColor: 'var(--accent-gold)',
                                        color: 'var(--bg-primary)',
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Menyimpan Target...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Konfirmasi Target & Klaim Bonus</span>
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: COMMITMENT & FIRST REWARD */}
                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ textAlign: 'center' }}
                        >
                            {/* Animated Glowing Flame Ignition */}
                            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 16px' }}>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.12, 1],
                                        opacity: [0.6, 0.9, 0.6],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(245, 158, 11, 0.25)',
                                        filter: 'blur(16px)',
                                    }}
                                />

                                <motion.div
                                    initial={{ scale: 0.5, rotate: -20 }}
                                    animate={{ scale: 1.1, rotate: 0 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 15,
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '24px',
                                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                        border: '2px solid var(--accent-gold)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '56px',
                                        position: 'relative',
                                        boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)',
                                    }}
                                >
                                    🔥
                                </motion.div>
                            </div>

                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    color: 'var(--accent-green)',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    marginBottom: '10px',
                                }}
                            >
                                <Check size={13} />
                                <span>Api Streak Menyala!</span>
                            </div>

                            <h2
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '22px',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    margin: '0 0 6px 0',
                                }}
                            >
                                Target {selectedMinutes} Menit Berhasil Diaktifkan
                            </h2>

                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
                                Selamat! Sebagai apresiasi awal komitmen belajarmu, kamu mendapatkan bonus FTUE awal.
                            </p>

                            {/* Bonus XP Box */}
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.15 }}
                                style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    marginBottom: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                }}
                            >
                                <Sparkles size={24} style={{ color: 'var(--accent-gold)' }} />
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                                        Bonus Pengalaman Pertama
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                                        +{rewardXpAmount} XP Langsung Diklaim!
                                    </div>
                                </div>
                            </motion.div>

                            <button
                                type="button"
                                onClick={() => setStep(4)}
                                style={{
                                    width: '100%',
                                    padding: '12px 20px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: 'var(--accent-gold)',
                                    color: 'var(--bg-primary)',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                            >
                                <span>Lanjut ke Preview Komunitas</span>
                                <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 4: STREAK SOCIETY PREVIEW */}
                    {step === 4 && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        margin: '0 auto 12px',
                                        borderRadius: '14px',
                                        backgroundColor: 'rgba(168, 85, 247, 0.12)',
                                        border: '1.5px solid rgba(168, 85, 247, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '30px',
                                    }}
                                >
                                    👑
                                </div>

                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(168, 85, 247, 0.12)',
                                        border: '1px solid rgba(168, 85, 247, 0.3)',
                                        color: '#a855f7',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        marginBottom: '10px',
                                    }}
                                >
                                    <ShieldCheck size={13} />
                                    <span>Fitur Komunitas Eksklusif</span>
                                </div>

                                <h2
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        margin: '0 0 6px 0',
                                    }}
                                >
                                    Komunitas "Streak Society"
                                </h2>

                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                                    Jaga streak belajar kamu selama 7 hari berturut-turut untuk membuka tempat kehormatan ini!
                                </p>
                            </div>

                            {/* Preview Perks */}
                            <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
                                {[
                                    {
                                        title: 'Lencana Eksklusif 7-Day Streak',
                                        desc: 'Pamerkan lencana bergengsi di profil hero & leaderboard arena.',
                                        icon: '🏅',
                                    },
                                    {
                                        title: 'Bonus Multiplier XP Harian',
                                        desc: 'Dapatkan pengali poin XP lebih besar saat menyelesaikan modul.',
                                        icon: '⚡',
                                    },
                                    {
                                        title: 'Akses Arena Duel 1v1 Top Hero',
                                        desc: 'Bertanding melawan siswa terbaik se-Indonesia di ranking papan atas.',
                                        icon: '⚔️',
                                    },
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            backgroundColor: '#181818',
                                            border: '1px solid #282828',
                                        }}
                                    >
                                        <div style={{ fontSize: '24px', lineHeight: 1 }}>{item.icon}</div>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                                                {item.title}
                                            </div>
                                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                                                {item.desc}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={handleFinishOnboarding}
                                style={{
                                    width: '100%',
                                    padding: '12px 20px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: 'var(--accent-gold)',
                                    color: 'var(--bg-primary)',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                            >
                                <span>Mulai Petualangan Belajar Sekarang</span>
                                <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
