'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AvatarClass, Profile } from '@/types'
import { CHARACTER_ROLES } from '@/lib/game/character'
import { getStarterItemsForClass } from '@/lib/game/items'
import CharacterVisual from './CharacterVisual'
import { Swords, Sparkles, Shield, Zap, Check, ArrowRight, Loader2 } from 'lucide-react'
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
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(5, 5, 10, 0.88)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    overflowY: 'auto',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    className="product-demo-panel"
                    style={{
                        width: '100%',
                        maxWidth: '840px',
                        maxHeight: '92vh',
                        overflowY: 'auto',
                        padding: '32px 28px',
                        borderRadius: '16px',
                        border: `1px solid ${roleInfo.themeColor}55`,
                        boxShadow: `0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px ${roleInfo.themeColor}22`,
                        position: 'relative',
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                backgroundColor: `${roleInfo.themeColor}15`,
                                border: `1px solid ${roleInfo.themeColor}44`,
                                color: roleInfo.themeColor,
                                fontSize: '12px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-heading)',
                                marginBottom: '10px',
                            }}
                        >
                            <Sparkles size={14} /> Pembuatan Karakter Baru
                        </div>
                        <h2
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '24px',
                                fontWeight: 800,
                                color: '#ffffff',
                                margin: '0 0 6px 0',
                            }}
                        >
                            Pilih Pahlawan Belajarmu
                        </h2>
                        <p style={{ color: 'var(--color-fog)', fontSize: '13px', margin: 0 }}>
                            Setiap role memiliki karakteristik, atribut tempur, dan buff unik untuk arena battle.
                        </p>
                    </div>

                    {/* Role Selection Tabs */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '10px',
                            marginBottom: '24px',
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
                                        padding: '12px 8px',
                                        borderRadius: '12px',
                                        border: `1px solid ${isSelected ? r.themeColor : 'rgba(255, 255, 255, 0.08)'}`,
                                        backgroundColor: isSelected ? `${r.themeColor}18` : 'rgba(255, 255, 255, 0.03)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <span style={{ fontSize: '24px', marginBottom: '4px' }}>{r.avatarEmoji}</span>
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
                                    <span style={{ fontSize: '10px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                        {r.title}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Main Character Showcase: 2 Columns */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(240px, 300px) 1fr',
                            gap: '24px',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            borderRadius: '14px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            padding: '20px',
                            marginBottom: '24px',
                        }}
                    >
                        {/* Visual Avatar Stage */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '12px',
                                border: `1px solid ${roleInfo.themeColor}33`,
                                padding: '16px',
                            }}
                        >
                            <CharacterVisual
                                role={selectedRole}
                                size={190}
                                showAura={true}
                                interactive={true}
                            />
                            <div
                                style={{
                                    marginTop: '8px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    color: roleInfo.themeColor,
                                    fontWeight: 700,
                                }}
                            >
                                {roleInfo.subtitle}
                            </div>
                        </div>

                        {/* Role Details & Stats */}
                        <div>
                            <div style={{ marginBottom: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <h3
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '20px',
                                            fontWeight: 700,
                                            color: '#ffffff',
                                            margin: 0,
                                        }}
                                    >
                                        {roleInfo.name} — {roleInfo.title}
                                    </h3>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--color-fog)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                                    {roleInfo.description}
                                </p>
                            </div>

                            {/* Inherent Role Perk */}
                            <div
                                style={{
                                    backgroundColor: `${roleInfo.themeColor}12`,
                                    border: `1px solid ${roleInfo.themeColor}35`,
                                    borderRadius: '10px',
                                    padding: '10px 14px',
                                    marginBottom: '16px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                    <Zap size={14} style={{ color: roleInfo.themeColor }} />
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: roleInfo.themeColor }}>
                                        Kemampuan Spesial: {roleInfo.perk.name}
                                    </span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--color-silver)', lineHeight: 1.4 }}>
                                    {roleInfo.perk.effect} — {roleInfo.perk.description}
                                </div>
                            </div>

                            {/* Base Stats Grid */}
                            <div style={{ marginBottom: '16px' }}>
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
                                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                                borderRadius: '6px',
                                                padding: '6px 8px',
                                                border: '1px solid rgba(255, 255, 255, 0.06)',
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
                                    Paket Kostum & Aksesoris Awal (Gratis):
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {starterItems.map(it => (
                                        <div
                                            key={it.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                                backgroundColor: 'rgba(232, 64, 64, 0.1)',
                                borderRadius: '8px',
                                border: '1px solid rgba(232, 64, 64, 0.3)',
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
                                boxShadow: `0 8px 24px ${roleInfo.themeColor}55`,
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
                                    <span>Pilih {roleInfo.name} & Mulai</span>
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
