'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Module, UserModule, Question, LessonStep } from '@/types'
import { ArrowLeft, CheckCircle, ChevronRight, Zap, BookOpen, Clock, Flame, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { classHasBonusForCategory, CLASS_BONUS_PERCENT } from '@/lib/game/xp'

interface ModuleDetailProps {
    module: Module
    userModule: UserModule | null
    completedFromLog?: boolean
    questions: Question[]
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

const MAX_QUIZ_QUESTIONS = 5

const CATEGORY_COLORS: Record<string, string> = {
    coding: 'var(--accent-cyan)',
    design: 'var(--accent-gold)',
    productivity: 'var(--accent-green)',
    business: 'var(--accent-red)',
}

const COMPLETE_CTA_STYLE: CSSProperties = {
    padding: '10px 24px',
    borderRadius: '4px',
    border: 'none',
    color: 'var(--bg-primary)',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: 'var(--font-heading)',
}

const QUIZ_PRIMARY_CTA_STYLE: CSSProperties = {
    padding: '10px 24px',
    borderRadius: '4px',
    border: 'none',
    color: 'var(--bg-primary)',
    fontFamily: 'var(--font-heading)',
    fontSize: '14px',
    fontWeight: 700,
}

function isLikelyUrl(value: string): boolean {
    try {
        const parsed = new URL(value)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}

function extractYouTubeVideoId(raw: string | null | undefined): string | null {
    if (!raw) return null

    const value = raw.trim()
    if (!value) return null

    try {
        const url = new URL(value)
        const host = url.hostname.replace(/^www\./, '')

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            const videoId = url.searchParams.get('v')
            if (videoId) return videoId
            if (url.pathname.startsWith('/embed/')) {
                const id = url.pathname.split('/embed/')[1]?.split('/')[0]
                if (id) return id
            }
        }

        if (host === 'youtu.be') {
            const id = url.pathname.slice(1).split('/')[0]
            if (id) return id
        }
    } catch {
        // Allow plain video id as shorthand.
        if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
            return value
        }
    }

    return null
}

function getYouTubeEmbedUrl(raw: string | null | undefined): string | null {
    const id = extractYouTubeVideoId(raw)
    if (!id) return null
    return `https://www.youtube-nocookie.com/embed/${id}`
}

function stableHash(input: string): number {
    let hash = 2166136261
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i)
        hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
}

function createSeededRng(seed: number): () => number {
    let state = seed >>> 0
    return () => {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0
        return state / 4294967296
    }
}

function shuffleModuleQuestionOptions(question: Question, seed: string): Question {
    const pairs = question.options.map((opt, idx) => ({ opt, idx }))
    const rng = createSeededRng(stableHash(seed))

    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        const tmp = pairs[i]
        pairs[i] = pairs[j]
        pairs[j] = tmp
    }

    const options = pairs.map((pair) => pair.opt)
    const correctOption = pairs.findIndex((pair) => pair.idx === question.correct_option)

    return {
        ...question,
        options,
        correct_option: correctOption >= 0 ? correctOption : question.correct_option,
    }
}

function getQuestionDifficultyWeight(rawDifficulty: string | null | undefined): number {
    const difficulty = (rawDifficulty || '').toLowerCase()
    if (difficulty === 'hard' || difficulty === 'advanced') return 3
    if (difficulty === 'medium' || difficulty === 'intermediate') return 2
    if (difficulty === 'easy' || difficulty === 'beginner') return 1
    return 0
}

function prioritizeModuleQuestions(questions: Question[], moduleId: string): Question[] {
    const withPriority = questions.map((question, idx) => {
        const textLength = (question.question_text || '').trim().length
        const avgOptionLength = question.options.length > 0
            ? question.options.reduce((sum, option) => sum + option.trim().length, 0) / question.options.length
            : 0
        const difficultyWeight = getQuestionDifficultyWeight(question.difficulty)
        const seedTieBreaker = stableHash(`${moduleId}:${question.id}:${idx}`) / 4294967296

        return {
            question,
            difficultyWeight,
            textLength,
            avgOptionLength,
            seedTieBreaker,
        }
    })

    withPriority.sort((a, b) => {
        if (b.difficultyWeight !== a.difficultyWeight) return b.difficultyWeight - a.difficultyWeight
        if (b.textLength !== a.textLength) return b.textLength - a.textLength
        if (b.avgOptionLength !== a.avgOptionLength) return b.avgOptionLength - a.avgOptionLength
        return b.seedTieBreaker - a.seedTieBreaker
    })

    return withPriority.map((item) => item.question)
}

function buildAutoLessonSteps(module: Module): LessonStep[] {
    const categoryGuide: Record<string, string> = {
        coding: 'Materi ini membahas konsep teknis inti, pola implementasi, dan best practice agar kamu bisa langsung praktik.',
        design: 'Materi ini membahas prinsip desain, proses berpikir desain, dan cara membangun keputusan visual yang kuat.',
        productivity: 'Materi ini fokus ke pola kerja efektif, manajemen energi, dan sistem kebiasaan untuk hasil yang konsisten.',
        business: 'Materi ini membahas mindset bisnis, strategi eksekusi, dan cara mengukur dampak dari keputusanmu.',
    }

    return [
        {
            id: 'auto-intro',
            title: `Pengantar: ${module.title}`,
            type: 'text',
            content: module.description || `Di modul ini kamu akan memahami dasar-dasar ${module.title} secara terstruktur.`,
        },
        {
            id: 'auto-konsep',
            title: 'Konsep Inti Materi',
            type: 'text',
            content: categoryGuide[module.category] || 'Pelajari konsep inti materi, lalu pahami alur logika sebelum lanjut ke praktik.',
        },
        {
            id: 'auto-praktik',
            title: 'Penerapan Praktis',
            type: 'text',
            content: 'Setelah memahami konsep, coba terapkan pada studi kasus sederhana. Fokus ke alasan di balik setiap langkah yang kamu ambil.',
        },
    ]
}

function ensureLessonDepth(module: Module, rawSteps: LessonStep[]): LessonStep[] {
    const textCount = rawSteps.filter((step) => step.type === 'text').length
    if (textCount >= 2) return rawSteps
    return [...buildAutoLessonSteps(module), ...rawSteps]
}

export default function ModuleDetail({ module, userModule, completedFromLog = false, questions, avatarClass }: ModuleDetailProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [phase, setPhase] = useState<'lesson' | 'quiz'>('lesson')
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
    const [quizSubmitted, setQuizSubmitted] = useState(false)
    const [completed, setCompleted] = useState(Boolean(userModule?.status === 'completed' || completedFromLog))
    const [loading, setLoading] = useState(false)
    const [completionFeedback, setCompletionFeedback] = useState<CompletionFeedback | null>(null)
    const hasClassBonus = classHasBonusForCategory(avatarClass, module.category)
    const bonusXp = hasClassBonus ? Math.floor(module.xp_reward * CLASS_BONUS_PERCENT / 100) : 0

    const content = module.content as LessonStep[] | null
    const fallbackSteps: LessonStep[] = [
        {
            id: 'intro',
            title: 'Pengantar Materi',
            type: 'text',
            content: module.description || 'Materi belum tersedia detailnya. Baca pengantar ini lalu lanjut ke quiz.',
        },
    ]
    const baseSteps = content && content.length > 0 ? content : fallbackSteps
    const steps = ensureLessonDepth(module, baseSteps)
    const totalSteps = steps.length
    const currentQuestions = useMemo(() => {
        const prioritized = prioritizeModuleQuestions(questions, module.id)
        return prioritized
            .slice(0, MAX_QUIZ_QUESTIONS)
            .map((question) => shuffleModuleQuestionOptions(question, `${module.id}:${question.id}`))
    }, [questions, module.id])
    const hasQuiz = currentQuestions.length > 0
    const allQuizAnswered = currentQuestions.every((q) => typeof quizAnswers[q.id] === 'number')
    const canComplete = !hasQuiz || (quizSubmitted && allQuizAnswered)
    const lessonProgress = Math.round(((currentStep + 1) / totalSteps) * 100)
    const progress = completed
        ? 100
        : phase === 'lesson'
            ? lessonProgress
            : (quizSubmitted ? 95 : 85)

    async function handleComplete() {
        if (loading || completed || !canComplete) return
        setLoading(true)

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

        if (typeof xpData.newXp === 'number') {
            const { useUserStore } = await import('@/stores/userStore')
            useUserStore.getState().updateXP(xpData.newXp, {
                newStreak: typeof xpData.streak === 'number' ? xpData.streak : undefined,
                earnedBadges: Array.isArray(xpData.earnedBadges) ? xpData.earnedBadges : undefined,
            })
        }

        setCompleted(true)
        setLoading(false)
    }

    function handleAnswer(questionId: string, idx: number) {
        if (quizSubmitted) return
        setQuizAnswers(prev => ({ ...prev, [questionId]: idx }))
    }

    function handleSubmitQuiz() {
        if (!allQuizAnswered) return
        setQuizSubmitted(true)
    }

    const catColor = CATEGORY_COLORS[module.category] || 'var(--accent-cyan)'
    const displayedProgress = completed ? 100 : progress
    const completionRewardText = `${module.xp_reward}${hasClassBonus ? ` + ${bonusXp} BONUS` : ''}`
    const completionCtaText = loading ? 'Menyimpan...' : `✓ SELESAIKAN & DAPAT ${completionRewardText} XP`
    const activeStep = steps[currentStep]
    const videoEmbedUrl = activeStep?.type === 'video' ? getYouTubeEmbedUrl(activeStep.content) : null
    const videoId = activeStep?.type === 'video' ? extractYouTubeVideoId(activeStep.content) : null
    const videoRawContent = activeStep?.type === 'video' ? (activeStep.content || '').trim() : ''
    const youtubeWatchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : videoRawContent
    const showVideoText = activeStep?.type === 'video' && videoRawContent.length > 0 && !isLikelyUrl(videoRawContent)

    function getQuizOptionVisual(idx: number, selected: number | undefined, isCorrect: boolean, correctOption: number) {
        let backgroundColor = 'var(--bg-tertiary)'
        let borderColor = 'var(--border)'

        if (quizSubmitted) {
            if (idx === correctOption) {
                backgroundColor = 'rgba(34,197,94,0.1)'
                borderColor = 'var(--accent-green)'
            } else if (idx === selected && !isCorrect) {
                backgroundColor = 'rgba(232,64,64,0.1)'
                borderColor = 'var(--accent-red)'
            }
        } else if (idx === selected) {
            backgroundColor = 'rgba(0,212,255,0.1)'
            borderColor = 'var(--accent-cyan)'
        }

        return { backgroundColor, borderColor }
    }

    return (
        <div
            style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '24px',
                paddingBottom: '24px',
            }}
        >
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
                        <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>{displayedProgress}%</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                            animate={{ width: `${displayedProgress}%` }}
                            style={{ height: '100%', backgroundColor: 'var(--accent-cyan)' }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>

            {/* Content / Steps */}
            {phase === 'lesson' ? (
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
                                {activeStep.title}
                            </h2>
                            {activeStep.type === 'video' ? (
                                <div>
                                    <div
                                        style={{
                                            width: '100%',
                                            aspectRatio: '16 / 9',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            border: '1px solid var(--border)',
                                            backgroundColor: 'var(--bg-tertiary)',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        {videoEmbedUrl ? (
                                            <iframe
                                                src={`${videoEmbedUrl}?rel=0&modestbranding=1&playsinline=0&fs=1`}
                                                title={activeStep.title}
                                                allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                                referrerPolicy="strict-origin-when-cross-origin"
                                                loading="lazy"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    border: 'none',
                                                    display: 'block',
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                    color: 'var(--text-muted)',
                                                    fontSize: '13px',
                                                    textAlign: 'center',
                                                    padding: '16px',
                                                }}
                                            >
                                                Tempel URL YouTube pada konten step video untuk menampilkan embed.
                                            </div>
                                        )}
                                    </div>
                                    {videoEmbedUrl && (
                                        <a
                                            href={youtubeWatchUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginBottom: '10px',
                                                fontSize: '12px',
                                                color: 'var(--accent-cyan)',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            Buka di YouTube
                                        </a>
                                    )}
                                    {showVideoText && (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                            {videoRawContent}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                    {activeStep.content}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div
                        className="module-nav-floating"
                        style={{
                            bottom: '10px',
                            zIndex: 30,
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'color-mix(in srgb, var(--bg-primary) 92%, transparent)',
                            backdropFilter: 'blur(6px)',
                        }}
                    >
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
                        ) : hasQuiz ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setPhase('quiz')}
                                style={{
                                    padding: '10px 24px', borderRadius: '4px', cursor: 'pointer',
                                    backgroundColor: 'var(--accent-gold)', border: 'none',
                                    color: 'var(--bg-primary)', fontSize: '13px', fontWeight: 700,
                                    fontFamily: 'var(--font-heading)',
                                }}
                            >
                                Lanjut ke Quiz
                            </motion.button>
                        ) : !completed ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={handleComplete}
                                disabled={loading}
                                style={{
                                    ...COMPLETE_CTA_STYLE,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    backgroundColor: 'var(--accent-green)', border: 'none',
                                }}
                            >
                                {completionCtaText}
                            </motion.button>
                        ) : (
                            <div style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle size={16} /> Modul Selesai!
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {hasQuiz ? (
                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700 }}>
                                    Quiz — {module.title}
                                </h2>
                                <button
                                    onClick={() => setPhase('lesson')}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        color: 'var(--text-secondary)',
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                    }}
                                >
                                    Kembali ke Materi
                                </button>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
                                Jawab semua soal dulu sebelum modul bisa diselesaikan.
                            </p>
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
                                                    const { backgroundColor, borderColor } = getQuizOptionVisual(idx, selected, isCorrect, q.correct_option)
                                                    return (
                                                        <button key={idx} onClick={() => handleAnswer(q.id, idx)} style={{
                                                            textAlign: 'left', padding: '10px 12px', borderRadius: '4px',
                                                            backgroundColor, border: `1px solid ${borderColor}`,
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
                                    disabled={!allQuizAnswered}
                                    style={{
                                        ...QUIZ_PRIMARY_CTA_STYLE,
                                        marginTop: '20px',
                                        backgroundColor: 'var(--accent-gold)',
                                        cursor: allQuizAnswered ? 'pointer' : 'not-allowed',
                                        opacity: allQuizAnswered ? 1 : 0.6,
                                    }}
                                >
                                    SUBMIT JAWABAN
                                </motion.button>
                            ) : !completed && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={handleComplete}
                                    disabled={loading || !canComplete}
                                    style={{
                                        ...QUIZ_PRIMARY_CTA_STYLE,
                                        marginTop: '16px',
                                        backgroundColor: 'var(--accent-green)',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {completionCtaText}
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
                                        ...QUIZ_PRIMARY_CTA_STYLE,
                                        marginTop: '16px',
                                        backgroundColor: 'var(--accent-gold)',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {loading ? 'Menyimpan...' : `Tandai Selesai (+${module.xp_reward}${hasClassBonus ? ` + ${bonusXp} bonus` : ''} XP)`}
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
