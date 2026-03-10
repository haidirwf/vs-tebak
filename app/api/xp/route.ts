import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculateLevel, getClassXpBonus } from '@/lib/game/xp'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, reason, category } = body as { amount: number; reason: string; category?: string }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ error: 'Invalid XP amount' }, { status: 400 })
    }

    // Get current profile (including avatar_class for bonus calculation)
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xp, level, avatar_class')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Calculate class bonus
    const bonusAmount = category ? getClassXpBonus(profile.avatar_class, category, amount) : 0
    const totalAmount = amount + bonusAmount

    const newTotalXp = profile.xp + totalAmount
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

    // Log XP gain (total including bonus)
    await supabase.from('xp_logs').insert({
        user_id: user.id,
        xp_amount: totalAmount,
        reason: bonusAmount > 0 ? `${reason || 'XP gained'} (+${bonusAmount} class bonus)` : (reason || 'XP gained'),
    })

    return NextResponse.json({
        success: true,
        newXp: newTotalXp,
        newLevel: level,
        xpToNext,
        leveledUp,
        bonusApplied: bonusAmount > 0,
        bonusAmount,
        totalAwarded: totalAmount,
    })
}

