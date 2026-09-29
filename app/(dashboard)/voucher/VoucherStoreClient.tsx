'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Copy, CheckCircle, Zap } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface VoucherItem {
    id: string
    name: string
    description: string | null
    xp_cost: number
    voucher_value: number
    stock: number | null
    is_active: boolean
}

interface RedemptionItem {
    id: string
    voucher_id: string
    code: string
    xp_spent: number
    voucher_value: number
    status: 'issued' | 'redeemed' | 'expired'
    created_at: string
    voucherName: string
}

interface VoucherStoreClientProps {
    initialXp: number
    vouchers: VoucherItem[]
    initialHistory: RedemptionItem[]
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

export default function VoucherStoreClient({ initialXp, vouchers, initialHistory }: VoucherStoreClientProps) {
    const { profile } = useUserStore()
    const [xp, setXp] = useState(initialXp)
    const [history, setHistory] = useState(initialHistory)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [redeemResult, setRedeemResult] = useState<RedeemResult | null>(null)
    const [redeemModalSource, setRedeemModalSource] = useState<RedeemModalSource>('claim')
    const [copied, setCopied] = useState(false)

    const displayXp = useMemo(() => profile?.xp ?? xp, [profile?.xp, xp])
    const claimedVoucherIds = useMemo(() => new Set(history.map((item) => item.voucher_id)), [history])

    async function handleRedeem(voucher: VoucherItem) {
        if (loadingId || displayXp < voucher.xp_cost || claimedVoucherIds.has(voucher.id)) return

        setError(null)
        setLoadingId(voucher.id)
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
                setError(data?.error || 'Gagal klaim voucher.')
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
                setError('Response voucher tidak valid dari server.')
                return
            }

            setRedeemModalSource('claim')
            setCopied(false)
            setRedeemResult(result)
            setXp(result.newXp)
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
            setError('Gagal terhubung ke server saat klaim voucher.')
        } finally {
            setLoadingId(null)
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

    return (
        <div className="responsive-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '6px', color: '#ffffff' }}>
                    🎟️ Toko Voucher Kantin
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Klaim voucher jika XP kamu sudah memenuhi syarat. Setiap voucher menghasilkan kode unik.
                </p>
            </div>

            <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '17.1429px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
                <Zap size={16} style={{ color: '#F5C542' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>XP kamu saat ini:</span>
                <strong style={{ color: '#F5C542', fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600 }}>
                    {displayXp.toLocaleString()} XP
                </strong>
            </div>

            {error && (
                <div style={{
                    marginBottom: '16px',
                    backgroundColor: 'rgba(255, 51, 85, 0.08)',
                    border: '1px solid rgba(255, 51, 85, 0.3)',
                    color: '#ff3355',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                }}>
                    {error}
                </div>
            )}

            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                <div className="card" style={{ padding: '24px', borderRadius: '17.1429px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '16px', color: '#ffffff' }}>
                        Pilih Voucher
                    </h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {vouchers.map((voucher) => {
                            const alreadyClaimed = claimedVoucherIds.has(voucher.id)
                            const canRedeem = !alreadyClaimed && displayXp >= voucher.xp_cost && (voucher.stock === null || voucher.stock > 0)
                            const showValueBadge = true
                            const cleanVoucherName = containsVoucherValueInName(voucher.name, voucher.voucher_value)
                                ? stripVoucherValueFromName(voucher.name, voucher.voucher_value)
                                : voucher.name
                            return (
                                <div key={voucher.id} className="ticket-card hover-lift" style={{
                                    border: '1px solid #222222',
                                    borderRadius: '12px',
                                    backgroundColor: '#0d0d0d',
                                    padding: '16px 18px',
                                    transition: 'border-color 0.2s',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Ticket size={15} style={{ color: '#F5C542' }} />
                                            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>{cleanVoucherName}</strong>
                                        </div>
                                        {showValueBadge && (
                                            <span style={{
                                                fontSize: '11px',
                                                color: '#08c380',
                                                backgroundColor: 'rgba(8, 195, 128, 0.1)',
                                                border: '1px solid rgba(8, 195, 128, 0.25)',
                                                borderRadius: '9999px',
                                                padding: '2px 8px',
                                                fontWeight: 600,
                                            }}>
                                                Rp{voucher.voucher_value.toLocaleString('id-ID')}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                        {voucher.description || 'Voucher kantin untuk penukaran makanan/minuman.'}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                        <span style={{ fontSize: '12px', color: '#F5C542', fontWeight: 600 }}>
                                            Syarat: {voucher.xp_cost} XP
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: canRedeem ? 1.02 : 1 }}
                                            whileTap={{ scale: canRedeem ? 0.98 : 1 }}
                                            onClick={() => handleRedeem(voucher)}
                                            disabled={!canRedeem || loadingId === voucher.id}
                                            style={{
                                                border: 'none',
                                                borderRadius: '9999px',
                                                padding: '8px 16px',
                                                cursor: canRedeem ? 'pointer' : 'not-allowed',
                                                fontFamily: 'var(--font-heading)',
                                                fontWeight: 600,
                                                fontSize: '12px',
                                                backgroundColor: canRedeem ? '#F5C542' : '#141414',
                                                color: canRedeem ? '#0a0a0a' : 'var(--text-muted)',
                                                boxShadow: canRedeem ? '0 0 14px rgba(245, 197, 66, 0.35)' : 'none',
                                                opacity: loadingId === voucher.id ? 0.75 : 1,
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {loadingId === voucher.id ? 'Memproses...' : alreadyClaimed ? 'Sudah Diklaim' : 'Klaim'}
                                        </motion.button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="card" style={{ padding: '24px', borderRadius: '17.1429px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '16px', color: '#ffffff' }}>
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
                                        border: '1px solid #222222',
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
                                        <strong style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 500, color: '#ffffff' }}>{item.voucherName}</strong>
                                        <span style={{ fontSize: '11px', color: '#F5C542', fontWeight: 600 }}>
                                            Syarat {item.xp_spent} XP
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#08c380', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                                        {item.code}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: idLocale })}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {redeemResult && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setRedeemResult(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 1000,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px',
                        }}
                    >
                        <motion.div
                            initial={{ y: 10, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 8, opacity: 0, scale: 0.98 }}
                            onClick={(e) => e.stopPropagation()}
                            className="card"
                            style={{
                                width: '100%',
                                maxWidth: '420px',
                                padding: '28px',
                                borderRadius: '17.1429px',
                                backgroundColor: 'var(--surface-card)',
                                border: '1px solid var(--surface-border)',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#08c380' }}>
                                <CheckCircle size={18} />
                                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 400, letterSpacing: '-0.01em', margin: 0, color: '#ffffff' }}>
                                    {redeemModalSource === 'claim' ? 'Voucher Berhasil Diklaim' : 'Detail Kode Voucher'}
                                </h4>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '18px' }}>
                                Tunjukkan kode ini ke kantin untuk ditukarkan.
                            </p>
                            <div style={{
                                border: '1px dashed #F5C542',
                                borderRadius: '12px',
                                padding: '16px',
                                textAlign: 'center',
                                marginBottom: '18px',
                                backgroundColor: 'rgba(245, 197, 66, 0.08)',
                            }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px', letterSpacing: '0.05em' }}>
                                    KODE VOUCHER
                                </div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', letterSpacing: '2px', fontWeight: 600, color: '#F5C542' }}>
                                    {redeemResult.code}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => copyCode(redeemResult.code)}
                                    style={{
                                        flex: 1,
                                        border: '1px solid var(--surface-border)',
                                        borderRadius: '9999px',
                                        backgroundColor: 'var(--surface-elevated)',
                                        color: '#ffffff',
                                        padding: '11px 16px',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Copy size={14} />
                                    {copied ? 'Tersalin' : 'Copy Kode'}
                                </button>
                                <button
                                    onClick={() => setRedeemResult(null)}
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        borderRadius: '9999px',
                                        backgroundColor: '#F5C542',
                                        color: '#0a0a0a',
                                        padding: '11px 16px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '13px',
                                        boxShadow: '0 0 14px rgba(245, 197, 66, 0.35)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
