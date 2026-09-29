'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Question, Battle, Profile } from '@/types'
import { Sword, Shield, CheckCircle, Flame, Zap, Trophy, ChevronRight, XCircle, AlertCircle, Copy, Check, Swords } from 'lucide-react'
import { getClassBonusDescription, AVATAR_CLASS_STATS } from '@/lib/game/xp'
import { calculateCharacterStats } from '@/lib/game/character'
import CharacterVisual from '@/components/character/CharacterVisual'

interface BattleArenaProps {
    battle: Battle
    questions: Question[]
    currentUser: Profile
    opponent: Profile | null
}

type BattlePhase = 'waiting' | 'lobby' | 'playing' | 'finished'
type BattleOutcome = 'win' | 'lose' | 'draw'

export default function BattleArena({ battle: initialBattle, questions, currentUser, opponent: initialOpponent }: BattleArenaProps) {
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])
    const isDev = process.env.NODE_ENV !== 'production'
    const debugBattle = (...args: unknown[]) => {
        if (isDev) console.debug('[battle]', ...args)
    }

    // Derive initial phase
    const initPhase = (): BattlePhase => {
        if (initialBattle.status === 'finished') return 'finished'
        if (initialBattle.player1_id && initialBattle.player2_id) return 'lobby'
        return 'waiting'
    }

    const [phase, setPhase] = useState<BattlePhase>(initPhase())
    const [battle, setBattle] = useState(initialBattle)
    const [opponent, setOpponent] = useState<Profile | null>(initialOpponent)

    // Ready state (source of truth: battles.player1_ready / battles.player2_ready)
    const [iAmReady, setIAmReady] = useState(false)
    const [opponentReady, setOpponentReady] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [isRealtimeSubscribed, setIsRealtimeSubscribed] = useState(false)

    // Finish state
    const [iAmFinished, setIAmFinished] = useState(false)
    const [opponentFinished, setOpponentFinished] = useState(false)

    // Quiz state
    const [currentQ, setCurrentQ] = useState(0)
    const [myScore, setMyScore] = useState(0)
    const [opponentScore, setOpponentScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(15)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [showAnswer, setShowAnswer] = useState(false)
    const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false)
    const [xpResult, setXpResult] = useState<{ base: number; bonus: number } | null>(null)
    const [finalOutcome, setFinalOutcome] = useState<BattleOutcome | null>(null)
    const [comboCount, setComboCount] = useState(0)
    const [myHp, setMyHp] = useState(100)
    const [oppHp, setOppHp] = useState(100)
    const [myMp, setMyMp] = useState(30)
    const [oppMp, setOppMp] = useState(30)
    const [combatText, setCombatText] = useState<{ target: 'me' | 'opp'; text: string; type: 'crit' | 'damage' | 'miss' } | null>(null)
    const [meAnimation, setMeAnimation] = useState<'idle' | 'attack' | 'hurt'>('idle')
    const [oppAnimation, setOppAnimation] = useState<'idle' | 'attack' | 'hurt'>('idle')
    const [battleLog, setBattleLog] = useState<string>('Pilih jawaban terbaik untuk melancarkan serangan duel!')
    const [opponentAnsweredThisRound, setOpponentAnsweredThisRound] = useState(false)
    const [copiedRoomCode, setCopiedRoomCode] = useState(false)
    const classBenefitText = getClassBonusDescription(currentUser.avatar_class)

    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const finalizedRef = useRef(false)
    const xpAwardRequestedRef = useRef(false)
    const myScoreRef = useRef(0)
    const opponentScoreRef = useRef(0)
    const opponentFinalScoreRef = useRef<number | null>(null)
    const finalizeFallbackRequestedRef = useRef(false)
    const finalizeFallbackTimerRef = useRef<NodeJS.Timeout | null>(null)

    const isPlayer1 = battle.player1_id === currentUser.id
    const syncXpToUserStore = useCallback(async (
        newXp: number,
        newStreak?: number,
        newLastActive?: string | null,
        streakUpdated?: boolean,
        earnedBadges?: Array<{ id: string; name: string; description: string | null; icon_url: string | null }>
    ) => {
        const { useUserStore } = await import('@/stores/userStore')
        useUserStore.getState().updateXP(newXp, { newStreak, newLastActive, streakUpdated, earnedBadges })
    }, [])
    const getBattleOutcome = useCallback((my: number, opp: number, isSurrender = false): BattleOutcome => {
        if (isSurrender) return 'lose'
        if (my > opp) return 'win'
        if (my < opp) return 'lose'
        return 'draw'
    }, [])
    const getXpAction = useCallback((outcome: BattleOutcome): 'battle_win' | 'battle_draw' | 'battle_loss' => {
        if (outcome === 'win') return 'battle_win'
        if (outcome === 'draw') return 'battle_draw'
        return 'battle_loss'
    }, [])
    const awardXp = useCallback(async (outcome: BattleOutcome, isSurrender = false) => {
        if (xpAwardRequestedRef.current) return
        xpAwardRequestedRef.current = true
        const action = getXpAction(outcome)
        try {
            const res = await fetch('/api/xp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, battleId: battle.id, isSurrender })
            })
            const data = await res.json()
            if (data.success) {
                const isDuplicateClaim = Boolean(data.alreadyClaimed)
                if (!isDuplicateClaim) {
                    setXpResult({ base: data.baseAward || 0, bonus: data.bonusAmount || 0 })
                }
                if (typeof data.newXp === 'number') {
                    await syncXpToUserStore(
                        data.newXp,
                        typeof data.streak === 'number' ? data.streak : undefined,
                        typeof data.lastActive === 'string' || data.lastActive === null ? data.lastActive : undefined,
                        data.streakUpdated === true,
                        Array.isArray(data.earnedBadges) ? data.earnedBadges : undefined
                    )
                }
            } else {
                xpAwardRequestedRef.current = false
            }
        } catch {
            xpAwardRequestedRef.current = false
        }
    }, [battle.id, getXpAction, syncXpToUserStore])

    const handleExitGame = async () => {
        try {
            channelRef.current?.send({ type: 'broadcast', event: 'player_left', payload: { player_id: currentUser.id } })
        } catch { }

        if (isPlayer1) {
            // Delete the entire room
            await supabase.from('battles').delete().eq('id', battle.id)
        } else {
            // Remove self from room
            await supabase.from('battles').update({
                player2_id: null,
                status: 'waiting',
                player1_ready: false,
                player2_ready: false,
            }).eq('id', battle.id)
        }
        router.push('/battle')
    }

    const endBattle = useCallback(async (
        finalMyScore: number,
        finalOppScore: number,
        isSurrender = false,
        forcedOutcome?: BattleOutcome
    ) => {
        clearInterval(timerRef.current!)
        setIAmFinished(true)
        setMyScore(finalMyScore)
        setOpponentScore(finalOppScore)

        channelRef.current?.send({
            type: 'broadcast', event: 'player_finished',
            payload: { player_id: currentUser.id, final_score: finalMyScore }
        })

        if (opponentFinished || !opponent || isSurrender || forcedOutcome) {
            if (finalizedRef.current) return
            finalizedRef.current = true

            const resolvedOppScore =
                typeof opponentFinalScoreRef.current === 'number'
                    ? Math.max(finalOppScore, opponentFinalScoreRef.current)
                    : finalOppScore

            setOpponentScore(resolvedOppScore)
            setPhase('finished')
            const outcome = forcedOutcome ?? getBattleOutcome(finalMyScore, resolvedOppScore, isSurrender)
            setFinalOutcome(outcome)
            const opponentIdFallback = opponent?.id ?? currentUser.id
            const winner =
                outcome === 'draw'
                    ? null
                    : outcome === 'win'
                        ? currentUser.id
                        : opponentIdFallback

            if (isPlayer1) {
                await supabase.from('battles').update({
                    status: 'finished',
                    player1_score: finalMyScore,
                    player2_score: resolvedOppScore,
                    winner_id: winner,
                }).eq('id', battle.id)

                await awardXp(outcome, isSurrender)
            }
        }
    }, [battle.id, currentUser.id, isPlayer1, opponent, supabase, opponentFinished, getBattleOutcome, awardXp])

    const handleSurrender = async () => {
        setFinalOutcome('lose')
        channelRef.current?.send({
            type: 'broadcast',
            event: 'player_surrendered',
            payload: { player_id: currentUser.id }
        })
        await endBattle(myScoreRef.current, opponentScoreRef.current, true, 'lose')
    }

    useEffect(() => {
        myScoreRef.current = myScore
        opponentScoreRef.current = opponentScore
    }, [myScore, opponentScore])

    // Fallback safety: if host misses final DB write, let participant force finalize once.
    useEffect(() => {
        if (isPlayer1) return
        if (phase !== 'finished') return
        if (!iAmFinished || !opponentFinished) return
        if (battle.status === 'finished') return
        if (finalizeFallbackRequestedRef.current) return

        finalizeFallbackTimerRef.current = setTimeout(async () => {
            if (finalizeFallbackRequestedRef.current) return
            finalizeFallbackRequestedRef.current = true
            try {
                await fetch(`/api/battle/${battle.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        myScore: myScoreRef.current,
                        opponentScore: opponentScoreRef.current,
                    }),
                })
            } catch {
                finalizeFallbackRequestedRef.current = false
            }
        }, 4500)

        return () => {
            if (finalizeFallbackTimerRef.current) clearTimeout(finalizeFallbackTimerRef.current)
        }
    }, [isPlayer1, phase, iAmFinished, opponentFinished, battle.status, battle.id])

    // Timer — only runs during 'playing' phase
    useEffect(() => {
        if (phase !== 'playing' || questions.length === 0) return
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!)
                    setShowAnswer(true)
                    setComboCount(0)
                    const hpDamage = Math.max(12, Math.floor(100 / Math.max(questions.length, 1)))
                    setMyHp(hp => Math.max(10, hp - hpDamage))
                    setCombatText({ target: 'me', text: '⏰ TIMEOUT! -15 HP', type: 'miss' })
                    setMeAnimation('hurt')
                    setBattleLog('⌛ Waktu habis! Kamu kehilangan giliran dan terkena penalti HP.')
                    setTimeout(() => setMeAnimation('idle'), 600)
                    setTimeout(() => setCombatText(null), 1200)
                    setTimeout(() => {
                        if (currentQ < questions.length - 1) {
                            setCurrentQ(q => q + 1)
                            setTimeLeft(15)
                            setSelectedAnswer(null)
                            setShowAnswer(false)
                            setOpponentAnsweredThisRound(false)
                        } else {
                            endBattle(myScore, opponentScore)
                        }
                    }, 1500)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current!)
    }, [phase, currentQ, questions.length, myScore, opponentScore, endBattle])

    // Realtime channel
    useEffect(() => {
        const channel = supabase.channel(`battle:${battle.id}`)
        channelRef.current = channel

        channel
            .on('broadcast', { event: 'player_ready' }, async ({ payload }) => {
                if (payload.player_id !== currentUser.id) {
                    setOpponentReady(true)
                }
                const { data: freshBattle } = await supabase.from('battles').select('*').eq('id', battle.id).single()
                if (freshBattle) setBattle(freshBattle as Battle)
            })
            .on('broadcast', { event: 'game_start' }, () => {
                // If the host force-starts it over the network
                setCountdown(5)
            })
            .on('broadcast', { event: 'player_surrendered' }, ({ payload }) => {
                if (payload?.player_id === currentUser.id) return
                // Opponent surrendered, I win
                setFinalOutcome('win')
                endBattle(myScoreRef.current, opponentScoreRef.current, false, 'win') // Surrendered opponent always loses
            })
            .on('broadcast', { event: 'player_left' }, () => {
                debugBattle('Opponent left the room.')
                if (phase === 'playing') {
                    setFinalOutcome('win')
                    endBattle(myScoreRef.current, opponentScoreRef.current, false, 'win')
                } else {
                    router.push('/battle')
                }
            })
            .on('broadcast', { event: 'player_finished' }, ({ payload }) => {
                if (payload.player_id !== currentUser.id) {
                    if (typeof payload.final_score === 'number') {
                        opponentFinalScoreRef.current = payload.final_score
                        setOpponentScore(payload.final_score)
                    }
                    setOpponentFinished(true)
                }
            })
            .on('broadcast', { event: 'score_update' }, ({ payload }) => {
                if (payload.player_id !== currentUser.id) {
                    setOpponentScore(payload.score)
                    setOpponentAnsweredThisRound(true)
                    setOppAnimation('attack')
                    setOppMp(mp => Math.min(100, mp + 20))
                    setBattleLog(`⚡ Lawan telah melancarkan serangannya!`)
                    setTimeout(() => setOppAnimation('idle'), 600)
                }
            })
            .on('postgres_changes', {
                event: 'DELETE', schema: 'public', table: 'battles', filter: `id=eq.${battle.id}`
            }, () => {
                debugBattle('Battle room deleted by host')
                router.push('/battle')
            })
            .on('postgres_changes', {
                event: 'UPDATE', schema: 'public', table: 'battles', filter: `id=eq.${battle.id}`
            }, async (payload) => {
                debugBattle('Battle update received via Realtime:', payload.new)
                const newBattle = payload.new as Battle
                setBattle(newBattle)

                if (newBattle.status === 'finished') {
                    const finalMy = isPlayer1 ? (newBattle.player1_score || 0) : (newBattle.player2_score || 0)
                    const finalOpp = isPlayer1 ? (newBattle.player2_score || 0) : (newBattle.player1_score || 0)
                    setMyScore(finalMy)
                    setOpponentScore(finalOpp)

                    const outcome: BattleOutcome =
                        newBattle.winner_id === null
                            ? 'draw'
                            : newBattle.winner_id === currentUser.id
                                ? 'win'
                                : 'lose'
                    setFinalOutcome(outcome)
                    await awardXp(outcome, false)
                    setPhase('finished')
                    return
                }

                if (!isPlayer1 && (!newBattle.player2_id || newBattle.status === 'waiting')) {
                    router.push('/battle')
                    return
                }

                if (isPlayer1 && (phase === 'lobby' || phase === 'waiting') && !newBattle.player2_id) {
                    router.push('/battle')
                    return
                }

                // When player 2 joins the room, move to lobby (ready check phase)
                if (newBattle.player2_id) {
                    setPhase((prev) => {
                        if (prev === 'waiting') return 'lobby'
                        return prev
                    })
                    // Fetch opponent profile if not set
                    const { data } = await supabase.from('profiles').select('*').eq('id', newBattle.player2_id).single()
                    if (data) setOpponent(data)
                }
            })
            .subscribe((status) => {
                debugBattle('Supabase Realtime subscription status:', status)
                if (status === 'SUBSCRIBED') {
                    setIsRealtimeSubscribed(true)
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                    setIsRealtimeSubscribed(false)
                }
            })

        return () => { supabase.removeChannel(channel) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [battle.id, currentUser.id, supabase, isPlayer1, awardXp, phase, router])

    // Sync local ready UI from DB state.
    useEffect(() => {
        const myReady = isPlayer1 ? battle.player1_ready : battle.player2_ready
        const oppReady = isPlayer1 ? battle.player2_ready : battle.player1_ready
        setIAmReady(Boolean(myReady))
        setOpponentReady(Boolean(oppReady))
    }, [battle.player1_ready, battle.player2_ready, isPlayer1])

    // Monitor player2_id to transition and fetch opponent (with Fallback Polling)
    useEffect(() => {
        let pollInterval: NodeJS.Timeout

        const checkFreshBattle = async () => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
            const { data: freshBattle, error: fetchErr } = await supabase.from('battles').select('*').eq('id', battle.id).maybeSingle()
            if (fetchErr || !freshBattle) {
                router.push('/battle')
                return
            }

            if (!isPlayer1 && (freshBattle.player2_id !== currentUser.id || freshBattle.status === 'waiting')) {
                router.push('/battle')
                return
            }

            if (isPlayer1 && (phase === 'lobby') && !freshBattle.player2_id) {
                router.push('/battle')
                return
            }

            const hasDiff =
                freshBattle.player2_id !== battle.player2_id ||
                freshBattle.player1_ready !== battle.player1_ready ||
                freshBattle.player2_ready !== battle.player2_ready ||
                freshBattle.status !== battle.status

            if (hasDiff) {
                setBattle(freshBattle)
            }
        }

        // Initial check on mount to bypass SSR stale data
        checkFreshBattle()

        if (battle.status === 'finished') {
            setPhase('finished')
            return
        }

        // Fallback polling: when Realtime WebSocket is connected, updates arrive instantly.
        // We use a relaxed 15s heartbeat when subscribed, or 3.5s if offline/reconnecting.
        const pollDelay = isRealtimeSubscribed ? 15000 : 3500
        if (phase === 'waiting' && isPlayer1) {
            pollInterval = setInterval(checkFreshBattle, pollDelay)
        } else if (phase === 'lobby') {
            pollInterval = setInterval(checkFreshBattle, pollDelay)
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkFreshBattle()
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        if (battle.player1_id && battle.player2_id) {
            setPhase((prev) => {
                if (prev === 'waiting') return 'lobby'
                return prev
            })

            // If we don't have the opponent profile yet, fetch it
            if (!opponent) {
                const fetchOpponent = async () => {
                    const opponentId = isPlayer1 ? battle.player2_id : battle.player1_id
                    if (opponentId) {
                        const { data } = await supabase.from('profiles').select('*').eq('id', opponentId).single()
                        if (data) setOpponent(data)
                    }
                }
                fetchOpponent()
            }
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [
        battle.id,
        battle.player1_id,
        battle.player2_id,
        battle.player1_ready,
        battle.player2_ready,
        battle.status,
        isPlayer1,
        isRealtimeSubscribed,
        opponent,
        phase,
        supabase
    ])

    // Effect to handle state transition if we finished waiting for opponent
    useEffect(() => {
        if (iAmFinished && opponentFinished && phase !== 'finished') {
            if (finalizedRef.current) return
            finalizedRef.current = true

            setPhase('finished')
            const finalMyScore = myScore
            const finalOppScore = opponentScore
            const outcome = getBattleOutcome(finalMyScore, finalOppScore, false)
            setFinalOutcome(outcome)
            const winner =
                outcome === 'draw'
                    ? null
                    : outcome === 'win'
                        ? currentUser.id
                        : (opponent?.id ?? currentUser.id)

            // Only player 1 writes and awards. Player 2 waits for DB update event.
            if (isPlayer1) {
                supabase.from('battles').update({
                    status: 'finished',
                    player1_score: finalMyScore,
                    player2_score: finalOppScore,
                    winner_id: winner,
                }).eq('id', battle.id).then()
                awardXp(outcome, false)
            }
        }
    }, [iAmFinished, opponentFinished, phase, myScore, opponentScore, currentUser.id, opponent, isPlayer1, battle.id, supabase, getBattleOutcome, awardXp])

    async function handleReady() {
        if (iAmReady) return

        setIAmReady(true) // optimistic UI
        const patch = isPlayer1 ? { player1_ready: true } : { player2_ready: true }
        const { data, error } = await supabase
            .from('battles')
            .update(patch)
            .eq('id', battle.id)
            .select('*')
            .single()

        if (error) {
            console.error('Failed to update ready status:', error)
            setIAmReady(false)
            return
        }

        channelRef.current?.send({
            type: 'broadcast',
            event: 'player_ready',
            payload: { player_id: currentUser.id, ready: true }
        })

        if (data) {
            setBattle(data as Battle)
        }
    }

    // When both players are ready, start countdown
    useEffect(() => {
        if (battle.status !== 'finished' && iAmReady && opponentReady && phase === 'lobby' && countdown === null) {
            if (isPlayer1) channelRef.current?.send({ type: 'broadcast', event: 'game_start', payload: {} })
            setCountdown(5)
        }
    }, [battle.status, iAmReady, opponentReady, isPlayer1, phase, countdown])

    // Handle countdown timer
    useEffect(() => {
        if (countdown !== null && phase === 'lobby') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(c => (c as number) - 1), 1000)
                return () => clearTimeout(timer)
            } else {
                setPhase('playing')
                setCountdown(null)
            }
        }
    }, [countdown, phase])

    // Helper class info & customization stats
    const myClassKey = (currentUser.avatar_class || 'warrior').toLowerCase() as keyof typeof AVATAR_CLASS_STATS
    const myClassInfo = AVATAR_CLASS_STATS[myClassKey] || AVATAR_CLASS_STATS.warrior
    const oppClassKey = (opponent?.avatar_class || 'mage').toLowerCase() as keyof typeof AVATAR_CLASS_STATS
    const oppClassInfo = AVATAR_CLASS_STATS[oppClassKey] || AVATAR_CLASS_STATS.mage
    const myHpPercent = Math.max(10, Math.min(100, myHp))
    const oppHpPercent = Math.max(10, Math.min(100, oppHp))

    const myStats = useMemo(() => {
        return calculateCharacterStats(
            myClassKey as any,
            currentUser.level || 1,
            (currentUser.equipped_items as any) || {}
        )
    }, [myClassKey, currentUser.level, currentUser.equipped_items])

    function handleAnswer(idx: number) {
        if (selectedAnswer !== null || showAnswer) return
        clearInterval(timerRef.current!)
        setSelectedAnswer(idx)
        setShowAnswer(true)

        const q = questions[currentQ]
        const isCorrect = idx === q.correct_option
        const bonus = Math.floor(timeLeft * 0.5)

        // Customization Buffs
        const extraAtk = myStats.battleBuffs.extraAtkPoints
        const rollCrit = (Math.random() * 100) < myStats.battleBuffs.critChancePct
        const baseScoreGained = isCorrect ? (10 + bonus + extraAtk) : 0
        const finalScoreGained = isCorrect && rollCrit ? Math.floor(baseScoreGained * 1.5) : baseScoreGained
        const newScore = myScore + finalScoreGained
        setMyScore(newScore)

        const baseHpDamage = Math.max(12, Math.floor(100 / Math.max(questions.length, 1)))
        if (isCorrect) {
            const nextCombo = comboCount + 1
            setComboCount(nextCombo)
            const isCrit = rollCrit || nextCombo >= 2
            const effectiveDamage = isCrit ? baseHpDamage + 10 : baseHpDamage
            setOppHp(prev => Math.max(10, prev - effectiveDamage))
            setMyMp(mp => Math.min(100, mp + 25))

            // Shield recovery from healer / accessory buff
            if (myStats.battleBuffs.shieldRegenPoints > 0) {
                setMyHp(hp => Math.min(100, hp + myStats.battleBuffs.shieldRegenPoints))
            }

            setCombatText({
                target: 'opp',
                text: isCrit ? `💥 CRIT! +${finalScoreGained} PTS` : `⚔️ +${finalScoreGained} PTS`,
                type: isCrit ? 'crit' : 'damage',
            })
            setMeAnimation('attack')
            setOppAnimation('hurt')
            setBattleLog(
                isCrit
                    ? `🔥 CRITICAL HIT! Serangan ${myClassInfo.label} mendarat telak (+${finalScoreGained} Poin)!`
                    : `⚔️ Serangan ${myClassInfo.label} menembus pertahanan lawan (+${finalScoreGained} Poin)!`
            )
            setTimeout(() => {
                setMeAnimation('idle')
                setOppAnimation('idle')
            }, 600)
            setTimeout(() => setCombatText(null), 1100)
        } else {
            setComboCount(0)
            const reduction = myStats.battleBuffs.damageReductionPct
            const mitigatedDamage = Math.max(4, Math.floor(baseHpDamage * (1 - reduction / 100)))
            setMyHp(prev => Math.max(10, prev - mitigatedDamage))
            setCombatText({
                target: 'me',
                text: `❌ MISS! -${mitigatedDamage} HP`,
                type: 'miss',
            })
            setMeAnimation('hurt')
            setBattleLog(`🛡️ Serangan meleset! Zirah menyerap benturan (-${mitigatedDamage} HP).`)
            setTimeout(() => setMeAnimation('idle'), 600)
            setTimeout(() => setCombatText(null), 1100)
        }

        channelRef.current?.send({
            type: 'broadcast', event: 'score_update',
            payload: { player_id: currentUser.id, score: newScore }
        })

        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(q => q + 1)
                setTimeLeft(15 + myStats.battleBuffs.extraTimerSec)
                setSelectedAnswer(null)
                setShowAnswer(false)
                setOpponentAnsweredThisRound(false)
            } else {
                endBattle(newScore, opponentScore)
            }
        }, 1200)
    }

    const handleCopyRoomCode = () => {
        if (!battle?.room_code) return
        navigator.clipboard.writeText(battle.room_code)
        setCopiedRoomCode(true)
        setTimeout(() => setCopiedRoomCode(false), 2000)
    }

    // Phase: Waiting for opponent (only player1 sees this)
    if (phase === 'waiting') {
        return (
            <div className="responsive-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="product-demo-panel"
                    style={{ width: '100%', maxWidth: '640px', textAlign: 'center' }}
                >
                    {/* Topbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-steel)', fontFamily: 'var(--font-mono)' }}>
                            ID: {battle.id.slice(0, 8)}
                        </span>
                    </div>

                    {/* Animated Radar Swords */}
                    <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '9999px',
                                border: '2px dashed rgba(245, 197, 66, 0.4)',
                            }}
                        />
                        <div
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '16px',
                                backgroundColor: 'rgba(245, 197, 66, 0.12)',
                                border: '1px solid rgba(245, 197, 66, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '26px',
                                boxShadow: '0 0 20px rgba(245, 197, 66, 0.25)',
                            }}
                        >
                            {myClassInfo.emoji}
                        </div>
                    </div>

                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                        Menunggu Lawan Masuk...
                    </h2>
                    <p style={{ color: 'var(--color-fog)', fontSize: '13px', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                        Bagikan kode room ini kepada teman atau rekan sekelasmu untuk bergabung ke dalam duel:
                    </p>

                    {/* Room Code Card */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '12px 24px',
                            borderRadius: '14px',
                            backgroundColor: 'rgba(245, 197, 66, 0.08)',
                            border: '1px solid rgba(245, 197, 66, 0.35)',
                            marginBottom: '24px',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: 'var(--color-signal-orange)', letterSpacing: '6px' }}>
                            {battle.room_code}
                        </span>
                        <button
                            type="button"
                            onClick={handleCopyRoomCode}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                backgroundColor: copiedRoomCode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                border: `1px solid ${copiedRoomCode ? 'var(--color-vector-green)' : 'rgba(255, 255, 255, 0.15)'}`,
                                color: copiedRoomCode ? 'var(--color-vector-green)' : '#ffffff',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {copiedRoomCode ? <Check size={14} /> : <Copy size={14} />}
                            {copiedRoomCode ? 'Tersalin!' : 'Salin Kode'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleExitGame}
                            className="btn-dark-outline"
                            style={{
                                padding: '10px 24px',
                                fontSize: '13px',
                                color: 'var(--accent-red)',
                                borderColor: 'rgba(232, 64, 64, 0.4)',
                            }}
                        >
                            Batalkan Room
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        )
    }

    // Phase: Lobby — both players in, waiting for both to be Ready
    if (phase === 'lobby') {
        const myReady = iAmReady
        const oppReady = opponentReady
        return (
            <div className="responsive-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="product-demo-panel"
                    style={{ width: '100%', maxWidth: '720px' }}
                >
                    {/* Topbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-steel)', fontFamily: 'var(--font-mono)' }}>
                            ROOM: {battle.room_code}
                        </span>
                    </div>

                    {/* Versus Contestant Row */}
                    <div
                        className="battle-versus-row"
                    >
                        {/* Player 1 (You) */}
                        <div className="battle-versus-col">
                            <div
                                className="battle-versus-avatar"
                                style={{
                                    backgroundColor: myReady ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 197, 66, 0.12)',
                                    border: `1px solid ${myReady ? 'var(--color-vector-green)' : 'rgba(245, 197, 66, 0.4)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: myReady ? '0 0 16px rgba(34, 197, 94, 0.3)' : '0 0 16px rgba(245, 197, 66, 0.2)',
                                }}
                            >
                                {myReady ? '✓' : myClassInfo.emoji}
                            </div>
                            <div className="battle-versus-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                    <span className="battle-player-name">
                                        {currentUser.username}
                                    </span>
                                    <span
                                        className="battle-level-badge"
                                        style={{
                                            backgroundColor: 'rgba(245, 197, 66, 0.15)',
                                            border: '1px solid rgba(245, 197, 66, 0.4)',
                                            color: 'var(--color-signal-orange)',
                                        }}
                                    >
                                        LV.{currentUser.level || 1}
                                    </span>
                                </div>
                                <div className="battle-school-name">
                                    {currentUser.school_name || 'Pelajar'} · {myClassInfo.label}
                                </div>
                                <div style={{ marginTop: '4px' }}>
                                    <span
                                        className="battle-player-status"
                                        style={{
                                            color: myReady ? 'var(--color-vector-green)' : 'var(--color-steel)',
                                        }}
                                    >
                                        {myReady ? '✓ Siap Bertanding' : 'Menunggu Siap'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* VS Center Pill */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div className="battle-vs-badge">
                                VS
                            </div>
                        </div>

                        {/* Player 2 (Opponent) */}
                        <div className="battle-versus-col battle-versus-col-right">
                            <div className="battle-versus-info">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', flexWrap: 'wrap' }}>
                                    <span
                                        className="battle-level-badge"
                                        style={{
                                            backgroundColor: 'rgba(0, 212, 255, 0.15)',
                                            border: '1px solid rgba(0, 212, 255, 0.4)',
                                            color: '#00d4ff',
                                        }}
                                    >
                                        LV.{opponent?.level || 1}
                                    </span>
                                    <span className="battle-player-name">
                                        {opponent?.username || 'Menunggu...'}
                                    </span>
                                </div>
                                <div className="battle-school-name">
                                    {opponent?.school_name || 'Pelajar'} · {oppClassInfo.label}
                                </div>
                                <div style={{ marginTop: '4px' }}>
                                    <span
                                        className="battle-player-status"
                                        style={{
                                            color: oppReady ? 'var(--color-vector-green)' : 'var(--color-steel)',
                                        }}
                                    >
                                        {oppReady ? '✓ Lawan Siap' : 'Menunggu Lawan'}
                                    </span>
                                </div>
                            </div>
                            <div
                                className="battle-versus-avatar"
                                style={{
                                    backgroundColor: oppReady ? 'rgba(34, 197, 94, 0.15)' : 'rgba(0, 212, 255, 0.1)',
                                    border: `1px solid ${oppReady ? 'var(--color-vector-green)' : 'rgba(0, 212, 255, 0.35)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: oppReady ? '0 0 16px rgba(34, 197, 94, 0.3)' : '0 0 16px rgba(0, 212, 255, 0.2)',
                                }}
                            >
                                {oppReady ? '✓' : oppClassInfo.emoji}
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        {!myReady ? (
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleReady}
                                className="btn-signal-orange"
                                style={{ padding: '14px 44px', fontSize: '15px', fontWeight: 700 }}
                            >
                                <Swords size={18} /> SAYA SIAP BERTANDING!
                            </motion.button>
                        ) : countdown !== null ? (
                            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <p style={{ color: 'var(--color-fog)', fontSize: '13px', marginBottom: '6px' }}>Pertandingan Dimulai Dalam</p>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '54px', fontWeight: 800, color: 'var(--color-signal-orange)', textShadow: '0 0 20px rgba(245, 197, 66, 0.6)' }}>
                                    {countdown}
                                </div>
                            </motion.div>
                        ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', color: 'var(--color-vector-green)', fontSize: '13px', fontWeight: 500 }}>
                                <CheckCircle size={16} /> Menunggu lawan menekan tombol siap...
                            </div>
                        )}

                        <div style={{ marginTop: '18px' }}>
                            <p style={{ color: 'var(--color-signal-orange)', fontSize: '12px', fontWeight: 600 }}>
                                🔥 Bonus Role Aktif: {classBenefitText}
                            </p>
                        </div>

                        {countdown === null && (
                            <div style={{ marginTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={handleExitGame}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--color-steel)',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                    }}
                                >
                                    Keluar Dari Room
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        )
    }

    // Phase: Finished early waiting for opponent to finish
    if (iAmFinished && !opponentFinished && phase !== 'finished') {
        return (
            <div className="responsive-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="product-demo-panel" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '14px' }}>⏳</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                        Semua Pertanyaan Selesai!
                    </h2>
                    <p style={{ color: 'var(--color-fog)', fontSize: '13px', marginBottom: '20px' }}>
                        Menunggu {opponent?.username || 'Lawan'} menyelesaikan pertanyaan terakhirnya...
                    </p>
                    <div style={{ height: '4px', width: '140px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden', margin: '0 auto 24px' }}>
                        <motion.div animate={{ x: [-140, 140] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} style={{ height: '100%', width: '60px', backgroundColor: 'var(--color-signal-orange)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', color: 'var(--color-steel)', fontSize: '13px' }}>
                        <div>Skor Anda: <strong style={{ color: 'var(--color-signal-orange)' }}>{myScore} PTS</strong></div>
                        <div>•</div>
                        <div>Skor Lawan: <strong style={{ color: '#00d4ff' }}>{opponentScore} PTS</strong></div>
                    </div>
                </motion.div>
            </div>
        )
    }

    // Phase: Finished
    if (phase === 'finished') {
        const outcome = finalOutcome ?? getBattleOutcome(myScore, opponentScore, false)
        const isDraw = outcome === 'draw'
        const won = outcome === 'win'
        const title = isDraw ? 'HASIL SERI!' : won ? 'KEMENANGAN MUTLAK!' : 'KEKALAHAN'
        const titleColor = isDraw ? '#00d4ff' : won ? 'var(--color-signal-orange)' : 'var(--accent-red)'
        const icon = isDraw ? '🤝' : won ? '🏆' : '💀'

        return (
            <div className="responsive-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
                <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="product-demo-panel" style={{ width: '100%', maxWidth: '720px', textAlign: 'center' }}>
                    <div style={{ fontSize: '56px', marginBottom: '8px' }}>{icon}</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: titleColor, marginBottom: '8px' }}>
                        {title}
                    </h2>
                    <p style={{ color: 'var(--color-fog)', fontSize: '14px', marginBottom: '16px' }}>
                        {xpResult ? (
                            xpResult.bonus > 0
                                ? <>{`+${xpResult.base} XP `}<span style={{ color: 'var(--color-vector-green)', fontWeight: 700 }}>+ {xpResult.bonus} bonus 🔥</span>{' didapat!'}</>
                                : `+${xpResult.base} XP didapat!`
                        ) : (
                            isDraw ? '+40 XP didapat (hasil seri)!' : won ? '+80 XP didapat!' : '+20 XP untuk usahamu'
                        )}
                    </p>
                    <p style={{ color: 'var(--color-signal-orange)', fontSize: '12px', fontWeight: 600, marginBottom: '24px' }}>
                        {classBenefitText}
                    </p>

                    {/* Contestants Final Comparison */}
                    <div
                        className="battle-versus-row"
                        style={{ marginBottom: '28px' }}
                    >
                        {/* You */}
                        <div className="battle-versus-col">
                            <div
                                className="battle-versus-avatar"
                                style={{
                                    backgroundColor: 'rgba(245, 197, 66, 0.12)',
                                    border: '1px solid rgba(245, 197, 66, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                {myClassInfo.emoji}
                            </div>
                            <div className="battle-versus-info" style={{ textAlign: 'left' }}>
                                <div className="battle-player-name">Kamu</div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: 'var(--color-signal-orange)', lineHeight: 1.2 }}>
                                    {myScore} <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>PTS</span>
                                </div>
                            </div>
                        </div>

                        {/* VS center */}
                        <div className="battle-vs-badge">
                            VS
                        </div>

                        {/* Opponent */}
                        <div className="battle-versus-col battle-versus-col-right">
                            <div className="battle-versus-info">
                                <div className="battle-player-name">{opponent?.username || 'Lawan'}</div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#00d4ff', lineHeight: 1.2 }}>
                                    {opponentScore} <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>PTS</span>
                                </div>
                            </div>
                            <div
                                className="battle-versus-avatar"
                                style={{
                                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                    border: '1px solid rgba(0, 212, 255, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                {oppClassInfo.emoji}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => router.push('/battle')}
                            className="btn-dark-outline"
                            style={{ padding: '12px 24px', fontSize: '13px' }}
                        >
                            Kembali ke Lobby
                        </button>
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/battle')}
                            className="btn-signal-orange"
                            style={{ padding: '12px 28px', fontSize: '13px', fontWeight: 700 }}
                        >
                            <Swords size={16} /> MAIN LAGI
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        )
    }

    // Phase: Playing
    if (questions.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
                Tidak ada soal untuk kategori ini.
            </div>
        )
    }

    const safeQuestionIndex = Math.min(currentQ, Math.max(questions.length - 1, 0))
    const q = questions[safeQuestionIndex]
    const timerPercent = (timeLeft / 15) * 100
    const timerColor = timeLeft > 8 ? 'var(--color-vector-green)' : timeLeft > 4 ? 'var(--color-signal-orange)' : 'var(--accent-red)'

    return (
        <div className="responsive-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '840px' }}>
                {/* Linearity Frosted Duel Demonstration Panel */}
                <div className="product-demo-panel">
                    {/* Panel Chrome Topbar */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingBottom: '16px',
                            marginBottom: '20px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                                style={{
                                    fontFamily: 'var(--font-inter)',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                Soal {safeQuestionIndex + 1} dari {questions.length}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span
                                style={{
                                    fontSize: '12px',
                                    color: 'var(--color-signal-orange)',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <Flame size={14} /> {comboCount > 1 ? `x${comboCount} COMBO!` : 'Ronde Aktif'}
                            </span>
                            <span
                                style={{
                                    fontSize: '12px',
                                    color: timerColor,
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                    backgroundColor: timeLeft <= 4 ? 'rgba(255, 51, 68, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                                    padding: '3px 10px',
                                    borderRadius: '9999px',
                                    border: `1px solid ${timeLeft <= 4 ? 'rgba(255, 51, 68, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
                                }}
                            >
                                00:{timeLeft < 10 ? '0' : ''}{timeLeft}s
                            </span>
                        </div>
                    </div>

                    {/* Versus Contestant Row (Mirroring Landing Page Simulation) */}
                    <div
                        className="battle-versus-row"
                    >
                        {/* Player 1 (You) */}
                        <div className="battle-versus-col" style={{ position: 'relative' }}>
                            {/* Floating Combat Text for Me */}
                            <AnimatePresence>
                                {combatText?.target === 'me' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.7 }}
                                        animate={{ opacity: 1, y: -26, scale: 1.15 }}
                                        exit={{ opacity: 0, y: -40 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                        style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            left: '4px',
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 900,
                                            fontSize: '14px',
                                            color: 'var(--accent-red)',
                                            textShadow: '0 0 10px rgba(232, 64, 64, 0.9), 0 2px 4px #000000',
                                            pointerEvents: 'none',
                                            zIndex: 25,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {combatText.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div
                                className="battle-versus-avatar"
                                animate={
                                    meAnimation === 'attack'
                                        ? { x: [0, 18, 0], scale: [1, 1.15, 1] }
                                        : meAnimation === 'hurt'
                                        ? { x: [-6, 6, -4, 4, 0], scale: [1, 0.95, 1] }
                                        : { x: 0, scale: 1 }
                                }
                                transition={{ duration: 0.35 }}
                                style={{
                                    backgroundColor: meAnimation === 'hurt' ? 'rgba(232, 64, 64, 0.25)' : 'rgba(245, 197, 66, 0.12)',
                                    border: `1px solid ${meAnimation === 'hurt' ? 'var(--accent-red)' : 'rgba(245, 197, 66, 0.4)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: meAnimation === 'attack' ? '0 0 24px rgba(245, 197, 66, 0.6)' : meAnimation === 'hurt' ? '0 0 24px rgba(232, 64, 64, 0.6)' : '0 0 16px rgba(245, 197, 66, 0.2)',
                                }}
                            >
                                <CharacterVisual
                                    role={myClassKey as any}
                                    equipped={(currentUser.equipped_items as any) || {}}
                                    size={44}
                                    animationState={meAnimation}
                                    showAura={false}
                                />
                            </motion.div>
                            <div className="battle-versus-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                    <span className="battle-player-name">
                                        {currentUser.username} <span style={{ color: 'var(--color-signal-orange)', fontSize: '10px', fontWeight: 400 }}>(Kamu)</span>
                                    </span>
                                    <span
                                        className="battle-level-badge"
                                        style={{
                                            backgroundColor: 'rgba(245, 197, 66, 0.15)',
                                            border: '1px solid rgba(245, 197, 66, 0.4)',
                                            color: 'var(--color-signal-orange)',
                                        }}
                                    >
                                        LV.{currentUser.level || 1}
                                    </span>
                                </div>
                                <div className="battle-school-name">
                                    {currentUser.school_name || 'Pelajar Hebat'} · {myClassInfo.label}
                                </div>
                                {/* Health Bar */}
                                <div className="battle-hp-bar-wrapper">
                                    <div className="battle-hp-bar-outer">
                                        <motion.div
                                            initial={{ width: '100%' }}
                                            animate={{ width: `${myHpPercent}%` }}
                                            transition={{ duration: 0.4 }}
                                            style={{
                                                height: '100%',
                                                backgroundColor: myHpPercent > 50 ? 'var(--color-vector-green)' : myHpPercent > 25 ? 'var(--color-signal-orange)' : 'var(--accent-red)',
                                            }}
                                        />
                                    </div>
                                    <span className="battle-score-text" style={{ color: 'var(--color-signal-orange)', fontFamily: 'var(--font-heading)' }}>
                                        {myScore} <span style={{ fontSize: '9px', fontWeight: 500, color: 'var(--color-steel)' }}>PTS</span>
                                    </span>
                                </div>
                                {/* Mana / Special Gauge */}
                                <div className="battle-mp-row">
                                    <div
                                        style={{
                                            flex: 1,
                                            maxWidth: '120px',
                                            height: '3px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                            borderRadius: '9999px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <motion.div
                                            animate={{ width: `${myMp}%` }}
                                            transition={{ duration: 0.3 }}
                                            style={{
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
                                            }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '9px', color: '#a855f7', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                        MP {myMp}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Center VS Badge */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                            <div className="battle-vs-badge">
                                VS
                            </div>
                            <span style={{ fontSize: '9px', color: 'var(--color-steel)', fontWeight: 600, letterSpacing: '0.04em' }}>
                                {safeQuestionIndex + 1}/{questions.length}
                            </span>
                        </div>

                        {/* Player 2 (Opponent) */}
                        <div className="battle-versus-col battle-versus-col-right" style={{ position: 'relative' }}>
                            {/* Floating Combat Text for Opponent */}
                            <AnimatePresence>
                                {combatText?.target === 'opp' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.7 }}
                                        animate={{ opacity: 1, y: -26, scale: 1.25 }}
                                        exit={{ opacity: 0, y: -40 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                        style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            right: '4px',
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 900,
                                            fontSize: '14px',
                                            color: combatText.type === 'crit' ? '#ff3b30' : 'var(--color-signal-orange)',
                                            textShadow: '0 0 12px rgba(255, 59, 48, 0.9), 0 2px 4px #000000',
                                            pointerEvents: 'none',
                                            zIndex: 25,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {combatText.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="battle-versus-info">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', flexWrap: 'wrap' }}>
                                    <span
                                        className="battle-level-badge"
                                        style={{
                                            backgroundColor: 'rgba(0, 212, 255, 0.15)',
                                            border: '1px solid rgba(0, 212, 255, 0.4)',
                                            color: '#00d4ff',
                                        }}
                                    >
                                        LV.{opponent?.level || 1}
                                    </span>
                                    <span className="battle-player-name">
                                        {opponent?.username || 'Lawan'}
                                    </span>
                                </div>
                                <div className="battle-school-name">
                                    {opponent?.school_name || 'Pelajar'} · {oppClassInfo.label}
                                </div>
                                {/* Health Bar */}
                                <div className="battle-hp-bar-wrapper" style={{ justifyContent: 'flex-end' }}>
                                    <span className="battle-score-text" style={{ color: '#00d4ff', fontFamily: 'var(--font-heading)' }}>
                                        {opponentScore} <span style={{ fontSize: '9px', fontWeight: 500, color: 'var(--color-steel)' }}>PTS</span>
                                    </span>
                                    <div className="battle-hp-bar-outer">
                                        <motion.div
                                            initial={{ width: '100%' }}
                                            animate={{ width: `${oppHpPercent}%` }}
                                            transition={{ duration: 0.4 }}
                                            style={{
                                                height: '100%',
                                                backgroundColor: oppHpPercent > 50 ? '#00d4ff' : oppHpPercent > 25 ? 'var(--color-signal-orange)' : 'var(--accent-red)',
                                                marginLeft: 'auto',
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Mana / Special Gauge */}
                                <div className="battle-mp-row" style={{ justifyContent: 'flex-end' }}>
                                    <span style={{ fontSize: '9px', color: '#00d4ff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                        MP {oppMp}%
                                    </span>
                                    <div
                                        style={{
                                            flex: 1,
                                            maxWidth: '120px',
                                            height: '3px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                            borderRadius: '9999px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <motion.div
                                            animate={{ width: `${oppMp}%` }}
                                            transition={{ duration: 0.3 }}
                                            style={{
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                                                marginLeft: 'auto',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '2px' }}>
                                    <span className="battle-player-status" style={{ fontSize: '9.5px', color: opponentFinished ? 'var(--color-vector-green)' : opponentAnsweredThisRound ? 'var(--color-signal-orange)' : 'var(--color-steel)' }}>
                                        {opponentFinished ? '✓ Selesai' : opponentAnsweredThisRound ? '⚡ Menjawab' : '🤔 Berpikir...'}
                                    </span>
                                </div>
                            </div>
                            <motion.div
                                className="battle-versus-avatar"
                                animate={
                                    oppAnimation === 'attack'
                                        ? { x: [0, -18, 0], scale: [1, 1.15, 1] }
                                        : oppAnimation === 'hurt'
                                        ? { x: [6, -6, 4, -4, 0], scale: [1, 0.95, 1] }
                                        : { x: 0, scale: 1 }
                                }
                                transition={{ duration: 0.35 }}
                                style={{
                                    backgroundColor: oppAnimation === 'hurt' ? 'rgba(232, 64, 64, 0.25)' : 'rgba(0, 212, 255, 0.1)',
                                    border: `1px solid ${oppAnimation === 'hurt' ? 'var(--accent-red)' : 'rgba(0, 212, 255, 0.35)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: oppAnimation === 'attack' ? '0 0 24px rgba(0, 212, 255, 0.6)' : oppAnimation === 'hurt' ? '0 0 24px rgba(232, 64, 64, 0.6)' : '0 0 16px rgba(0, 212, 255, 0.2)',
                                }}
                            >
                                <CharacterVisual
                                    role={oppClassKey as any}
                                    equipped={(opponent?.equipped_items as any) || {}}
                                    size={44}
                                    animationState={oppAnimation}
                                    showAura={false}
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* RPG Combat Feed / Action Banner */}
                    <motion.div
                        key={battleLog}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                            marginBottom: '16px',
                            fontSize: '12px',
                            color: 'var(--color-fog)',
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{battleLog}</span>
                    </motion.div>

                    {/* Question Card (Linearity Frosted Block) */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQ}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="battle-question-card"
                            style={{
                                backgroundColor: 'var(--color-carbon)',
                                borderRadius: '14px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                marginBottom: '14px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--color-signal-orange)', fontWeight: 700, letterSpacing: '0.05em' }}>
                                    SOAL {safeQuestionIndex + 1}/{questions.length}
                                </span>
                                <span className="battle-question-subtitle" style={{ color: 'var(--color-steel)' }}>•</span>
                                <span className="battle-question-subtitle" style={{ fontSize: '11px', color: 'var(--color-steel)' }}>Pilih opsi untuk menyerang lawan:</span>
                            </div>

                            <h3 className="battle-question-text">
                                {q.question_text}
                            </h3>
                        </motion.div>
                    </AnimatePresence>

                    {/* Options Grid */}
                    <div className="battle-options-grid">
                        {q.options.map((opt, idx) => {
                            const isSelected = selectedAnswer === idx
                            const isCorrect = idx === q.correct_option

                            let bg = 'rgba(255, 255, 255, 0.04)'
                            let border = 'rgba(255, 255, 255, 0.1)'
                            let textColor = '#ffffff'
                            let badgeBg = 'rgba(255, 255, 255, 0.08)'
                            let badgeColor = 'var(--color-silver)'

                            if (showAnswer) {
                                if (isCorrect) {
                                    bg = 'rgba(34, 197, 94, 0.16)'
                                    border = 'var(--color-vector-green)'
                                    textColor = 'var(--color-vector-green)'
                                    badgeBg = 'var(--color-vector-green)'
                                    badgeColor = '#050505'
                                } else if (isSelected) {
                                    bg = 'rgba(239, 68, 68, 0.16)'
                                    border = 'var(--accent-red)'
                                    textColor = 'var(--accent-red)'
                                    badgeBg = 'var(--accent-red)'
                                    badgeColor = '#ffffff'
                                }
                            } else if (isSelected) {
                                bg = 'rgba(245, 197, 66, 0.15)'
                                border = 'var(--color-signal-orange)'
                                textColor = '#ffffff'
                                badgeBg = 'var(--color-signal-orange)'
                                badgeColor = '#050505'
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    type="button"
                                    whileHover={selectedAnswer === null ? { y: -2, borderColor: 'rgba(255, 255, 255, 0.25)' } : {}}
                                    whileTap={selectedAnswer === null ? { scale: 0.99 } : {}}
                                    onClick={() => handleAnswer(idx)}
                                    className="battle-option-btn"
                                    style={{
                                        cursor: selectedAnswer !== null ? 'default' : 'pointer',
                                        backgroundColor: bg,
                                        border: `1px solid ${border}`,
                                        color: textColor,
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '6px',
                                            backgroundColor: badgeBg,
                                            color: badgeColor,
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 700,
                                            fontSize: '11px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="battle-option-text">{opt}</span>
                                    {showAnswer && isCorrect && <CheckCircle size={15} style={{ color: 'var(--color-vector-green)', flexShrink: 0 }} />}
                                    {showAnswer && isSelected && !isCorrect && <XCircle size={15} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />}
                                </motion.button>
                            )
                        })}
                    </div>

                    {/* Bottom Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-signal-orange)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            🔥 {classBenefitText}
                        </span>

                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowSurrenderConfirm(true)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: 'rgba(232, 64, 64, 0.08)',
                                border: '1px solid rgba(232, 64, 64, 0.3)',
                                color: 'var(--accent-red)',
                                fontSize: '11px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                flexShrink: 0,
                            }}
                        >
                            🚩 Menyerah
                        </motion.button>
                    </div>
                </div>

                {/* Surrender Confirmation Modal */}
                {showSurrenderConfirm && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '16px',
                        }}
                        onClick={() => setShowSurrenderConfirm(false)}
                    >
                        <div
                            className="product-demo-panel"
                            style={{
                                width: '100%',
                                maxWidth: '380px',
                                padding: '24px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    marginBottom: '8px',
                                }}
                            >
                                Konfirmasi Menyerah
                            </h3>
                            <p style={{ color: 'var(--color-fog)', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
                                Yakin ingin menyerah? Kamu akan otomatis didiskualifikasi dan lawanmu mendapatkan kemenangan penuh.
                            </p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowSurrenderConfirm(false)}
                                    className="btn-dark-outline"
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSurrenderConfirm(false)
                                        handleSurrender()
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '9999px',
                                        border: '1px solid rgba(232, 64, 64, 0.6)',
                                        backgroundColor: 'rgba(232, 64, 64, 0.2)',
                                        color: 'var(--accent-red)',
                                        fontFamily: 'var(--font-heading)',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Ya, Menyerah
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
