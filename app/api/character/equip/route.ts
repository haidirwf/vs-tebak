import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getItemById, ItemSlot } from '@/lib/game/items'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as { itemId: string; slot: ItemSlot; action: 'equip' | 'unequip' }
    const { itemId, slot, action } = body

    const item = getItemById(itemId)
    if (!item) {
        return NextResponse.json({ error: 'Item tidak valid' }, { status: 400 })
    }

    if (item.slot !== slot) {
        return NextResponse.json({ error: 'Slot item tidak sesuai' }, { status: 400 })
    }

    // 1. Fetch current profile
    const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('id, avatar_class, equipped_items')
        .eq('id', user.id)
        .single()

    if (profErr || !profile) {
        return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    }

    // Class requirement check
    if (item.class_req !== 'all' && item.class_req !== profile.avatar_class) {
        return NextResponse.json({
            error: `Item ini khusus untuk role ${item.class_req.toUpperCase()}`
        }, { status: 400 })
    }

    const currentEquipped = ((profile.equipped_items as Partial<Record<ItemSlot, string>>) || {})

    // 2. Perform equip or unequip
    if (action === 'equip') {
        currentEquipped[slot] = itemId

        // Update user_inventory table if it exists
        try {
            await supabase
                .from('user_inventory')
                .update({ is_equipped: false })
                .eq('user_id', user.id)
                .eq('slot', slot)

            await supabase
                .from('user_inventory')
                .update({ is_equipped: true })
                .eq('user_id', user.id)
                .eq('item_id', itemId)
        } catch {
            // Silently ignore if table is pending migration
        }
    } else {
        delete currentEquipped[slot]

        try {
            await supabase
                .from('user_inventory')
                .update({ is_equipped: false })
                .eq('user_id', user.id)
                .eq('slot', slot)
        } catch {
            // Silently ignore if table is pending migration
        }
    }

    // 3. Persist to profiles
    const { error: updateErr } = await supabase
        .from('profiles')
        .update({ equipped_items: currentEquipped })
        .eq('id', user.id)

    if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        equipped: currentEquipped,
        message: action === 'equip' ? `${item.name} berhasil dipakai!` : `${item.name} dilepas.`,
    })
}
