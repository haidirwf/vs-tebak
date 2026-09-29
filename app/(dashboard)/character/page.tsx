'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { AvatarClass } from '@/types'
import { CHARACTER_ROLES, calculateCharacterStats, EquippedItemsMap } from '@/lib/game/character'
import { GAME_ITEMS, GameItem, ItemSlot, RARITY_CONFIG, getItemsBySlot } from '@/lib/game/items'
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
    Loader2
} from 'lucide-react'

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

    // Handle Buy with XP
    async function handleBuyItem(item: GameItem) {
        if (!profile || profile.xp < item.cost_xp) {
            setNotification({
                type: 'error',
                message: `XP tidak cukup! Butuh ${item.cost_xp} XP, kamu memiliki ${profile?.xp || 0} XP.`
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
                setNotification({ type: 'error', message: data.error || 'Gagal membeli item.' })
            } else {
                setInventory(prev => [...prev, data.item])
                updateXP(data.newXp)
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
        const eligible = GAME_ITEMS.filter(it => it.class_req === 'all' || it.class_req === avatarClass)
        if (selectedSlotFilter === 'all') return eligible
        return eligible.filter(it => it.slot === selectedSlotFilter)
    }, [avatarClass, selectedSlotFilter])

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
                        Atur perlengkapan tempur, belanja aksesoris dengan XP, dan tingkatkan buff tempur duelmu.
                    </p>
                </div>

                {/* XP Balance Display */}
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
                    <span style={{ fontSize: '12px', color: 'var(--color-silver)' }}>Saldo XP:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: '#F5C542' }}>
                        {profile?.xp || 0} XP
                    </span>
                </div>
            </div>

            {/* Notification Alert Banner */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                            color: notification.type === 'success' ? 'var(--color-vector-green)' : 'var(--accent-red)',
                        }}
                    >
                        <span>{notification.message}</span>
                        <button
                            type="button"
                            onClick={() => setNotification(null)}
                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px 6px' }}
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main 2-Column Customization Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(300px, 380px) 1fr',
                    gap: '24px',
                    alignItems: 'start',
                }}
            >
                {/* LEFT COLUMN: Character Stage & Equipment Slots */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Character Stage Card */}
                    <div
                        className="product-demo-panel"
                        style={{
                            padding: '24px 20px',
                            borderRadius: '16px',
                            border: `1px solid ${roleInfo.themeColor}44`,
                            backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
                                padding: '3px 10px',
                                borderRadius: '6px',
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
                            <span>{roleInfo.name.toUpperCase()} · LV.{profile?.level || 1}</span>
                        </div>

                        {/* Visual Stage */}
                        <CharacterVisual
                            role={avatarClass}
                            equipped={equipped}
                            size={210}
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

                    {/* Active Equipment Slots Bar */}
                    <div
                        className="product-demo-panel"
                        style={{
                            padding: '18px',
                            borderRadius: '14px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
                        className="product-demo-panel"
                        style={{
                            padding: '16px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(15, 23, 42, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '10px' }}>
                            Total Atribut & Buff Tempur:
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

                {/* RIGHT COLUMN: Tabs (Inventory, Shop, Role Traits) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Navigation Tabs */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            paddingBottom: '8px',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setActiveTab('inventory')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: activeTab === 'inventory' ? 'rgba(245, 197, 66, 0.15)' : 'transparent',
                                color: activeTab === 'inventory' ? '#F5C542' : 'var(--color-fog)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            <Package size={15} />
                            <span>Inventori Milikmu ({inventory.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('shop')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: activeTab === 'shop' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                                color: activeTab === 'shop' ? '#38bdf8' : 'var(--color-fog)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            <ShoppingBag size={15} />
                            <span>Toko Aksesoris (Beli XP)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('perks')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: activeTab === 'perks' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                color: activeTab === 'perks' ? '#10b981' : 'var(--color-fog)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            <Info size={15} />
                            <span>Panduan Role & Efek</span>
                        </button>
                    </div>

                    {/* Slot Filter Buttons (For Inventory & Shop) */}
                    {activeTab !== 'perks' && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {(['all', 'weapon', 'head', 'armor', 'accessory'] as const).map(flt => (
                                <button
                                    key={flt}
                                    type="button"
                                    onClick={() => setSelectedSlotFilter(flt)}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '6px',
                                        border: `1px solid ${selectedSlotFilter === flt ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                                        backgroundColor: selectedSlotFilter === flt ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                        color: selectedSlotFilter === flt ? '#ffffff' : 'var(--color-steel)',
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
                                            backgroundColor: '#38bdf8',
                                            color: '#050505',
                                            border: 'none',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Buka Toko Aksesoris
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                                    {filteredInventory.map((item) => {
                                        const isEquipped = equipped[item.slot] === item.id
                                        const rarity = RARITY_CONFIG[item.rarity]

                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    padding: '14px',
                                                    borderRadius: '12px',
                                                    backgroundColor: isEquipped ? `${rarity.bg}` : 'rgba(255, 255, 255, 0.03)',
                                                    border: `1px solid ${isEquipped ? rarity.color : rarity.border}`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    gap: '10px',
                                                }}
                                            >
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '24px' }}>{item.icon}</span>
                                                        <span
                                                            style={{
                                                                fontSize: '10px',
                                                                fontWeight: 700,
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                color: rarity.color,
                                                                backgroundColor: rarity.bg,
                                                                border: `1px solid ${rarity.border}`,
                                                            }}
                                                        >
                                                            {rarity.label}
                                                        </span>
                                                    </div>

                                                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                                                        {item.name}
                                                    </div>

                                                    <p style={{ fontSize: '11px', color: 'var(--color-fog)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                                                        {item.description}
                                                    </p>

                                                    <div
                                                        style={{
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            color: 'var(--color-vector-green)',
                                                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                        }}
                                                    >
                                                        ⚡ {item.buff.label}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                                    {isEquipped ? (
                                                        <button
                                                            type="button"
                                                            disabled={actionLoadingId === item.id}
                                                            onClick={() => handleEquipToggle(item, 'unequip')}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                                                color: 'var(--accent-red)',
                                                                fontSize: '11px',
                                                                fontWeight: 700,
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
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                backgroundColor: '#38bdf8',
                                                                color: '#050505',
                                                                fontSize: '11px',
                                                                fontWeight: 700,
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                            {filteredShopItems.map((item) => {
                                const isOwned = ownedIds.has(item.id)
                                const rarity = RARITY_CONFIG[item.rarity]
                                const canAfford = (profile?.xp || 0) >= item.cost_xp

                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            padding: '14px',
                                            borderRadius: '12px',
                                            backgroundColor: isOwned ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.65)',
                                            border: `1px solid ${rarity.border}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                            opacity: isOwned ? 0.75 : 1,
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '26px' }}>{item.icon}</span>
                                                <span
                                                    style={{
                                                        fontSize: '10px',
                                                        fontWeight: 700,
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        color: rarity.color,
                                                        backgroundColor: rarity.bg,
                                                        border: `1px solid ${rarity.border}`,
                                                    }}
                                                >
                                                    {rarity.label}
                                                </span>
                                            </div>

                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                                                {item.name}
                                            </div>

                                            <p style={{ fontSize: '11px', color: 'var(--color-fog)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                                                {item.description}
                                            </p>

                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: 'var(--color-vector-green)',
                                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    marginBottom: '10px',
                                                }}
                                            >
                                                ⚡ {item.buff.label}
                                            </div>
                                        </div>

                                        <div>
                                            {isOwned ? (
                                                <div
                                                    style={{
                                                        textAlign: 'center',
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        color: 'var(--color-steel)',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Sudah Dimiliki
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={actionLoadingId === item.id || !canAfford}
                                                    onClick={() => handleBuyItem(item)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        backgroundColor: canAfford ? '#F5C542' : 'rgba(255, 255, 255, 0.1)',
                                                        color: canAfford ? '#050505' : 'var(--color-steel)',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        fontFamily: 'var(--font-heading)',
                                                        cursor: canAfford ? 'pointer' : 'not-allowed',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                    }}
                                                >
                                                    {actionLoadingId === item.id ? (
                                                        <span>Membeli...</span>
                                                    ) : (
                                                        <>
                                                            <Coins size={14} />
                                                            <span>Beli {item.cost_xp} XP</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* TAB 3: ROLE TRAITS & BATTLE GUIDE */}
                    {activeTab === 'perks' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {(['warrior', 'mage', 'archer', 'healer'] as AvatarClass[]).map(rKey => {
                                const r = CHARACTER_ROLES[rKey]
                                const isCurrent = avatarClass === rKey

                                return (
                                    <div
                                        key={rKey}
                                        style={{
                                            padding: '18px',
                                            borderRadius: '12px',
                                            backgroundColor: isCurrent ? `${r.themeColor}12` : 'rgba(255, 255, 255, 0.03)',
                                            border: `1px solid ${isCurrent ? r.themeColor : 'rgba(255, 255, 255, 0.08)'}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '24px' }}>{r.avatarEmoji}</span>
                                                <div>
                                                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
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
                                                        backgroundColor: r.themeColor,
                                                        color: '#ffffff',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    Role Aktif
                                                </span>
                                            )}
                                        </div>

                                        <p style={{ fontSize: '12px', color: 'var(--color-fog)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
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
