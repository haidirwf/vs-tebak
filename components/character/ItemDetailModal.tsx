'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    X,
    Shield,
    Swords,
    Sparkles,
    Zap,
    Clock,
    Flame,
    ArrowRight,
    CheckCircle2,
    Check,
    ShoppingBag,
    Info,
    ExternalLink,
    Crown,
    Share2,
    Layers,
    UserCheck,
    AlertCircle,
} from 'lucide-react'
import {
    GameItem,
    ItemSlot,
    ItemRarity,
    ItemBuff,
    ItemStats,
    RARITY_CONFIG,
    GAME_ITEMS,
    getItemStats,
    formatItemStatBadges,
} from '@/lib/game/items'
import { AvatarClass } from '@/types'
import { CHARACTER_ROLES } from '@/lib/game/character'
import ItemIcon from '@/components/character/ItemIcon'

export interface ItemDetailModalProps {
    item: GameItem | null
    isOpen: boolean
    onClose: () => void
    isEquipped?: boolean
    onEquipToggle?: (item: GameItem, action: 'equip' | 'unequip') => Promise<void> | void
    actionLoading?: boolean
    currentlyEquippedInSlot?: GameItem | null
    playerRole?: AvatarClass
    userXp?: number
    isInInventory?: boolean
    onBuy?: (item: GameItem) => Promise<void> | void
}

const ANATOMICAL_INFO: Record<ItemSlot, { name: string; position: string; emoji: string; desc: string }> = {
    head: {
        name: 'Pelindung Kepala',
        position: 'Kepala & Mahkota',
        emoji: '🪖',
        desc: 'Melindungi konsentrasi dan pemikiran analitis saat menyelesaikan teka-teki logika.',
    },
    armor: {
        name: 'Zirah Pelindung',
        position: 'Tubuh & Dada',
        emoji: '🛡️',
        desc: 'Meredam dampak mental dan melindungi pahlawan dari penalti kesalahan taktis.',
    },
    weapon: {
        name: 'Senjata Utama',
        position: 'Tangan & Lengan',
        emoji: '🗡️',
        desc: 'Instrumen tempur utama untuk melancarkan poin serangan ke musuh dalam duel 1v1.',
    },
    accessory: {
        name: 'Relik Magis',
        position: 'Aura & Jiwa',
        emoji: '💍',
        desc: 'Artefak pelengkap yang memberikan keunggulan pasif khusus di setiap ronde duel.',
    },
}

function getBuffDetails(buff: ItemBuff): { title: string; mechanic: string; tip: string; icon: React.ReactNode } {
    switch (buff.type) {
        case 'atk_bonus':
            return {
                title: 'Bonus Poin Serangan (ATK)',
                mechanic: `Setiap jawaban benar saat duel 1v1 menghasilkan tambahan +${buff.value} poin skor langsung ke lawan. Semakin tinggi ATK, semakin cepat kamu menguras darah HP musuh.`,
                tip: 'Sangat efektif untuk menghabisi pahlawan lawan lebih cepat di ronde-ronde awal.',
                icon: <Swords size={16} style={{ color: '#f59e0b' }} />,
            }
        case 'def_bonus':
            return {
                title: 'Peredam Kerusakan (DEF)',
                mechanic: `Meredam ${buff.value}% dampak kerusakan yang diterima saat kamu melakukan kesalahan menjawab, sehingga darah HP pahlawanmu tetap terjaga.`,
                tip: 'Memberikan bantalan keamanan ekstra saat menghadapi tantangan pemrograman tingkat lanjut.',
                icon: <Shield size={16} style={{ color: '#10b981' }} />,
            }
        case 'crit_rate':
            return {
                title: 'Peluang Kritis (CRIT)',
                mechanic: `Memberikan ${buff.value}% peluang agar jawaban benarmu memicu serangan kritis dengan skor 1.5x lipat dan efek visual petir yang memukau.`,
                tip: 'Kombinasikan dengan streak jawaban benar untuk membalikkan keadaan dalam sekejap.',
                icon: <Zap size={16} style={{ color: '#a855f7' }} />,
            }
        case 'time_bonus':
            return {
                title: 'Ekstra Waktu Berpikir (TIMER)',
                mechanic: `Menambahkan +${buff.value} detik durasi berpikir di setiap ronde pertandingan, memberimu ruang lebih untuk membaca kode dan menganalisis opsi jawaban.`,
                tip: 'Sangat direkomendasikan untuk tipe soal sintaksis panjang atau algoritma bercabang.',
                icon: <Clock size={16} style={{ color: '#38bdf8' }} />,
            }
        case 'xp_bonus':
            return {
                title: 'Pengganda Pengalaman (XP BONUS)',
                mechanic: `Meningkatkan perolehan XP sebesar +${buff.value}% setelah memenangkan pertandingan duel, mempercepat peningkatan level pahlawanmu.`,
                tip: 'Gunakan saat sesi latihan intensif untuk mempercepat unlock konten baru.',
                icon: <Sparkles size={16} style={{ color: 'var(--color-gold-text)' }} />,
            }
        case 'shield_regen':
            return {
                title: 'Pemulihan Perisai (SHIELD REGEN)',
                mechanic: `Memulihkan perisai perlindungan sebesar +${buff.value} poin setiap kali kamu mempertahankan rentetan (streak) jawaban benar berturut-turut.`,
                tip: 'Membuat pahlawanmu semakin tak tergoyahkan jika kamu menjawab dengan konsisten.',
                icon: <Shield size={16} style={{ color: '#06b6d4' }} />,
            }
        default:
            return {
                title: 'Efek Tempur Khusus',
                mechanic: buff.label,
                tip: 'Manfaatkan buff ini untuk meningkatkan keunggulan di arena duel.',
                icon: <Sparkles size={16} style={{ color: 'var(--accent-gold-text)' }} />,
            }
    }
}

export default function ItemDetailModal({
    item,
    isOpen,
    onClose,
    isEquipped = false,
    onEquipToggle,
    actionLoading = false,
    currentlyEquippedInSlot = null,
    playerRole = 'warrior',
    userXp = 0,
    isInInventory = true,
    onBuy,
}: ItemDetailModalProps) {
    const [copiedLink, setCopiedLink] = useState(false)

    // Handle Escape key
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen || !item) return null

    const rarity = RARITY_CONFIG[item.rarity]
    const slotInfo = ANATOMICAL_INFO[item.slot]
    const buffDetails = getBuffDetails(item.buff)

    // Role eligibility
    const isUniversal = item.class_req === 'all'
    const isRoleMatch = isUniversal || item.class_req === playerRole
    const requiredRoleInfo = !isUniversal && item.class_req !== 'all' ? CHARACTER_ROLES[item.class_req] : null

    // Comparison calculation
    const hasDifferentEquipped = Boolean(
        currentlyEquippedInSlot && currentlyEquippedInSlot.id !== item.id
    )
    const isThisEquipped = Boolean(isEquipped || (currentlyEquippedInSlot && currentlyEquippedInSlot.id === item.id))

    const statComparison = useMemo(() => {
        if (!hasDifferentEquipped || !currentlyEquippedInSlot) return null

        const currentBuff = currentlyEquippedInSlot.buff
        const newBuff = item.buff

        if (currentBuff.type === newBuff.type) {
            const diff = newBuff.value - currentBuff.value
            return {
                sameType: true,
                diff,
                label: diff > 0
                    ? `+${diff} lebih tinggi dari item aktif saat ini`
                    : diff < 0
                    ? `${diff} lebih rendah dari item aktif saat ini`
                    : 'Setara dengan item aktif saat ini',
                isUpgrade: diff > 0,
            }
        }

        return {
            sameType: false,
            diff: 0,
            label: `Menggantikan efek [${currentBuff.label}] dengan [${newBuff.label}]`,
            isUpgrade: true,
        }
    }, [hasDifferentEquipped, currentlyEquippedInSlot, item])

    const statDiffs = useMemo(() => {
        if (!hasDifferentEquipped || !currentlyEquippedInSlot) return []
        const currentStats = getItemStats(currentlyEquippedInSlot)
        const newStats = getItemStats(item)
        const diffs: { key: string; label: string; diff: number; icon: string; isPct?: boolean }[] = []

        const keys: { key: keyof ItemStats; label: string; icon: string; isPct?: boolean }[] = [
            { key: 'hp', label: 'HP', icon: '❤️' },
            { key: 'atk', label: 'ATK', icon: '⚔️' },
            { key: 'def', label: 'DEF', icon: '🛡️' },
            { key: 'crit', label: 'CRIT', icon: '💥', isPct: true },
            { key: 'xp', label: 'XP', icon: '⭐', isPct: true },
        ]

        for (const k of keys) {
            const vNew = newStats[k.key] || 0
            const vOld = currentStats[k.key] || 0
            const diff = vNew - vOld
            if (diff !== 0) {
                diffs.push({
                    key: k.key,
                    label: k.label,
                    diff,
                    icon: k.icon,
                    isPct: k.isPct,
                })
            }
        }
        return diffs
    }, [hasDifferentEquipped, currentlyEquippedInSlot, item])

    const itemStatBadges = useMemo(() => formatItemStatBadges(item), [item])

    const handleShare = () => {
        if (typeof window === 'undefined') return
        const url = `${window.location.origin}/character?item=${item.id}`
        navigator.clipboard?.writeText(url).then(() => {
            setCopiedLink(true)
            setTimeout(() => setCopiedLink(false), 2000)
        })
    }

    return (
        <AnimatePresence>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99990,
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
                    initial={{ opacity: 0, scale: 0.94, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 16 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '520px',
                        maxHeight: '90vh',
                        backgroundColor: 'var(--surface-card)',
                        border: `1.5px solid ${rarity.cardBorder || 'var(--surface-border)'}`,
                        borderRadius: '18px',
                        boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.7), 0 0 30px -8px ${rarity.color}25`,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Top Beam Highlight by Rarity */}
                    {rarity.topBeam && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: item.rarity === 'legendary' ? '3px' : '2px',
                                background: rarity.topBeam,
                                zIndex: 5,
                            }}
                        />
                    )}

                    {/* Modal Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 18px',
                            borderBottom: '1px solid var(--surface-border)',
                            backgroundColor: 'var(--surface-elevated)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid var(--surface-border)',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                {slotInfo.emoji} {slotInfo.name}
                            </span>
                            <span
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    color: rarity.badgeColor,
                                    backgroundColor: rarity.badgeBg,
                                    border: `1px solid ${rarity.badgeBorder}`,
                                }}
                            >
                                {rarity.stars} {rarity.label}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                                type="button"
                                onClick={handleShare}
                                title="Salin Tautan Item"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    color: copiedLink ? 'var(--color-vector-green)' : 'var(--color-steel)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Tutup modal"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    color: 'var(--color-steel)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Modal Body */}
                    <div
                        style={{
                            padding: '20px 20px 16px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}
                    >
                        {/* Spotlight Showcase (Hero Avatar Pedestal) */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                padding: '16px 12px 14px',
                                borderRadius: '14px',
                                background: `radial-gradient(circle at 50% 35%, ${rarity.color}15 0%, rgba(0, 0, 0, 0.2) 65%, transparent 100%)`,
                                border: '1px solid var(--surface-border)',
                                position: 'relative',
                            }}
                        >
                            <div style={{ marginBottom: '12px' }}>
                                <ItemIcon item={item} slot={item.slot} size={74} />
                            </div>

                            <h3
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '19px',
                                    fontWeight: 800,
                                    margin: '0 0 4px 0',
                                    color: `var(--rarity-title-${item.rarity})`,
                                    letterSpacing: '-0.01em',
                                    textShadow:
                                        item.rarity === 'legendary'
                                            ? '0 2px 12px rgba(245, 158, 11, 0.3)'
                                            : item.rarity === 'epic'
                                            ? '0 2px 10px rgba(192, 132, 252, 0.25)'
                                            : 'none',
                                }}
                            >
                                {item.name}
                            </h3>

                            <div style={{ fontSize: '12px', color: 'var(--color-fog)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <span>Letak Tubuh: <strong>{slotInfo.position}</strong></span>
                                <span>•</span>
                                <span>{item.is_starter ? 'Item Pemula' : item.cost_xp > 0 ? `Harga Toko: ${item.cost_xp} XP` : 'Item Khusus'}</span>
                            </div>

                            {/* Active Status Ribbon */}
                            {isThisEquipped && (
                                <div
                                    style={{
                                        marginTop: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: '6px',
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                        border: '1px solid rgba(16, 185, 129, 0.35)',
                                        color: '#10b981',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: 700 }}>
                                        <CheckCircle2 size={14} />
                                        <span>Sedang Terpasang pada Pahlawan</span>
                                    </div>
                                    {itemStatBadges.length > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Nambah:</span>
                                            {itemStatBadges.map((badge) => (
                                                <span key={badge.key} style={{ color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                                                    {badge.label} {badge.display}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Lore & Story Description */}
                        <div
                            style={{
                                padding: '12px 14px',
                                borderRadius: '11px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                            }}
                        >
                            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-steel)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                                Deskripsi Artefak
                            </div>
                            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                                {item.description}
                            </p>
                        </div>

                        {/* Bonus Stat Tempur / Pahlawan (Green "+X" badges) */}
                        {itemStatBadges.length > 0 && (
                            <div
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                    border: '1.5px solid rgba(16, 185, 129, 0.3)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span>⚡</span>
                                        <span>Bonus Atribut Stat {isThisEquipped ? '(Aktif Menambah ke Pahlawan)' : '(Jika Dipasang)'}</span>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            color: '#34d399',
                                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                            padding: '2px 7px',
                                            borderRadius: '5px',
                                            border: '1px solid rgba(16, 185, 129, 0.35)',
                                            fontFamily: 'var(--font-mono)',
                                        }}
                                    >
                                        {isThisEquipped ? 'Sedang Aktif Menambah' : '+ Peningkatan Stat'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {itemStatBadges.map((badge) => (
                                        <div
                                            key={badge.key}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                backgroundColor: 'rgba(16, 185, 129, 0.14)',
                                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                                color: '#10b981',
                                                fontSize: '12px',
                                                fontWeight: 800,
                                                fontFamily: 'var(--font-mono)',
                                                letterSpacing: '0.01em',
                                            }}
                                        >
                                            <span style={{ fontSize: '12px' }}>{badge.icon}</span>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px' }}>{badge.label}</span>
                                            <span style={{ color: '#34d399', fontWeight: 900 }}>{badge.display}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Combat Mechanics & Buff Deep-Dive */}
                        <div
                            style={{
                                padding: '14px',
                                borderRadius: '12px',
                                backgroundColor: rarity.buffBg,
                                border: `1px solid ${rarity.buffBorder}`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {buffDetails.icon}
                                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: rarity.buffColor }}>
                                        {buffDetails.title}
                                    </span>
                                </div>
                                <span
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        fontFamily: 'var(--font-mono)',
                                        color: rarity.buffColor,
                                        backgroundColor: 'var(--surface-card)',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        border: `1px solid ${rarity.buffBorder}`,
                                    }}
                                >
                                    {item.buff.label}
                                </span>
                            </div>

                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                {buffDetails.mechanic}
                            </p>

                            <div
                                style={{
                                    fontSize: '11px',
                                    color: 'var(--color-fog)',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    paddingTop: '6px',
                                    marginTop: '2px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '4px',
                                }}
                            >
                                <span style={{ color: 'var(--color-gold-text)' }}>💡</span>
                                <span>{buffDetails.tip}</span>
                            </div>
                        </div>

                        {/* Comparative Stats (If replacing another equipped item) */}
                        {hasDifferentEquipped && currentlyEquippedInSlot && (
                            <div
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: '11px',
                                    backgroundColor: 'var(--surface-elevated)',
                                    border: '1px solid var(--surface-border)',
                                }}
                            >
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Perbandingan dengan Perlengkapan Terpasang:
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: statDiffs.length > 0 ? '10px' : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                        <ItemIcon item={currentlyEquippedInSlot} size={32} />
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {currentlyEquippedInSlot.name}
                                            </div>
                                            <div style={{ fontSize: '10.5px', color: 'var(--color-steel)' }}>
                                                {currentlyEquippedInSlot.buff.label}
                                            </div>
                                        </div>
                                    </div>

                                    {statComparison && (
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                backgroundColor: statComparison.isUpgrade ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.1)',
                                                border: `1px solid ${statComparison.isUpgrade ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`,
                                                color: statComparison.isUpgrade ? '#10b981' : 'var(--accent-red)',
                                                textAlign: 'right',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {statComparison.label}
                                        </div>
                                    )}
                                </div>

                                {/* Stat Diffs Details */}
                                {statDiffs.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--surface-border)' }}>
                                        {statDiffs.map((sd) => {
                                            const isPlus = sd.diff > 0
                                            return (
                                                <div
                                                    key={sd.key}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        backgroundColor: isPlus ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.1)',
                                                        border: `1px solid ${isPlus ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`,
                                                        color: isPlus ? '#10b981' : 'var(--accent-red)',
                                                        fontFamily: 'var(--font-mono)',
                                                    }}
                                                >
                                                    <span>{sd.icon}</span>
                                                    <span>{sd.label}</span>
                                                    <span>{isPlus ? `+${sd.diff}${sd.isPct ? '%' : ''}` : `${sd.diff}${sd.isPct ? '%' : ''}`}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Role Requirements Checklist */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                backgroundColor: isRoleMatch ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                border: `1px solid ${isRoleMatch ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                                fontSize: '11.5px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <UserCheck size={14} style={{ color: isRoleMatch ? '#10b981' : 'var(--accent-red)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>
                                    {isUniversal
                                        ? 'Kompatibel dengan semua role pahlawan'
                                        : `Khusus role ${requiredRoleInfo?.name || item.class_req}`}
                                </span>
                            </div>

                            <span
                                style={{
                                    fontWeight: 700,
                                    color: isRoleMatch ? '#10b981' : 'var(--accent-red)',
                                }}
                            >
                                {isRoleMatch ? 'Dapat Dipakai' : 'Role Berbeda'}
                            </span>
                        </div>
                    </div>

                    {/* Modal Footer Controls */}
                    <div
                        style={{
                            padding: '14px 18px',
                            borderTop: '1px solid var(--surface-border)',
                            backgroundColor: 'var(--surface-elevated)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid var(--surface-border)',
                                backgroundColor: 'var(--surface-card)',
                                color: 'var(--text-secondary)',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Tutup
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isInInventory ? (
                                onEquipToggle && (
                                    isThisEquipped ? (
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => onEquipToggle(item, 'unequip')}
                                            style={{
                                                padding: '8px 18px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--accent-red-border)',
                                                backgroundColor: 'var(--accent-red-bg)',
                                                color: 'var(--accent-red)',
                                                fontSize: '12.5px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            {actionLoading ? 'Memproses...' : 'Lepas Perlengkapan'}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => onEquipToggle(item, 'equip')}
                                            style={{
                                                padding: '8px 20px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--brand-primary-border)',
                                                background: 'linear-gradient(180deg, #FDE047 0%, #F5C542 100%)',
                                                color: '#18181b',
                                                boxShadow: 'var(--shadow-signal-orange)',
                                                fontSize: '12.5px',
                                                fontWeight: 700,
                                                fontFamily: 'var(--font-heading)',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}
                                        >
                                            <Zap size={14} />
                                            <span>{actionLoading ? 'Memasang...' : 'Pasang ke Pahlawan'}</span>
                                        </button>
                                    )
                                )
                            ) : onBuy ? (
                                <button
                                    type="button"
                                    disabled={actionLoading || userXp < item.cost_xp}
                                    onClick={() => onBuy(item)}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '8px',
                                        border: userXp >= item.cost_xp ? '1px solid var(--brand-primary-border)' : '1px solid var(--surface-border)',
                                        background: userXp >= item.cost_xp
                                            ? 'linear-gradient(180deg, #FDE047 0%, #F5C542 100%)'
                                            : 'var(--surface-elevated)',
                                        color: userXp >= item.cost_xp ? '#18181b' : 'var(--color-steel)',
                                        boxShadow: userXp >= item.cost_xp ? 'var(--shadow-signal-orange)' : 'none',
                                        fontSize: '12.5px',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-heading)',
                                        cursor: userXp >= item.cost_xp && !actionLoading ? 'pointer' : 'not-allowed',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <ShoppingBag size={14} />
                                    <span>
                                        {actionLoading
                                            ? 'Membeli...'
                                            : userXp < item.cost_xp
                                            ? `XP Belum Cukup (${item.cost_xp} XP)`
                                            : `Beli (${item.cost_xp} XP)`}
                                    </span>
                                </button>
                            ) : (
                                <Link
                                    href="/shop?tab=items"
                                    onClick={onClose}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--brand-primary-border)',
                                        background: 'linear-gradient(180deg, #FDE047 0%, #F5C542 100%)',
                                        color: '#18181b',
                                        boxShadow: 'var(--shadow-signal-orange)',
                                        fontSize: '12.5px',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-heading)',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    <ShoppingBag size={14} />
                                    <span>Beli di Toko ({item.cost_xp} XP)</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
