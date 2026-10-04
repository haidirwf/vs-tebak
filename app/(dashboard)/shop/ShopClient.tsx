'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Ticket,
    ShoppingBag,
    Copy,
    CheckCircle,
    Zap,
    Check,
} from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { useContentStore, VoucherItem, RedemptionItem } from '@/stores/contentStore'
import { GameItem, ItemSlot, RARITY_CONFIG, GAME_ITEMS } from '@/lib/game/items'
import { EquippedItemsMap } from '@/lib/game/character'

export type ShopTab = 'voucher' | 'items'

interface ShopClientProps {
    initialTab?: ShopTab
    initialXp: number
    vouchers: VoucherItem[]
    initialHistory: RedemptionItem[]
    initialInventory: GameItem[]
}

interface RedeemResult {
    redemptionId: string
    code: string
    newXp: number
    xpSpent: number
    voucherValue: number
    voucherName: string
}

type RedeemModalSource = 'claim' | 'history'

const SLOT_LABELS: Record<ItemSlot, { name: string; emoji: string }> = {
    weapon: { name: 'Senjata', emoji: '⚔️' },
    head: { name: 'Kepala', emoji: '👑' },
    armor: { name: 'Armor', emoji: '🛡️' },
    accessory: { name: 'Aksesoris', emoji: '💍' },
}


function toStringValue(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback
}

function toNumberValue(value: unknown, fallback = 0): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function containsVoucherValueInName(name: string, voucherValue: number): boolean {
    const nameDigits = name.replace(/\D/g, '')
    const valueDigits = String(Math.max(0, Math.floor(voucherValue)))
    if (!nameDigits || !valueDigits) return false
    return nameDigits.includes(valueDigits)
}

function stripVoucherValueFromName(name: string, voucherValue: number): string {
    let cleaned = name
    const valueDigits = String(Math.max(0, Math.floor(voucherValue)))
    const compactThousands = valueDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const groupedThousands = valueDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '[\\s.]?')
    const patterns = [
        new RegExp(`\\b[rR][pP]\\s*${valueDigits}\\b`, 'g'),
        new RegExp(`\\b[rR][pP]\\s*${compactThousands}\\b`, 'g'),
        new RegExp(`\\b${groupedThousands}\\b`, 'g'),
    ]

    for (const pattern of patterns) {
        cleaned = cleaned.replace(pattern, '')
    }

    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()
    return cleaned || name
}

export default function ShopClient({
    initialTab = 'voucher',
    initialXp,
    vouchers,
    initialHistory,
    initialInventory,
}: ShopClientProps) {
    const { profile, updateXP } = useUserStore()
    const { characterEquipped, setCharacterInventoryData } = useContentStore()

    // State: Active Tab
    const [activeTab, setActiveTab] = useState<ShopTab>(initialTab)

    // State: Voucher
    const [xp, setXp] = useState(initialXp)
    const [history, setHistory] = useState(initialHistory)
    const [voucherLoadingId, setVoucherLoadingId] = useState<string | null>(null)
    const [voucherError, setVoucherError] = useState<string | null>(null)
    const [redeemResult, setRedeemResult] = useState<RedeemResult | null>(null)
    const [redeemModalSource, setRedeemModalSource] = useState<RedeemModalSource>('claim')
    const [copied, setCopied] = useState(false)

    // State: Items
    const [inventory, setInventory] = useState<GameItem[]>(initialInventory)
    const [selectedSlotFilter, setSelectedSlotFilter] = useState<'all' | ItemSlot>('all')
    const [itemActionLoadingId, setItemActionLoadingId] = useState<string | null>(null)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const displayXp = useMemo(() => profile?.xp ?? xp, [profile?.xp, xp])
    const claimedVoucherIds = useMemo(() => new Set(history.map((item) => item.voucher_id)), [history])
    const ownedItemIds = useMemo(() => new Set(inventory.map((item) => item.id)), [inventory])

    // Filtered Shop Items (sorted by price ascending)
    const filteredShopItems = useMemo(() => {
        let items = GAME_ITEMS.filter((item) => {
            if (selectedSlotFilter !== 'all' && item.slot !== selectedSlotFilter) return false
            if (item.class_req !== 'all' && profile?.avatar_class && item.class_req !== profile.avatar_class) {
                return false
            }
            return true
        })

        return items.sort((a, b) => a.cost_xp - b.cost_xp)
    }, [selectedSlotFilter, profile?.avatar_class])

    // Auto dismiss notification
    useEffect(() => {
        if (!notification) return
        const timer = setTimeout(() => setNotification(null), 4000)
        return () => clearTimeout(timer)
    }, [notification])

    // Handlers: Voucher
    async function handleRedeem(voucher: VoucherItem) {
        if (voucherLoadingId || displayXp < voucher.xp_cost || claimedVoucherIds.has(voucher.id)) return

        setVoucherError(null)
        setVoucherLoadingId(voucher.id)
        try {
            const res = await fetch('/api/vouchers/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voucherId: voucher.id }),
            })
            let data: { success?: boolean; error?: string; [key: string]: unknown } = {}
            try {
                data = await res.json()
            } catch {
                data = { error: `Server error ${res.status}` }
            }

            if (!res.ok || !data?.success) {
                setVoucherError(data?.error || 'Gagal klaim voucher.')
                return
            }

            const result: RedeemResult = {
                redemptionId: toStringValue(data.redemptionId),
                code: toStringValue(data.code),
                newXp: toNumberValue(data.newXp),
                xpSpent: toNumberValue(data.xpSpent),
                voucherValue: toNumberValue(data.voucherValue),
                voucherName: toStringValue(data.voucherName, 'Voucher Kantin'),
            }

            if (!result.redemptionId || !result.code) {
                setVoucherError('Response voucher tidak valid dari server.')
                return
            }

            setRedeemModalSource('claim')
            setCopied(false)
            setRedeemResult(result)
            setXp(result.newXp)
            updateXP(result.newXp)
            setHistory((prev) => [
                {
                    id: result.redemptionId,
                    voucher_id: voucher.id,
                    code: result.code,
                    xp_spent: result.xpSpent,
                    voucher_value: result.voucherValue,
                    status: 'issued',
                    created_at: new Date().toISOString(),
                    voucherName: result.voucherName,
                },
                ...prev,
            ])
        } catch {
            setVoucherError('Gagal terhubung ke server saat klaim voucher.')
        } finally {
            setVoucherLoadingId(null)
        }
    }

    async function copyCode(value: string) {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
        } catch {
            setCopied(false)
        }
    }

    // Handlers: Buy Item
    async function handleBuyItem(item: GameItem) {
        if (!profile || displayXp < item.cost_xp) {
            setNotification({
                type: 'error',
                message: `XP belum cukup! Butuh ${item.cost_xp} XP, saat ini kamu memiliki ${displayXp} XP.`,
            })
            return
        }

        setItemActionLoadingId(item.id)
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
                const updatedInventory = [...inventory, data.item]
                setInventory(updatedInventory)
                setCharacterInventoryData({
                    equipped: (profile?.equipped_items || characterEquipped || {}) as EquippedItemsMap,
                    inventory: updatedInventory,
                })
                if (data.currentXp !== undefined) {
                    setXp(data.currentXp)
                    updateXP(data.currentXp)
                }
                setNotification({ type: 'success', message: data.message || `${item.name} berhasil dibeli!` })
            }
        } catch (e: any) {
            setNotification({ type: 'error', message: e.message || 'Terjadi kesalahan jaringan.' })
        } finally {
            setItemActionLoadingId(null)
        }
    }

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: '#ffffff' }}>
                            Toko Petualang
                        </h1>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(245, 197, 66, 0.1)',
                                border: '1px solid rgba(245, 197, 66, 0.25)',
                                color: '#F5C542',
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            <Zap size={14} />
                            <span>{displayXp.toLocaleString()} XP</span>
                        </div>
                    </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                    Tukarkan poin XP dengan voucher kantin atau beli perlengkapan karakter.
                </p>
            </div>

            {/* Main Tabs Navigation (Only Voucher Kantin & Toko Aksesoris) */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                    borderBottom: '1px solid var(--surface-border)',
                    paddingBottom: '10px',
                    overflowX: 'auto',
                }}
            >
                <button
                    type="button"
                    onClick={() => setActiveTab('voucher')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: activeTab === 'voucher' ? '1px solid rgba(245, 197, 66, 0.35)' : '1px solid transparent',
                        backgroundColor: activeTab === 'voucher' ? 'rgba(245, 197, 66, 0.12)' : 'transparent',
                        color: activeTab === 'voucher' ? '#F5C542' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Ticket size={16} />
                    <span>Voucher Kantin</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('items')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: activeTab === 'items' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                        backgroundColor: activeTab === 'items' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                        color: activeTab === 'items' ? '#38bdf8' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <ShoppingBag size={16} />
                    <span>Toko Aksesoris</span>
                </button>
            </div>

            {/* Notification Toast */}
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                        marginBottom: '16px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 500,
                        backgroundColor: notification.type === 'success' ? 'rgba(8, 195, 128, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: `1px solid ${notification.type === 'success' ? 'rgba(8, 195, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        color: notification.type === 'success' ? '#08c380' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    {notification.type === 'success' ? <CheckCircle size={16} /> : <Zap size={16} />}
                    <span>{notification.message}</span>
                </motion.div>
            )}

            {/* TAB 1: VOUCHER KANTIN */}
            {activeTab === 'voucher' && (
                <div>
                    {voucherError && (
                        <div
                            style={{
                                marginBottom: '16px',
                                backgroundColor: 'rgba(255, 51, 85, 0.08)',
                                border: '1px solid rgba(255, 51, 85, 0.3)',
                                color: '#ff3355',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                fontSize: '13px',
                            }}
                        >
                            {voucherError}
                        </div>
                    )}

                    <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                        {/* Voucher Catalog */}
                        <div className="card" style={{ padding: '24px', borderRadius: '14px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '16px', color: '#ffffff' }}>
                                Pilih Voucher Kantin
                            </h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {vouchers.map((voucher) => {
                                    const alreadyClaimed = claimedVoucherIds.has(voucher.id)
                                    const canRedeem = !alreadyClaimed && displayXp >= voucher.xp_cost && (voucher.stock === null || voucher.stock > 0)
                                    const cleanVoucherName = containsVoucherValueInName(voucher.name, voucher.voucher_value)
                                        ? stripVoucherValueFromName(voucher.name, voucher.voucher_value)
                                        : voucher.name
                                    return (
                                        <div
                                            key={voucher.id}
                                            style={{
                                                border: '1px solid var(--surface-border)',
                                                borderRadius: '12px',
                                                backgroundColor: '#0d0d0d',
                                                padding: '16px 18px',
                                                transition: 'border-color 0.2s',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Ticket size={16} style={{ color: '#F5C542' }} />
                                                    <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                                                        {cleanVoucherName}
                                                    </strong>
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: '11px',
                                                        color: '#08c380',
                                                        backgroundColor: 'rgba(8, 195, 128, 0.1)',
                                                        border: '1px solid rgba(8, 195, 128, 0.25)',
                                                        borderRadius: '6px',
                                                        padding: '2px 8px',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Rp{voucher.voucher_value.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                                {voucher.description || 'Voucher kantin untuk penukaran makanan/minuman.'}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                <span style={{ fontSize: '12px', color: '#F5C542', fontWeight: 600 }}>
                                                    Syarat: {voucher.xp_cost} XP
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRedeem(voucher)}
                                                    disabled={!canRedeem || voucherLoadingId === voucher.id}
                                                    style={{
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '8px 16px',
                                                        cursor: canRedeem ? 'pointer' : 'not-allowed',
                                                        fontFamily: 'var(--font-heading)',
                                                        fontWeight: 600,
                                                        fontSize: '12px',
                                                        backgroundColor: canRedeem ? '#F5C542' : '#141414',
                                                        color: canRedeem ? '#0a0a0a' : 'var(--text-muted)',
                                                        opacity: voucherLoadingId === voucher.id ? 0.75 : 1,
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                >
                                                    {voucherLoadingId === voucher.id ? 'Memproses...' : alreadyClaimed ? 'Sudah Diklaim' : 'Klaim'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Claimed History */}
                        <div className="card" style={{ padding: '24px', borderRadius: '14px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '16px', color: '#ffffff' }}>
                                Riwayat Kode Voucher
                            </h3>
                            {history.length === 0 ? (
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    Belum ada penukaran voucher.
                                </p>
                            ) : (
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {history.slice(0, 12).map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                setRedeemModalSource('history')
                                                setCopied(false)
                                                setRedeemResult({
                                                    redemptionId: item.id,
                                                    code: item.code,
                                                    newXp: displayXp,
                                                    xpSpent: item.xp_spent,
                                                    voucherValue: item.voucher_value,
                                                    voucherName: item.voucherName,
                                                })
                                            }}
                                            style={{
                                                border: '1px solid var(--surface-border)',
                                                borderRadius: '12px',
                                                backgroundColor: '#0d0d0d',
                                                padding: '12px 14px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                width: '100%',
                                                transition: 'border-color 0.2s',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '4px' }}>
                                                <strong style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#ffffff' }}>
                                                    {item.voucherName}
                                                </strong>
                                                <span style={{ fontSize: '11px', color: '#F5C542', fontWeight: 600 }}>
                                                    Syarat {item.xp_spent} XP
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#08c380', fontFamily: 'monospace', fontWeight: 600 }}>
                                                {item.code}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: TOKO AKSESORIS */}
            {activeTab === 'items' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Controls: Slot Filters & Sorter */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                            padding: '12px 16px',
                            backgroundColor: 'var(--surface-card)',
                            borderRadius: '12px',
                            border: '1px solid var(--surface-border)',
                        }}
                    >
                        {/* Slot Filter Chips */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {(['all', 'weapon', 'head', 'armor', 'accessory'] as const).map((slotKey) => (
                                <button
                                    key={slotKey}
                                    type="button"
                                    onClick={() => setSelectedSlotFilter(slotKey)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        border: `1px solid ${selectedSlotFilter === slotKey ? 'rgba(56, 189, 248, 0.4)' : 'var(--surface-border)'}`,
                                        backgroundColor: selectedSlotFilter === slotKey ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                                        color: selectedSlotFilter === slotKey ? '#38bdf8' : 'var(--text-secondary)',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {slotKey === 'all' ? 'Semua Slot' : `${SLOT_LABELS[slotKey].emoji} ${SLOT_LABELS[slotKey].name}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Items Grid */}
                    {filteredShopItems.length === 0 ? (
                        <div
                            style={{
                                padding: '40px 20px',
                                textAlign: 'center',
                                backgroundColor: 'var(--surface-card)',
                                borderRadius: '14px',
                                border: '1px dashed var(--surface-border)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            <ShoppingBag size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                            <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
                                Tidak ada item toko yang cocok dengan filter slot ini.
                            </p>
                            <button
                                type="button"
                                onClick={() => setSelectedSlotFilter('all')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    color: '#ffffff',
                                    border: '1px solid var(--surface-border)',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Tampilkan Semua Slot
                            </button>
                        </div>
                    ) : (
                        <div className="shop-items-grid">
                            {filteredShopItems.map((item) => {
                                const isOwned = ownedItemIds.has(item.id)
                                const rarity = RARITY_CONFIG[item.rarity]
                                const slotMeta = SLOT_LABELS[item.slot]
                                const canAfford = displayXp >= item.cost_xp
                                const isLoading = itemActionLoadingId === item.id

                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '12px',
                                            backgroundColor: '#121212',
                                            border: `1px solid ${rarity.border}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            gap: '8px',
                                            opacity: isOwned ? 0.8 : 1,
                                            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                                            position: 'relative',
                                        }}
                                    >
                                        <div>
                                            {/* Top badges */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '6px' }}>
                                                <span
                                                    style={{
                                                        fontSize: '9.5px',
                                                        color: 'var(--text-secondary)',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                                        padding: '2px 5px',
                                                        borderRadius: '4px',
                                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {slotMeta?.emoji} {slotMeta?.name}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '9px',
                                                        fontWeight: 600,
                                                        padding: '1px 5px',
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

                                            {/* Item Identity */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <div
                                                    style={{
                                                        width: '34px',
                                                        height: '34px',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#0a0a0a',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '18px',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {item.icon}
                                                </div>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div
                                                        style={{
                                                            fontFamily: 'var(--font-heading)',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            color: '#ffffff',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        {item.name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '9.5px',
                                                            fontWeight: 600,
                                                            color: '#38bdf8',
                                                            marginTop: '1px',
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
                                                    fontSize: '10.5px',
                                                    color: 'var(--text-secondary)',
                                                    margin: '0 0 6px 0',
                                                    lineHeight: 1.35,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    minHeight: '2.7em',
                                                }}
                                            >
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* Bottom Action */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '6px',
                                                paddingTop: '8px',
                                                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#F5C542',
                                                    fontWeight: 700,
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {item.cost_xp === 0 ? 'Gratis' : `${item.cost_xp.toLocaleString()} XP`}
                                            </span>

                                            {isOwned ? (
                                                <span
                                                    style={{
                                                        fontSize: '9.5px',
                                                        color: '#08c380',
                                                        backgroundColor: 'rgba(8, 195, 128, 0.1)',
                                                        border: '1px solid rgba(8, 195, 128, 0.25)',
                                                        padding: '3px 6px',
                                                        borderRadius: '5px',
                                                        fontWeight: 600,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '3px',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    <Check size={11} /> Dimiliki
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleBuyItem(item)}
                                                    disabled={!canAfford || isLoading}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        backgroundColor: canAfford ? '#38bdf8' : '#1e1e1e',
                                                        color: canAfford ? '#050505' : 'var(--text-muted)',
                                                        fontFamily: 'var(--font-heading)',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        cursor: canAfford ? 'pointer' : 'not-allowed',
                                                        transition: 'all 0.15s ease',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {isLoading ? '...' : canAfford ? 'Beli' : 'Kurang'}
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

            {/* Voucher Redemption Result Modal */}
            <AnimatePresence>
                {redeemResult && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                            padding: '20px',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                width: '100%',
                                maxWidth: '420px',
                                backgroundColor: '#141414',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '16px',
                                padding: '24px',
                                textAlign: 'center',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                            }}
                        >
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(8, 195, 128, 0.12)',
                                    border: '1px solid rgba(8, 195, 128, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#08c380',
                                    margin: '0 auto 16px',
                                }}
                            >
                                <Ticket size={24} />
                            </div>

                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>
                                {redeemModalSource === 'claim' ? 'Voucher Berhasil Diklaim!' : 'Detail Voucher'}
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                {redeemResult.voucherName}
                            </p>

                            <div
                                style={{
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '16px',
                                }}
                            >
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                    KODE KANTIN
                                </div>
                                <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 700, color: '#08c380', letterSpacing: '1px', marginBottom: '10px' }}>
                                    {redeemResult.code}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => copyCode(redeemResult.code)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--surface-border)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: '#ffffff',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {copied ? <CheckCircle size={14} style={{ color: '#08c380' }} /> : <Copy size={14} />}
                                    <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                                </button>
                            </div>

                            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                Tunjukkan kode ini kepada petugas kantin saat melakukan pembayaran.
                            </p>

                            <button
                                type="button"
                                onClick={() => setRedeemResult(null)}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: '#F5C542',
                                    color: '#050505',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                }}
                            >
                                Tutup
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
