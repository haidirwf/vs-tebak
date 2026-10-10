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

    // Check if user already finalized character
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    // If character is already created, return immediately to prevent hanging
    if (existingProfile?.character_created) {
        return NextResponse.json({
            success: true,
            profile: existingProfile,
            equipped: existingProfile.equipped_items || {},
            alreadyCreated: true,
            message: 'Karakter sudah pernah dibuat sebelumnya.',
        })
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

    // 2. Parallel execution: insert starter items and update profile
    const [invResult, profileResult] = await Promise.all([
        Promise.resolve(
            supabase
                .from('user_inventory')
                .upsert(inventoryInserts, { onConflict: 'user_id, item_id' })
        ).catch(() => ({ data: null, error: null })),
        supabase
            .from('profiles')
            .update({
                avatar_class,
                character_created: true,
                equipped_items: equippedMap,
            })
            .eq('id', user.id)
            .select('*')
            .single(),
    ])

    if (profileResult.error) {
        return NextResponse.json({ error: profileResult.error.message }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        profile: profileResult.data,
        equipped: equippedMap,
        starters,
        message: `Karakter role ${avatar_class.toUpperCase()} berhasil dibuat!`,
    })
}
