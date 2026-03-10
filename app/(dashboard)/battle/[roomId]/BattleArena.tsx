'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Question, Battle, Profile } from '@/types'
import { Sword, Shield, CheckCircle } from 'lucide-react'

interface BattleArenaProps {
    battle: Battle
    questions: Question[]
    currentUser: Profile
    opponent: Profile | null
}

type BattlePhase = 'waiting' | 'lobby' | 'playing' | 'finished'

export default function BattleArena({ battle: initialBattle, questions, currentUser, opponent: initialOpponent }: BattleArenaProps) {
    const router = useRouter()
    const supabase = createClient()

    // Derive initial phase
    const initPhase = (): BattlePhase => {
        if (initialBattle.player1_id && initialBattle.player2_id) return 'lobby'
        return 'waiting'
    }

    const [phase, setPhase] = useState<BattlePhase>(initPhase())
    const [battle, setBattle] = useState(initialBattle)
    const [opponent, setOpponent] = useState<Profile | null>(initialOpponent)

    // Ready state (tracked via realtime broadcast)
    const [iAmReady, setIAmReady] = useState(false)
    const [opponentReady, setOpponentReady] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)

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

    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const isPlayer1 = battle.player1_id === currentUser.id

    const handleExitGame = async () => {
        if (isPlayer1) {
            // Delete the entire room
            await supabase.from('battles').delete().eq('id', battle.id)
        } else {
            // Remove self from room
            await supabase.from('battles').update({ player2_id: null, status: 'waiting' }).eq('id', battle.id)
            // Inform player 1 so they go back to waiting
            channelRef.current?.send({ type: 'broadcast', event: 'player_left', payload: {} })
        }
        router.push('/battle')
    }

    const endBattle = useCallback(async (finalMyScore: number, finalOppScore: number, isSurrender = false) => {
        clearInterval(timerRef.current!)
        setIAmFinished(true)

        channelRef.current?.send({
            type: 'broadcast', event: 'player_finished',
            payload: { player_id: currentUser.id }
        })

        if (opponentFinished || !opponent || isSurrender) {
            setPhase('finished')
            let winner = finalMyScore >= finalOppScore ? currentUser.id : (opponent?.id ?? currentUser.id)
            const opponentIdFallback = opponent?.id ?? currentUser.id
            if (isSurrender) winner = opponentIdFallback // Ensure opponent wins

            await supabase.from('battles').update({
                status: 'finished',
                player1_score: isPlayer1 ? finalMyScore : finalOppScore,
                player2_score: isPlayer1 ? finalOppScore : finalMyScore,
                winner_id: winner,
            }).eq('id', battle.id)

            // Calculate XP
            let myXpAmount = finalMyScore >= finalOppScore ? 80 : 20
            if (isSurrender) myXpAmount = 0 // Penalty for surrendering

            if (myXpAmount > 0) {
                await fetch('/api/xp', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: myXpAmount, reason: `Battle ${isSurrender ? 'menyerah' : finalMyScore >= finalOppScore ? 'kemenangan' : 'kekalahan'}` })
                })
            }
        }
    }, [battle.id, currentUser.id, isPlayer1, opponent, supabase, opponentFinished])

    const handleSurrender = async () => {
        channelRef.current?.send({ type: 'broadcast', event: 'player_surrendered', payload: {} })
        await endBattle(0, 100, true) // Force opponent to win
    }

    // Timer — only runs during 'playing' phase
    useEffect(() => {
        if (phase !== 'playing' || questions.length === 0) return
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!)
                    setShowAnswer(true)
                    setTimeout(() => {
                        if (currentQ < questions.length - 1) {
                            setCurrentQ(q => q + 1)
                            setTimeLeft(15)
                            setSelectedAnswer(null)
                            setShowAnswer(false)
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
            .on('broadcast', { event: 'player_ready' }, ({ payload }) => {
                if (payload.player_id !== currentUser.id) {
                    setOpponentReady(true)
                }
            })
            .on('broadcast', { event: 'game_start' }, () => {
                // If the host force-starts it over the network
                setCountdown(5)
            })
            .on('broadcast', { event: 'player_surrendered' }, () => {
                // Opponent surrendered, I win
                setPhase('finished')
                setOpponentScore(0)
                endBattle(myScore, 0, false) // I win by default
            })
            .on('broadcast', { event: 'player_left' }, () => {
                if (isPlayer1) {
                    console.log('Opponent left the room.')
                    setPhase('waiting')
                    setOpponent(null)
                    setOpponentReady(false)
                    setIAmReady(false)
                    setBattle((prev) => ({ ...prev, player2_id: null }))
                }
            })
            .on('broadcast', { event: 'player_finished' }, ({ payload }) => {
                if (payload.player_id !== currentUser.id) {
                    setOpponentFinished(true)
                }
            })
            .on('broadcast', { event: 'score_update' }, ({ payload }) => {
                if (payload.player_id !== currentUser.id) {
                    setOpponentScore(payload.score)
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE', schema: 'public', table: 'battles', filter: `id=eq.${battle.id}`
            }, async (payload) => {
                console.log('Battle update received via Realtime:', payload.new)
                const newBattle = payload.new as Battle
                setBattle(newBattle)

                // When player 2 joins the room, auto-start
                if (newBattle.player2_id) {
                    setPhase((prev) => {
                        if (prev === 'waiting') return 'playing'
                        return prev
                    })
                    // Fetch opponent profile if not set
                    const { data } = await supabase.from('profiles').select('*').eq('id', newBattle.player2_id).single()
                    if (data) setOpponent(data)
                }
            })
            .subscribe((status) => {
                console.log('Supabase Realtime subscription status:', status)
            })

        return () => { supabase.removeChannel(channel) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [battle.id, currentUser.id])

    // Monitor player2_id to transition and fetch opponent (with Fallback Polling)
    useEffect(() => {
        let pollInterval: NodeJS.Timeout

        const checkFreshBattle = async () => {
            const { data: freshBattle } = await supabase.from('battles').select('*').eq('id', battle.id).single()
            if (freshBattle && freshBattle.player2_id && !battle.player2_id) {
                console.log('Opponent joined! Updating battle state.', freshBattle)
                setBattle(freshBattle)
            }
        }

        // Initial check on mount to bypass SSR stale data
        checkFreshBattle()

        // Active polling for Player 1 (Creator) just in case Realtime replication isn't enabled
        if (phase === 'waiting' && isPlayer1) {
            pollInterval = setInterval(checkFreshBattle, 2000)
        }

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
        }
    }, [battle.id, battle.player1_id, battle.player2_id, isPlayer1, opponent, phase, supabase])

    // Effect to handle state transition if we finished waiting for opponent
    useEffect(() => {
        if (iAmFinished && opponentFinished && phase !== 'finished') {
            setPhase('finished')
            const finalMyScore = myScore
            const finalOppScore = opponentScore
            const winner = finalMyScore >= finalOppScore ? currentUser.id : (opponent?.id ?? currentUser.id)

            // Only player 1 writes the result
            if (isPlayer1) {
                supabase.from('battles').update({
                    status: 'finished',
                    player1_score: finalMyScore,
                    player2_score: finalOppScore,
                    winner_id: winner,
                }).eq('id', battle.id).then()

                const xpAmount = finalMyScore >= finalOppScore ? 80 : 20
                fetch('/api/xp', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: xpAmount, reason: `Battle ${finalMyScore >= finalOppScore ? 'kemenangan' : 'kekalahan'}` })
                }).then()
            } else {
                const xpAmount = finalMyScore >= finalOppScore ? 80 : 20
                fetch('/api/xp', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: xpAmount, reason: `Battle ${finalMyScore >= finalOppScore ? 'kemenangan' : 'kekalahan'}` })
                }).then()
            }
        }
    }, [iAmFinished, opponentFinished, phase, myScore, opponentScore, currentUser.id, opponent, isPlayer1, battle.id, supabase])

    function handleReady() {
        setIAmReady(true)
        channelRef.current?.send({
            type: 'broadcast', event: 'player_ready',
            payload: { player_id: currentUser.id }
        })
    }

    // When both players are ready, start countdown
    useEffect(() => {
        if (iAmReady && opponentReady && phase === 'lobby' && countdown === null) {
            if (isPlayer1) channelRef.current?.send({ type: 'broadcast', event: 'game_start', payload: {} })
            setCountdown(5)
        }
    }, [iAmReady, opponentReady, isPlayer1, phase, countdown])

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

    function handleAnswer(idx: number) {
        if (selectedAnswer !== null || showAnswer) return
        clearInterval(timerRef.current!)
        setSelectedAnswer(idx)
        setShowAnswer(true)

        const q = questions[currentQ]
        const isCorrect = idx === q.correct_option
        const bonus = Math.floor(timeLeft * 0.5)
        const newScore = myScore + (isCorrect ? 10 + bonus : 0)
        setMyScore(newScore)

        channelRef.current?.send({
            type: 'broadcast', event: 'score_update',
            payload: { player_id: currentUser.id, score: newScore }
        })

        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(q => q + 1)
                setTimeLeft(15)
                setSelectedAnswer(null)
                setShowAnswer(false)
            } else {
                endBattle(newScore, opponentScore)
            }
        }, 1200)
    }

    // Phase: Waiting for opponent (only player1 sees this)
    if (phase === 'waiting') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '24px', textAlign: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                    <Sword size={48} style={{ color: 'var(--accent-gold)' }} />
                </motion.div>
                <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Menunggu Lawan...</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>Bagikan kode room ke temanmu</p>
                    <div style={{
                        display: 'inline-block', padding: '12px 24px', borderRadius: '4px',
                        backgroundColor: 'rgba(245,197,66,0.1)', border: '2px solid var(--accent-gold)',
                        fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700,
                        color: 'var(--accent-gold)', letterSpacing: '6px',
                    }}>
                        {battle.room_code}
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleExitGame}
                    style={{
                        padding: '10px 24px', borderRadius: '4px', cursor: 'pointer',
                        backgroundColor: 'rgba(232, 64, 64, 0.1)', border: '1px solid var(--accent-red)',
                        color: 'var(--accent-red)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700,
                    }}
                >
                    Keluar Permainan
                </motion.button>
            </div>
        )
    }

    // Phase: Lobby — both players in, waiting for both to be Ready
    if (phase === 'lobby') {
        const myReady = iAmReady
        const oppReady = opponentReady
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '32px', textAlign: 'center' }}
            >
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700 }}>
                    ⚔️ Persiapan Battle
                </h2>

                {/* Players row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '16px' }}>
                    {/* Me */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 8px',
                            backgroundColor: myReady ? 'rgba(34,197,94,0.15)' : 'var(--bg-secondary)',
                            border: `2px solid ${myReady ? 'var(--accent-green)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                        }}>
                            {myReady ? <CheckCircle size={36} color="var(--accent-green)" /> : <Shield size={36} color="var(--text-muted)" />}
                        </div>
                        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{currentUser.username}</p>
                        <p style={{ fontSize: '11px', color: myReady ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: '4px' }}>
                            {myReady ? '✓ SIAP' : 'Menunggu...'}
                        </p>
                    </div>

                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: 'var(--accent-red)' }}>VS</div>

                    {/* Opponent */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 8px',
                            backgroundColor: oppReady ? 'rgba(34,197,94,0.15)' : 'var(--bg-secondary)',
                            border: `2px solid ${oppReady ? 'var(--accent-green)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                        }}>
                            {oppReady ? <CheckCircle size={36} color="var(--accent-green)" /> : <Shield size={36} color="var(--text-muted)" />}
                        </div>
                        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{opponent?.username || '???'}</p>
                        <p style={{ fontSize: '11px', color: oppReady ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: '4px' }}>
                            {oppReady ? '✓ SIAP' : 'Menunggu...'}
                        </p>
                    </div>
                </div>

                {!myReady ? (
                    <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        onClick={handleReady}
                        style={{
                            padding: '14px 48px', borderRadius: '4px', cursor: 'pointer',
                            backgroundColor: 'var(--accent-green)', border: 'none',
                            color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)',
                            fontSize: '18px', fontWeight: 700, letterSpacing: '1px',
                        }}
                    >
                        ✓ SIAP!
                    </motion.button>
                ) : countdown !== null ? (
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{
                        marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Mulai dalam</p>
                        <div style={{
                            fontFamily: 'var(--font-heading)', fontSize: '48px', fontWeight: 800,
                            color: 'var(--accent-gold)'
                        }}>
                            {countdown}
                        </div>
                    </motion.div>
                ) : (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {oppReady ? 'Memulai...' : 'Menunggu lawan siap...'}
                    </p>
                )}

                {countdown === null && (
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleExitGame}
                        style={{
                            padding: '10px 24px', borderRadius: '4px', cursor: 'pointer',
                            backgroundColor: 'transparent', border: '1px solid var(--border)',
                            color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 700,
                            marginTop: '16px'
                        }}
                    >
                        Keluar Permainan
                    </motion.button>
                )}
            </motion.div>
        )
    }

    if (iAmFinished && !opponentFinished && phase !== 'finished') {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px' }}>⏰</div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700 }}>Kerja Bagus!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Menunggu {opponent?.username || 'Lawan'} menyelesaikan pertanyaannya...</p>
                <div style={{ height: '4px', width: '100px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden', marginTop: '16px' }}>
                    <motion.div animate={{ x: [-100, 100] }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ height: '100%', width: '50px', backgroundColor: 'var(--accent-gold)' }} />
                </div>
            </motion.div>
        )
    }

    // Phase: Finished
    if (phase === 'finished') {
        const won = myScore >= opponentScore
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '70vh', gap: '24px', textAlign: 'center',
            }}>
                <div style={{ fontSize: '64px' }}>{won ? '🏆' : '💀'}</div>
                <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700, color: won ? 'var(--accent-gold)' : 'var(--accent-red)', marginBottom: '8px' }}>
                        {won ? 'KEMENANGAN!' : 'KEKALAHAN'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {won ? `+80 XP didapat!` : '+20 XP untuk usahamu'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '48px' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{myScore}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Skormu</div>
                    </div>
                    <div style={{ fontSize: '28px', color: 'var(--text-muted)', alignSelf: 'center' }}>vs</div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 700, color: 'var(--text-secondary)' }}>{opponentScore}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{opponent?.username || 'Lawan'}</div>
                    </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => router.push('/battle')} style={{
                    padding: '12px 32px', borderRadius: '4px', cursor: 'pointer',
                    backgroundColor: 'var(--accent-gold)', border: 'none',
                    color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700,
                }}>
                    MAIN LAGI
                </motion.button>
            </motion.div>
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

    const q = questions[currentQ]
    const timerPercent = (timeLeft / 15) * 100
    const timerColor = timeLeft > 8 ? 'var(--accent-green)' : timeLeft > 4 ? 'var(--accent-gold)' : 'var(--accent-red)'

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px' }}>
            {/* Scoreboard */}
            <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{currentUser.username}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{myScore}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0 16px' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {currentQ + 1}/{questions.length}
                    </div>
                    <Sword size={20} style={{ color: 'var(--accent-red)', margin: '4px auto' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{opponent?.username || 'Lawan'}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, color: 'var(--text-secondary)' }}>{opponentScore}</div>
                </div>
            </div>

            {/* Timer */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Waktu tersisa</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: timerColor, fontSize: '16px' }}>{timeLeft}s</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div animate={{ width: `${timerPercent}%` }} transition={{ duration: 1 }}
                        style={{ height: '100%', backgroundColor: timerColor }} />
                </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="card" style={{ padding: '24px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>SOAL {currentQ + 1}</div>
                    <p style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.6 }}>{q.question_text}</p>
                </motion.div>
            </AnimatePresence>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options.map((opt, idx) => {
                    let bg = 'var(--bg-secondary)'
                    let border = 'var(--border)'
                    if (showAnswer) {
                        if (idx === q.correct_option) { bg = 'rgba(34,197,94,0.15)'; border = 'var(--accent-green)' }
                        else if (idx === selectedAnswer) { bg = 'rgba(232,64,64,0.15)'; border = 'var(--accent-red)' }
                    } else if (idx === selectedAnswer) {
                        bg = 'rgba(0,212,255,0.1)'; border = 'var(--accent-cyan)'
                    }
                    return (
                        <motion.button key={idx} whileHover={selectedAnswer === null ? { x: 4 } : {}}
                            onClick={() => handleAnswer(idx)} style={{
                                textAlign: 'left', padding: '14px 16px', borderRadius: '4px',
                                cursor: selectedAnswer !== null ? 'default' : 'pointer',
                                backgroundColor: bg, border: `1px solid ${border}`,
                                color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500,
                            }}>
                            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginRight: '10px', color: 'var(--text-secondary)' }}>
                                {String.fromCharCode(65 + idx)}.
                            </span>
                            {opt}
                        </motion.button>
                    )
                })}
            </div>

            {/* Surrender Button */}
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSurrenderConfirm(true)}
                    style={{
                        padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
                        backgroundColor: 'transparent', border: '1px solid var(--accent-red)',
                        color: 'var(--accent-red)', fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 700,
                    }}
                >
                    🚩 Menyerah
                </motion.button>
            </div>

            {showSurrenderConfirm && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '16px',
                    }}
                    onClick={() => setShowSurrenderConfirm(false)}
                >
                    <div
                        className="card"
                        style={{
                            width: '100%',
                            maxWidth: '360px',
                            padding: '20px',
                            border: '1px solid var(--border)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '18px',
                                fontWeight: 700,
                                marginBottom: '8px',
                            }}
                        >
                            Konfirmasi Menyerah
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                            Yakin ingin menyerah? Kamu akan otomatis didiskualifikasi dan lawanmu menang.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowSurrenderConfirm(false)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-secondary)',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Tidak
                            </button>
                            <button
                                onClick={() => {
                                    setShowSurrenderConfirm(false)
                                    handleSurrender()
                                }}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(232,64,64,0.45)',
                                    backgroundColor: 'rgba(232,64,64,0.1)',
                                    color: 'var(--accent-red)',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Ya
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
