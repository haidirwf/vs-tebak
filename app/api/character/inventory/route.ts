import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { NextResponse } from 'next/server'
import { AvatarClass } from '@/types'
import { GAME_ITEMS, getStarterItemsForClass, ItemSlot } from '@/lib/game/items'

export async function GET() {
    let user = await getAuthenticatedUser()
    const supabase = await createClient()

    if (!user) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        user = authUser
    }

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch user profile & user inventory in parallel
    const [profileRes, invRes] = await Promise.all([
        supabase
            .from('profiles')
            .select('id, username, avatar_class, level, xp, equipped_items, character_created')
            .eq('id', user.id)
            .single(),
        supabase
            .from('user_inventory')
            .select('id, item_id, slot, is_equipped, acquired_at')
            .eq('user_id', user.id),
    ])

    const profile = profileRes.data
    const profileErr = profileRes.error
    const inventoryRows = invRes.data
    const invErr = invRes.error

    if (profileErr || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const avatarClass = (profile.avatar_class || 'warrior') as AvatarClass
    const profEquipped = (profile.equipped_items as Partial<Record<ItemSlot, string>>) || {}

    let ownedItemIds = new Set<string>()
    let equippedMap: Partial<Record<ItemSlot, string>> = {}

    // Fallback if table not yet created in remote DB or error
    if (invErr) {
        equippedMap = { ...profEquipped }

        // Give starter items only if character was actually created
        if (profile.character_created) {
            const starters = getStarterItemsForClass(avatarClass)
            starters.forEach(it => {
                ownedItemIds.add(it.id)
                if (!equippedMap[it.slot]) equippedMap[it.slot] = it.id
            })
            Object.values(profEquipped).forEach(id => {
                if (id) ownedItemIds.add(id)
            })
        }
    } else {
        if (!inventoryRows || inventoryRows.length === 0) {
            // Auto-grant starter items if user has already created their character
            if (profile.character_created) {
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

                // Also sync equipped_items to profile
                await supabase.from('profiles').update({
                    equipped_items: equippedMap,
                }).eq('id', user.id)
            }
        } else {
            inventoryRows.forEach(row => {
                ownedItemIds.add(row.item_id)
                if (row.is_equipped) {
                    equippedMap[row.slot as ItemSlot] = row.item_id
                }
            })

            // If inventory has items but equippedMap is empty, fallback to profile.equipped_items
            if (Object.keys(equippedMap).length === 0 && Object.keys(profEquipped).length > 0) {
                equippedMap = { ...profEquipped }
            }

            // Ensure starter items are owned and equipped if empty
            if (profile.character_created) {
                const starters = getStarterItemsForClass(avatarClass)
                starters.forEach(it => {
                    ownedItemIds.add(it.id)
                    if (!equippedMap[it.slot]) {
                        equippedMap[it.slot] = it.id
                    }
                })
            }
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
