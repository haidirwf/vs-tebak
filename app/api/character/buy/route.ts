import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getItemById } from '@/lib/game/items'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/server/rateLimit'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateKey = `character:buy:${getRateLimitIdentifier(request, user.id)}`
    const rate = checkRateLimit({ key: rateKey, limit: 15, windowMs: 60_000 })
    if (!rate.ok) {
        return NextResponse.json({
            error: 'Terlalu banyak transaksi. Silakan coba sesaat lagi.',
            retry_after_ms: rate.retryAfterMs,
        }, { status: 429 })
    }

    const body = await request.json() as { itemId: string }
    const { itemId } = body

    const item = getItemById(itemId)
    if (!item) {
        return NextResponse.json({ error: 'Item tidak ditemukan di katalog' }, { status: 404 })
    }

    // 1. Fetch current profile
    const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('id, xp, level, avatar_class, equipped_items')
        .eq('id', user.id)
        .single()

    if (profErr || !profile) {
        return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    }

    // Role eligibility check
    if (item.class_req !== 'all' && item.class_req !== profile.avatar_class) {
        return NextResponse.json({
            error: `Item ini dirancang khusus untuk role ${item.class_req.toUpperCase()}`
        }, { status: 400 })
    }

    // 2. Check if user already owns this item
    const { data: existingRow } = await supabase
        .from('user_inventory')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .maybeSingle()

    if (existingRow) {
        return NextResponse.json({ error: 'Kamu sudah memiliki item ini!' }, { status: 400 })
    }

    // 3. Check XP balance
    if (profile.xp < item.cost_xp) {
        return NextResponse.json({
            error: `XP tidak mencukupi! Butuh ${item.cost_xp} XP, kamu memiliki ${profile.xp} XP.`
        }, { status: 400 })
    }

    // 4. Deduct XP
    const newXp = profile.xp - item.cost_xp
    const { error: deductErr } = await supabase
        .from('profiles')
        .update({ xp: newXp })
        .eq('id', user.id)

    if (deductErr) {
        return NextResponse.json({ error: 'Gagal memproses pengurangan XP: ' + deductErr.message }, { status: 500 })
    }

    // 5. Insert into user_inventory
    try {
        await supabase.from('user_inventory').insert({
            user_id: user.id,
            item_id: item.id,
            slot: item.slot,
            is_equipped: false,
        })
    } catch {}

    // 6. Log XP expenditure
    try {
        await supabase.from('xp_logs').insert({
            user_id: user.id,
            xp_amount: -item.cost_xp,
            reason: `Beli item aksesoris: ${item.name}`,
        })
    } catch {}

    return NextResponse.json({
        success: true,
        item,
        newXp,
        message: `Berhasil membeli ${item.name}!`,
    })
}
