import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RedeemResult = {
    redemption_id: string
    code: string
    new_xp: number
    xp_spent: number
    voucher_value: number
    voucher_name: string
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as { voucherId?: string }
    if (!body.voucherId) {
        return NextResponse.json({ error: 'voucherId is required' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('redeem_voucher_xp', {
        p_voucher_id: body.voucherId,
    })

    if (error) {
        const msg = String(error.message || '')
        console.error('redeem_voucher_xp rpc error:', error)
        if (
            (msg.toLowerCase().includes('redeem_voucher_xp') && msg.toLowerCase().includes('does not exist')) ||
            (msg.toLowerCase().includes('redeem_voucher_xp') && msg.toLowerCase().includes('schema cache'))
        ) {
            return NextResponse.json({ error: 'Fitur voucher belum aktif. Jalankan migration 014 di SQL Editor.' }, { status: 503 })
        }
        if (msg.toLowerCase().includes('voucher_catalog') && msg.toLowerCase().includes('does not exist')) {
            return NextResponse.json({ error: 'Tabel voucher belum tersedia. Jalankan migration 014 di SQL Editor.' }, { status: 503 })
        }
        if (msg.includes('XP_NOT_ENOUGH')) {
            return NextResponse.json({ error: 'XP tidak cukup' }, { status: 400 })
        }
        if (msg.includes('VOUCHER_OUT_OF_STOCK')) {
            return NextResponse.json({ error: 'Voucher habis' }, { status: 400 })
        }
        if (msg.includes('ALREADY_CLAIMED')) {
            return NextResponse.json({ error: 'Voucher ini sudah pernah kamu klaim' }, { status: 400 })
        }
        if (msg.includes('VOUCHER_NOT_FOUND')) {
            return NextResponse.json({ error: 'Voucher tidak ditemukan' }, { status: 404 })
        }
        if (msg.includes('PROFILE_NOT_FOUND')) {
            return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
        }
        return NextResponse.json({ error: `Gagal klaim voucher: ${msg || 'unknown error'}` }, { status: 500 })
    }

    const row = (Array.isArray(data) ? data[0] : data) as RedeemResult | null
    if (!row) {
        return NextResponse.json({ error: 'Gagal klaim voucher' }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        redemptionId: row.redemption_id,
        code: row.code,
        newXp: row.new_xp,
        xpSpent: row.xp_spent,
        voucherValue: row.voucher_value,
        voucherName: row.voucher_name,
    })
}
