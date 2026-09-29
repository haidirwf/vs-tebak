import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { AvatarClass } from '@/types'
import { GAME_ITEMS, getStarterItemsForClass, ItemSlot } from '@/lib/game/items'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch user profile
    const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, username, avatar_class, level, xp, equipped_items, character_created')
        .eq('id', user.id)
        .single()

    if (profileErr || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const avatarClass = (profile.avatar_class || 'warrior') as AvatarClass

    // 2. Fetch inventory items from DB
    const { data: inventoryRows, error: invErr } = await supabase
        .from('user_inventory')
        .select('id, item_id, slot, is_equipped, acquired_at')
        .eq('user_id', user.id)

    let ownedItemIds = new Set<string>()
    let equippedMap: Partial<Record<ItemSlot, string>> = {}

    // Fallback if table not yet created in remote DB or empty
    if (invErr) {
        // Use profile equipped_items JSONB fallback
        const profEquipped = (profile.equipped_items as Partial<Record<ItemSlot, string>>) || {}
        equippedMap = profEquipped

        // Give starter items
        const starters = getStarterItemsForClass(avatarClass)
        starters.forEach(it => ownedItemIds.add(it.id))
        Object.values(profEquipped).forEach(id => {
            if (id) ownedItemIds.add(id)
        })
    } else {
        if (!inventoryRows || inventoryRows.length === 0) {
            // Auto-grant starter items
            const starters = getStarterItemsForClass(avatarClass)
            const insertPayload = starters.map(it => ({
                user_id: user.id,
                item_id: it.id,
                slot: it.slot,
                is_equipped: true,
            }))

            await supabase.from('user_inventory').upsert(insertPayload, { onConflict: 'user_id, item_id' })
            starters.forEach(it => {
                ownedItemIds.add(it.id)
                equippedMap[it.slot] = it.id
            })

            // Also sync to profile
            await supabase.from('profiles').update({
                equipped_items: equippedMap,
                character_created: true,
            }).eq('id', user.id)
        } else {
            inventoryRows.forEach(row => {
                ownedItemIds.add(row.item_id)
                if (row.is_equipped) {
                    equippedMap[row.slot as ItemSlot] = row.item_id
                }
            })
        }
    }

    // Map owned full items details
    const ownedItems = GAME_ITEMS.filter(it => ownedItemIds.has(it.id))

    return NextResponse.json({
        profile: {
            id: profile.id,
            username: profile.username,
            avatar_class: avatarClass,
            level: profile.level,
            xp: profile.xp,
            character_created: profile.character_created ?? false,
        },
        equipped: equippedMap,
        inventory: ownedItems,
    })
}
