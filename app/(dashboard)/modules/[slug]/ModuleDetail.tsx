'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Module, UserModule, Question, LessonStep } from '@/types'
import { ArrowLeft, CheckCircle, ChevronRight, Zap, BookOpen, Clock, Flame, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { classHasBonusForCategory, CLASS_BONUS_PERCENT } from '@/lib/game/xp'

interface ModuleDetailProps {
    module: Module
    userModule: UserModule | null
    completedFromLog?: boolean
    questions: Question[]
    userId: string
    avatarClass: string
}

interface CompletionFeedback {
    alreadyClaimed: boolean
    baseAward: number
    bonusAmount: number
    totalAwarded: number
    leveledUp: boolean
    newLevel: number | null
}

export default function ModuleDetail({ module, userModule, completedFromLog = false, questions, userId, avatarClass }: ModuleDetailProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
    const [quizSubmitted, setQuizSubmitted] = useState(false)
    const [completed, setCompleted] = useState(Boolean(userModule?.status === 'completed' || completedFromLog))
    const [loading, setLoading] = useState(false)
    const [completionFeedback, setCompletionFeedback] = useState<CompletionFeedback | null>(null)
    const hasClassBonus = classHasBonusForCategory(avatarClass, module.category)
    const bonusXp = hasClassBonus ? Math.floor(module.xp_reward * CLASS_BONUS_PERCENT / 100) : 0

    const content = module.content as LessonStep[] | null
    const steps = content || []
    const totalSteps = steps.length
    const progress = totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0

    const currentQuestions = questions.filter((_, i) => i < 5) // Show 5 quiz questions

    async function handleComplete() {
        if (loading || completed) return
        setLoading(true)
        const supabase = createClient()

        // Server-authoritative completion + XP claim (idempotent)
        const xpRes = await fetch('/api/xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'complete_module', moduleId: module.id }),
        })
        const xpData = await xpRes.json()
        if (!xpRes.ok || !xpData?.success) {
            setLoading(false)
            return
        }

        setCompletionFeedback({
            alreadyClaimed: Boolean(xpData.alreadyClaimed),
            baseAward: Number(xpData.baseAward ?? 0),
            bonusAmount: Number(xpData.bonusAmount ?? 0),
            totalAwarded: Number(xpData.totalAwarded ?? 0),
            leveledUp: Boolean(xpData.leveledUp),
            newLevel: xpData.newLevel ? Number(xpData.newLevel) : null,
        })

        // Fetch updated profile to trigger XP and Level UI reactivity
        const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (updatedProfile) {
            // Import and use the user store directly if not already injected
            const { useUserStore } = await import('@/stores/userStore')
            useUserStore.getState().setProfile(updatedProfile)
        }

        setCompleted(true)
        setLoading(false)
    }

    function handleAnswer(questionId: string, idx: number) {
        if (quizSubmitted) return
        setQuizAnswers(prev => ({ ...prev, [questionId]: idx }))
    }

    function handleSubmitQuiz() {
        setQuizSubmitted(true)
    }

    const CATEGORY_COLORS: Record<string, string> = {
        coding: 'var(--accent-cyan)', design: 'var(--accent-gold)',
        productivity: 'var(--accent-green)', business: 'var(--accent-red)',
    }
    const catColor = CATEGORY_COLORS[module.category] || 'var(--accent-cyan)'

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
            {/* Back */}
            <button
                onClick={() => {
                    router.push(`/modules?refresh=${Date.now()}`)
                }}
                style={{
                display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)',
                fontSize: '13px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '20px',
            }}>
                <ArrowLeft size={14} /> Kembali ke Modul
            </button>

            {/* Header */}
            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <span style={{
                            fontSize: '11px', fontWeight: 600, color: catColor, fontFamily: 'var(--font-heading)',
                            textTransform: 'uppercase', marginBottom: '6px', display: 'block',
                        }}>
                            {module.category}
                        </span>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
                            {module.title}
                        </h1>
                        {module.description && (
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{module.description}</p>
                        )}
                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                <Clock size={12} /> {module.duration_minutes} menit
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-gold)' }}>
                                <Zap size={12} /> +{module.xp_reward} XP
                            </span>
                            {hasClassBonus && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>
                                    <Flame size={11} /> +{bonusXp} bonus
                                </span>
                            )}
                        </div>
                    </div>
                    {completed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)' }}>
                            <CheckCircle size={20} />
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>Selesai</span>
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Progress Belajar</span>
                        <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>{completed ? 100 : progress}%</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                            animate={{ width: `${completed ? 100 : progress}%` }}
                            style={{ height: '100%', backgroundColor: 'var(--accent-cyan)' }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>

            {/* Content / Steps */}
            {steps.length > 0 ? (
                <div>
                    {/* Step Navigation */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        {steps.map((step, i) => (
                            <button key={i} onClick={() => setCurrentStep(i)} style={{
                                width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer',
                                backgroundColor: i === currentStep ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                                border: `1px solid ${i <= currentStep ? 'var(--accent-cyan)' : 'var(--border)'}`,
                                color: i === currentStep ? 'var(--bg-primary)' : i < currentStep ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 700,
                            }}>
                                {i < currentStep ? '✓' : i + 1}
                            </button>
                        ))}
                    </div>

                    {/* Current Step Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="card"
                            style={{ padding: '24px', marginBottom: '20px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                                    LANGKAH {currentStep + 1}/{steps.length}
                                </span>
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
                                {steps[currentStep].title}
                            </h2>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                {steps[currentStep].content}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button
                            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                            disabled={currentStep === 0}
                            style={{
                                padding: '10px 20px', borderRadius: '4px', cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                                backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                color: currentStep === 0 ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: '13px',
                            }}
                        >
                            ← Sebelumnya
                        </button>
                        {currentStep < steps.length - 1 ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setCurrentStep(s => s + 1)}
                                style={{
                                    padding: '10px 20px', borderRadius: '4px', cursor: 'pointer',
                                    backgroundColor: 'var(--accent-cyan)', border: 'none',
                                    color: 'var(--bg-primary)', fontSize: '13px', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                }}
                            >
                                Selanjutnya <ChevronRight size={14} />
                            </motion.button>
                        ) : !completed ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={handleComplete}
                                disabled={loading}
                                style={{
                                    padding: '10px 24px', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer',
                                    backgroundColor: 'var(--accent-green)', border: 'none',
                                    color: 'var(--bg-primary)', fontSize: '13px', fontWeight: 700,
                                    fontFamily: 'var(--font-heading)',
                                }}
                            >
                                {loading ? 'Menyimpan...' : `✓ SELESAIKAN & DAPAT ${module.xp_reward}${hasClassBonus ? ` + ${bonusXp} BONUS` : ''} XP`}
                            </motion.button>
                        ) : (
                            <div style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle size={16} /> Modul Selesai!
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* No content — show quiz only */
                <div>
                    {questions.length > 0 ? (
                        <div className="card" style={{ padding: '24px' }}>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                                Quiz — {module.title}
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {currentQuestions.map((q, qi) => {
                                    const selected = quizAnswers[q.id]
                                    const isCorrect = selected === q.correct_option
                                    return (
                                        <div key={q.id}>
                                            <p style={{ fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>
                                                {qi + 1}. {q.question_text}
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {q.options.map((opt, idx) => {
                                                    let optBg = 'var(--bg-tertiary)'
                                                    let optBorder = 'var(--border)'
                                                    if (quizSubmitted) {
                                                        if (idx === q.correct_option) { optBg = 'rgba(34,197,94,0.1)'; optBorder = 'var(--accent-green)' }
                                                        else if (idx === selected && !isCorrect) { optBg = 'rgba(232,64,64,0.1)'; optBorder = 'var(--accent-red)' }
                                                    } else if (idx === selected) {
                                                        optBg = 'rgba(0,212,255,0.1)'; optBorder = 'var(--accent-cyan)'
                                                    }
                                                    return (
                                                        <button key={idx} onClick={() => handleAnswer(q.id, idx)} style={{
                                                            textAlign: 'left', padding: '10px 12px', borderRadius: '4px',
                                                            backgroundColor: optBg, border: `1px solid ${optBorder}`,
                                                            color: 'var(--text-primary)', fontSize: '13px', cursor: quizSubmitted ? 'default' : 'pointer',
                                                        }}>
                                                            {String.fromCharCode(65 + idx)}. {opt}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            {quizSubmitted && q.explanation && (
                                                <div style={{ marginTop: '8px', padding: '8px', borderRadius: '4px', backgroundColor: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    💡 {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            {!quizSubmitted ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={handleSubmitQuiz}
                                    style={{
                                        marginTop: '20px', padding: '10px 24px', borderRadius: '4px',
                                        backgroundColor: 'var(--accent-gold)', border: 'none',
                                        color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                    }}
                                >
                                    SUBMIT JAWABAN
                                </motion.button>
                            ) : !completed && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={handleComplete}
                                    disabled={loading}
                                    style={{
                                        marginTop: '16px', padding: '10px 24px', borderRadius: '4px',
                                        backgroundColor: 'var(--accent-green)', border: 'none',
                                        color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                    }}
                                >
                                    {loading ? 'Menyimpan...' : `✓ SELESAIKAN & DAPAT ${module.xp_reward}${hasClassBonus ? ` + ${bonusXp} BONUS` : ''} XP`}
                                </motion.button>
                            )}
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                            <p>Konten modul sedang dipersiapkan</p>
                            {!completed && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={handleComplete}
                                    disabled={loading}
                                    style={{
                                        marginTop: '16px', padding: '10px 24px', borderRadius: '4px',
                                        backgroundColor: 'var(--accent-gold)', border: 'none',
                                        color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                    }}
                                >
                                    Tandai Selesai (+{module.xp_reward}{hasClassBonus ? ` + ${bonusXp} bonus` : ''} XP)
                                </motion.button>
                            )}
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {completionFeedback && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.65)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px',
                            zIndex: 1000,
                        }}
                        onClick={() => setCompletionFeedback(null)}
                    >
                        <motion.div
                            initial={{ y: 16, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 10, opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="card"
                            style={{
                                width: '100%',
                                maxWidth: '420px',
                                padding: '20px',
                                border: '1px solid rgba(34, 197, 94, 0.35)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800, color: 'var(--accent-green)' }}>
                                    {completionFeedback.alreadyClaimed ? 'Modul Sudah Pernah Selesai' : 'Modul Berhasil Diselesaikan'}
                                </h3>
                                <button
                                    onClick={() => setCompletionFeedback(null)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '8px', marginBottom: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Base XP</span>
                                    <span style={{ fontWeight: 700 }}>+{completionFeedback.baseAward}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Bonus Class</span>
                                    <span style={{ fontWeight: 700, color: completionFeedback.bonusAmount > 0 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                                        +{completionFeedback.bonusAmount}
                                    </span>
                                </div>
                                <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Total XP</span>
                                    <span style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>+{completionFeedback.totalAwarded}</span>
                                </div>
                            </div>

                            {completionFeedback.leveledUp && completionFeedback.newLevel && (
                                <div style={{
                                    marginBottom: '14px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(245,197,66,0.4)',
                                    backgroundColor: 'rgba(245,197,66,0.1)',
                                    fontSize: '13px',
                                    color: 'var(--accent-gold)',
                                    fontWeight: 700,
                                }}>
                                    Level up! Kamu sekarang Level {completionFeedback.newLevel}
                                </div>
                            )}

                            <button
                                onClick={() => setCompletionFeedback(null)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: 'var(--accent-cyan)',
                                    color: 'var(--bg-primary)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Oke, lanjut
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
