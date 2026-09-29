'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sword, CheckCircle, XCircle, Flame, Swords } from 'lucide-react'
import { Question } from '@/types'

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

export default function PracticeArena({ questionPool }: PracticeArenaProps) {
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
    const [combatText, setCombatText] = useState<{
        target: 'me' | 'bot'
        text: string
        type: 'damage' | 'crit' | 'miss'
    } | null>(null)
    const [battleLog, setBattleLog] = useState('⚡ Arena Latihan RPG aktif. Jawab pertanyaan untuk menyerang AI Sentinel!')

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
            setMyHp(prev => Math.max(10, prev - 10))
            setBotMp(mp => Math.min(100, mp + 25))
            setBotAnimation('attack')
            setMeAnimation('hurt')
            setCombatText({ target: 'me', text: '⚡ BOT HIT! -10 HP', type: 'damage' })
            setBattleLog('🤖 AI Sentinel melancarkan serangan energi kilat (-10 HP)!')

            setTimeout(() => {
                setBotAnimation('idle')
                setMeAnimation('idle')
            }, 600)
            setTimeout(() => setCombatText(null), 1100)
        }, botDelayMs)
    }

    function endGame(finalMy: number, finalBot: number) {
        resetTimers()
        setFinished(true)
        if (finalMy > finalBot) setResult('win')
        else if (finalMy < finalBot) setResult('lose')
        else setResult('draw')
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
                    setMyHp(hp => Math.max(10, hp - 15))
                    setCombatText({ target: 'me', text: '⏰ TIMEOUT! -15 HP', type: 'miss' })
                    setMeAnimation('hurt')
                    setBattleLog('⌛ Waktu habis! Kamu terkena penalti giliran dan kehilangan 15 HP.')
                    setTimeout(() => setMeAnimation('idle'), 600)
                    setTimeout(() => setCombatText(null), 1100)

                    setTimeout(() => {
                        goNextQuestion(myScore, botScore)
                    }, 1200)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => resetTimers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, finished, currentQ, currentQuestion])

    function handleAnswer(idx: number) {
        if (!currentQuestion || showAnswer || selectedAnswer !== null) return
        resetTimers()
        setSelectedAnswer(idx)
        setShowAnswer(true)

        const isCorrect = idx === currentQuestion.correct_option
        const bonus = Math.floor(timeLeft * 0.5)
        const updatedMyScore = myScore + (isCorrect ? 10 + bonus : 0)
        setMyScore(updatedMyScore)

        const hpDamage = 12
        if (isCorrect) {
            const nextCombo = comboCount + 1
            setComboCount(nextCombo)
            const isCrit = nextCombo >= 2
            const effectiveDamage = isCrit ? hpDamage + 10 : hpDamage
            setBotHp(prev => Math.max(10, prev - effectiveDamage))
            setMyMp(mp => Math.min(100, mp + 25))
            setCombatText({
                target: 'bot',
                text: isCrit ? `💥 CRIT! -${effectiveDamage} HP` : `⚔️ -${effectiveDamage} HP`,
                type: isCrit ? 'crit' : 'damage',
            })
            setMeAnimation('attack')
            setBotAnimation('hurt')
            setBattleLog(
                isCrit
                    ? `🔥 COMBO x${nextCombo}! Serangan kritikal Hero mendarat telak (-${effectiveDamage} HP)!`
                    : `⚔️ Serangan Hero menembus pertahanan AI Sentinel (-${effectiveDamage} HP)!`
            )
            setTimeout(() => {
                setMeAnimation('idle')
                setBotAnimation('idle')
            }, 600)
            setTimeout(() => setCombatText(null), 1100)
        } else {
            setComboCount(0)
            setMyHp(prev => Math.max(10, prev - hpDamage))
            setCombatText({
                target: 'me',
                text: `❌ MISS! -${hpDamage} HP`,
                type: 'miss',
            })
            setMeAnimation('hurt')
            setBattleLog(`🛡️ Serangan meleset! AI Sentinel membalas dengan serangan balik (-${hpDamage} HP).`)
            setTimeout(() => setMeAnimation('idle'), 600)
            setTimeout(() => setCombatText(null), 1100)
        }

        setTimeout(() => {
            goNextQuestion(updatedMyScore, botScore)
        }, 1200)
    }

    if (!started) {
        return (
            <div className="responsive-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
                <div style={{ width: '100%', maxWidth: '900px' }}>
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
                        🤖 Battle vs Computer
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
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
                        <p style={{ color: 'var(--accent-red)', fontSize: '13px', marginBottom: '12px' }}>
                            Soal untuk kategori ini belum tersedia.
                        </p>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
                            Soal tersedia: {availableQuestions.length}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => router.push('/battle')}
                            style={{
                                padding: '10px 20px', borderRadius: '4px', cursor: 'pointer',
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
            <div className="responsive-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
                <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="product-demo-panel" style={{ width: '100%', maxWidth: '720px', padding: '28px', textAlign: 'center' }}>
                    <div style={{ fontSize: '56px', marginBottom: '8px' }}>{icon}</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color, marginBottom: '10px' }}>{title}</h2>
                    <p style={{ color: 'var(--color-fog)', fontSize: '14px', marginBottom: '24px' }}>
                        {result === 'win' ? 'Luar biasa! Kamu berhasil menaklukkan Computer AI.' : result === 'lose' ? 'Tetap semangat! Coba lagi untuk mengasah ketepatan analisismu.' : 'Pertandingan sengit! Skor kalian seimbang.'}
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
                                ⚔️
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

                        {/* Bot */}
                        <div className="battle-versus-col battle-versus-col-right">
                            <div className="battle-versus-info">
                                <div className="battle-player-name">Computer AI</div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#00d4ff', lineHeight: 1.2 }}>
                                    {botScore} <span style={{ fontSize: '10px', color: 'var(--color-steel)' }}>PTS</span>
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

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setStarted(false)
                                setFinished(false)
                            }}
                            className="btn-dark-outline"
                            style={{ padding: '12px 24px', fontSize: '13px' }}
                        >
                            Atur Ulang
                        </button>
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={startPractice}
                            className="btn-signal-orange battle-finish-btn"
                            style={{ padding: '12px 28px', fontSize: '13px', fontWeight: 700 }}
                        >
                            <Swords size={16} /> Main Lagi
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
        <div className="responsive-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                    borderRadius: '8px',
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
                                ⚔️
                            </motion.div>
                            <div className="battle-versus-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                                    <span className="battle-player-name" title="Kamu (Hero)">
                                        Kamu
                                    </span>
                                    <span
                                        className="battle-level-badge"
                                        style={{
                                            backgroundColor: 'rgba(245, 197, 66, 0.15)',
                                            border: '1px solid rgba(245, 197, 66, 0.4)',
                                            color: 'var(--color-signal-orange)',
                                        }}
                                    >
                                        LV.12
                                    </span>
                                </div>
                                <div className="battle-school-name">
                                    Pelajar Hebat · Warrior
                                </div>
                                {/* Health / Score Bar */}
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
                                            borderRadius: '4px',
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
                                {currentQ + 1}/{questions.length}
                            </span>
                        </div>

                        {/* Player 2 (Computer Bot) */}
                        <div className="battle-versus-col battle-versus-col-right" style={{ position: 'relative' }}>
                            {/* Floating Combat Text for Bot */}
                            <AnimatePresence>
                                {combatText?.target === 'bot' && (
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
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', minWidth: 0 }}>
                                    <span
                                        className="battle-level-badge"
                                        style={{
                                            backgroundColor: 'rgba(0, 212, 255, 0.15)',
                                            border: '1px solid rgba(0, 212, 255, 0.4)',
                                            color: '#00d4ff',
                                        }}
                                    >
                                        LV.14
                                    </span>
                                    <span className="battle-player-name" title="Computer AI">
                                        Computer AI
                                    </span>
                                </div>
                                <div className="battle-school-name">
                                    SMK Cybernetics · Bot
                                </div>
                                {/* Health / Score Bar */}
                                <div className="battle-hp-bar-wrapper" style={{ justifyContent: 'flex-end' }}>
                                    <span className="battle-score-text" style={{ color: '#00d4ff', fontFamily: 'var(--font-heading)' }}>
                                        {botScore} <span style={{ fontSize: '9px', fontWeight: 500, color: 'var(--color-steel)' }}>PTS</span>
                                    </span>
                                    <div className="battle-hp-bar-outer">
                                        <motion.div
                                            initial={{ width: '100%' }}
                                            animate={{ width: `${botHpPercent}%` }}
                                            transition={{ duration: 0.4 }}
                                            style={{
                                                height: '100%',
                                                backgroundColor: botHpPercent > 50 ? '#00d4ff' : botHpPercent > 25 ? 'var(--color-signal-orange)' : 'var(--accent-red)',
                                                marginLeft: 'auto',
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Mana / Special Gauge */}
                                <div className="battle-mp-row" style={{ justifyContent: 'flex-end' }}>
                                    <span style={{ fontSize: '9px', color: '#00d4ff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                        MP {botMp}%
                                    </span>
                                    <div
                                        style={{
                                            flex: 1,
                                            maxWidth: '120px',
                                            height: '3px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <motion.div
                                            animate={{ width: `${botMp}%` }}
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
                                    <span className="battle-player-status" style={{ fontSize: '9.5px', color: botAnswered ? 'var(--color-signal-orange)' : 'var(--color-steel)' }}>
                                        {botAnswered ? '⚡ Sudah Menjawab!' : '🤔 Menganalisis...'}
                                    </span>
                                </div>
                            </div>
                            <motion.div
                                className="battle-versus-avatar"
                                animate={
                                    botAnimation === 'attack'
                                        ? { x: [0, -18, 0], scale: [1, 1.15, 1] }
                                        : botAnimation === 'hurt'
                                        ? { x: [6, -6, 4, -4, 0], scale: [1, 0.95, 1] }
                                        : { x: 0, scale: 1 }
                                }
                                transition={{ duration: 0.35 }}
                                style={{
                                    backgroundColor: botAnimation === 'hurt' ? 'rgba(232, 64, 64, 0.25)' : 'rgba(0, 212, 255, 0.1)',
                                    border: `1px solid ${botAnimation === 'hurt' ? 'var(--accent-red)' : 'rgba(0, 212, 255, 0.35)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: botAnimation === 'attack' ? '0 0 24px rgba(0, 212, 255, 0.6)' : botAnimation === 'hurt' ? '0 0 24px rgba(232, 64, 64, 0.6)' : '0 0 16px rgba(0, 212, 255, 0.2)',
                                }}
                            >
                                🤖
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
                            marginBottom: '14px',
                            fontSize: '11.5px',
                            lineHeight: 1.35,
                            color: 'var(--color-fog)',
                            textAlign: 'center',
                            width: '100%',
                            boxSizing: 'border-box',
                            wordBreak: 'break-word',
                        }}
                    >
                        <span>{battleLog}</span>
                    </motion.div>

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
