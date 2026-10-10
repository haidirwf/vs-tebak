'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { GameItem, ItemRarity, ItemSlot } from '@/lib/game/items'
import ItemIcon from '@/components/character/ItemIcon'

interface ItemCelebrationModalProps {
    item: GameItem | null
    onClose: () => void
    onEquip?: (item: GameItem) => Promise<void> | void
    isCurrentlyEquipped?: boolean
}

interface RarityTheme {
    primary: string
    light: string
    dark: string
    glow: string
    bgRadial: string
    border: string
    badgeBg: string
    titlePrefix: string
    tierLabel: string
}

const RARITY_THEMES: Record<ItemRarity, RarityTheme> = {
    rare: {
        primary: '#3b82f6',
        light: '#60a5fa',
        dark: '#1d4ed8',
        glow: 'rgba(59, 130, 246, 0.5)',
        bgRadial: 'radial-gradient(circle, rgba(59, 130, 246, 0.32) 0%, rgba(30, 58, 138, 0.12) 50%, transparent 70%)',
        border: 'rgba(59, 130, 246, 0.55)',
        badgeBg: 'rgba(59, 130, 246, 0.15)',
        titlePrefix: 'Item Langka Terbuka!',
        tierLabel: 'Tier II • Rare',
    },
    epic: {
        primary: '#a855f7',
        light: '#c084fc',
        dark: '#7e22ce',
        glow: 'rgba(168, 85, 247, 0.55)',
        bgRadial: 'radial-gradient(circle, rgba(168, 85, 247, 0.36) 0%, rgba(88, 28, 135, 0.15) 50%, transparent 70%)',
        border: 'rgba(168, 85, 247, 0.6)',
        badgeBg: 'rgba(168, 85, 247, 0.18)',
        titlePrefix: 'Item Epik Diperoleh!',
        tierLabel: 'Tier III • Epic',
    },
    legendary: {
        primary: '#f59e0b',
        light: '#fbbf24',
        dark: '#b45309',
        glow: 'rgba(245, 158, 11, 0.6)',
        bgRadial: 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(180, 83, 9, 0.18) 50%, transparent 70%)',
        border: 'rgba(245, 158, 11, 0.7)',
        badgeBg: 'rgba(245, 158, 11, 0.2)',
        titlePrefix: 'Artefak Legendaris Didapatkan!',
        tierLabel: 'Tier IV • Legendary',
    },
    common: {
        primary: '#94a3b8',
        light: '#cbd5e1',
        dark: '#475569',
        glow: 'rgba(148, 163, 184, 0.35)',
        bgRadial: 'radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, transparent 70%)',
        border: 'rgba(148, 163, 184, 0.45)',
        badgeBg: 'rgba(148, 163, 184, 0.15)',
        titlePrefix: 'Item Baru Diperoleh!',
        tierLabel: 'Tier I • Common',
    },
}

const SLOT_NAMES: Record<ItemSlot, string> = {
    weapon: 'Senjata Utama',
    head: 'Pelindung Kepala',
    armor: 'Zirah Pelindung',
    accessory: 'Aksesoris Magis',
}

export default function ItemCelebrationModal({
    item,
    onClose,
    onEquip,
    isCurrentlyEquipped = false,
}: ItemCelebrationModalProps) {
    const [isEquipping, setIsEquipping] = useState(false)
    const [equippedSuccess, setEquippedSuccess] = useState(isCurrentlyEquipped)

    if (!item) return null

    const theme = RARITY_THEMES[item.rarity] || RARITY_THEMES.common

    const handleEquipClick = async () => {
        if (!onEquip || equippedSuccess) return
        setIsEquipping(true)
        try {
            await onEquip(item)
            setEquippedSuccess(true)
        } catch (err) {
            console.error('Failed to equip item directly from modal:', err)
        } finally {
            setIsEquipping(false)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-overlay"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    backgroundColor: 'rgba(0, 0, 0, 0.88)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    overflow: 'hidden',
                }}
                onClick={onClose}
            >
                {/* Background Rotating Aura Ray */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
                    style={{
                        position: 'absolute',
                        width: '560px',
                        height: '560px',
                        borderRadius: '50%',
                        background: theme.bgRadial,
                        filter: 'blur(36px)',
                        pointerEvents: 'none',
                    }}
                />

                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 16 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.88, opacity: 0, y: 12 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '440px',
                        backgroundColor: 'var(--surface-card)',
                        borderRadius: '20px',
                        border: `1.5px solid ${theme.border}`,
                        boxShadow: `0 0 40px ${theme.glow}, 0 20px 48px rgba(0, 0, 0, 0.65)`,
                        overflow: 'hidden',
                        padding: '32px 24px 28px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {/* Top Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        style={{
                            position: 'absolute',
                            top: '14px',
                            right: '14px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '8px',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <X size={16} />
                    </button>

                    {/* Celebration Eyebrow */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            backgroundColor: theme.badgeBg,
                            border: `1px solid ${theme.border}`,
                            color: theme.light,
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            marginBottom: '16px',
                        }}
                    >
                        <Sparkles size={13} style={{ color: theme.primary }} />
                        <span>{theme.titlePrefix}</span>
                    </div>

                    {/* Big Item Presentation Stage */}
                    <div
                        style={{
                            position: 'relative',
                            width: '120px',
                            height: '120px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '8px 0 20px',
                        }}
                    >
                        {/* Radial Pedestal Halo */}
                        <div
                            style={{
                                position: 'absolute',
                                width: '140px',
                                height: '140px',
                                borderRadius: '50%',
                                background: theme.bgRadial,
                                filter: 'blur(16px)',
                            }}
                        />

                        {/* Large Spring Item Visual */}
                        <motion.div
                            initial={{ scale: 0.6, rotate: -12 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 280 }}
                            style={{ position: 'relative', zIndex: 2 }}
                        >
                            <ItemIcon item={item} size={110} showBorder={true} />
                        </motion.div>
                    </div>

                    {/* Item Name */}
                    <h3
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '22px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            margin: '0 0 6px 0',
                            lineHeight: 1.25,
                        }}
                    >
                        {item.name}
                    </h3>

                    {/* Slot & Rarity Meta Badges */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '18px',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '6px',
                                padding: '3px 8px',
                            }}
                        >
                            {SLOT_NAMES[item.slot] || item.slot}
                        </span>
                        <span
                            style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: theme.light,
                                backgroundColor: theme.badgeBg,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '6px',
                                padding: '3px 8px',
                            }}
                        >
                            {theme.tierLabel}
                        </span>
                    </div>

                    {/* Buff Stat Card */}
                    {item.buff && (
                        <div
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: `1px solid ${theme.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '14px',
                                textAlign: 'left',
                                boxSizing: 'border-box',
                            }}
                        >
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: theme.badgeBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: theme.light,
                                    flexShrink: 0,
                                }}
                            >
                                <Zap size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: 'var(--text-muted)',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Efek Stat Tambahan
                                </div>
                                <div
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: theme.light,
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {item.buff.label}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Item Description */}
                    <p
                        style={{
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            lineHeight: 1.5,
                            margin: '0 0 24px 0',
                            maxWidth: '360px',
                        }}
                    >
                        {item.description}
                    </p>

                    {/* Action Buttons */}
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                        }}
                    >
                        {onEquip && (
                            <button
                                type="button"
                                onClick={handleEquipClick}
                                disabled={isEquipping || equippedSuccess}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    backgroundColor: equippedSuccess ? '#059669' : theme.primary,
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: equippedSuccess ? 'default' : 'pointer',
                                    boxShadow: `0 4px 16px ${theme.glow}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {equippedSuccess ? (
                                    <>
                                        <Check size={16} />
                                        <span>Sudah Terpasang di Karakter</span>
                                    </>
                                ) : isEquipping ? (
                                    <span>Memasang item...</span>
                                ) : (
                                    <>
                                        <ShieldCheck size={16} />
                                        <span>Pasang ke Karakter Sekarang</span>
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                width: '100%',
                                padding: '10px 16px',
                                borderRadius: '12px',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--surface-border)',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            Simpan ke Inventaris
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
