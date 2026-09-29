import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { AvatarClass } from '@/types'
import { getStarterItemsForClass, ItemSlot } from '@/lib/game/items'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as { avatar_class: AvatarClass }
    const { avatar_class } = body

    if (!['warrior', 'mage', 'archer', 'healer'].includes(avatar_class)) {
        return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 })
    }

    // 1. Get starter items for selected role
    const starters = getStarterItemsForClass(avatar_class)
    const equippedMap: Partial<Record<ItemSlot, string>> = {}

    const inventoryInserts = starters.map(it => {
        equippedMap[it.slot] = it.id
        return {
            user_id: user.id,
            item_id: it.id,
            slot: it.slot,
            is_equipped: true,
        }
    })

    // 2. Insert into user_inventory
    try {
        await supabase.from('user_inventory').upsert(inventoryInserts, { onConflict: 'user_id, item_id' })
    } catch {
        // Silently ignore if table is pending migration
    }

    // 3. Update profile with role, character_created = true, and equipped_items
    const { data: updatedProfile, error: updateErr } = await supabase
        .from('profiles')
        .update({
            avatar_class,
            character_created: true,
            equipped_items: equippedMap,
        })
        .eq('id', user.id)
        .select('*')
        .single()

    if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        profile: updatedProfile,
        equipped: equippedMap,
        starters,
        message: `Karakter role ${avatar_class.toUpperCase()} berhasil dibuat!`,
    })
}
