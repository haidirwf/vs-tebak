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

export default function VoucherStoreClient({ initialXp, vouchers, initialHistory }: VoucherStoreClientProps) {
    const { profile } = useUserStore()
    const [xp, setXp] = useState(initialXp)
    const [history, setHistory] = useState(initialHistory)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [redeemResult, setRedeemResult] = useState<RedeemResult | null>(null)
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
                redemptionId: data.redemptionId,
                code: data.code,
                newXp: data.newXp,
                xpSpent: data.xpSpent,
                voucherValue: data.voucherValue,
                voucherName: data.voucherName,
            }

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
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
                    🎟️ Toko Voucher Kantin
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Klaim voucher jika XP kamu sudah memenuhi syarat. Setiap voucher menghasilkan kode unik.
                </p>
            </div>

            <div className="card" style={{ padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={16} style={{ color: 'var(--accent-gold)' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>XP kamu saat ini:</span>
                <strong style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-heading)', fontSize: '16px' }}>
                    {displayXp.toLocaleString()} XP
                </strong>
            </div>

            {error && (
                <div style={{
                    marginBottom: '14px',
                    backgroundColor: 'rgba(232,64,64,0.12)',
                    border: '1px solid rgba(232,64,64,0.4)',
                    color: 'var(--accent-red)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                }}>
                    {error}
                </div>
            )}

            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', alignItems: 'start' }}>
                <div className="card" style={{ padding: '16px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
                        Pilih Voucher
                    </h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {vouchers.map((voucher) => {
                            const alreadyClaimed = claimedVoucherIds.has(voucher.id)
                            const canRedeem = !alreadyClaimed && displayXp >= voucher.xp_cost && (voucher.stock === null || voucher.stock > 0)
                            return (
                                <div key={voucher.id} style={{
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    padding: '12px',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Ticket size={15} style={{ color: 'var(--accent-cyan)' }} />
                                            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '14px' }}>{voucher.name}</strong>
                                        </div>
                                        <span style={{
                                            fontSize: '11px',
                                            color: 'var(--accent-green)',
                                            backgroundColor: 'rgba(34,197,94,0.12)',
                                            border: '1px solid rgba(34,197,94,0.3)',
                                            borderRadius: '4px',
                                            padding: '2px 6px',
                                            fontWeight: 700,
                                        }}>
                                            Rp{voucher.voucher_value.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                        {voucher.description || 'Voucher kantin untuk penukaran makanan/minuman.'}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                                            Syarat: {voucher.xp_cost} XP
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: canRedeem ? 1.03 : 1 }}
                                            whileTap={{ scale: canRedeem ? 0.97 : 1 }}
                                            onClick={() => handleRedeem(voucher)}
                                            disabled={!canRedeem || loadingId === voucher.id}
                                            style={{
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '8px 10px',
                                                cursor: canRedeem ? 'pointer' : 'not-allowed',
                                                fontFamily: 'var(--font-heading)',
                                                fontWeight: 700,
                                                fontSize: '12px',
                                                backgroundColor: canRedeem ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                                                color: canRedeem ? 'var(--bg-primary)' : 'var(--text-muted)',
                                                opacity: loadingId === voucher.id ? 0.75 : 1,
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

                <div className="card" style={{ padding: '16px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
                        Riwayat Kode Voucher
                    </h3>
                    {history.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Belum ada penukaran voucher.
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {history.slice(0, 12).map((item) => (
                                <div key={item.id} style={{
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    padding: '10px',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '4px' }}>
                                        <strong style={{ fontSize: '13px', fontFamily: 'var(--font-heading)' }}>{item.voucherName}</strong>
                                        <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                                            Syarat {item.xp_spent} XP
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                                        {item.code}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: idLocale })}
                                    </div>
                                </div>
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
                            backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
                            style={{ width: '100%', maxWidth: '420px', padding: '20px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--accent-green)' }}>
                                <CheckCircle size={18} />
                                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800 }}>
                                    Voucher Berhasil Diklaim
                                </h4>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>
                                Tunjukkan kode ini ke kantin untuk ditukarkan.
                            </p>
                            <div style={{
                                border: '1px dashed var(--accent-cyan)',
                                borderRadius: '8px',
                                padding: '14px',
                                textAlign: 'center',
                                marginBottom: '14px',
                                backgroundColor: 'rgba(0,212,255,0.08)',
                            }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px' }}>
                                    KODE VOUCHER
                                </div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', letterSpacing: '1px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                                    {redeemResult.code}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => copyCode(redeemResult.code)}
                                    style={{
                                        flex: 1,
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        backgroundColor: 'var(--bg-tertiary)',
                                        color: 'var(--text-primary)',
                                        padding: '10px 12px',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
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
                                        borderRadius: '6px',
                                        backgroundColor: 'var(--accent-gold)',
                                        color: 'var(--bg-primary)',
                                        padding: '10px 12px',
                                        cursor: 'pointer',
                                        fontWeight: 800,
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '13px',
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
