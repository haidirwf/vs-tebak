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
    ChevronRight,
} from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { useContentStore, VoucherItem, RedemptionItem } from '@/stores/contentStore'
import { GameItem, ItemSlot, RARITY_CONFIG, GAME_ITEMS } from '@/lib/game/items'
import { EquippedItemsMap } from '@/lib/game/character'
import ItemIcon from '@/components/character/ItemIcon'
import ItemCelebrationModal from '@/components/character/ItemCelebrationModal'

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
    const [celebrationItem, setCelebrationItem] = useState<GameItem | null>(null)

    const displayXp = useMemo(() => profile?.xp ?? xp, [profile?.xp, xp])
    const claimedVoucherIds = useMemo(() => new Set(history.map((item) => item.voucher_id)), [history])
    const ownedItemIds = useMemo(() => new Set(inventory.map((item) => item.id)), [inventory])

    // Filtered Shop Items (filtered by slot only)
    const filteredShopItems = useMemo(() => {
        return GAME_ITEMS.filter((item) => {
            if (selectedSlotFilter !== 'all' && item.slot !== selectedSlotFilter) return false
            if (item.class_req !== 'all' && profile?.avatar_class && item.class_req !== profile.avatar_class) {
                return false
            }
            return true
        })
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
                const purchasedItem = data.item || item
                const updatedInventory = [...inventory, purchasedItem]
                setInventory(updatedInventory)
                setCharacterInventoryData({
                    equipped: (profile?.equipped_items || characterEquipped || {}) as EquippedItemsMap,
                    inventory: updatedInventory,
                })
                if (data.currentXp !== undefined) {
                    setXp(data.currentXp)
                    updateXP(data.currentXp)
                }
                // Trigger celebratory rarity-tailored showcase modal (no green toast)
                setCelebrationItem(purchasedItem)
            }
        } catch (e: any) {
            setNotification({ type: 'error', message: e.message || 'Terjadi kesalahan jaringan.' })
        } finally {
            setItemActionLoadingId(null)
        }
    }

    // Direct equip handler from celebration modal
    async function handleEquipFromCelebration(itemToEquip: GameItem) {
        const currentEquipped = { ...(profile?.equipped_items || characterEquipped || {}) }
        const newEquipped = { ...currentEquipped, [itemToEquip.slot]: itemToEquip.id }

        if (profile) {
            useUserStore.getState().setProfile({
                ...profile,
                equipped_items: newEquipped,
            })
        }
        setCharacterInventoryData({
            equipped: newEquipped,
            inventory,
        })

        try {
            await fetch('/api/character/equip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: itemToEquip.id, slot: itemToEquip.slot, action: 'equip' }),
            })
        } catch (err) {
            console.error('Failed to equip item directly from modal:', err)
        }
    }

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: 'var(--text-primary)' }}>
                            🛍️ Toko Petualang
                        </h1>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--accent-gold-bg)',
                                border: '1px solid var(--accent-gold-border)',
                                color: 'var(--accent-gold-text)',
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
                    overflowX: 'auto',
                }}
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setActiveTab('voucher')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 16px',
                        borderRadius: '8px',
                        border: `1px solid ${activeTab === 'voucher' ? 'var(--accent-gold-border)' : 'var(--surface-border)'}`,
                        backgroundColor: activeTab === 'voucher' ? 'var(--accent-gold-bg)' : 'var(--surface-elevated)',
                        color: activeTab === 'voucher' ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '13px',
                        fontWeight: activeTab === 'voucher' ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        boxShadow: 'none',
                    }}
                >
                    <Ticket size={16} />
                    <span>Voucher Kantin</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setActiveTab('items')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 16px',
                        borderRadius: '8px',
                        border: `1px solid ${activeTab === 'items' ? 'var(--accent-gold-border)' : 'var(--surface-border)'}`,
                        backgroundColor: activeTab === 'items' ? 'var(--accent-gold-bg)' : 'var(--surface-elevated)',
                        color: activeTab === 'items' ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '13px',
                        fontWeight: activeTab === 'items' ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        boxShadow: 'none',
                    }}
                >
                    <ShoppingBag size={16} />
                    <span>Toko Aksesoris</span>
                </motion.button>
            </div>

            {/* Error Notification Toast (Green success toaster removed) */}
            {notification && notification.type === 'error' && (
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
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <Zap size={16} />
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
                        <div className="card" style={{ padding: '24px', borderRadius: '14px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', boxShadow: 'var(--shadow-card)' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '16px', color: 'var(--text-primary)' }}>
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
                                                backgroundColor: 'var(--surface-elevated)',
                                                padding: '16px 18px',
                                                transition: 'border-color 0.2s',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                    <Ticket size={16} style={{ color: 'var(--color-gold-text)', flexShrink: 0 }} />
                                                    <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    Rp{voucher.voucher_value.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                                {voucher.description || 'Voucher kantin untuk penukaran makanan/minuman.'}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                <span style={{ fontSize: '12px', color: 'var(--color-gold-text)', fontWeight: 700 }}>
                                                    Syarat: {voucher.xp_cost} XP
                                                </span>
                                                <motion.button
                                                    whileHover={canRedeem && voucherLoadingId !== voucher.id ? { scale: 1.02 } : {}}
                                                    whileTap={canRedeem && voucherLoadingId !== voucher.id ? { scale: 0.98 } : {}}
                                                    type="button"
                                                    onClick={() => handleRedeem(voucher)}
                                                    disabled={!canRedeem || voucherLoadingId === voucher.id}
                                                    className={canRedeem ? 'btn-signal-orange' : 'btn-dark-outline'}
                                                    style={{
                                                        padding: '7px 16px',
                                                        borderRadius: '8px',
                                                        cursor: canRedeem ? 'pointer' : 'not-allowed',
                                                        fontWeight: 700,
                                                        fontSize: '12px',
                                                        opacity: canRedeem ? (voucherLoadingId === voucher.id ? 0.75 : 1) : 0.6,
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {voucherLoadingId === voucher.id ? 'Memproses...' : alreadyClaimed ? 'Sudah Diklaim' : 'Klaim'}
                                                </motion.button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Claimed History */}
                        <div className="card" style={{ padding: '24px', borderRadius: '14px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', boxShadow: 'var(--shadow-card)' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '16px', color: 'var(--text-primary)' }}>
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
                                                borderRadius: '10px',
                                                backgroundColor: 'var(--surface-card)',
                                                boxShadow: 'var(--shadow-card)',
                                                padding: '12px 14px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                width: '100%',
                                                transition: 'all 0.15s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--accent-gold-border)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--surface-border)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                <strong style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    {item.voucherName}
                                                </strong>
                                                <span
                                                    style={{
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        color: 'var(--accent-gold-text)',
                                                        backgroundColor: 'var(--accent-gold-bg)',
                                                        border: '1px solid var(--accent-gold-border)',
                                                        padding: '2px 7px',
                                                        borderRadius: '6px',
                                                    }}
                                                >
                                                    {item.xp_spent} XP
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                <div style={{ fontSize: '12.5px', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.04em' }}>
                                                    {item.code}
                                                </div>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    Lihat Detail ▸
                                                </span>
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
                    {/* Controls: Slot Filters Only */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                            padding: '12px 16px',
                            backgroundColor: 'var(--surface-card)',
                            borderRadius: '12px',
                            border: '1px solid var(--surface-border)',
                        }}
                    >
                        <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 600, marginRight: '2px' }}>
                            Slot:
                        </span>
                        {(['all', 'weapon', 'head', 'armor', 'accessory'] as const).map((slotKey) => {
                            const isSlotActive = selectedSlotFilter === slotKey
                            return (
                                <motion.button
                                    key={slotKey}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => setSelectedSlotFilter(slotKey)}
                                    style={{
                                        padding: '5px 11px',
                                        borderRadius: '7px',
                                        border: `1px solid ${isSlotActive ? 'var(--accent-gold-border)' : 'var(--surface-border)'}`,
                                        backgroundColor: isSlotActive ? 'var(--accent-gold-bg)' : 'var(--surface-elevated)',
                                        color: isSlotActive ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '11.5px',
                                        fontWeight: isSlotActive ? 700 : 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        boxShadow: 'none',
                                    }}
                                >
                                    {slotKey === 'all' ? 'Semua Slot' : `${SLOT_LABELS[slotKey].emoji} ${SLOT_LABELS[slotKey].name}`}
                                </motion.button>
                            )
                        })}
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
                                Tidak ada item toko yang cocok dengan filter yang dipilih.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => {
                                    setSelectedSlotFilter('all')
                                }}
                                className="btn-dark-outline"
                                style={{
                                    padding: '7px 16px',
                                    fontSize: '12px',
                                }}
                            >
                                Reset Filter
                            </motion.button>
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
                                        className={`rarity-card-tier rarity-card-${item.rarity}`}
                                        style={{
                                            padding: '14px 13px',
                                            background: rarity.cardBg,
                                            border: `1.5px solid ${rarity.cardBorder}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            gap: '10px',
                                            opacity: isOwned ? 0.85 : 1,
                                            boxShadow: rarity.cardShadow,
                                        }}
                                    >
                                        {/* Top Beam Highlight for rare / epic / legendary */}
                                        {rarity.topBeam && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: item.rarity === 'legendary' ? '3px' : '2px',
                                                    background: rarity.topBeam,
                                                    zIndex: 3,
                                                }}
                                            />
                                        )}

                                        {/* Corner Sheen / Ambient Light Overlay for epic / legendary */}
                                        {rarity.sheenOverlay && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: rarity.sheenOverlay,
                                                    pointerEvents: 'none',
                                                    zIndex: 1,
                                                }}
                                            />
                                        )}

                                        <div style={{ position: 'relative', zIndex: 2 }}>
                                            {/* Top badges: Slot on left, Rarity on right */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '10px' }}>
                                                <span
                                                    style={{
                                                        fontSize: '11px',
                                                        color: 'var(--rarity-slot-color)',
                                                        backgroundColor: 'var(--rarity-slot-bg)',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--rarity-slot-border)',
                                                        whiteSpace: 'nowrap',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                    }}
                                                >
                                                    {slotMeta?.emoji} {slotMeta?.name}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {item.rarity === 'legendary' && (
                                                        <span
                                                            style={{
                                                                fontSize: '9.5px',
                                                                fontWeight: 700,
                                                                color: '#b45309',
                                                                backgroundColor: 'rgba(245, 158, 11, 0.22)',
                                                                border: '1px solid rgba(251, 191, 36, 0.65)',
                                                                padding: '2px 6px',
                                                                borderRadius: '5px',
                                                                lineHeight: 1.2,
                                                            }}
                                                        >
                                                            👑 Pusaka
                                                        </span>
                                                    )}
                                                    <span
                                                        style={{
                                                            fontSize: '10.5px',
                                                            fontWeight: 700,
                                                            padding: '2.5px 8px',
                                                            borderRadius: '6px',
                                                            color: rarity.badgeColor,
                                                            backgroundColor: rarity.badgeBg,
                                                            border: `1px solid ${rarity.badgeBorder}`,
                                                            whiteSpace: 'nowrap',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '3px',
                                                            textShadow:
                                                                item.rarity === 'legendary'
                                                                    ? '0 0 10px rgba(251, 191, 36, 0.45)'
                                                                    : item.rarity === 'epic'
                                                                    ? '0 0 8px rgba(192, 132, 252, 0.35)'
                                                                    : 'none',
                                                        }}
                                                    >
                                                        <span>{rarity.stars}</span>
                                                        <span>{rarity.label}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Item Identity: Prominent Pedestal Icon + Name & Rarity-themed Buff */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                                                <ItemIcon item={item} size={46} />
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div
                                                        style={{
                                                            fontFamily: 'var(--font-heading)',
                                                            fontSize: '13.5px',
                                                            fontWeight: 700,
                                                            color: `var(--rarity-title-${item.rarity})`,
                                                            lineHeight: 1.3,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textShadow:
                                                                item.rarity === 'legendary'
                                                                    ? '0 1px 8px rgba(245, 158, 11, 0.25)'
                                                                    : 'none',
                                                        }}
                                                    >
                                                        {item.name}
                                                    </div>
                                                    <div style={{ marginTop: '4px' }}>
                                                        <span
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '3px',
                                                                fontSize: '10.5px',
                                                                fontWeight: 600,
                                                                color: rarity.buffColor,
                                                                backgroundColor: rarity.buffBg,
                                                                border: `1px solid ${rarity.buffBorder}`,
                                                                padding: '2px 6px',
                                                                borderRadius: '5px',
                                                                lineHeight: 1.25,
                                                            }}
                                                        >
                                                            ⚡ {item.buff.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p
                                                style={{
                                                    fontSize: '11.5px',
                                                    color: `var(--rarity-desc-${item.rarity})`,
                                                    margin: '0 0 6px 0',
                                                    lineHeight: 1.45,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    minHeight: '2.8em',
                                                }}
                                            >
                                                {item.description}
                                            </p>

                                            {/* Class requirement notice if applicable */}
                                            {item.class_req !== 'all' && (
                                                <div style={{ marginTop: '2px', marginBottom: '4px' }}>
                                                    <span
                                                        style={{
                                                            fontSize: '10px',
                                                            color: 'var(--rarity-slot-color)',
                                                            backgroundColor: 'var(--rarity-slot-bg)',
                                                            border: '1px solid var(--rarity-slot-border)',
                                                            padding: '1.5px 6px',
                                                            borderRadius: '4px',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '3px',
                                                        }}
                                                    >
                                                        🛡️ Khusus {item.class_req.toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Action / Price & CTA */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '6px',
                                                paddingTop: '10px',
                                                borderTop: '1px solid var(--rarity-divider)',
                                                position: 'relative',
                                                zIndex: 2,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '12.5px',
                                                    color: rarity.priceColor,
                                                    fontWeight: 700,
                                                    fontFamily: 'var(--font-heading)',
                                                    whiteSpace: 'nowrap',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    textShadow:
                                                        item.rarity === 'legendary'
                                                            ? '0 0 8px rgba(251, 191, 36, 0.45)'
                                                            : 'none',
                                                }}
                                            >
                                                <Zap size={13} style={{ opacity: 0.85 }} />
                                                {item.cost_xp === 0 ? 'Gratis' : `${item.cost_xp.toLocaleString()} XP`}
                                            </span>

                                            {isOwned ? (
                                                <span
                                                    style={{
                                                        fontSize: '10.5px',
                                                        color: '#08c380',
                                                        backgroundColor: 'rgba(8, 195, 128, 0.12)',
                                                        border: '1px solid rgba(8, 195, 128, 0.28)',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontWeight: 600,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    <Check size={12} /> Dimiliki
                                                </span>
                                            ) : (
                                                <motion.button
                                                    whileHover={canAfford && !isLoading ? { scale: 1.02 } : {}}
                                                    whileTap={canAfford && !isLoading ? { scale: 0.98 } : {}}
                                                    type="button"
                                                    onClick={() => handleBuyItem(item)}
                                                    disabled={!canAfford || isLoading}
                                                    style={
                                                        item.rarity === 'legendary' && canAfford
                                                            ? {
                                                                  padding: '6px 14px',
                                                                  fontSize: '12px',
                                                                  fontWeight: 700,
                                                                  borderRadius: '8px',
                                                                  cursor: 'pointer',
                                                                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                                  color: '#111827',
                                                                  border: '1px solid #fef08a',
                                                                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.45)',
                                                                  whiteSpace: 'nowrap',
                                                              }
                                                            : item.rarity === 'epic' && canAfford
                                                            ? {
                                                                  padding: '6px 14px',
                                                                  fontSize: '12px',
                                                                  fontWeight: 700,
                                                                  borderRadius: '8px',
                                                                  cursor: 'pointer',
                                                                  background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                                                                  color: '#ffffff',
                                                                  border: '1px solid #c084fc',
                                                                  boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)',
                                                                  whiteSpace: 'nowrap',
                                                              }
                                                            : {
                                                                  padding: '6px 14px',
                                                                  fontSize: '12px',
                                                                  fontWeight: 700,
                                                                  borderRadius: '8px',
                                                                  cursor: canAfford ? 'pointer' : 'not-allowed',
                                                                  opacity: canAfford ? (isLoading ? 0.75 : 1) : 0.6,
                                                                  whiteSpace: 'nowrap',
                                                              }
                                                    }
                                                    className={
                                                        (item.rarity === 'legendary' || item.rarity === 'epic') && canAfford
                                                            ? ''
                                                            : canAfford
                                                            ? 'btn-signal-orange'
                                                            : 'btn-dark-outline'
                                                    }
                                                >
                                                    {isLoading ? '...' : canAfford ? 'Beli' : 'XP Kurang'}
                                                </motion.button>
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
                                backgroundColor: 'var(--surface-card)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '16px',
                                padding: '24px',
                                textAlign: 'center',
                                boxShadow: 'var(--shadow-modal)',
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

                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                {redeemModalSource === 'claim' ? 'Voucher Berhasil Diklaim!' : 'Detail Voucher'}
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                {redeemResult.voucherName}
                            </p>

                            <div
                                style={{
                                    backgroundColor: 'var(--surface-elevated)',
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
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => copyCode(redeemResult.code)}
                                    className="btn-dark-outline"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '7px 16px',
                                        borderRadius: '8px',
                                        fontSize: '12.5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {copied ? <CheckCircle size={14} style={{ color: '#08c380' }} /> : <Copy size={14} />}
                                    <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                                </motion.button>
                            </div>

                            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                Tunjukkan kode ini kepada petugas kantin saat melakukan pembayaran.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setRedeemResult(null)}
                                className="btn-signal-orange"
                                style={{
                                    width: '100%',
                                    padding: '11px 18px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                <Check size={14} /> Tutup <ChevronRight size={14} />
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Exclusive Item Unlock Celebration Showcase Modal */}
            <ItemCelebrationModal
                item={celebrationItem}
                onClose={() => setCelebrationItem(null)}
                onEquip={handleEquipFromCelebration}
                isCurrentlyEquipped={Boolean(
                    celebrationItem &&
                    (profile?.equipped_items?.[celebrationItem.slot] === celebrationItem.id ||
                     characterEquipped?.[celebrationItem.slot] === celebrationItem.id)
                )}
            />
        </div>
    )
}
