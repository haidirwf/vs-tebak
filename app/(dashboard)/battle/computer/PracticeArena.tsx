'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sword } from 'lucide-react'
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
                                padding: '10px 20px', borderRadius: '4px',
                                cursor: availableQuestions.length > 0 ? 'pointer' : 'not-allowed',
                                backgroundColor: 'var(--accent-gold)', border: 'none',
                                color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700,
                                opacity: availableQuestions.length > 0 ? 1 : 0.5,
                            }}
                        >
                            MULAI LATIHAN
                        </motion.button>
                    </div>
                </div>
                </div>
            </div>
        )
    }

    if (finished) {
        const title = result === 'win' ? 'KAMU MENANG!' : result === 'lose' ? 'KAMU KALAH' : 'SERI'
        const icon = result === 'win' ? '🏆' : result === 'lose' ? '💀' : '🤝'
        const color = result === 'win' ? 'var(--accent-gold)' : result === 'lose' ? 'var(--accent-red)' : 'var(--accent-cyan)'
        return (
            <div className="responsive-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '100%', maxWidth: '760px', padding: '28px', textAlign: 'center' }}>
                    <div style={{ fontSize: '56px' }}>{icon}</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', fontWeight: 700, color, marginBottom: '10px' }}>{title}</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '34px', marginBottom: '18px' }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: 'var(--accent-cyan)' }}>{myScore}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kamu</div>
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>vs</div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: 'var(--text-secondary)' }}>{botScore}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Computer</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setStarted(false)
                                setFinished(false)
                            }}
                            style={{
                                padding: '10px 18px', borderRadius: '4px', cursor: 'pointer',
                                backgroundColor: 'transparent', border: '1px solid var(--border)',
                                color: 'var(--text-secondary)', fontSize: '13px',
                            }}
                        >
                            Atur Ulang
                        </button>
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={startPractice}
                            style={{
                                padding: '10px 18px', borderRadius: '4px', cursor: 'pointer',
                                backgroundColor: 'var(--accent-gold)', border: 'none',
                                color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700,
                            }}
                        >
                            MAIN LAGI
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        )
    }

    if (!currentQuestion) {
        return (
            <div className="responsive-page" style={{ maxWidth: '760px', margin: '0 auto', padding: '24px' }}>
                <div className="card" style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Tidak ada soal untuk latihan.
                </div>
            </div>
        )
    }

    const timerPercent = (timeLeft / QUESTION_TIME) * 100
    const timerColor = timeLeft > 8 ? 'var(--accent-green)' : timeLeft > 4 ? 'var(--accent-gold)' : 'var(--accent-red)'

    return (
        <div className="responsive-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', width: '100%', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '760px' }}>
            <div className="card" style={{ padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kamu</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: 'var(--accent-cyan)' }}>{myScore}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0 16px' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {currentQ + 1}/{questions.length}
                    </div>
                    <Sword size={20} style={{ color: 'var(--accent-red)', margin: '4px auto' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Computer {botAnswered ? '✓' : ''}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: 'var(--text-secondary)' }}>{botScore}</div>
                </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Waktu tersisa</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: timerColor, fontSize: '16px' }}>{timeLeft}s</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div animate={{ width: `${timerPercent}%` }} transition={{ duration: 1 }} style={{ height: '100%', backgroundColor: timerColor }} />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ padding: '24px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>SOAL {currentQ + 1}</div>
                    <p style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.6 }}>{currentQuestion.question_text}</p>
                </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentQuestion.options.map((opt, idx) => {
                    let bg = 'var(--bg-secondary)'
                    let border = 'var(--border)'
                    if (showAnswer) {
                        if (idx === currentQuestion.correct_option) {
                            bg = 'rgba(34,197,94,0.15)'
                            border = 'var(--accent-green)'
                        } else if (idx === selectedAnswer) {
                            bg = 'rgba(232,64,64,0.15)'
                            border = 'var(--accent-red)'
                        }
                    } else if (idx === selectedAnswer) {
                        bg = 'rgba(0,212,255,0.1)'
                        border = 'var(--accent-cyan)'
                    }
                    return (
                        <motion.button
                            key={idx}
                            type="button"
                            whileHover={selectedAnswer === null ? { x: 4 } : {}}
                            onClick={() => handleAnswer(idx)}
                            style={{
                                textAlign: 'left', padding: '14px 16px', borderRadius: '4px',
                                cursor: selectedAnswer !== null ? 'default' : 'pointer',
                                backgroundColor: bg, border: `1px solid ${border}`,
                                color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500,
                            }}
                        >
                            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginRight: '10px', color: 'var(--text-secondary)' }}>
                                {String.fromCharCode(65 + idx)}.
                            </span>
                            {opt}
                        </motion.button>
                    )
                })}
            </div>
            </div>
        </div>
    )
}
