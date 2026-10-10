'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { AvatarClass, Profile } from '@/types'
import { CHARACTER_ROLES } from '@/lib/game/character'
import { getStarterItemsForClass } from '@/lib/game/items'
import CharacterVisual from './CharacterVisual'
import { Sparkles, Zap, Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { useContentStore } from '@/stores/contentStore'

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
        if (isSubmitting || confirmedSuccess) return
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
                setError(data.error || 'Gagal menyimpan pilihan role.')
                setIsSubmitting(false)
                return
            }

            // 1. Immediately update user store
            const newProfile: Profile = data.profile || {
                ...profile,
                avatar_class: selectedRole,
                character_created: true,
                equipped_items: data.equipped || {},
            }
            useUserStore.getState().setProfile(newProfile)

            // 2. Pre-seed contentStore with starter items
            const starters = data.starters || starterItems
            useContentStore.getState().setCharacterInventoryData({
                inventory: starters,
                equipped: data.equipped || {},
            })

            // 3. Mark success and trigger smooth closure
            setConfirmedSuccess(true)
            setIsSubmitting(false)

            setTimeout(() => {
                onComplete?.()
                router.refresh()
            }, 450)
        } catch (e: any) {
            setError(e.message || 'Terjadi gangguan koneksi jaringan.')
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
                    backgroundColor: 'rgba(0, 0, 0, 0.82)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    overflowY: 'auto',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{
                        width: '100%',
                        maxWidth: '680px',
                        maxHeight: '92vh',
                        overflowY: 'auto',
                        padding: '24px 22px',
                        borderRadius: '16px',
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--surface-border)',
                        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65)',
                        position: 'relative',
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                                color: 'var(--accent-gold-text)',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                fontFamily: 'var(--font-heading)',
                                marginBottom: '10px',
                            }}
                        >
                            <Sparkles size={13} style={{ color: 'var(--accent-gold)' }} />
                            <span>Onboarding Pahlawan</span>
                        </div>
                        <h2
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '22px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                margin: '0 0 6px 0',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Pilih Role Pahlawan Belajarmu
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                            Tentukan gaya bermainmu untuk mengaktifkan pasif skill tempur, bonus atribut, dan paket perlengkapan starter gratis.
                        </p>
                    </div>

                    {/* Warning Notice: One-Time Selection */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '11px 14px',
                            backgroundColor: 'rgba(245, 158, 11, 0.08)',
                            border: '1px solid rgba(245, 158, 11, 0.28)',
                            borderRadius: '10px',
                            marginBottom: '18px',
                        }}
                    >
                        <AlertCircle size={16} style={{ color: '#f59e0b', marginTop: '1px', flexShrink: 0 }} />
                        <div style={{ fontSize: '12px', lineHeight: 1.45 }}>
                            <strong style={{ color: '#f59e0b', fontWeight: 600 }}>Pilihan Permanen: </strong>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                Role ini hanya dapat dipilih <strong>satu kali</strong> dan tidak dapat diubah kembali setelah dikonfirmasi. Pastikan memilih gaya bertarung yang paling sesuai denganmu.
                            </span>
                        </div>
                    </div>

                    {/* Role Selection Cards Grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '10px',
                            marginBottom: '18px',
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
                                        padding: '12px 8px',
                                        borderRadius: '10px',
                                        border: isSelected
                                            ? `1.5px solid ${r.themeColor}`
                                            : '1px solid var(--surface-border)',
                                        backgroundColor: isSelected ? `${r.themeColor}12` : 'var(--surface-elevated)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        userSelect: 'none',
                                    }}
                                >
                                    <span style={{ fontSize: '24px', marginBottom: '6px' }}>{r.avatarEmoji}</span>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 700,
                                            fontSize: '13px',
                                            color: isSelected ? r.themeColor : 'var(--text-primary)',
                                            marginBottom: '2px',
                                        }}
                                    >
                                        {r.name}
                                    </span>
                                    <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', lineHeight: 1.2 }}>
                                        {r.title}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Selected Role Detail Card */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '16px',
                            alignItems: 'center',
                            backgroundColor: 'var(--surface-elevated)',
                            borderRadius: '12px',
                            border: '1px solid var(--surface-border)',
                            padding: '16px',
                            marginBottom: '18px',
                        }}
                    >
                        {/* Visual Stage */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--surface-card)',
                                borderRadius: '10px',
                                border: '1px solid var(--surface-border)',
                                padding: '14px 10px',
                            }}
                        >
                            <CharacterVisual
                                role={selectedRole}
                                size={135}
                                showAura={true}
                                interactive={false}
                            />
                            <div
                                style={{
                                    marginTop: '8px',
                                    fontSize: '11px',
                                    color: roleInfo.themeColor,
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-heading)',
                                    textAlign: 'center',
                                }}
                            >
                                {roleInfo.name} · {roleInfo.subtitle}
                            </div>
                        </div>

                        {/* Role Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <h3
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        margin: '0 0 3px 0',
                                    }}
                                >
                                    {roleInfo.name} — {roleInfo.title}
                                </h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                                    {roleInfo.description}
                                </p>
                            </div>

                            {/* Inherent Perk Box */}
                            <div
                                style={{
                                    backgroundColor: 'var(--surface-card)',
                                    border: `1px solid ${roleInfo.themeColor}33`,
                                    borderRadius: '9px',
                                    padding: '9px 12px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                    <Zap size={13} style={{ color: roleInfo.themeColor }} />
                                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: roleInfo.themeColor }}>
                                        Pasif: {roleInfo.perk.name}
                                    </span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.35 }}>
                                    {roleInfo.perk.effect}
                                </div>
                                <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                                    {roleInfo.perk.description}
                                </div>
                            </div>

                            {/* Starter Kit Preview */}
                            <div>
                                <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '5px' }}>
                                    Paket Starter Gratis:
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {starterItems.map((it) => (
                                        <div
                                            key={it.id}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                backgroundColor: 'var(--surface-card)',
                                                border: '1px solid var(--surface-border)',
                                                fontSize: '11px',
                                                color: 'var(--text-secondary)',
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
                                color: '#ef4444',
                                fontSize: '12px',
                                marginBottom: '16px',
                                padding: '9px 14px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
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
                            whileHover={!isSubmitting && !confirmedSuccess ? { scale: 1.02 } : {}}
                            whileTap={!isSubmitting && !confirmedSuccess ? { scale: 0.98 } : {}}
                            disabled={isSubmitting || confirmedSuccess}
                            onClick={handleConfirmCharacter}
                            style={{
                                width: '100%',
                                maxWidth: '380px',
                                padding: '12px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: confirmedSuccess ? '#10b981' : roleInfo.themeColor,
                                color: '#ffffff',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13.5px',
                                fontWeight: 700,
                                cursor: isSubmitting || confirmedSuccess ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: `0 4px 14px ${confirmedSuccess ? 'rgba(16, 185, 129, 0.35)' : roleInfo.themeColor + '40'}`,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Menyimpan Pilihan Role...</span>
                                </>
                            ) : confirmedSuccess ? (
                                <>
                                    <Check size={16} />
                                    <span>Role {roleInfo.name} Berhasil Dipilih!</span>
                                </>
                            ) : (
                                <>
                                    <span>Konfirmasi & Pilih {roleInfo.name}</span>
                                    <ArrowRight size={15} />
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
