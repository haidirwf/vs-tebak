'use client'

import React, { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    X,
    Check,
    ShoppingBag,
    Info,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    ArrowUpDown,
} from 'lucide-react'
import {
    GameItem,
    ItemSlot,
    RARITY_CONFIG,
    getItemStats,
    formatItemStatBadges,
    ItemStats,
    getItemRarityRank,
} from '@/lib/game/items'
import { AvatarClass } from '@/types'
import { CHARACTER_ROLES } from '@/lib/game/character'
import ItemIcon from '@/components/character/ItemIcon'

interface SlotPickerModalProps {
    slot: ItemSlot | null
    isOpen: boolean
    onClose: () => void
    equippedItemId: string | null
    inventory: GameItem[]
    playerRole: AvatarClass
    actionLoadingId: string | null
    onEquipToggle: (item: GameItem, action: 'equip' | 'unequip') => void
    onOpenItemDetail: (item: GameItem) => void
}

const SLOT_META: Record<ItemSlot, { name: string; emoji: string; subtitle: string }> = {
    weapon: {
        name: 'Senjata',
        emoji: '🗡️',
        subtitle: 'Pilih senjata tempur untuk meningkatkan serangan fisik (ATK) dan peluang kritikal (CRIT).',
    },
    head: {
        name: 'Helm & Kepala',
        emoji: '🪖',
        subtitle: 'Pilih pelindung kepala untuk menambah ketahanan, pertahanan (DEF), dan HP pahlawan.',
    },
    armor: {
        name: 'Zirah & Baju Besi',
        emoji: '🛡️',
        subtitle: 'Pilih zirah badan untuk memperkuat pertahanan (DEF) dan kapasitas darah maksimal (HP).',
    },
    accessory: {
        name: 'Aksesoris & Relik',
        emoji: '💍',
        subtitle: 'Pilih aksesoris untuk mengaktifkan bonus XP tambahan dan atribut tempur spesial.',
    },
}

export default function SlotPickerModal({
    slot,
    isOpen,
    onClose,
    equippedItemId,
    inventory,
    playerRole,
    actionLoadingId,
    onEquipToggle,
    onOpenItemDetail,
}: SlotPickerModalProps) {
    // Handle Escape key to close modal
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen || !slot) return null

    const meta = SLOT_META[slot]

    // Find currently equipped item in this slot
    const equippedItem = inventory.find(it => it.slot === slot && it.id === equippedItemId)
        || null

    // Get all items in inventory for this slot, sorted by rarity (Legendary -> Common)
    const slotItems = inventory
        .filter(it => it.slot === slot)
        .sort((a, b) => {
            const diff = getItemRarityRank(b.rarity) - getItemRarityRank(a.rarity)
            if (diff !== 0) return diff
            return a.name.localeCompare(b.name)
        })

    const equippedStats = equippedItem ? getItemStats(equippedItem) : null

    return (
        <AnimatePresence>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99980,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    backgroundColor: 'rgba(0, 0, 0, 0.76)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '560px',
                        maxHeight: '90vh',
                        backgroundColor: 'var(--surface-card)',
                        border: '1.5px solid var(--surface-border)',
                        borderRadius: '18px',
                        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.7), var(--shadow-modal)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid var(--surface-border)',
                            backgroundColor: 'var(--surface-elevated)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                                style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid var(--surface-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    flexShrink: 0,
                                }}
                            >
                                {meta.emoji}
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '16px',
                                        fontWeight: 800,
                                        color: 'var(--text-primary)',
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    Pilih {meta.name}
                                </div>
                                <div style={{ fontSize: '11.5px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                    {slotItems.length} pilihan tersedia di tas inventaris
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '8px',
                                padding: '6px',
                                color: 'var(--color-steel)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                            }}
                            title="Tutup (Esc)"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div
                        style={{
                            padding: '16px 20px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            flex: 1,
                        }}
                    >
                        {/* Currently Equipped Item Summary Box */}
                        {equippedItem ? (
                            <div
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                                    border: '1.5px solid rgba(16, 185, 129, 0.28)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#10b981' }}>
                                        <CheckCircle2 size={13} />
                                        <span>Sedang Terpasang Saat Ini</span>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={actionLoadingId === equippedItem.id}
                                        onClick={() => onEquipToggle(equippedItem, 'unequip')}
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--accent-red-border)',
                                            backgroundColor: 'var(--accent-red-bg)',
                                            color: 'var(--accent-red)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {actionLoadingId === equippedItem.id ? '...' : 'Lepas'}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ItemIcon item={equippedItem} slot={slot} size={42} />
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div
                                            style={{
                                                fontSize: '13.5px',
                                                fontWeight: 800,
                                                fontFamily: 'var(--font-heading)',
                                                color: `var(--rarity-title-${equippedItem.rarity})`,
                                            }}
                                        >
                                            {equippedItem.name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                            ⚡ {equippedItem.buff.label}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onOpenItemDetail(equippedItem)}
                                        style={{
                                            padding: '5px 8px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--surface-border)',
                                            backgroundColor: 'var(--surface-elevated)',
                                            color: 'var(--text-secondary)',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                        title="Buka rincian lengkap"
                                    >
                                        <Info size={12} />
                                        <span>Detail</span>
                                    </button>
                                </div>

                                {/* Active Stats of Equipped Item */}
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', paddingTop: '4px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    {formatItemStatBadges(equippedItem).map((b) => (
                                        <span
                                            key={b.key}
                                            style={{
                                                fontSize: '10.5px',
                                                fontWeight: 800,
                                                color: '#34d399',
                                                fontFamily: 'var(--font-mono)',
                                                backgroundColor: 'rgba(16, 185, 129, 0.16)',
                                                padding: '1px 5px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            {b.icon} {b.display}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--surface-elevated)',
                                    border: '1px dashed var(--surface-border)',
                                    fontSize: '12px',
                                    color: 'var(--color-steel)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <AlertCircle size={15} style={{ color: 'var(--color-gold-text)' }} />
                                <span>Slot {meta.name} belum memiliki item yang terpasang. Pilih salah satu item di bawah:</span>
                            </div>
                        )}

                        {/* Inventory Items List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <ArrowUpDown size={13} />
                                <span>Pilihan {meta.name} di Tas Inventaris:</span>
                            </div>

                            {slotItems.length === 0 ? (
                                <div
                                    style={{
                                        padding: '24px 16px',
                                        borderRadius: '12px',
                                        backgroundColor: 'var(--surface-elevated)',
                                        border: '1px solid var(--surface-border)',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '10px',
                                    }}
                                >
                                    <div style={{ fontSize: '28px' }}>🎒</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        Belum Ada {meta.name} Lain di Tasmu
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-fog)', maxWidth: '320px', lineHeight: 1.5 }}>
                                        Kunjungi Toko Pahlawan untuk membeli {meta.name.toLowerCase()} baru dengan XP hasil kuis/duelmu!
                                    </p>
                                    <Link
                                        href="/shop?tab=items"
                                        onClick={onClose}
                                        style={{
                                            marginTop: '6px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--brand-primary-border)',
                                            background: 'linear-gradient(180deg, #FDE047 0%, #F5C542 100%)',
                                            color: '#18181b',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-heading)',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <ShoppingBag size={14} />
                                        <span>Buka Toko {meta.name}</span>
                                        <ArrowRight size={13} />
                                    </Link>
                                </div>
                            ) : (
                                slotItems.map((item) => {
                                    const isThisEquipped = equippedItem?.id === item.id
                                    const rarity = RARITY_CONFIG[item.rarity]
                                    const isUniversal = item.class_req === 'all'
                                    const isRoleMatch = isUniversal || item.class_req === playerRole
                                    const requiredRoleInfo = !isUniversal && item.class_req !== 'all' ? CHARACTER_ROLES[item.class_req as AvatarClass] : null

                                    // Compute stat differences vs current equipped
                                    const thisStats = getItemStats(item)
                                    const diffBadges: { label: string; diff: number; icon: string; isPct?: boolean }[] = []
                                    if (equippedStats) {
                                        const keys: { key: keyof ItemStats; label: string; icon: string; isPct?: boolean }[] = [
                                            { key: 'hp', label: 'HP', icon: '❤️' },
                                            { key: 'atk', label: 'ATK', icon: '⚔️' },
                                            { key: 'def', label: 'DEF', icon: '🛡️' },
                                            { key: 'crit', label: 'CRIT', icon: '💥', isPct: true },
                                            { key: 'xp', label: 'XP', icon: '⭐', isPct: true },
                                        ]
                                        for (const k of keys) {
                                            const vThis = thisStats[k.key] || 0
                                            const vEquipped = equippedStats[k.key] || 0
                                            const diff = vThis - vEquipped
                                            if (diff !== 0) {
                                                diffBadges.push({ label: k.label, diff, icon: k.icon, isPct: k.isPct })
                                            }
                                        }
                                    }

                                    return (
                                        <div
                                            key={item.id}
                                            style={{
                                                padding: '12px 14px',
                                                borderRadius: '12px',
                                                backgroundColor: isThisEquipped ? 'rgba(16, 185, 129, 0.08)' : rarity.cardBg,
                                                border: isThisEquipped
                                                    ? '1.5px solid rgba(16, 185, 129, 0.4)'
                                                    : `1.5px solid ${rarity.cardBorder}`,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            {/* Item Info Row */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                                    <ItemIcon item={item} slot={slot} size={42} />
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                            <span
                                                                style={{
                                                                    fontSize: '13px',
                                                                    fontWeight: 700,
                                                                    fontFamily: 'var(--font-heading)',
                                                                    color: `var(--rarity-title-${item.rarity})`,
                                                                }}
                                                            >
                                                                {item.name}
                                                            </span>
                                                            <span
                                                                style={{
                                                                    fontSize: '9.5px',
                                                                    fontWeight: 700,
                                                                    padding: '1px 5px',
                                                                    borderRadius: '4px',
                                                                    color: rarity.badgeColor,
                                                                    backgroundColor: rarity.badgeBg,
                                                                    border: `1px solid ${rarity.badgeBorder}`,
                                                                }}
                                                            >
                                                                {rarity.stars} {rarity.label}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                            ⚡ {item.buff.label}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => onOpenItemDetail(item)}
                                                    style={{
                                                        padding: '4px 7px',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--surface-border)',
                                                        backgroundColor: 'var(--surface-elevated)',
                                                        color: 'var(--text-secondary)',
                                                        fontSize: '11px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        flexShrink: 0,
                                                    }}
                                                    title="Buka rincian lengkap"
                                                >
                                                    <Info size={12} />
                                                    <span>Detail</span>
                                                </button>
                                            </div>

                                            {/* Stats & Diff Row */}
                                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
                                                <span style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--color-steel)' }}>
                                                    Stat:
                                                </span>
                                                {formatItemStatBadges(item).map((badge) => (
                                                    <span
                                                        key={badge.key}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '2px',
                                                            fontSize: '10px',
                                                            fontWeight: 800,
                                                            color: '#34d399',
                                                            fontFamily: 'var(--font-mono)',
                                                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                                            border: '1px solid rgba(16, 185, 129, 0.28)',
                                                            padding: '1px 5px',
                                                            borderRadius: '4px',
                                                        }}
                                                    >
                                                        <span>{badge.icon}</span>
                                                        <span style={{ color: '#10b981', fontWeight: 900 }}>{badge.display}</span>
                                                    </span>
                                                ))}

                                                {/* If comparing against current equipped */}
                                                {!isThisEquipped && diffBadges.length > 0 && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                                                        {diffBadges.map((db) => {
                                                            const isPlus = db.diff > 0
                                                            return (
                                                                <span
                                                                    key={db.label}
                                                                    style={{
                                                                        fontSize: '9.5px',
                                                                        fontWeight: 800,
                                                                        fontFamily: 'var(--font-mono)',
                                                                        color: isPlus ? '#10b981' : 'var(--accent-red)',
                                                                        backgroundColor: isPlus ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.1)',
                                                                        border: `1px solid ${isPlus ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`,
                                                                        padding: '1px 5px',
                                                                        borderRadius: '4px',
                                                                    }}
                                                                >
                                                                    {isPlus ? `+${db.diff}${db.isPct ? '%' : ''}` : `${db.diff}${db.isPct ? '%' : ''}`} {db.label}
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Role Warning if incompatible */}
                                            {!isRoleMatch && requiredRoleInfo && (
                                                <div style={{ fontSize: '10.5px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <AlertCircle size={12} />
                                                    <span>Hanya dapat dipakai oleh pahlawan kelas {requiredRoleInfo.name}</span>
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            <div style={{ paddingTop: '6px', borderTop: '1px solid var(--surface-border)' }}>
                                                {isThisEquipped ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Check size={13} />
                                                            <span>Sedang Dipakai pada Pahlawan</span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            disabled={actionLoadingId === item.id}
                                                            onClick={() => onEquipToggle(item, 'unequip')}
                                                            style={{
                                                                padding: '5px 12px',
                                                                borderRadius: '6px',
                                                                border: '1px solid var(--accent-red-border)',
                                                                backgroundColor: 'var(--accent-red-bg)',
                                                                color: 'var(--accent-red)',
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {actionLoadingId === item.id ? '...' : 'Lepas'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={!isRoleMatch || actionLoadingId === item.id}
                                                        onClick={() => onEquipToggle(item, 'equip')}
                                                        style={{
                                                            width: '100%',
                                                            padding: '7px 12px',
                                                            borderRadius: '7px',
                                                            border: isRoleMatch ? '1px solid var(--brand-primary-border)' : '1px solid var(--surface-border)',
                                                            background: isRoleMatch
                                                                ? 'linear-gradient(180deg, #FDE047 0%, #F5C542 100%)'
                                                                : 'var(--surface-elevated)',
                                                            color: isRoleMatch ? '#18181b' : 'var(--color-steel)',
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                            fontFamily: 'var(--font-heading)',
                                                            cursor: isRoleMatch ? 'pointer' : 'not-allowed',
                                                            transition: 'all 0.15s ease',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                        }}
                                                    >
                                                        {actionLoadingId === item.id ? (
                                                            'Memasang...'
                                                        ) : !isRoleMatch ? (
                                                            `Tidak Cocok dengan ${CHARACTER_ROLES[playerRole]?.name || 'Kelas'}`
                                                        ) : (
                                                            <>
                                                                <span>Ganti ke {item.name}</span>
                                                                <ArrowRight size={13} />
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            padding: '12px 20px',
                            borderTop: '1px solid var(--surface-border)',
                            backgroundColor: 'var(--surface-elevated)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                        }}
                    >
                        <Link
                            href="/shop?tab=items"
                            onClick={onClose}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '11.5px',
                                color: 'var(--color-gold-text)',
                                textDecoration: 'none',
                                fontWeight: 600,
                            }}
                        >
                            <ShoppingBag size={13} />
                            <span>Buka Toko Perlengkapan</span>
                        </Link>

                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '7px',
                                border: '1px solid var(--surface-border)',
                                backgroundColor: 'var(--surface-card)',
                                color: 'var(--text-secondary)',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Tutup
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
