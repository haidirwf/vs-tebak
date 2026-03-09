import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculateLevel } from '@/lib/game/xp'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, reason } = body as { amount: number; reason: string }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ error: 'Invalid XP amount' }, { status: 400 })
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const newTotalXp = profile.xp + amount
    const { level, xpToNext } = calculateLevel(newTotalXp)
    const leveledUp = level > profile.level

    // Update profile XP and level
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ xp: newTotalXp, level, xp_to_next_level: xpToNext })
        .eq('id', user.id)

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log XP gain
    await supabase.from('xp_logs').insert({
        user_id: user.id,
        xp_amount: amount,
        reason: reason || 'XP gained',
    })

    return NextResponse.json({
        success: true,
        newXp: newTotalXp,
        newLevel: level,
        xpToNext,
        leveledUp,
    })
}
