'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { AvatarClass, Profile } from '@/types'
import { CHARACTER_ROLES } from '@/lib/game/character'
import { getStarterItemsForClass } from '@/lib/game/items'
import CharacterVisual from './CharacterVisual'
import { Sparkles, Zap, Check, ArrowRight, Loader2 } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'

interface CharacterCreationModalProps {
    isOpen: boolean
    profile: Profile
    onComplete?: () => void
}

const ROLES: AvatarClass[] = ['warrior', 'mage', 'archer', 'healer']

export default function CharacterCreationModal({
    isOpen,
    profile,
    onComplete,
}: CharacterCreationModalProps) {
    const router = useRouter()
    const [selectedRole, setSelectedRole] = useState<AvatarClass>(profile.avatar_class || 'warrior')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [confirmedSuccess, setConfirmedSuccess] = useState(false)

    const roleInfo = CHARACTER_ROLES[selectedRole]
    const starterItems = getStarterItemsForClass(selectedRole)

    if (!isOpen && !confirmedSuccess) return null

    async function handleConfirmCharacter() {
        setIsSubmitting(true)
        setError(null)
        try {
            const res = await fetch('/api/character/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar_class: selectedRole }),
            })
            const data = await res.json()
            if (!res.ok || data.error) {
                setError(data.error || 'Gagal menyimpan karakter.')
                setIsSubmitting(false)
                return
            }

            // Update local user store
            if (data.profile) {
                useUserStore.getState().setProfile(data.profile)
            } else {
                useUserStore.getState().setProfile({
                    ...profile,
                    avatar_class: selectedRole,
                    character_created: true,
                    equipped_items: data.equipped || {},
                })
            }

            setConfirmedSuccess(true)
            router.refresh()
            setTimeout(() => {
                onComplete?.()
            }, 1200)
        } catch (e: any) {
            setError(e.message || 'Terjadi kesalahan jaringan.')
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            <div
                className="modal-overlay"
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    overflow: 'hidden',
                    touchAction: 'none',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{
                        width: '100%',
                        maxWidth: '560px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '24px 22px',
                        borderRadius: '16px',
                        backgroundColor: '#141414',
                        border: '1px solid #313131',
                        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
                        position: 'relative',
                        touchAction: 'pan-y',
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(245, 197, 66, 0.12)',
                                border: '1px solid rgba(245, 197, 66, 0.3)',
                                color: 'var(--color-gold)',
                                fontSize: '12px',
                                fontWeight: 600,
                                fontFamily: 'var(--font-heading)',
                                marginBottom: '10px',
                            }}
                        >
                            <Sparkles size={13} />
                            <span>Pahlawan Belajar</span>
                        </div>
                        <h2
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '22px',
                                fontWeight: 700,
                                color: '#ffffff',
                                margin: '0 0 6px 0',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Pilih Pahlawan Belajarmu
                        </h2>
                        <p style={{ color: 'var(--color-fog)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                            Pilih role pahlawan untuk membuka gaya bertarung, bonus XP, dan paket perlengkapan starter gratis.
                        </p>
                    </div>

                    {/* Role Selection Cards Grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '10px',
                            marginBottom: '20px',
                        }}
                    >
                        {ROLES.map((rKey) => {
                            const r = CHARACTER_ROLES[rKey]
                            const isSelected = selectedRole === rKey
                            return (
                                <button
                                    key={rKey}
                                    type="button"
                                    onClick={() => setSelectedRole(rKey)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        padding: '14px 10px',
                                        borderRadius: '12px',
                                        border: `1.5px solid ${isSelected ? r.themeColor : '#313131'}`,
                                        backgroundColor: isSelected ? `${r.themeColor}14` : '#1a1a1a',
                                        cursor: 'pointer',
                                        transition: 'all 0.18s ease',
                                        position: 'relative',
                                    }}
                                >
                                    <span style={{ fontSize: '26px', marginBottom: '6px' }}>{r.avatarEmoji}</span>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 700,
                                            fontSize: '13px',
                                            color: isSelected ? r.themeColor : '#ffffff',
                                        }}
                                    >
                                        {r.name}
                                    </span>
                                    <span style={{ fontSize: '10px', color: 'var(--color-fog)', marginTop: '2px', marginBottom: '8px' }}>
                                        {r.title}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '9.5px',
                                            fontWeight: 600,
                                            color: isSelected ? r.themeColor : 'var(--color-steel)',
                                            backgroundColor: isSelected ? `${r.themeColor}22` : 'rgba(255, 255, 255, 0.05)',
                                            padding: '2px 6px',
                                            borderRadius: '6px',
                                            border: `1px solid ${isSelected ? `${r.themeColor}44` : 'transparent'}`,
                                        }}
                                    >
                                        {r.perk.name}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Character Showcase Card */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(180px, 210px) 1fr',
                            gap: '16px',
                            alignItems: 'center',
                            backgroundColor: '#181818',
                            borderRadius: '14px',
                            border: '1px solid #2a2a2a',
                            padding: '16px',
                            marginBottom: '20px',
                        }}
                    >
                        {/* Visual Stage */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#141414',
                                borderRadius: '12px',
                                border: '1px solid #313131',
                                padding: '14px 10px',
                            }}
                        >
                            <CharacterVisual
                                role={selectedRole}
                                size={150}
                                showAura={true}
                                interactive={true}
                            />
                            <div
                                style={{
                                    marginTop: '8px',
                                    fontSize: '11px',
                                    color: roleInfo.themeColor,
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-heading)',
                                }}
                            >
                                {roleInfo.name} · {roleInfo.subtitle}
                            </div>
                        </div>

                        {/* Role Details */}
                        <div>
                            {/* Role Title & Description */}
                            <div style={{ marginBottom: '14px' }}>
                                <h3
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        margin: '0 0 4px 0',
                                    }}
                                >
                                    {roleInfo.name} — {roleInfo.title}
                                </h3>
                                <p style={{ fontSize: '12px', color: 'var(--color-fog)', margin: 0, lineHeight: 1.5 }}>
                                    {roleInfo.description}
                                </p>
                            </div>

                            {/* Inherent Perk Box */}
                            <div
                                style={{
                                    backgroundColor: '#141414',
                                    border: '1px solid #313131',
                                    borderRadius: '10px',
                                    padding: '10px 14px',
                                    marginBottom: '14px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                    <Zap size={14} style={{ color: roleInfo.themeColor }} />
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: roleInfo.themeColor }}>
                                        Kemampuan Spesial: {roleInfo.perk.name}
                                    </span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--color-silver)', lineHeight: 1.4 }}>
                                    {roleInfo.perk.effect} — {roleInfo.perk.description}
                                </div>
                            </div>

                            {/* Base Stats Grid */}
                            <div style={{ marginBottom: '14px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--color-steel)', fontWeight: 600, marginBottom: '6px' }}>
                                    Atribut Tempur Awal:
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {[
                                        { label: 'HP Darah', val: roleInfo.baseStats.hp, color: '#ef4444' },
                                        { label: 'MP Mana', val: roleInfo.baseStats.mp, color: '#38bdf8' },
                                        { label: 'ATK Serang', val: roleInfo.baseStats.atk, color: '#f59e0b' },
                                        { label: 'DEF Bertahan', val: roleInfo.baseStats.def, color: '#10b981' },
                                        { label: 'CRIT Kritis', val: `${roleInfo.baseStats.crit}%`, color: '#a855f7' },
                                        { label: 'SPEED Gerak', val: roleInfo.baseStats.speed, color: '#06b6d4' },
                                    ].map(st => (
                                        <div
                                            key={st.label}
                                            style={{
                                                backgroundColor: '#141414',
                                                borderRadius: '8px',
                                                padding: '6px 10px',
                                                border: '1px solid #2e2e2e',
                                            }}
                                        >
                                            <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>{st.label}</div>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: st.color, fontFamily: 'var(--font-mono)' }}>
                                                {st.val}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Starter Kit Preview */}
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--color-steel)', fontWeight: 600, marginBottom: '6px' }}>
                                    Perlengkapan Starter Gratis:
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {starterItems.map(it => (
                                        <div
                                            key={it.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                backgroundColor: '#141414',
                                                border: '1px solid #313131',
                                                fontSize: '11px',
                                                color: 'var(--color-silver)',
                                            }}
                                        >
                                            <span>{it.icon}</span>
                                            <span>{it.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div
                            style={{
                                color: 'var(--accent-red)',
                                fontSize: '12px',
                                marginBottom: '16px',
                                padding: '8px 14px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                textAlign: 'center',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Action Footer */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting || confirmedSuccess}
                            onClick={handleConfirmCharacter}
                            style={{
                                padding: '12px 36px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: roleInfo.themeColor,
                                color: '#ffffff',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: isSubmitting || confirmedSuccess ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: `0 8px 20px ${roleInfo.themeColor}40`,
                                transition: 'background-color 0.2s ease',
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Menyiapkan Karakter...</span>
                                </>
                            ) : confirmedSuccess ? (
                                <>
                                    <Check size={16} />
                                    <span>Karakter Berhasil Dibuat!</span>
                                </>
                            ) : (
                                <>
                                    <span>Pilih {roleInfo.name} & Mulai Petualangan</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
