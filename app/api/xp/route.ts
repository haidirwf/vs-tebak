import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculateLevel, getClassBonusAmount, getClassXpBonus } from '@/lib/game/xp'
import { updateQuestProgress } from '@/lib/game/quests'
import { ensureDailyQuestsAndProgress } from '@/lib/game/dailyQuests'
import { format } from 'date-fns'
import { checkStreakStatus } from '@/lib/game/streak'
import { ensureUserBadges } from '@/lib/game/badges'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/server/rateLimit'

type XpAction = 'complete_module' | 'battle_win' | 'battle_draw' | 'battle_loss'

const STATIC_ACTION_CONFIG: Record<Exclude<XpAction, 'complete_module'>, { base: number; category: string; reason: string }> = {
    battle_win: { base: 80, category: 'battle_win', reason: 'Menang battle' },
    battle_draw: { base: 40, category: 'battle_draw', reason: 'Battle seri' },
    battle_loss: { base: 20, category: 'battle_loss', reason: 'Kalah battle' },
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateKey = `xp:${getRateLimitIdentifier(request, user.id)}`
    const rate = checkRateLimit({ key: rateKey, limit: 20, windowMs: 60_000 })
    if (!rate.ok) {
        return NextResponse.json({
            error: 'Terlalu banyak request XP. Coba lagi sebentar.',
            retry_after_ms: rate.retryAfterMs,
        }, { status: 429 })
    }
    const today = format(new Date(), 'yyyy-MM-dd')
    await ensureDailyQuestsAndProgress(supabase, user.id, today)

    const body = await request.json() as { action?: XpAction; moduleId?: string; battleId?: string }
    const action = body.action
    if (!action) {
        return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    // Server-side anti exploit: battle outcome must match persisted battle result.
    if (action.startsWith('battle_')) {
        if (!body.battleId) {
            return NextResponse.json({ error: 'battleId is required for battle actions' }, { status: 400 })
        }

        const { data: battle, error: battleError } = await supabase
            .from('battles')
            .select('id, status, winner_id, player1_id, player2_id')
            .eq('id', body.battleId)
            .maybeSingle()

        if (battleError || !battle) {
            return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
        }

        const isParticipant = battle.player1_id === user.id || battle.player2_id === user.id
        if (!isParticipant) {
            return NextResponse.json({ error: 'Forbidden battle claim' }, { status: 403 })
        }

        if (battle.status !== 'finished') {
            return NextResponse.json({ error: 'Battle belum selesai' }, { status: 409 })
        }

        const expectedAction: XpAction =
            battle.winner_id === null
                ? 'battle_draw'
                : battle.winner_id === user.id
                    ? 'battle_win'
                    : 'battle_loss'

        if (action !== expectedAction) {
            return NextResponse.json({
                error: 'Action tidak sesuai hasil battle',
                expectedAction,
            }, { status: 409 })
        }
    }

    let baseAmount = 0
    let reason = ''
    let category = ''
    let skipAward = false
    let duplicateMarker: string | null = null

    if (action === 'complete_module') {
        if (!body.moduleId) {
            return NextResponse.json({ error: 'moduleId is required for complete_module action' }, { status: 400 })
        }

        const { data: moduleRow, error: moduleError } = await supabase
            .from('modules')
            .select('id, title, xp_reward, category')
            .eq('id', body.moduleId)
            .single()

        if (moduleError || !moduleRow) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 })
        }

        // Enforce one-time XP claim by checking xp_logs marker first.
        // This still works even if user_modules table/constraints were modified manually.
        const marker = `[module:${moduleRow.id}]`
        const { data: existingModuleXp } = await supabase
            .from('xp_logs')
            .select('id')
            .eq('user_id', user.id)
            .ilike('reason', `%${marker}%`)
            .limit(1)

        if (existingModuleXp && existingModuleXp.length > 0) {
            skipAward = true
        } else {
            // Best-effort sync to user_modules; do not block XP flow if table was altered.
            try {
                const { data: userModuleRow } = await supabase
                    .from('user_modules')
                    .select('id, xp_granted_at')
                    .eq('user_id', user.id)
                    .eq('module_id', moduleRow.id)
                    .maybeSingle()

                if (!userModuleRow) {
                    await supabase
                        .from('user_modules')
                        .insert({
                            user_id: user.id,
                            module_id: moduleRow.id,
                            status: 'completed',
                            progress_percent: 100,
                            completed_at: new Date().toISOString(),
                            xp_granted_at: new Date().toISOString(),
                        })
                } else if (!userModuleRow.xp_granted_at) {
                    await supabase
                        .from('user_modules')
                        .update({
                            status: 'completed',
                            progress_percent: 100,
                            completed_at: new Date().toISOString(),
                            xp_granted_at: new Date().toISOString(),
                        })
                        .eq('id', userModuleRow.id)
                }
            } catch {
                // ignore: user_modules can be missing in some custom DB states
            }
        }

        baseAmount = skipAward ? 0 : moduleRow.xp_reward
        category = moduleRow.category
        reason = `Menyelesaikan modul: ${moduleRow.title} ${marker}`
    } else {
        const cfg = STATIC_ACTION_CONFIG[action]
        if (!cfg) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
        baseAmount = cfg.base
        category = cfg.category
        reason = cfg.reason

        // Prevent duplicate XP claim for the same battle result from race/reconnect/realtime overlap.
        if (action.startsWith('battle_')) {
            const battleId = body.battleId as string
            duplicateMarker = `[battle:${battleId}:${action}]`
            const { data: existingBattleXp } = await supabase
                .from('xp_logs')
                .select('id')
                .eq('user_id', user.id)
                .ilike('reason', `%${duplicateMarker}%`)
                .limit(1)
            if (existingBattleXp && existingBattleXp.length > 0) {
                skipAward = true
            } else {
                reason = `${reason} ${duplicateMarker}`
            }
        }
    }

    if (!baseAmount || baseAmount <= 0) {
        // For duplicate complete_module claim, return success without adding XP.
        if (skipAward) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('xp, level, xp_to_next_level, streak_count, last_active')
                .eq('id', user.id)
                .single()

            return NextResponse.json({
                success: true,
                newXp: profile?.xp ?? 0,
                newLevel: profile?.level ?? 1,
                xpToNext: profile?.xp_to_next_level ?? 100,
                leveledUp: false,
                bonusApplied: false,
                baseAward: 0,
                bonusAmount: 0,
                bonusMultiplier: 1,
                totalAwarded: 0,
                action,
                alreadyClaimed: true,
                marker: duplicateMarker,
                streak: profile?.streak_count ?? 0,
                lastActive: profile?.last_active ?? null,
                streakUpdated: false,
            })
        }
        return NextResponse.json({ error: 'Invalid XP config' }, { status: 400 })
    }

    // Get current profile (including avatar_class for bonus calculation)
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xp, level, avatar_class, streak_count, last_active')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Calculate class bonus
    const normalizedCategory = category.toLowerCase().trim()
    const bonusMultiplier = normalizedCategory ? getClassXpBonus(profile.avatar_class, normalizedCategory) : 1
    const bonusAmount = normalizedCategory ? getClassBonusAmount(profile.avatar_class, normalizedCategory, baseAmount) : 0
    const totalAmount = baseAmount + bonusAmount

    const newTotalXp = profile.xp + totalAmount
    const { level, xpToNext } = calculateLevel(newTotalXp)
    const leveledUp = level > profile.level
    const streakStatus = checkStreakStatus(profile.last_active, profile.streak_count)

    // Update profile XP and level
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            xp: newTotalXp,
            level,
            xp_to_next_level: xpToNext,
            streak_count: streakStatus.streakCount,
            last_active: streakStatus.lastActive,
        })
        .eq('id', user.id)

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log XP gain (total including bonus)
    await supabase.from('xp_logs').insert({
        user_id: user.id,
        xp_amount: totalAmount,
        reason: bonusAmount > 0 ? `${reason} (+${bonusAmount} class bonus)` : reason,
    })

    // --- QUEST LOGS ---
    let questBonusAwarded = 0
    // Update "earn_xp" quest
    questBonusAwarded += await updateQuestProgress(supabase, user.id, 'earn_xp', totalAmount, today)

    // Update "complete_module" quest if reason suggests it
    if (action === 'complete_module' && !skipAward) {
        questBonusAwarded += await updateQuestProgress(supabase, user.id, 'complete_module', 1, today)
    }

    // Update "win_battle" quest only for battle_win
    if (action === 'battle_win') {
        questBonusAwarded += await updateQuestProgress(supabase, user.id, 'win_battle', 1, today)
    }
    if (streakStatus.isActive) {
        questBonusAwarded += await updateQuestProgress(supabase, user.id, 'maintain_streak', streakStatus.streakCount, today)
    }

    const { data: finalProfile } = await supabase
        .from('profiles')
        .select('xp, level, xp_to_next_level')
        .eq('id', user.id)
        .single()

    const finalXp = finalProfile?.xp ?? newTotalXp
    const finalLevel = finalProfile?.level ?? level
    const finalXpToNext = finalProfile?.xp_to_next_level ?? xpToNext
    const leveledUpFinal = finalLevel > profile.level
    const earnedBadges = await ensureUserBadges(supabase, user.id)

    return NextResponse.json({
        success: true,
        newXp: finalXp,
        newLevel: finalLevel,
        xpToNext: finalXpToNext,
        leveledUp: leveledUpFinal || leveledUp,
        bonusApplied: bonusAmount > 0,
        baseAward: baseAmount,
        bonusAmount,
        bonusMultiplier,
        totalAwarded: totalAmount,
        questBonusAwarded,
        earnedBadges,
        action,
        streak: streakStatus.streakCount,
        lastActive: streakStatus.lastActive,
        streakUpdated: streakStatus.shouldUpdate,
    })
}
