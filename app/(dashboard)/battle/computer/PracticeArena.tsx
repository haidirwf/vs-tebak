'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sword, CheckCircle, XCircle, Flame, Swords, Volume2, VolumeX, Music } from 'lucide-react'
import { Question, Profile, AvatarClass } from '@/types'
import BattleArenaStage, { AttackEvent } from '@/components/battle/BattleArenaStage'
import { battleSounds } from '@/lib/game/battle-sounds'

type PracticeCategory = 'coding' | 'design' | 'productivity' | 'business' | 'general'

type PracticeQuestion = Question & {
    category?: string
}

const BATTLE_QUESTION_COUNT = 10
const QUESTION_TIME = 15

const CATEGORIES: { value: PracticeCategory; label: string; emoji: string }[] = [
    { value: 'coding', label: 'Coding', emoji: '💻' },
    { value: 'design', label: 'Desain', emoji: '🎨' },
    { value: 'productivity', label: 'Produktivitas', emoji: '⚡' },
    { value: 'business', label: 'Bisnis', emoji: '📈' },
    { value: 'general', label: 'Umum', emoji: '🎯' },
]

interface PracticeArenaProps {
    questionPool: PracticeQuestion[]
    currentUser?: Profile | null
}

function shuffle<T>(arr: T[]): T[] {
    const cloned = [...arr]
    for (let i = cloned.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[cloned[i], cloned[j]] = [cloned[j], cloned[i]]
    }
    return cloned
}

function shuffleQuestionOptions(question: PracticeQuestion): PracticeQuestion {
    const indexed = question.options.map((opt, idx) => ({ opt, idx }))
    const shuffled = shuffle(indexed)
    const newCorrect = shuffled.findIndex((item) => item.idx === question.correct_option)

    return {
        ...question,
        options: shuffled.map((item) => item.opt),
        correct_option: newCorrect >= 0 ? newCorrect : question.correct_option,
    }
}

function botAccuracyByDifficulty(difficulty: string) {
    if (difficulty === 'hard') return 0.55
    if (difficulty === 'easy') return 0.8
    return 0.68
}

export default function PracticeArena({ questionPool, currentUser }: PracticeArenaProps) {
    const router = useRouter()
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const botRef = useRef<NodeJS.Timeout | null>(null)

    const [selectedCategory, setSelectedCategory] = useState<PracticeCategory>('general')
    const [started, setStarted] = useState(false)
    const [questions, setQuestions] = useState<PracticeQuestion[]>([])
    const [currentQ, setCurrentQ] = useState(0)
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
    const [myScore, setMyScore] = useState(0)
    const [botScore, setBotScore] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [showAnswer, setShowAnswer] = useState(false)
    const [botAnswered, setBotAnswered] = useState(false)
    const [finished, setFinished] = useState(false)
    const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null)
    const [comboCount, setComboCount] = useState(0)
    const [myHp, setMyHp] = useState(100)
    const [botHp, setBotHp] = useState(100)
    const [myMp, setMyMp] = useState(30)
    const [botMp, setBotMp] = useState(20)
    const [meAnimation, setMeAnimation] = useState<'idle' | 'attack' | 'hurt'>('idle')
    const [botAnimation, setBotAnimation] = useState<'idle' | 'attack' | 'hurt'>('idle')
    const [activeAttack, setActiveAttack] = useState<AttackEvent | null>(null)
    const [combatText, setCombatText] = useState<{
        target: 'me' | 'bot'
        text: string
        type: 'damage' | 'crit' | 'miss'
    } | null>(null)
    const [battleLog, setBattleLog] = useState('⚡ Arena Latihan RPG aktif. Jawab pertanyaan untuk melancarkan serangan!')
    const [audioMuted, setAudioMuted] = useState(() => battleSounds.getIsMuted())
    const [bgmMuted, setBgmMuted] = useState(() => battleSounds.getIsBgmMuted())

    useEffect(() => {
        return battleSounds.subscribe(() => {
            setAudioMuted(battleSounds.getIsMuted())
            setBgmMuted(battleSounds.getIsBgmMuted())
        })
    }, [])

    useEffect(() => {
        if (started && !finished) {
            battleSounds.startBattleBGM()
        } else {
            battleSounds.stopBattleBGM()
        }
        return () => {
            battleSounds.stopBattleBGM()
        }
    }, [started, finished])

    const availableQuestions = useMemo(() => {
        if (selectedCategory === 'general') return questionPool
        return questionPool.filter(q => q.category === selectedCategory)
    }, [questionPool, selectedCategory])

    const currentQuestion = questions[currentQ]

    function resetTimers() {
        if (timerRef.current) clearInterval(timerRef.current)
        if (botRef.current) clearTimeout(botRef.current)
    }

    function startRoundBot(question: PracticeQuestion) {
        const botDelayMs = (Math.floor(Math.random() * 7) + 2) * 1000 // 2-8s
        botRef.current = setTimeout(() => {
            setBotAnswered(true)
            const willBeCorrect = Math.random() < botAccuracyByDifficulty(question.difficulty || 'medium')
            const picked = willBeCorrect
                ? question.correct_option
                : Math.floor(Math.random() * question.options.length)
            const isCorrect = picked === question.correct_option
            if (!isCorrect) return

            const remaining = Math.max(1, QUESTION_TIME - Math.floor(botDelayMs / 1000))
            const bonus = Math.floor(remaining * 0.5)
            setBotScore(prev => prev + 10 + bonus)
            setBotMp(mp => Math.min(100, mp + 25))

            // Bot attack visual & sound
            battleSounds.playAttackSwing()
            setBotAnimation('attack')
            setActiveAttack({
                id: String(Date.now()),
                direction: 'right-to-left',
                type: 'bot',
                damage: 12,
            })

            setTimeout(() => {
                battleSounds.playHitImpact(false)
                setMeAnimation('hurt')
                const newHp = Math.max(0, myHp - 12)
                setMyHp(newHp)
                setCombatText({ target: 'me', text: '⚡ -12 HP', type: 'damage' })
                setBattleLog('🤖 AI Sentinel melancarkan serangan pulsa energi kilat (-12 HP)!')
                setTimeout(() => setMeAnimation('idle'), 500)
                setTimeout(() => setCombatText(null), 1100)

                if (newHp <= 0) {
                    setTimeout(() => {
                        endGame(myScore, botScore + 10, 'lose')
                    }, 500)
                }
            }, 280)

            setTimeout(() => {
                setBotAnimation('idle')
                setActiveAttack(null)
            }, 600)
        }, botDelayMs)
    }

    function endGame(finalMy: number, finalBot: number, forcedResult?: 'win' | 'lose' | 'draw') {
        resetTimers()
        setFinished(true)
        battleSounds.stopBattleBGM()
        const outcome = forcedResult || (finalMy > finalBot ? 'win' : finalMy < finalBot ? 'lose' : 'draw')
        setResult(outcome)
        if (outcome === 'win') {
            battleSounds.playVictory()
        } else if (outcome === 'lose') {
            battleSounds.playDefeat()
        }
    }

    function goNextQuestion(finalMy: number, finalBot: number) {
        if (currentQ >= questions.length - 1) {
            endGame(finalMy, finalBot)
            return
        }
        setCurrentQ(prev => prev + 1)
        setTimeLeft(QUESTION_TIME)
        setSelectedAnswer(null)
        setShowAnswer(false)
        setBotAnswered(false)
    }

    function startPractice() {
        const picked = shuffle(availableQuestions)
            .slice(0, BATTLE_QUESTION_COUNT)
            .map((q) => shuffleQuestionOptions(q))
        if (picked.length === 0) return
        setQuestions(picked)
        setCurrentQ(0)
        setTimeLeft(QUESTION_TIME)
        setMyScore(0)
        setBotScore(0)
        setSelectedAnswer(null)
        setShowAnswer(false)
        setBotAnswered(false)
        setFinished(false)
        setResult(null)
        setComboCount(0)
        setMyHp(100)
        setBotHp(100)
        setMyMp(30)
        setBotMp(20)
        setCombatText(null)
        setBattleLog('⚡ Arena Latihan RPG aktif. Jawab pertanyaan untuk menyerang AI Sentinel!')
        setStarted(true)
        battleSounds.playMatchStart()
        battleSounds.startBattleBGM()
    }

    useEffect(() => {
        if (!started || finished || !currentQuestion) return

        resetTimers()
        startRoundBot(currentQuestion)
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!)
                    setShowAnswer(true)
                    setComboCount(0)
                    battleSounds.playWrongAnswer()
                    battleSounds.playMiss()
                    const newHp = Math.max(0, myHp - 15)
                    setMyHp(newHp)
                    setCombatText({ target: 'me', text: '⏰ TIMEOUT! -15 HP', type: 'miss' })
                    setMeAnimation('hurt')
                    setBattleLog('⌛ Waktu habis! Kamu terkena penalti giliran dan kehilangan 15 HP.')
                    setTimeout(() => setMeAnimation('idle'), 600)
                    setTimeout(() => setCombatText(null), 1100)

                    if (newHp <= 0) {
                        setTimeout(() => {
                            endGame(myScore, botScore, 'lose')
                        }, 600)
                        return 0
                    }

                    setTimeout(() => {
                        goNextQuestion(myScore, botScore)
                    }, 1250)
                    return 0
                }
                if (prev <= 4 && prev > 1) {
                    battleSounds.playTimeWarning()
                }
                return prev - 1
            })
        }, 1000)

        return () => resetTimers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, finished, currentQ, currentQuestion, myHp, botScore, myScore])

    function handleAnswer(idx: number) {
        if (!currentQuestion || showAnswer || selectedAnswer !== null) return
        resetTimers()
        setSelectedAnswer(idx)
        setShowAnswer(true)

        const isCorrect = idx === currentQuestion.correct_option
        const bonus = Math.floor(timeLeft * 0.5)
        const updatedMyScore = myScore + (isCorrect ? 10 + bonus : 0)
        setMyScore(updatedMyScore)

        const hpDamage = 14
        const playerClass = ((currentUser?.avatar_class as AvatarClass) || 'warrior')
        if (isCorrect) {
            const nextCombo = comboCount + 1
            setComboCount(nextCombo)
            const isCrit = nextCombo >= 2
            const isUltimate = myMp >= 100
            const effectiveDamage = isUltimate ? hpDamage * 2 : isCrit ? hpDamage + 8 : hpDamage

            if (isUltimate) {
                battleSounds.playUltimateSkill()
            } else if (nextCombo >= 2) {
                battleSounds.playComboStreak(nextCombo)
            } else {
                battleSounds.playCorrectAnswer()
            }

            // Attacker whoosh sound & lunge/hand animation
            battleSounds.playAttackSwing()
            setMeAnimation('attack')
            setActiveAttack({
                id: String(Date.now()),
                direction: 'left-to-right',
                type: playerClass as any,
                isCrit,
                isUltimate,
                damage: effectiveDamage,
            })

            // Projectile impact
            setTimeout(() => {
                battleSounds.playHitImpact(isCrit || isUltimate)
                setBotAnimation('hurt')
                const newBotHp = Math.max(0, botHp - effectiveDamage)
                setBotHp(newBotHp)
                setCombatText({
                    target: 'bot',
                    text: isUltimate
                        ? `🔥 ULTIMATE! -${effectiveDamage} HP`
                        : isCrit
                        ? `💥 CRIT! -${effectiveDamage} HP`
                        : `⚔️ -${effectiveDamage} HP`,
                    type: isCrit || isUltimate ? 'crit' : 'damage',
                })

                if (newBotHp <= 0) {
                    setTimeout(() => {
                        endGame(updatedMyScore + 10, botScore, 'win')
                    }, 500)
                }
            }, 280)

            if (isUltimate) {
                setMyMp(0)
            } else {
                setMyMp(mp => Math.min(100, mp + 25))
            }

            setBattleLog(
                isUltimate
                    ? `🔥 ULTIMATE BURST! Serangan pamungkas melumpuhkan sistem pertahanan AI Sentinel (-${effectiveDamage} HP)!`
                    : isCrit
                    ? `🔥 COMBO x${nextCombo}! Serangan kritikal mendarat telak (-${effectiveDamage} HP)!`
                    : `⚔️ Serangan menembus pertahanan AI Sentinel (-${effectiveDamage} HP)!`
            )
            setTimeout(() => {
                setMeAnimation('idle')
                setBotAnimation('idle')
                setActiveAttack(null)
            }, 600)
            setTimeout(() => setCombatText(null), 1100)
        } else {
            battleSounds.playWrongAnswer()
            battleSounds.playMiss()
            setComboCount(0)
            const newMyHp = Math.max(0, myHp - hpDamage)
            setMyHp(newMyHp)
            setCombatText({
                target: 'me',
                text: `❌ Meleset! -${hpDamage} HP`,
                type: 'miss',
            })
            setMeAnimation('hurt')
            setBattleLog(`🛡️ Serangan meleset! AI Sentinel membalas dengan serangan balik (-${hpDamage} HP).`)
            setTimeout(() => setMeAnimation('idle'), 600)
            setTimeout(() => setCombatText(null), 1100)

            if (newMyHp <= 0) {
                setTimeout(() => {
                    endGame(updatedMyScore, botScore + 10, 'lose')
                }, 500)
                return
            }
        }

        setTimeout(() => {
            goNextQuestion(updatedMyScore, botScore)
        }, 1250)
    }

    if (!started) {
        return (
            <div className="responsive-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
                <div style={{ width: '100%', maxWidth: '540px' }}>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>
                        🤖 Battle vs Computer
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                        Mode latihan solo. Main 10 soal melawan AI bot.
                    </p>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Pilih kategori latihan
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', marginBottom: '20px' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setSelectedCategory(cat.value)}
                                style={{
                                    padding: '12px 8px', borderRadius: '4px', cursor: 'pointer',
                                    backgroundColor: selectedCategory === cat.value ? 'rgba(245,197,66,0.1)' : 'var(--bg-tertiary)',
                                    border: `1px solid ${selectedCategory === cat.value ? 'var(--accent-gold)' : 'var(--border)'}`,
                                    color: selectedCategory === cat.value ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                    fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 600,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{cat.emoji}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {availableQuestions.length === 0 ? (
                        <p style={{ color: 'var(--accent-red)', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
                            Soal untuk kategori ini belum tersedia.
                        </p>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
                            Soal tersedia: {availableQuestions.length}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            type="button"
                            onClick={() => router.push('/battle')}
                            style={{
                                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                                backgroundColor: 'transparent', border: '1px solid var(--border)',
                                color: 'var(--text-secondary)', fontSize: '13px',
                            }}
                        >
                            Kembali
                        </button>
                        <motion.button
                            type="button"
                            whileHover={{ scale: availableQuestions.length > 0 ? 1.02 : 1 }}
                            whileTap={{ scale: availableQuestions.length > 0 ? 0.97 : 1 }}
                            onClick={startPractice}
                            disabled={availableQuestions.length === 0}
                            style={{
                                padding: '10px 22px', borderRadius: '8px',
                                cursor: availableQuestions.length > 0 ? 'pointer' : 'not-allowed',
                                backgroundColor: 'var(--accent-gold)', border: 'none',
                                color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700,
                                opacity: availableQuestions.length > 0 ? 1 : 0.5,
                            }}
                        >
                            Mulai Latihan
                        </motion.button>
                    </div>
                </div>
                </div>
            </div>
        )
    }

    if (finished) {
        const title = result === 'win' ? 'KEMENANGAN MUTLAK!' : result === 'lose' ? 'KEKALAHAN' : 'HASIL SERI!'
        const icon = result === 'win' ? '🏆' : result === 'lose' ? '💀' : '🤝'
        const color = result === 'win' ? 'var(--color-signal-orange)' : result === 'lose' ? 'var(--accent-red)' : '#00d4ff'
        return (
            <div className="battle-fullscreen-stage">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="product-demo-panel battle-result-card"
                    style={{
                        width: '100%',
                        maxWidth: '440px',
                        backgroundColor: '#141414',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.9)',
                        textAlign: 'center',
                        padding: 'clamp(14px, 2.2vh, 20px) 18px',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        touchAction: 'none',
                    }}
                >
                    <div style={{ fontSize: '38px', marginBottom: '4px', lineHeight: 1 }}>{icon}</div>
                    <h2
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '22px',
                            fontWeight: 800,
                            color,
                            marginBottom: '6px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {title}
                    </h2>
                    <p style={{ color: 'var(--color-fog)', fontSize: '13px', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                        {result === 'win' ? 'Luar biasa! Kamu berhasil menaklukkan Computer AI.' : result === 'lose' ? 'Tetap semangat! Coba lagi untuk mengasah ketepatan analisismu.' : 'Pertandingan sengit! Skor kalian seimbang.'}
                    </p>

                    {/* Contestants Final Comparison */}
                    <div
                        className="battle-versus-row"
                        style={{ marginBottom: '18px' }}
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
                                ⚔️
                            </div>
                            <div className="battle-versus-info" style={{ textAlign: 'left' }}>
                                <div className="battle-player-name">Kamu</div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 800, color: 'var(--color-signal-orange)', lineHeight: 1.2 }}>
                                    {myScore} <span style={{ fontSize: '9.5px', color: 'var(--color-steel)' }}>PTS</span>
                                </div>
                            </div>
                        </div>

                        {/* VS center */}
                        <div className="battle-vs-badge">
                            VS
                        </div>

                        {/* Bot */}
                        <div className="battle-versus-col battle-versus-col-right">
                            <div className="battle-versus-info">
                                <div className="battle-player-name">Computer AI</div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 800, color: '#00d4ff', lineHeight: 1.2 }}>
                                    {botScore} <span style={{ fontSize: '9.5px', color: 'var(--color-steel)' }}>PTS</span>
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
                                🤖
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setStarted(false)
                                setFinished(false)
                            }}
                            className="btn-dark-outline"
                            style={{ padding: '9px 18px', fontSize: '12.5px', borderRadius: '8px' }}
                        >
                            Atur Ulang
                        </button>
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={startPractice}
                            className="btn-signal-orange battle-finish-btn"
                            style={{ padding: '9px 22px', fontSize: '12.5px', fontWeight: 700, borderRadius: '8px' }}
                        >
                            <Swords size={15} /> Main Lagi
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        )
    }

    if (!currentQuestion) {
        return (
            <div className="responsive-page" style={{ maxWidth: '760px', margin: '0 auto', padding: '24px' }}>
                <div className="product-demo-panel" style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Tidak ada soal untuk latihan.
                </div>
            </div>
        )
    }

    const timerColor = timeLeft > 8 ? 'var(--color-vector-green)' : timeLeft > 4 ? 'var(--color-signal-orange)' : 'var(--accent-red)'
    const myHpPercent = Math.max(10, Math.min(100, myHp))
    const botHpPercent = Math.max(10, Math.min(100, botHp))

    return (
        <div className="responsive-page battle-active-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '840px' }}>
                {/* Linearity Frosted Duel Panel */}
                <div className="product-demo-panel">
                    {/* Topbar */}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                                style={{
                                    fontFamily: 'var(--font-inter)',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                Soal {currentQ + 1} dari {questions.length}
                            </span>

                            {/* Sound & Music Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <button
                                        type="button"
                                        onClick={() => battleSounds.toggleBgm()}
                                        title={bgmMuted ? 'Nyalakan Musik (BGM)' : 'Matikan Musik (BGM)'}
                                        aria-label={bgmMuted ? 'Nyalakan Musik (BGM)' : 'Matikan Musik (BGM)'}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            backgroundColor: bgmMuted ? 'rgba(255, 255, 255, 0.04)' : 'rgba(245, 197, 66, 0.12)',
                                            color: bgmMuted ? 'var(--color-steel)' : 'var(--color-gold)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <Music size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => battleSounds.toggleMute()}
                                        title={audioMuted ? 'Nyalakan Efek Suara (SFX)' : 'Matikan Efek Suara (SFX)'}
                                        aria-label={audioMuted ? 'Nyalakan Efek Suara (SFX)' : 'Matikan Efek Suara (SFX)'}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            backgroundColor: audioMuted ? 'rgba(255, 255, 255, 0.04)' : 'rgba(34, 197, 94, 0.12)',
                                            color: audioMuted ? 'var(--color-steel)' : 'var(--accent-green)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {audioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {comboCount > 1 && (
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            color: 'var(--color-signal-orange)',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                    >
                                        <Flame size={14} /> x{comboCount} COMBO!
                                    </span>
                                )}
                            <span
                                style={{
                                    fontSize: '12px',
                                    color: timerColor,
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                    backgroundColor: timeLeft <= 4 ? 'rgba(255, 51, 68, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                                    padding: '3px 10px',
                                    borderRadius: '8px',
                                    border: `1px solid ${timeLeft <= 4 ? 'rgba(255, 51, 68, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
                                }}
                            >
                                00:{timeLeft < 10 ? '0' : ''}{timeLeft}s
                            </span>
                        </div>
                    </div>

                    {/* RPG Battle Arena Stage with Characters, Hand Attacks, & Projectile FX */}
                    <BattleArenaStage
                        player={{
                            name: currentUser?.username || 'Kamu',
                            avatarClass: (currentUser?.avatar_class as AvatarClass) || 'warrior',
                            equipped: (currentUser?.equipped_items as any) || {},
                            level: currentUser?.level || 1,
                            hp: myHp,
                            maxHp: 100,
                            mp: myMp,
                            score: myScore,
                            schoolName: currentUser?.school_name || 'Pelajar Hebat',
                            animationState: meAnimation,
                        }}
                        opponent={{
                            name: 'AI Sentinel',
                            avatarClass: 'mage',
                            equipped: {},
                            level: 10,
                            hp: botHp,
                            maxHp: 100,
                            mp: botMp,
                            score: botScore,
                            schoolName: 'Cyber Bot Engine',
                            animationState: botAnimation,
                            isBot: true,
                        }}
                        activeAttack={activeAttack}
                        combatText={
                            combatText
                                ? {
                                      target: combatText.target === 'me' ? 'player' : 'opponent',
                                      text: combatText.text,
                                      type: combatText.type,
                                  }
                                : null
                        }
                        comboCount={comboCount}
                        battleLog={battleLog}
                    />

                    {/* Question Card */}
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
                                    SOAL {currentQ + 1}/{questions.length}
                                </span>
                                <span className="battle-question-subtitle" style={{ color: 'var(--color-steel)' }}>•</span>
                                <span className="battle-question-subtitle" style={{ fontSize: '11px', color: 'var(--color-steel)' }}>Pilih opsi untuk menyerang lawan:</span>
                            </div>

                            <p className="battle-question-text" style={{ margin: 0 }}>
                                {currentQuestion.question_text}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Options Grid */}
                    <div className="battle-options-grid">
                        {currentQuestion.options.map((opt, idx) => {
                            const isSelected = selectedAnswer === idx
                            const isCorrect = idx === currentQuestion.correct_option

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

                    {/* Bottom toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <button
                            type="button"
                            onClick={() => {
                                resetTimers()
                                setStarted(false)
                                setFinished(false)
                            }}
                            className="btn-dark-outline"
                            style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--accent-red)', borderColor: 'rgba(232, 64, 64, 0.3)', borderRadius: '8px' }}
                        >
                            Akhiri Latihan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
