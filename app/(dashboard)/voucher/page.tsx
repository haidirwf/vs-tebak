'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import VoucherStoreClient from './VoucherStoreClient'
import { useUserStore } from '@/stores/userStore'
import { useContentStore, VoucherItem, RedemptionItem } from '@/stores/contentStore'
import { createClient } from '@/lib/supabase/client'

export default function VoucherPage() {
    const router = useRouter()
    const { profile } = useUserStore()
    const {
        vouchers,
        voucherHistory,
        vouchersFetchedAt,
        setVoucherData,
    } = useContentStore()

    const [isLoading, setIsLoading] = useState(!vouchersFetchedAt)

    useEffect(() => {
        const supabase = createClient()

        async function fetchVouchers() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            try {
                const [vouchersRes, historyRes] = await Promise.all([
                    supabase
                        .from('voucher_catalog')
                        .select('*')
                        .eq('is_active', true)
                        .order('xp_cost', { ascending: true }),
                    supabase
                        .from('voucher_redemptions')
                        .select('id, voucher_id, code, xp_spent, voucher_value, status, created_at, voucher_catalog(name)')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(20),
                ])

                const formattedHistory: RedemptionItem[] = ((historyRes.data || []) as any[]).map((row) => {
                    const relation = row.voucher_catalog
                    const voucherName = Array.isArray(relation) ? relation[0]?.name : relation?.name
                    return {
                        ...row,
                        voucherName: voucherName || 'Voucher Kantin',
                    }
                })

                setVoucherData({
                    vouchers: (vouchersRes.data || []) as VoucherItem[],
                    history: formattedHistory,
                })
            } catch (err) {
                console.error('Error loading vouchers:', err)
            } finally {
                setIsLoading(false)
            }
        }

        const isStale = !vouchersFetchedAt || Date.now() - vouchersFetchedAt > 60_000
        if (isStale) {
            fetchVouchers()
        } else {
            setIsLoading(false)
        }
    }, [vouchersFetchedAt, setVoucherData, router])

    if (isLoading && vouchers.length === 0) {
        return (
            <div className="responsive-page" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                <div className="sq-skeleton" style={{ height: '36px', width: '200px', marginBottom: '20px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card" style={{ padding: '20px', height: '240px' }}>
                            <div className="sq-skeleton" style={{ height: '20px', width: '80%', marginBottom: '12px' }} />
                            <div className="sq-skeleton" style={{ height: '14px', width: '60%', marginBottom: '16px' }} />
                            <div className="sq-skeleton" style={{ height: '40px', width: '100%' }} />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <VoucherStoreClient
            initialXp={profile?.xp ?? 0}
            vouchers={vouchers}
            initialHistory={voucherHistory}
        />
    )
}
