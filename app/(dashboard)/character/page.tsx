'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { AvatarClass } from '@/types'
import { CHARACTER_ROLES, calculateCharacterStats, EquippedItemsMap } from '@/lib/game/character'
import { GAME_ITEMS, GameItem, ItemSlot, ItemRarity, RARITY_CONFIG, getItemsBySlot } from '@/lib/game/items'
import CharacterVisual from '@/components/character/CharacterVisual'
import { 
    Swords, 
    Shield, 
    Sparkles, 
    Zap, 
    Coins, 
    Check, 
    ArrowRight, 
    ShoppingBag, 
    Package, 
    Info, 
    Clock, 
    Flame,
    Lock,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
    SlidersHorizontal,
} from 'lucide-react'

const RARITY_META: Record<ItemRarity, { weight: number; stars: number; starText: string; tierLabel: string }> = {
    common: { weight: 1, stars: 1, starText: '★☆☆☆', tierLabel: 'Tier I' },
    rare: { weight: 2, stars: 2, starText: '★★☆☆', tierLabel: 'Tier II' },
    epic: { weight: 3, stars: 3, starText: '★★★☆', tierLabel: 'Tier III' },
    legendary: { weight: 4, stars: 4, starText: '★★★★', tierLabel: 'Tier IV' },
}

type ShopSortOption = 'rating_price_asc' | 'rating_price_desc' | 'price_asc' | 'price_desc' | 'rating_desc'

const SLOT_LABELS: Record<ItemSlot, { name: string; emoji: string }> = {
    weapon: { name: 'Senjata', emoji: '🗡️' },
    head: { name: 'Kepala', emoji: '🪖' },
    armor: { name: 'Zirah', emoji: '🛡️' },
    accessory: { name: 'Aksesoris', emoji: '💍' },
}

export default function CharacterPage() {
    const { profile, updateXP } = useUserStore()
    const [activeTab, setActiveTab] = useState<'inventory' | 'shop' | 'perks'>('inventory')
    const [selectedSlotFilter, setSelectedSlotFilter] = useState<'all' | ItemSlot>('all')
    const [equipped, setEquipped] = useState<EquippedItemsMap>({})
    const [inventory, setInventory] = useState<GameItem[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [shopSort, setShopSort] = useState<ShopSortOption>('rating_price_asc')

    const avatarClass = (profile?.avatar_class || 'warrior') as AvatarClass
    const roleInfo = CHARACTER_ROLES[avatarClass] || CHARACTER_ROLES.warrior

    // 1. Fetch user inventory and equipped gear
    const loadInventoryData = useCallback(async () => {
        try {
            const res = await fetch('/api/character/inventory')
            if (res.ok) {
                const data = await res.json()
                setEquipped(data.equipped || {})
                setInventory(data.inventory || [])
            }
        } catch (e) {
            console.error('Failed to load character inventory:', e)
        } finally {
            setIsLoadingData(false)
        }
    }, [])

    useEffect(() => {
        loadInventoryData()
    }, [loadInventoryData, profile?.character_created, profile?.avatar_class])

    // Auto-dismiss floating toast notification
    useEffect(() => {
        if (!notification) return
        const timer = setTimeout(() => {
            setNotification(null)
        }, 3200)
        return () => clearTimeout(timer)
    }, [notification])

    // Compute total character stats
    const characterStats = useMemo(() => {
        return calculateCharacterStats(avatarClass, profile?.level || 1, equipped)
    }, [avatarClass, profile?.level, equipped])

    // Owned item IDs set
    const ownedIds = useMemo(() => {
        return new Set(inventory.map(it => it.id))
    }, [inventory])

    // Handle Equip or Unequip
    async function handleEquipToggle(item: GameItem, action: 'equip' | 'unequip') {
        setActionLoadingId(item.id)
        setNotification(null)
        try {
            const res = await fetch('/api/character/equip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: item.id, slot: item.slot, action }),
            })
            const data = await res.json()
            if (!res.ok || data.error) {
                setNotification({ type: 'error', message: data.error || 'Gagal mengubah perlengkapan.' })
            } else {
                setEquipped(data.equipped || {})
                setNotification({ type: 'success', message: data.message })
            }
        } catch (e: any) {
            setNotification({ type: 'error', message: e.message || 'Terjadi kesalahan jaringan.' })
        } finally {
            setActionLoadingId(null)
        }
    }

    // Handle Unlock/Claim with XP Requirement
    async function handleBuyItem(item: GameItem) {
        if (!profile || profile.xp < item.cost_xp) {
            setNotification({
                type: 'error',
                message: `Syarat XP belum terpenuhi! Butuh minimal ${item.cost_xp} XP, saat ini kamu memiliki ${profile?.xp || 0} XP.`
            })
            return
        }

        setActionLoadingId(item.id)
        setNotification(null)
        try {
            const res = await fetch('/api/character/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: item.id }),
            })
            const data = await res.json()
            if (!res.ok || data.error) {
                setNotification({ type: 'error', message: data.error || 'Gagal membuka item.' })
            } else {
                setInventory(prev => [...prev, data.item])
                if (data.currentXp !== undefined) {
                    updateXP(data.currentXp)
                }
                setNotification({ type: 'success', message: data.message })
            }
        } catch (e: any) {
            setNotification({ type: 'error', message: e.message || 'Terjadi kesalahan jaringan.' })
        } finally {
            setActionLoadingId(null)
        }
    }

    // Filter items
    const filteredInventory = useMemo(() => {
        if (selectedSlotFilter === 'all') return inventory
        return inventory.filter(it => it.slot === selectedSlotFilter)
    }, [inventory, selectedSlotFilter])

    const filteredShopItems = useMemo(() => {
        // Hanya item yang bisa dibeli (item starter gratis tidak ditampilkan di toko)
        const eligible = GAME_ITEMS.filter(it => {
            if (it.is_starter || it.cost_xp <= 0) return false
            return it.class_req === 'all' || it.class_req === avatarClass
        })

        const filtered = selectedSlotFilter === 'all'
            ? eligible
            : eligible.filter(it => it.slot === selectedSlotFilter)

        return [...filtered].sort((a, b) => {
            const weightA = RARITY_META[a.rarity]?.weight || 0
            const weightB = RARITY_META[b.rarity]?.weight || 0
            const priceA = a.cost_xp || 0
            const priceB = b.cost_xp || 0

            switch (shopSort) {
                case 'rating_price_asc':
                    // Rating rendah ke tinggi (Rare -> Epic -> Legendary), lalu harga termurah
                    if (weightA !== weightB) return weightA - weightB
                    return priceA - priceB

                case 'rating_price_desc':
                    // Rating tertinggi ke terendah (Legendary -> Epic -> Rare), lalu harga termahal
                    if (weightA !== weightB) return weightB - weightA
                    return priceB - priceA

                case 'price_asc':
                    // Harga termurah ke termahal
                    if (priceA !== priceB) return priceA - priceB
                    return weightA - weightB

                case 'price_desc':
                    // Harga termahal ke termurah
                    if (priceA !== priceB) return priceB - priceA
                    return weightB - weightA

                case 'rating_desc':
                    // Rating tertinggi ke terendah
                    if (weightA !== weightB) return weightB - weightA
                    return priceA - priceB

                default:
                    return weightA - weightB
            }
        })
    }, [avatarClass, selectedSlotFilter, shopSort])

    return (
        <div className="responsive-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Title & XP Balance */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
            >
                <div>
                    <h1
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '26px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            marginBottom: '4px',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <span>⚔️</span>
                        <span>Kostumisasi & Karakter</span>
                    </h1>
                    <p style={{ color: 'var(--color-fog)', fontSize: '13px', margin: 0 }}>
                        Atur perlengkapan tempur, buka aksesoris berdasarkan pencapaian XP, dan tingkatkan buff tempur duelmu.
                    </p>
                </div>

                {/* XP Balance / Milestone Display */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(245, 197, 66, 0.1)',
                        border: '1px solid rgba(245, 197, 66, 0.3)',
                    }}
                >
                    <Coins size={18} style={{ color: '#F5C542' }} />
                    <span style={{ fontSize: '12px', color: 'var(--color-silver)' }}>Total XP:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: '#F5C542' }}>
                        {profile?.xp || 0} XP
                    </span>
                </div>
            </div>

            {/* Floating Toaster for Equip/Unequip/Buy Notifications (No Layout Shift) */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{
                            position: 'fixed',
                            bottom: '28px',
                            right: '28px',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 18px',
                            borderRadius: '12px',
                            backgroundColor: '#141414',
                            border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)'}`,
                            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 1px rgba(255, 255, 255, 0.15)',
                            maxWidth: '420px',
                        }}
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle2 size={18} style={{ color: 'var(--color-vector-green)', flexShrink: 0 }} />
                        ) : (
                            <AlertCircle size={18} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500, lineHeight: 1.4 }}>
                            {notification.message}
                        </span>
                        <button
                            type="button"
                            onClick={() => setNotification(null)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-steel)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                marginLeft: '6px',
                            }}
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main 2-Column Customization Grid */}
            <div className="character-main-grid">
                {/* LEFT COLUMN: Character Stage & Equipment Sockets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Character Stage Card */}
                    <div
                        style={{
                            padding: '22px 20px',
                            borderRadius: '16px',
                            border: '1px solid #313131',
                            backgroundColor: '#141414',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Role & Level Pill */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                backgroundColor: `${roleInfo.themeColor}18`,
                                border: `1px solid ${roleInfo.themeColor}44`,
                                color: roleInfo.themeColor,
                                fontSize: '11px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-heading)',
                                marginBottom: '12px',
                            }}
                        >
                            <span>{roleInfo.avatarEmoji}</span>
                            <span>{roleInfo.name} · Lv.{profile?.level || 1}</span>
                            <span style={{ opacity: 0.5 }}>•</span>
                            <span style={{ color: '#F5C542', fontFamily: 'var(--font-mono)' }}>{profile?.xp || 0} XP</span>
                        </div>

                        {/* Visual Stage */}
                        <CharacterVisual
                            role={avatarClass}
                            equipped={equipped}
                            size={190}
                            showAura={true}
                            interactive={true}
                        />

                        {/* Hero Name & Lore */}
                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                                {profile?.username || 'Hero'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-fog)', marginTop: '2px' }}>
                                {roleInfo.title} — {roleInfo.subtitle}
                            </div>
                        </div>

                        {/* Special Perk Highlight */}
                        <div
                            style={{
                                width: '100%',
                                marginTop: '16px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                fontSize: '11px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: roleInfo.themeColor, fontWeight: 700, marginBottom: '2px' }}>
                                <Zap size={13} />
                                <span>Perk Pasif: {roleInfo.perk.name}</span>
                            </div>
                            <div style={{ color: 'var(--color-steel)', lineHeight: 1.4 }}>
                                {roleInfo.perk.effect}
                            </div>
                        </div>
                    </div>

                    {/* Active Equipment Slots Card */}
                    <div
                        style={{
                            padding: '18px',
                            borderRadius: '16px',
                            border: '1px solid #313131',
                            backgroundColor: '#141414',
                        }}
                    >
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '14px' }}>
                            Perlengkapan Terpasang
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(['head', 'weapon', 'armor', 'accessory'] as ItemSlot[]).map((slotKey) => {
                                const itemId = equipped[slotKey]
                                const item = itemId ? GAME_ITEMS.find(it => it.id === itemId) : null
                                const slotMeta = SLOT_LABELS[slotKey]

                                return (
                                    <div
                                        key={slotKey}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: item ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                                            border: `1px solid ${item ? RARITY_CONFIG[item.rarity].border : 'rgba(255, 255, 255, 0.05)'}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                            <div
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '16px',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {item ? item.icon : slotMeta.emoji}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: '10px', color: 'var(--color-steel)', textTransform: 'uppercase' }}>
                                                    {slotMeta.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        color: item ? '#ffffff' : 'var(--color-fog)',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {item ? item.name : 'Kosong'}
                                                </div>
                                            </div>
                                        </div>

                                        {item ? (
                                            <button
                                                type="button"
                                                disabled={actionLoadingId === item.id}
                                                onClick={() => handleEquipToggle(item, 'unequip')}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    color: 'var(--accent-red)',
                                                    fontSize: '11px',
                                                    cursor: 'pointer',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                Lepas
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '11px', color: 'var(--color-steel)' }}>
                                                —
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Battle Buffs Summary Card */}
                    <div
                        style={{
                            padding: '16px',
                            borderRadius: '16px',
                            backgroundColor: '#141414',
                            border: '1px solid #313131',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                                Total Atribut & Buff Tempur:
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>
                                PvP Duel 1v1
                            </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>HP Darah</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
                                    {characterStats.hp}
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>ATK Serang</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                                    +{characterStats.atk}
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>DEF Bertahan</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                                    {characterStats.def}
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>CRIT Kritis</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
                                    {characterStats.crit}%
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>Waktu Timer</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                                    +{characterStats.battleBuffs.extraTimerSec}s
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>Bonus XP</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F5C542', fontFamily: 'var(--font-mono)' }}>
                                    +{characterStats.battleBuffs.extraXpPct}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Unified Inventory & Shop Box */}
                <div
                    className="card"
                    style={{
                        padding: '20px',
                        backgroundColor: '#141414',
                        border: '1px solid #313131',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        minWidth: 0,
                    }}
                >
                    {/* Navigation Tabs */}
                    <div className="character-nav-tabs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('inventory')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: activeTab === 'inventory' ? '1px solid rgba(245, 197, 66, 0.35)' : '1px solid transparent',
                                backgroundColor: activeTab === 'inventory' ? 'rgba(245, 197, 66, 0.12)' : 'transparent',
                                color: activeTab === 'inventory' ? '#F5C542' : 'var(--color-fog)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            <Package size={15} />
                            <span>Inventori ({inventory.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('shop')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: activeTab === 'shop' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                                backgroundColor: activeTab === 'shop' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                                color: activeTab === 'shop' ? '#38bdf8' : 'var(--color-fog)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            <ShoppingBag size={15} />
                            <span>Toko Aksesoris</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('perks')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: activeTab === 'perks' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                                backgroundColor: activeTab === 'perks' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                                color: activeTab === 'perks' ? '#10b981' : 'var(--color-fog)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            <Info size={15} />
                            <span>Panduan Role</span>
                        </button>
                    </div>

                    {/* Slot Filter Buttons (For Inventory & Shop) */}
                    {activeTab !== 'perks' && (
                        <div className="character-filter-tabs">
                            {(['all', 'weapon', 'head', 'armor', 'accessory'] as const).map(flt => (
                                <button
                                    key={flt}
                                    type="button"
                                    onClick={() => setSelectedSlotFilter(flt)}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '6px',
                                        border: `1px solid ${selectedSlotFilter === flt ? 'rgba(245, 197, 66, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                                        backgroundColor: selectedSlotFilter === flt ? 'rgba(245, 197, 66, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                        color: selectedSlotFilter === flt ? '#F5C542' : 'var(--color-steel)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {flt === 'all' ? 'Semua Slot' : `${SLOT_LABELS[flt].emoji} ${SLOT_LABELS[flt].name}`}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* TAB 1: INVENTORY ITEMS */}
                    {activeTab === 'inventory' && (
                        <div>
                            {isLoadingData ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-fog)' }}>
                                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                                    <span>Memuat inventori pahlawan...</span>
                                </div>
                            ) : filteredInventory.length === 0 ? (
                                <div
                                    style={{
                                        padding: '36px',
                                        textAlign: 'center',
                                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: '12px',
                                        border: '1px dashed rgba(255, 255, 255, 0.1)',
                                        color: 'var(--color-fog)',
                                    }}
                                >
                                    <Package size={28} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                                    <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>
                                        Belum ada item di slot ini.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('shop')}
                                        style={{
                                            padding: '8px 18px',
                                            borderRadius: '8px',
                                            backgroundColor: '#F5C542',
                                            color: '#050505',
                                            border: 'none',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-heading)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Buka Toko Aksesoris
                                    </button>
                                </div>
                            ) : (
                                <div className="character-items-grid">
                                    {filteredInventory.map((item) => {
                                        const isEquipped = equipped[item.slot] === item.id
                                        const rarity = RARITY_CONFIG[item.rarity]
                                        const slotMeta = SLOT_LABELS[item.slot]

                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#161616',
                                                    border: `1px solid ${isEquipped ? 'rgba(245, 197, 66, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    gap: '10px',
                                                    position: 'relative',
                                                }}
                                            >
                                                <div>
                                                    {/* Header: Slot Badge & Rarity / Equipped status */}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                                        <span
                                                            style={{
                                                                fontSize: '10px',
                                                                color: 'var(--color-steel)',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {slotMeta?.emoji} {slotMeta?.name}
                                                        </span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            {isEquipped && (
                                                                <span
                                                                    style={{
                                                                        fontSize: '9.5px',
                                                                        fontWeight: 700,
                                                                        padding: '1px 6px',
                                                                        borderRadius: '4px',
                                                                        color: '#F5C542',
                                                                        backgroundColor: 'rgba(245, 197, 66, 0.12)',
                                                                        border: '1px solid rgba(245, 197, 66, 0.3)',
                                                                        whiteSpace: 'nowrap',
                                                                    }}
                                                                >
                                                                    Terpasang
                                                                </span>
                                                            )}
                                                            <span
                                                                style={{
                                                                    fontSize: '9.5px',
                                                                    fontWeight: 600,
                                                                    padding: '1px 6px',
                                                                    borderRadius: '4px',
                                                                    color: rarity.color,
                                                                    backgroundColor: rarity.bg,
                                                                    border: `1px solid ${rarity.border}`,
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {rarity.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Item Icon & Title */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                        <div
                                                            style={{
                                                                width: '38px',
                                                                height: '38px',
                                                                borderRadius: '8px',
                                                                backgroundColor: '#121212',
                                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '20px',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {item.icon}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div
                                                                style={{
                                                                    fontFamily: 'var(--font-heading)',
                                                                    fontSize: '13px',
                                                                    fontWeight: 600,
                                                                    color: '#ffffff',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {item.name}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: '10.5px',
                                                                    fontWeight: 600,
                                                                    color: 'var(--color-vector-green)',
                                                                    marginTop: '2px',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                ⚡ {item.buff.label}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p
                                                        style={{
                                                            fontSize: '11px',
                                                            color: 'var(--color-fog)',
                                                            margin: '0 0 6px 0',
                                                            lineHeight: 1.35,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {/* Action Button */}
                                                <div>
                                                    {isEquipped ? (
                                                        <button
                                                            type="button"
                                                            disabled={actionLoadingId === item.id}
                                                            onClick={() => handleEquipToggle(item, 'unequip')}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px 10px',
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                                color: 'var(--accent-red)',
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {actionLoadingId === item.id ? 'Memproses...' : 'Lepas'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={actionLoadingId === item.id}
                                                            onClick={() => handleEquipToggle(item, 'equip')}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px 10px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                backgroundColor: '#F5C542',
                                                                color: '#050505',
                                                                fontSize: '11px',
                                                                fontWeight: 700,
                                                                fontFamily: 'var(--font-heading)',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {actionLoadingId === item.id ? 'Memproses...' : 'Gunakan'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: SHOP (Beli dengan XP) */}
                    {activeTab === 'shop' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* Shop Sorting & Count Toolbar */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '10px',
                                    padding: '10px 14px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-fog)' }}>
                                    <SlidersHorizontal size={14} style={{ color: '#38bdf8' }} />
                                    <span>
                                        Koleksi Toko: <strong style={{ color: '#ffffff' }}>{filteredShopItems.length}</strong> aksesoris
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <label htmlFor="shop-sort-selector" style={{ fontSize: '11.5px', color: 'var(--color-fog)', whiteSpace: 'nowrap' }}>
                                        Urutkan:
                                    </label>
                                    <select
                                        id="shop-sort-selector"
                                        value={shopSort}
                                        onChange={(e) => setShopSort(e.target.value as ShopSortOption)}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: '6px',
                                            backgroundColor: '#161616',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            color: '#ffffff',
                                            fontSize: '11.5px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            outline: 'none',
                                        }}
                                    >
                                        <option value="rating_price_asc">Rating & Syarat XP: Rendah → Tinggi</option>
                                        <option value="rating_price_desc">Rating & Syarat XP: Tinggi → Rendah</option>
                                        <option value="price_asc">Syarat XP: Terendah</option>
                                        <option value="price_desc">Syarat XP: Tertinggi</option>
                                        <option value="rating_desc">Rating Tertinggi</option>
                                    </select>
                                </div>
                            </div>

                            {filteredShopItems.length === 0 ? (
                                <div
                                    style={{
                                        padding: '36px',
                                        textAlign: 'center',
                                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: '12px',
                                        border: '1px dashed rgba(255, 255, 255, 0.1)',
                                        color: 'var(--color-fog)',
                                    }}
                                >
                                    <ShoppingBag size={28} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                                    <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>
                                        Tidak ada item toko yang cocok dengan filter slot ini.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSlotFilter('all')}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '6px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Tampilkan Semua Slot
                                    </button>
                                </div>
                            ) : (
                                <div className="character-items-grid">
                                    {filteredShopItems.map((item) => {
                                        const isOwned = ownedIds.has(item.id)
                                        const rarity = RARITY_CONFIG[item.rarity]
                                        const tierMeta = RARITY_META[item.rarity] || { stars: 1, starText: '★☆☆☆', tierLabel: 'Tier I' }
                                        const slotMeta = SLOT_LABELS[item.slot]
                                        const canAfford = (profile?.xp || 0) >= item.cost_xp

                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#161616',
                                                    border: `1px solid ${rarity.border}`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    gap: '10px',
                                                    opacity: isOwned ? 0.75 : 1,
                                                }}
                                            >
                                                <div>
                                                    {/* Header: Slot Badge & Rating/Rarity */}
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            gap: '6px',
                                                            marginBottom: '8px',
                                                            flexWrap: 'wrap',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: '10px',
                                                                color: 'var(--color-steel)',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {slotMeta?.emoji} {slotMeta?.name}
                                                        </span>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <span
                                                                style={{
                                                                    fontSize: '10.5px',
                                                                    color: rarity.color,
                                                                    letterSpacing: '0.5px',
                                                                    fontWeight: 700,
                                                                }}
                                                                title={`Rating: ${tierMeta.stars} Bintang (${tierMeta.tierLabel})`}
                                                            >
                                                                {tierMeta.starText}
                                                            </span>
                                                            <span
                                                                style={{
                                                                    fontSize: '9.5px',
                                                                    fontWeight: 600,
                                                                    padding: '1px 6px',
                                                                    borderRadius: '4px',
                                                                    color: rarity.color,
                                                                    backgroundColor: rarity.bg,
                                                                    border: `1px solid ${rarity.border}`,
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {rarity.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Item Icon & Title */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                        <div
                                                            style={{
                                                                width: '38px',
                                                                height: '38px',
                                                                borderRadius: '8px',
                                                                backgroundColor: '#121212',
                                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '20px',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {item.icon}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div
                                                                style={{
                                                                    fontFamily: 'var(--font-heading)',
                                                                    fontSize: '13px',
                                                                    fontWeight: 600,
                                                                    color: '#ffffff',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {item.name}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: '10.5px',
                                                                    fontWeight: 600,
                                                                    color: 'var(--color-vector-green)',
                                                                    marginTop: '2px',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                ⚡ {item.buff.label}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p
                                                        style={{
                                                            fontSize: '11px',
                                                            color: 'var(--color-fog)',
                                                            margin: '0 0 6px 0',
                                                            lineHeight: 1.35,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {/* Footer: Clean Price & Action Button */}
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        paddingTop: '8px',
                                                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                                        marginTop: 'auto',
                                                        gap: '8px',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '10px', color: 'var(--color-fog)', lineHeight: 1.2 }}>Syarat XP</span>
                                                        <span
                                                            style={{
                                                                fontFamily: 'var(--font-mono)',
                                                                fontSize: '12.5px',
                                                                fontWeight: 700,
                                                                color: isOwned ? 'var(--color-steel)' : canAfford ? '#F5C542' : 'var(--color-silver)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                marginTop: '1px',
                                                            }}
                                                        >
                                                            <Coins size={13} style={{ color: isOwned ? 'var(--color-steel)' : '#F5C542' }} />
                                                            {item.cost_xp} XP
                                                        </span>
                                                    </div>

                                                    {isOwned ? (
                                                        <div
                                                            style={{
                                                                padding: '6px 10px',
                                                                borderRadius: '6px',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                                color: 'var(--color-steel)',
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            Dimiliki
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={actionLoadingId === item.id || !canAfford}
                                                            onClick={() => handleBuyItem(item)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                backgroundColor: canAfford ? '#F5C542' : 'rgba(255, 255, 255, 0.08)',
                                                                color: canAfford ? '#050505' : 'var(--color-steel)',
                                                                fontSize: '11px',
                                                                fontWeight: 700,
                                                                fontFamily: 'var(--font-heading)',
                                                                cursor: canAfford ? 'pointer' : 'not-allowed',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {actionLoadingId === item.id ? (
                                                                <span>Membuka...</span>
                                                            ) : canAfford ? (
                                                                <span>Klaim</span>
                                                            ) : (
                                                                <span>Terkunci</span>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: ROLE TRAITS & BATTLE GUIDE */}
                    {activeTab === 'perks' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {(['warrior', 'mage', 'archer', 'healer'] as AvatarClass[]).map(rKey => {
                                const r = CHARACTER_ROLES[rKey]
                                const isCurrent = avatarClass === rKey

                                return (
                                    <div
                                        key={rKey}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            backgroundColor: '#161616',
                                            border: `1px solid ${isCurrent ? 'rgba(245, 197, 66, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '22px' }}>{r.avatarEmoji}</span>
                                                <div>
                                                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                                                        {r.name} — {r.title}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: 'var(--color-steel)', marginLeft: '8px' }}>
                                                        {r.subtitle}
                                                    </span>
                                                </div>
                                            </div>
                                            {isCurrent && (
                                                <span
                                                    style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: 'rgba(245, 197, 66, 0.15)',
                                                        color: '#F5C542',
                                                        border: '1px solid rgba(245, 197, 66, 0.35)',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    Role Aktif
                                                </span>
                                            )}
                                        </div>

                                        <p style={{ fontSize: '12px', color: 'var(--color-fog)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                                            {r.description}
                                        </p>

                                        <div style={{ fontSize: '11px', color: r.themeColor, fontWeight: 700 }}>
                                            ⚡ Efek Tempur: {r.perk.effect}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
