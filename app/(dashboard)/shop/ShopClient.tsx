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
                        <div className="card" style={{ padding: '24px', borderRadius: '14px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', boxShadow: 'var(--shadow-card)' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '16px', color: 'var(--text-primary)' }}>
                                Pilih Voucher Kantin
                            </h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {vouchers.map((voucher) => {
                                    const alreadyClaimed = claimedVoucherIds.has(voucher.id)
                                    const canRedeem = !alreadyClaimed && displayXp >= voucher.xp_cost && (voucher.stock === null || voucher.stock > 0)
                                    const rawName = voucher.name || 'Voucher Kantin'
                                    const displayName = rawName.toLowerCase().includes('rp')
                                        ? rawName
                                        : `${rawName} Rp${voucher.voucher_value.toLocaleString('id-ID')}`

                                    return (
                                        <div
                                            key={voucher.id}
                                            style={{
                                                border: canRedeem
                                                    ? '1.5px solid var(--accent-gold-border)'
                                                    : '1px solid var(--surface-border)',
                                                borderRadius: '12px',
                                                backgroundColor: 'var(--surface-card)',
                                                boxShadow: canRedeem
                                                    ? '0 2px 12px rgba(245, 197, 66, 0.1)'
                                                    : 'var(--shadow-card)',
                                                padding: '16px 18px',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {/* Header Voucher: Icon, Name, and Value Badge */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                                    <div
                                                        style={{
                                                            width: '38px',
                                                            height: '38px',
                                                            borderRadius: '8px',
                                                            backgroundColor: canRedeem ? 'var(--accent-gold-bg)' : 'var(--surface-elevated)',
                                                            border: `1px solid ${canRedeem ? 'var(--accent-gold-border)' : 'var(--surface-border)'}`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: canRedeem ? 'var(--accent-gold-text)' : 'var(--color-gold-text)',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <Ticket size={20} />
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <strong
                                                            style={{
                                                                fontFamily: 'var(--font-heading)',
                                                                fontSize: '14.5px',
                                                                fontWeight: 700,
                                                                color: 'var(--text-primary)',
                                                                lineHeight: 1.3,
                                                                display: 'block',
                                                            }}
                                                        >
                                                            {displayName}
                                                        </strong>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                            Potongan kantin sekolah
                                                        </span>
                                                    </div>
                                                </div>

                                                <span
                                                    style={{
                                                        fontSize: '12.5px',
                                                        fontWeight: 700,
                                                        fontFamily: 'var(--font-heading)',
                                                        color: 'var(--accent-green)',
                                                        backgroundColor: 'var(--accent-green-bg)',
                                                        border: '1px solid var(--accent-green-border)',
                                                        borderRadius: '6px',
                                                        padding: '4px 9px',
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    Rp{voucher.voucher_value.toLocaleString('id-ID')}
                                                </span>
                                            </div>

                                            {voucher.description && (
                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                                                    {voucher.description}
                                                </p>
                                            )}

                                            {/* Bottom Action & Cost Tag */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '8px',
                                                    paddingTop: '10px',
                                                    borderTop: '1px solid var(--surface-border)',
                                                }}
                                            >
                                                {/* High-contrast XP Requirement Pill */}
                                                <div
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        backgroundColor: canRedeem ? 'var(--accent-gold-bg)' : 'var(--surface-elevated)',
                                                        border: `1px solid ${canRedeem ? 'var(--accent-gold-border)' : 'var(--surface-border)'}`,
                                                        color: canRedeem ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
                                                    }}
                                                >
                                                    <Zap size={13} style={{ color: canRedeem ? 'var(--accent-gold)' : 'var(--text-muted)' }} />
                                                    <span>Syarat: {voucher.xp_cost} XP</span>
                                                    {!canRedeem && !alreadyClaimed && displayXp < voucher.xp_cost && (
                                                        <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.85 }}>
                                                            (Kurang {voucher.xp_cost - displayXp})
                                                        </span>
                                                    )}
                                                </div>

                                                {alreadyClaimed ? (
                                                    <span
                                                        style={{
                                                            fontSize: '11.5px',
                                                            color: 'var(--accent-green)',
                                                            backgroundColor: 'var(--accent-green-bg)',
                                                            border: '1px solid var(--accent-green-border)',
                                                            padding: '5px 12px',
                                                            borderRadius: '6px',
                                                            fontWeight: 700,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        <CheckCircle size={13} />
                                                        <span>Sudah Diklaim</span>
                                                    </span>
                                                ) : (
                                                    <motion.button
                                                        whileHover={canRedeem && voucherLoadingId !== voucher.id ? { scale: 1.02 } : {}}
                                                        whileTap={canRedeem && voucherLoadingId !== voucher.id ? { scale: 0.98 } : {}}
                                                        type="button"
                                                        onClick={() => handleRedeem(voucher)}
                                                        disabled={!canRedeem || voucherLoadingId === voucher.id}
                                                        className={canRedeem ? 'btn-signal-orange' : 'btn-dark-outline'}
                                                        style={{
                                                            padding: '7px 18px',
                                                            borderRadius: '8px',
                                                            cursor: canRedeem ? 'pointer' : 'not-allowed',
                                                            fontWeight: 700,
                                                            fontSize: '12.5px',
                                                            opacity: canRedeem ? (voucherLoadingId === voucher.id ? 0.75 : 1) : 0.7,
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {voucherLoadingId === voucher.id ? 'Memproses...' : canRedeem ? 'Klaim Sekarang' : 'XP Kurang'}
                                                    </motion.button>
                                                )}
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
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: `1px solid ${isSlotActive ? 'var(--accent-gold-border)' : 'var(--surface-border)'}`,
                                            backgroundColor: isSlotActive ? 'var(--accent-gold-bg)' : 'var(--surface-elevated)',
                                            color: isSlotActive ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '12px',
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
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setSelectedSlotFilter('all')}
                                className="btn-dark-outline"
                                style={{
                                    padding: '7px 16px',
                                    fontSize: '12px',
                                }}
                            >
                                Tampilkan Semua Slot
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
                                        style={{
                                            padding: '14px 12px',
                                            borderRadius: '12px',
                                            backgroundColor: 'var(--surface-card)',
                                            border: `1px solid ${rarity.border}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            gap: '8px',
                                            opacity: isOwned ? 0.82 : 1,
                                            boxShadow: 'var(--shadow-card)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                    >

                                        <div>
                                            {/* Top badges */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
                                                <span
                                                    style={{
                                                        fontSize: '10.5px',
                                                        color: 'var(--text-secondary)',
                                                        backgroundColor: 'var(--surface-elevated)',
                                                        padding: '2px 7px',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--surface-border)',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {slotMeta?.emoji} {slotMeta?.name}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        padding: '2px 7px',
                                                        borderRadius: '6px',
                                                        color: rarity.color,
                                                        backgroundColor: rarity.bg,
                                                        border: `1px solid ${rarity.border}`,
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {rarity.label}
                                                </span>
                                            </div>

                                            {/* Item Identity: Prominent Icon + Two-line Title & Buff */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                                                <div
                                                    style={{
                                                        width: '42px',
                                                        height: '42px',
                                                        borderRadius: '10px',
                                                        backgroundColor: rarity.bg,
                                                        border: `1px solid ${rarity.border}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '22px',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {item.icon}
                                                </div>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div
                                                        style={{
                                                            fontFamily: 'var(--font-heading)',
                                                            fontSize: '13.5px',
                                                            fontWeight: 600,
                                                            color: 'var(--text-primary)',
                                                            lineHeight: 1.3,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
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
                                                                color: '#38bdf8',
                                                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                                                border: '1px solid rgba(56, 189, 248, 0.28)',
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

                                            <p
                                                style={{
                                                    fontSize: '11.5px',
                                                    color: 'var(--text-secondary)',
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
                                        </div>

                                        {/* Bottom Action */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '6px',
                                                paddingTop: '10px',
                                                borderTop: '1px solid var(--surface-border)',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '12.5px',
                                                    color: 'var(--color-gold-text)',
                                                    fontWeight: 700,
                                                    fontFamily: 'var(--font-heading)',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {item.cost_xp === 0 ? 'Gratis' : `${item.cost_xp.toLocaleString()} XP`}
                                            </span>

                                            {isOwned ? (
                                                <span
                                                    style={{
                                                        fontSize: '10.5px',
                                                        color: '#08c380',
                                                        backgroundColor: 'rgba(8, 195, 128, 0.1)',
                                                        border: '1px solid rgba(8, 195, 128, 0.25)',
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
                                                    className={canAfford ? 'btn-signal-orange' : 'btn-dark-outline'}
                                                    style={{
                                                        padding: '6px 14px',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        borderRadius: '8px',
                                                        cursor: canAfford ? 'pointer' : 'not-allowed',
                                                        opacity: canAfford ? (isLoading ? 0.75 : 1) : 0.6,
                                                        whiteSpace: 'nowrap',
                                                    }}
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
        </div>
    )
}
