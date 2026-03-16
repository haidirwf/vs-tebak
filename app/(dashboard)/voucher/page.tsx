import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VoucherStoreClient from './VoucherStoreClient'

type VoucherRow = {
    id: string
    name: string
    description: string | null
    xp_cost: number
    voucher_value: number
    stock: number | null
    is_active: boolean
}

type RedemptionRow = {
    id: string
    voucher_id: string
    code: string
    xp_spent: number
    voucher_value: number
    status: 'issued' | 'redeemed' | 'expired'
    created_at: string
    voucher_catalog?: { name: string } | { name: string }[] | null
}

export default async function VoucherPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [profileRes, vouchersRes, historyRes] = await Promise.all([
        supabase.from('profiles').select('xp').eq('id', user.id).single(),
        supabase.from('voucher_catalog').select('*').eq('is_active', true).order('xp_cost', { ascending: true }),
        supabase
            .from('voucher_redemptions')
            .select('id, voucher_id, code, xp_spent, voucher_value, status, created_at, voucher_catalog(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20),
    ])

    const currentXp = profileRes.data?.xp ?? 0
    const vouchers = (vouchersRes.data || []) as VoucherRow[]
    const history = ((historyRes.data || []) as RedemptionRow[]).map((row) => {
        const relation = row.voucher_catalog
        const voucherName = Array.isArray(relation) ? relation[0]?.name : relation?.name
        return {
            ...row,
            voucherName: voucherName || 'Voucher Kantin',
        }
    })

    return (
        <VoucherStoreClient
            initialXp={currentXp}
            vouchers={vouchers}
            initialHistory={history}
        />
    )
}
