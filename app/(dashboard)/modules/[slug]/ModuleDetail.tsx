'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Module, UserModule, Question, LessonStep } from '@/types'
import {
    ChevronRight,
    ChevronDown,
    Check,
    CheckCircle,
    Menu,
    X,
    Play,
    FileText,
    HelpCircle,
    ExternalLink,
    Copy,
    CheckCheck,
    Sparkles,
    ArrowLeft,
    Clock,
    Zap,
    Swords,
} from 'lucide-react'
import { classHasBonusForCategory, CLASS_BONUS_PERCENT } from '@/lib/game/xp'
import { getCuratedStepsForModule } from '@/lib/content/module-lessons'

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

// --- Video URL Extraction ---
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

function isLikelyUrl(value: string): boolean {
    try {
        const parsed = new URL(value)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}

// --- Deterministic Question Shuffling ---
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

function resolveModuleSteps(module: Module): LessonStep[] {
    const curated = getCuratedStepsForModule(module.slug)
    if (curated) {
        return curated
    }
    const rawContent = module.content as LessonStep[] | null
    if (rawContent && rawContent.length > 0) {
        return rawContent
    }
    return [
        {
            id: 'intro',
            title: `Pengenalan: ${module.title}`,
            type: 'text',
            content: module.description || `Materi modul ${module.title}. Pelajari penjelasan di bawah ini sebelum melanjutkan ke latihan.`,
        },
        {
            id: 'konsep',
            title: 'Konsep Inti & Implementasi',
            type: 'text',
            content: `Materi ini membahas konsep inti dari ${module.title}. Pahami alur berpikir dan kaidah penerapannya secara bertahap.`,
        },
    ]
}

// --- Code Block Component with Copy Action ---
function CodeBlock({ code, language }: { code: string; language?: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div
            style={{
                position: 'relative',
                margin: '20px 0',
                borderRadius: '8px',
                border: '1px solid var(--surface-border, #e4e4e7)',
                backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--surface-border, #e4e4e7)',
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                }}
            >
                <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{language || 'code'}</span>
                <button
                    onClick={handleCopy}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: copied ? 'var(--accent-green, #16a34a)' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                    }}
                >
                    {copied ? (
                        <>
                            <CheckCheck size={13} /> Tersalin
                        </>
                    ) : (
                        <>
                            <Copy size={13} /> Salin
                        </>
                    )}
                </button>
            </div>
            <pre
                style={{
                    margin: 0,
                    padding: '16px',
                    overflowX: 'auto',
                    fontSize: '13px',
                    lineHeight: '1.65',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'transparent',
                }}
            >
                <code>{code}</code>
            </pre>
        </div>
    )
}

// --- Lightweight Safe Markdown Renderer ---
function RichContentRenderer({ content }: { content: string }) {
    const parts = useMemo(() => {
        const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g
        const segments: Array<{ type: 'text' | 'code'; text: string; lang?: string }> = []
        let lastIndex = 0
        let match: RegExpExecArray | null

        while ((match = regex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                segments.push({
                    type: 'text',
                    text: content.slice(lastIndex, match.index),
                })
            }
            segments.push({
                type: 'code',
                lang: match[1] || 'javascript',
                text: match[2].trimEnd(),
            })
            lastIndex = regex.lastIndex
        }

        if (lastIndex < content.length) {
            segments.push({
                type: 'text',
                text: content.slice(lastIndex),
            })
        }

        return segments
    }, [content])

    return (
        <div style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.75 }}>
            {parts.map((segment, segIdx) => {
                if (segment.type === 'code') {
                    return <CodeBlock key={segIdx} code={segment.text} language={segment.lang} />
                }

                const lines = segment.text.split('\n\n')
                return (
                    <div key={segIdx}>
                        {lines.map((block, bIdx) => {
                            const trimmed = block.trim()
                            if (!trimmed) return null

                            if (trimmed.startsWith('## ')) {
                                return (
                                    <h2
                                        key={bIdx}
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '20px',
                                            fontWeight: 700,
                                            color: 'var(--text-primary)',
                                            marginTop: '28px',
                                            marginBottom: '12px',
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {trimmed.slice(3)}
                                    </h2>
                                )
                            }

                            if (trimmed.startsWith('### ')) {
                                return (
                                    <h3
                                        key={bIdx}
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '17px',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            marginTop: '20px',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        {trimmed.slice(4)}
                                    </h3>
                                )
                            }

                            const formatInline = (text: string) => {
                                const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
                                return tokens.map((tok, tIdx) => {
                                    if (tok.startsWith('`') && tok.endsWith('`')) {
                                        return (
                                            <code
                                                key={tIdx}
                                                style={{
                                                    padding: '2px 6px',
                                                    margin: '0 2px',
                                                    borderRadius: '4px',
                                                    backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                                                    border: '1px solid var(--surface-border, #e4e4e7)',
                                                    fontSize: '13px',
                                                    fontFamily: 'var(--font-mono)',
                                                    color: 'var(--text-primary)',
                                                }}
                                            >
                                                {tok.slice(1, -1)}
                                            </code>
                                        )
                                    }
                                    if (tok.startsWith('**') && tok.endsWith('**')) {
                                        return <strong key={tIdx} style={{ color: 'var(--text-primary)' }}>{tok.slice(2, -2)}</strong>
                                    }
                                    if (tok.startsWith('*') && tok.endsWith('*')) {
                                        return <em key={tIdx}>{tok.slice(1, -1)}</em>
                                    }
                                    return tok
                                })
                            }

                            return (
                                <p key={bIdx} style={{ marginBottom: '16px' }}>
                                    {formatInline(trimmed)}
                                </p>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}

// --- Main ModuleDetail Component ---
export default function ModuleDetail({
    module,
    userModule,
    completedFromLog = false,
    questions,
    avatarClass,
}: ModuleDetailProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [phase, setPhase] = useState<'lesson' | 'quiz'>('lesson')
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
    const [quizSubmitted, setQuizSubmitted] = useState(false)
    const [completed, setCompleted] = useState(Boolean(userModule?.status === 'completed' || completedFromLog))
    const [loading, setLoading] = useState(false)
    const [completionFeedback, setCompletionFeedback] = useState<CompletionFeedback | null>(null)

    // UI Interactive States
    const [isStepDropdownOpen, setIsStepDropdownOpen] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isGuideOpen, setIsGuideOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // RPG XP calculations
    const hasClassBonus = classHasBonusForCategory(avatarClass, module.category)
    const bonusXp = hasClassBonus ? Math.floor((module.xp_reward * CLASS_BONUS_PERCENT) / 100) : 0

    // Steps Resolution
    const steps = useMemo(() => resolveModuleSteps(module), [module])
    const totalSteps = steps.length
    const activeStep = steps[currentStep] || steps[0]

    // Questions Resolution
    const currentQuestions = useMemo(() => {
        const prioritized = prioritizeModuleQuestions(questions, module.id)
        return prioritized
            .slice(0, MAX_QUIZ_QUESTIONS)
            .map((q) => shuffleModuleQuestionOptions(q, `${module.id}:${q.id}`))
    }, [questions, module.id])

    const hasQuiz = currentQuestions.length > 0
    const answeredCount = Object.keys(quizAnswers).length
    const allQuizAnswered = hasQuiz && currentQuestions.every((q) => typeof quizAnswers[q.id] === 'number')
    const canComplete = !hasQuiz || (quizSubmitted && allQuizAnswered)

    // Progress Calculation
    const completedItemsCount = completed
        ? totalSteps + (hasQuiz ? 1 : 0)
        : currentStep + (phase === 'quiz' ? 1 : 0)
    const totalItemsCount = totalSteps + (hasQuiz ? 1 : 0)
    const progressPercent = Math.min(100, Math.round((completedItemsCount / totalItemsCount) * 100))

    // Video Resolution
    const videoEmbedUrl = activeStep?.type === 'video' ? getYouTubeEmbedUrl(activeStep.content) : null
    const videoId = activeStep?.type === 'video' ? extractYouTubeVideoId(activeStep.content) : null
    const videoRawContent = activeStep?.type === 'video' ? (activeStep.content || '').trim() : ''
    const youtubeWatchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : videoRawContent
    const showVideoText = activeStep?.type === 'video' && videoRawContent.length > 0 && !isLikelyUrl(videoRawContent)

    // Close step dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsStepDropdownOpen(false)
            }
        }
        if (isStepDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isStepDropdownOpen])

    // Scroll to top when step or phase changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [currentStep, phase])

    // Handle Quiz Answer Selection
    const handleAnswer = (questionId: string, optionIdx: number) => {
        if (quizSubmitted) return
        setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIdx }))
    }

    const handleSubmitQuiz = () => {
        if (!allQuizAnswered) return
        setQuizSubmitted(true)
    }

    // Server-Authoritative Completion & XP Claim
    const handleComplete = async () => {
        if (loading || completed || !canComplete) return
        setLoading(true)

        try {
            const res = await fetch('/api/xp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete_module', moduleId: module.id }),
            })
            const xpData = await res.json()
            if (!res.ok || !xpData?.success) {
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
                    newLastActive:
                        typeof xpData.lastActive === 'string' || xpData.lastActive === null
                            ? xpData.lastActive
                            : undefined,
                    streakUpdated: xpData.streakUpdated === true,
                    earnedBadges: Array.isArray(xpData.earnedBadges) ? xpData.earnedBadges : undefined,
                })
            }

            setCompleted(true)
        } catch (err) {
            console.error('Failed to complete module:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: 'var(--surface-canvas, #fafafa)',
                color: 'var(--text-primary, #1d1d1d)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {/* =========================================================
                1. TOPBAR: SKILLUNGO BRANDED PLAYER HEADER
                Skillungo Swords Logo, Breadcrumbs, Step Dropdown, Gold Progress, Panduan, Drawer
                ========================================================= */}
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    height: '58px',
                    backgroundColor: 'var(--surface-card, #ffffff)',
                    borderBottom: '1px solid var(--surface-border, #e4e4e7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    gap: '12px',
                }}
            >
                {/* Left: Authentic Skillungo Logo & Breadcrumbs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <Link
                        href="/modules"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            marginRight: '4px',
                        }}
                    >
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '9px',
                                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                                border: '1px solid #F59E0B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
                                flexShrink: 0,
                            }}
                        >
                            <Swords
                                size={16}
                                style={{
                                    color: '#ffffff',
                                    filter: 'drop-shadow(0 1px 1px rgba(180, 83, 9, 0.4))',
                                }}
                            />
                        </div>
                        <span
                            className="hidden sm:inline"
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '18px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Skill<span
                                style={{
                                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontWeight: 700,
                                }}
                            >
                                ungo
                            </span>
                        </span>
                    </Link>

                    {/* Chevron Separator */}
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

                    {/* Breadcrumb: Module Title */}
                    <Link
                        href="/modules"
                        style={{
                            textDecoration: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '150px',
                        }}
                        title={module.title}
                    >
                        {module.title}
                    </Link>

                    {/* Chevron Separator */}
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

                    {/* Breadcrumb: Step Dropdown Selector */}
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setIsStepDropdownOpen((prev) => !prev)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--surface-border, #e4e4e7)',
                                backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                maxWidth: '210px',
                            }}
                        >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {phase === 'quiz' ? 'Latihan / Quiz' : `${currentStep + 1}. ${activeStep.title}`}
                            </span>
                            <ChevronDown size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                        </button>

                        {/* Step Switcher Dropdown Menu */}
                        <AnimatePresence>
                            {isStepDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 6px)',
                                        left: 0,
                                        width: '280px',
                                        maxHeight: '340px',
                                        overflowY: 'auto',
                                        backgroundColor: 'var(--surface-card, #ffffff)',
                                        border: '1px solid var(--surface-border, #e4e4e7)',
                                        borderRadius: '8px',
                                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                        padding: '6px',
                                        zIndex: 100,
                                    }}
                                >
                                    <div style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        Daftar Langkah Materi
                                    </div>
                                    {steps.map((st, i) => {
                                        const isCurrent = phase === 'lesson' && currentStep === i
                                        return (
                                            <button
                                                key={st.id}
                                                onClick={() => {
                                                    setCurrentStep(i)
                                                    setPhase('lesson')
                                                    setIsStepDropdownOpen(false)
                                                }}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '8px 10px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    backgroundColor: isCurrent ? 'rgba(245, 197, 66, 0.14)' : 'transparent',
                                                    color: isCurrent ? 'var(--color-burnt-orange, #D97706)' : 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    fontSize: '13px',
                                                    fontWeight: isCurrent ? 700 : 400,
                                                    marginBottom: '2px',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                    {st.type === 'video' ? <Play size={14} /> : <FileText size={14} />}
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {i + 1}. {st.title}
                                                    </span>
                                                </div>
                                                {completed && <Check size={14} style={{ color: 'var(--accent-green, #16a34a)' }} />}
                                            </button>
                                        )
                                    })}

                                    {/* Quiz Entry */}
                                    {hasQuiz && (
                                        <button
                                            onClick={() => {
                                                setPhase('quiz')
                                                setIsStepDropdownOpen(false)
                                            }}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '8px 10px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                backgroundColor: phase === 'quiz' ? 'rgba(245, 197, 66, 0.14)' : 'transparent',
                                                color: phase === 'quiz' ? 'var(--color-burnt-orange, #D97706)' : 'var(--text-primary)',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontSize: '13px',
                                                fontWeight: phase === 'quiz' ? 700 : 400,
                                                marginTop: '4px',
                                                borderTop: '1px solid var(--surface-border, #e4e4e7)',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <HelpCircle size={14} />
                                                <span>Latihan / Quiz</span>
                                            </div>
                                            {completed && <Check size={14} style={{ color: 'var(--accent-green, #16a34a)' }} />}
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Gold Progress Tracker, Guide Button, Hamburger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    {/* Progress Bar & Label with Skillungo Gold */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            style={{
                                width: '100px',
                                height: '7px',
                                backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                            }}
                            className="hidden sm:block"
                        >
                            <motion.div
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    height: '100%',
                                    backgroundColor: 'var(--color-gold, #F5C542)',
                                    borderRadius: '4px',
                                }}
                            />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--color-gold, #F5C542)' }}>
                                {completedItemsCount}/{totalItemsCount}
                            </strong>{' '}
                            <span className="hidden md:inline">Latihan diselesaikan</span>
                            <span className="inline md:hidden">Selesai</span>
                        </span>
                    </div>

                    {/* Panduan Button: Styled with Skillungo Gold accents */}
                    <button
                        onClick={() => setIsGuideOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'rgba(245, 197, 66, 0.12)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(245, 197, 66, 0.4)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <HelpCircle size={13} style={{ color: 'var(--color-gold, #F5C542)' }} />
                        <span className="hidden sm:inline">Panduan Belajar</span>
                    </button>

                    {/* Hamburger Menu: opens syllabus drawer */}
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        aria-label="Buka Silabus"
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--surface-border, #e4e4e7)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '6px',
                            borderRadius: '8px',
                        }}
                    >
                        <Menu size={18} />
                    </button>
                </div>
            </header>

            {/* =========================================================
                2. MAIN CONTENT AREA: CENTERED LEARNER VIEW
                H1 Title, Catatan callout box, Video/Text content, Quiz invitation
                ========================================================= */}
            <main
                style={{
                    flex: 1,
                    width: '100%',
                    maxWidth: '860px',
                    margin: '0 auto',
                    padding: '36px 20px 120px 20px',
                    boxSizing: 'border-box',
                }}
            >
                {phase === 'lesson' ? (
                    <div>
                        {/* Title: Clean Sentence case H1 */}
                        <h1
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '28px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                marginBottom: '20px',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {activeStep.title}
                        </h1>

                        {/* Catatan Box: Warm soft yellow alert banner */}
                        <div
                            style={{
                                backgroundColor: 'rgba(245, 197, 66, 0.08)',
                                border: '1px solid rgba(245, 197, 66, 0.35)',
                                borderRadius: '8px',
                                padding: '16px 20px',
                                marginBottom: '28px',
                                color: 'var(--text-primary)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '15px' }}>📝</span>
                                <strong style={{ fontSize: '14px', fontWeight: 700 }}>Catatan:</strong>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                                {activeStep.type === 'video'
                                    ? 'Mohon dipastikan kamu terhubung dengan koneksi Internet yang baik agar dapat mengakses video pembelajaran dengan minimum 720p hingga Full HD 1080p.'
                                    : 'Pelajari materi dan kode percontohan di bawah ini secara saksama. Kamu dapat mencatat poin-poin utama sebelum melanjutkan ke sesi latihan.'}
                            </p>
                        </div>

                        {/* Content Body: Video Player or Text Reading Material */}
                        {activeStep.type === 'video' ? (
                            <div>
                                <div
                                    style={{
                                        width: '100%',
                                        aspectRatio: '16 / 9',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: '1px solid var(--surface-border, #e4e4e7)',
                                        backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                                        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.06)',
                                        marginBottom: '14px',
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
                                                color: 'var(--text-secondary)',
                                                fontSize: '13px',
                                                textAlign: 'center',
                                                padding: '20px',
                                            }}
                                        >
                                            Video pembelajaran sedang disiapkan.
                                        </div>
                                    )}
                                </div>

                                {videoEmbedUrl && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <a
                                            href={youtubeWatchUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '13px',
                                                color: 'var(--color-burnt-orange, #D97706)',
                                                textDecoration: 'none',
                                                fontWeight: 600,
                                            }}
                                        >
                                            <ExternalLink size={13} /> Tonton langsung di YouTube
                                        </a>
                                    </div>
                                )}

                                {showVideoText && (
                                    <div style={{ marginTop: '16px' }}>
                                        <RichContentRenderer content={videoRawContent} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <RichContentRenderer content={activeStep.content} />
                            </div>
                        )}
                    </div>
                ) : (
                    /* =========================================================
                       QUIZ / EXERCISE INTERACTION VIEW
                       ========================================================= */
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '20px',
                                flexWrap: 'wrap',
                                gap: '12px',
                            }}
                        >
                            <div>
                                <h1
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '26px',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        marginBottom: '4px',
                                    }}
                                >
                                    Latihan Pemahaman: {module.title}
                                </h1>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                                    Jawab semua soal di bawah ini untuk menguji pemahaman dan membuka reward modul.
                                </p>
                            </div>
                            <button
                                onClick={() => setPhase('lesson')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--surface-border, #e4e4e7)',
                                    backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                                    color: 'var(--text-primary)',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                }}
                            >
                                <ArrowLeft size={14} /> Kembali ke Materi
                            </button>
                        </div>

                        {/* Catatan Box for Quiz */}
                        <div
                            style={{
                                backgroundColor: 'rgba(245, 197, 66, 0.08)',
                                border: '1px solid rgba(245, 197, 66, 0.35)',
                                borderRadius: '8px',
                                padding: '14px 18px',
                                marginBottom: '24px',
                                color: 'var(--text-primary)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                <span style={{ fontSize: '14px' }}>💡</span>
                                <strong style={{ fontSize: '13px', fontWeight: 700 }}>Tips Mengerjakan:</strong>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                                Kamu dapat kembali ke halaman materi kapan saja menggunakan tombol &quot;Kembali ke Materi&quot;.
                                Jawaban yang sudah kamu pilih akan tetap tersimpan.
                            </p>
                        </div>

                        {/* Questions List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {currentQuestions.map((q, qIdx) => {
                                const selected = quizAnswers[q.id]
                                const isCorrect = selected === q.correct_option

                                return (
                                    <div
                                        key={q.id}
                                        style={{
                                            padding: '20px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--surface-border, #e4e4e7)',
                                            backgroundColor: 'var(--surface-card, #ffffff)',
                                        }}
                                    >
                                        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
                                            {qIdx + 1}. {q.question_text}
                                        </p>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {q.options.map((opt, optIdx) => {
                                                const isThisSelected = selected === optIdx
                                                let optBg = 'var(--surface-canvas, #fafafa)'
                                                let optBorder = 'var(--surface-border, #e4e4e7)'
                                                let optColor = 'var(--text-primary)'
                                                let badgeBg = 'var(--surface-elevated, #f4f4f5)'
                                                let badgeColor = 'var(--text-muted)'

                                                if (quizSubmitted) {
                                                    if (optIdx === q.correct_option) {
                                                        optBg = 'rgba(22, 163, 74, 0.1)'
                                                        optBorder = 'var(--accent-green, #16a34a)'
                                                        optColor = 'var(--accent-green, #16a34a)'
                                                        badgeBg = 'var(--accent-green, #16a34a)'
                                                        badgeColor = '#ffffff'
                                                    } else if (isThisSelected && !isCorrect) {
                                                        optBg = 'rgba(239, 68, 68, 0.1)'
                                                        optBorder = 'var(--accent-red, #EF4444)'
                                                        optColor = 'var(--accent-red, #EF4444)'
                                                        badgeBg = 'var(--accent-red, #EF4444)'
                                                        badgeColor = '#ffffff'
                                                    }
                                                } else if (isThisSelected) {
                                                    optBg = 'rgba(245, 197, 66, 0.12)'
                                                    optBorder = 'var(--color-gold, #F5C542)'
                                                    optColor = 'var(--text-primary)'
                                                    badgeBg = 'var(--color-gold, #F5C542)'
                                                    badgeColor = '#0a0a0a'
                                                }

                                                return (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => handleAnswer(q.id, optIdx)}
                                                        disabled={quizSubmitted}
                                                        style={{
                                                            textAlign: 'left',
                                                            padding: '10px 14px',
                                                            borderRadius: '8px',
                                                            backgroundColor: optBg,
                                                            border: `1px solid ${optBorder}`,
                                                            color: optColor,
                                                            fontSize: '14px',
                                                            cursor: quizSubmitted ? 'default' : 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            transition: 'all 0.15s ease',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                width: '24px',
                                                                height: '24px',
                                                                borderRadius: '6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '12px',
                                                                fontWeight: 700,
                                                                backgroundColor: badgeBg,
                                                                color: badgeColor,
                                                            }}
                                                        >
                                                            {String.fromCharCode(65 + optIdx)}
                                                        </span>
                                                        <span>{opt}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {quizSubmitted && q.explanation && (
                                            <div
                                                style={{
                                                    marginTop: '12px',
                                                    padding: '10px 14px',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'rgba(245, 197, 66, 0.08)',
                                                    border: '1px solid rgba(245, 197, 66, 0.25)',
                                                    fontSize: '13px',
                                                    color: 'var(--text-secondary)',
                                                }}
                                            >
                                                💡 <strong>Penjelasan:</strong> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Quiz CTA Buttons */}
                        <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            {!quizSubmitted ? (
                                <button
                                    onClick={handleSubmitQuiz}
                                    disabled={!allQuizAnswered}
                                    style={{
                                        backgroundColor: 'var(--color-gold, #F5C542)',
                                        color: '#0a0a0a',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 28px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-heading)',
                                        cursor: allQuizAnswered ? 'pointer' : 'not-allowed',
                                        opacity: allQuizAnswered ? 1 : 0.6,
                                    }}
                                >
                                    Periksa Jawaban
                                </button>
                            ) : !completed ? (
                                <button
                                    onClick={handleComplete}
                                    disabled={loading || !canComplete}
                                    style={{
                                        backgroundColor: 'var(--accent-green, #16a34a)',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 28px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-heading)',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {loading
                                        ? 'Menyimpan...'
                                        : `✓ Selesaikan & Klaim ${module.xp_reward}${hasClassBonus ? ` + ${bonusXp}` : ''} XP`}
                                </button>
                            ) : (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: 'var(--accent-green, #16a34a)',
                                        fontWeight: 700,
                                        fontSize: '15px',
                                    }}
                                >
                                    <CheckCircle size={18} /> Modul Telah Selesai
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* =========================================================
                3. STICKY BOTTOM NAVIGATION BAR: CLEAN ELEVATED CONSOLE DOCK
                Clean surface (no aggressive red), Skillungo Gold actions
                Left: Prev Step | Center: Mulai Latihan | Right: Next Step
                ========================================================= */}
            <footer
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    backgroundColor: 'var(--surface-card, #ffffff)',
                    borderTop: '1px solid var(--surface-border, #e4e4e7)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    zIndex: 50,
                    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
                }}
            >
                {/* Left: Previous step */}
                <div>
                    {phase === 'lesson' ? (
                        currentStep > 0 ? (
                            <button
                                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                                style={{
                                    backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                                    border: '1px solid var(--surface-border, #e4e4e7)',
                                    borderRadius: '8px',
                                    padding: '7px 16px',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    maxWidth: '220px',
                                }}
                                title={steps[currentStep - 1]?.title}
                            >
                                <span>&lt;</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden sm:inline">
                                    {steps[currentStep - 1]?.title}
                                </span>
                                <span className="inline sm:hidden">Sebelumnya</span>
                            </button>
                        ) : (
                            <Link
                                href="/modules"
                                style={{
                                    backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                                    border: '1px solid var(--surface-border, #e4e4e7)',
                                    borderRadius: '8px',
                                    padding: '7px 16px',
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <span>&lt;</span> Modul
                            </Link>
                        )
                    ) : (
                        <button
                            onClick={() => setPhase('lesson')}
                            style={{
                                backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                                border: '1px solid var(--surface-border, #e4e4e7)',
                                borderRadius: '8px',
                                padding: '7px 16px',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <span>&lt;</span> Kembali ke Materi
                        </button>
                    )}
                </div>

                {/* Center: Mulai Latihan Button (Skillungo Gold) */}
                <div>
                    {phase === 'lesson' && hasQuiz && (
                        <button
                            onClick={() => {
                                setPhase('quiz')
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            style={{
                                backgroundColor: 'var(--color-gold, #F5C542)',
                                color: '#0a0a0a',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '7px 20px',
                                fontSize: '13px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-heading)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(245, 197, 66, 0.3)',
                            }}
                        >
                            <FileText size={14} /> Mulai Latihan
                        </button>
                    )}
                    {phase === 'quiz' && (
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {answeredCount}/{currentQuestions.length} Soal Dijawab
                        </span>
                    )}
                    {completed && phase === 'lesson' && !hasQuiz && (
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-green, #16a34a)' }}>
                            ✓ Modul Selesai
                        </span>
                    )}
                </div>

                {/* Right: Next step or Complete action */}
                <div>
                    {phase === 'lesson' ? (
                        currentStep < totalSteps - 1 ? (
                            <button
                                onClick={() => setCurrentStep((s) => s + 1)}
                                style={{
                                    backgroundColor: 'var(--color-gold, #F5C542)',
                                    color: '#0a0a0a',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '7px 18px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    maxWidth: '220px',
                                }}
                                title={steps[currentStep + 1]?.title}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden sm:inline">
                                    {steps[currentStep + 1]?.title}
                                </span>
                                <span className="inline sm:hidden">Selanjutnya</span>
                                <span>&gt;</span>
                            </button>
                        ) : hasQuiz ? (
                            <button
                                onClick={() => {
                                    setPhase('quiz')
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                style={{
                                    backgroundColor: 'var(--color-gold, #F5C542)',
                                    color: '#0a0a0a',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '7px 18px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                Lanjut ke Latihan &gt;
                            </button>
                        ) : !completed ? (
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                style={{
                                    backgroundColor: 'var(--accent-green, #16a34a)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '7px 18px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                Selesaikan &gt;
                            </button>
                        ) : (
                            <Link
                                href="/modules"
                                style={{
                                    backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                                    border: '1px solid var(--surface-border, #e4e4e7)',
                                    borderRadius: '8px',
                                    padding: '7px 16px',
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                Daftar Modul &gt;
                            </Link>
                        )
                    ) : quizSubmitted && !completed ? (
                        <button
                            onClick={handleComplete}
                            disabled={loading || !canComplete}
                            style={{
                                backgroundColor: 'var(--accent-green, #16a34a)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '7px 18px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            Klaim XP &gt;
                        </button>
                    ) : (
                        <Link
                            href="/modules"
                            style={{
                                backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                                border: '1px solid var(--surface-border, #e4e4e7)',
                                borderRadius: '8px',
                                padding: '7px 16px',
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                fontSize: '13px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            Selesai &gt;
                        </Link>
                    )}
                </div>
            </footer>

            {/* =========================================================
                4. SLIDE-OVER SYLLABUS DRAWER: Toggled by ☰
                ========================================================= */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.45)',
                            zIndex: 100,
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                            style={{
                                width: '380px',
                                maxWidth: '90vw',
                                height: '100%',
                                backgroundColor: 'var(--surface-card, #ffffff)',
                                borderLeft: '1px solid var(--surface-border, #e4e4e7)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Drawer Header */}
                            <div
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid var(--surface-border, #e4e4e7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <h3
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '17px',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    Silabus & Kurikulum Modul
                                </h3>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Module Summary Card */}
                            <div style={{ padding: '20px', borderBottom: '1px solid var(--surface-border, #e4e4e7)' }}>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700 }}>
                                    {module.title}
                                </h4>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> {module.duration_minutes || 45} menit
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-burnt-orange, #D97706)' }}>
                                        <Zap size={12} /> +{module.xp_reward} XP
                                    </span>
                                </div>
                                <div style={{ height: '6px', backgroundColor: 'var(--surface-elevated, #f4f4f5)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: 'var(--color-gold, #F5C542)' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                    <span>{progressPercent}% Selesai</span>
                                    <span>{completedItemsCount}/{totalItemsCount} Unit</span>
                                </div>
                            </div>

                            {/* Steps List */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                                {steps.map((st, i) => {
                                    const isCurrent = phase === 'lesson' && currentStep === i
                                    return (
                                        <button
                                            key={st.id}
                                            onClick={() => {
                                                setCurrentStep(i)
                                                setPhase('lesson')
                                                setIsDrawerOpen(false)
                                            }}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: `1px solid ${isCurrent ? 'var(--color-gold, #F5C542)' : 'var(--surface-border, #e4e4e7)'}`,
                                                backgroundColor: isCurrent ? 'rgba(245, 197, 66, 0.12)' : 'var(--surface-card, #ffffff)',
                                                color: isCurrent ? 'var(--color-burnt-orange, #D97706)' : 'var(--text-primary)',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                marginBottom: '8px',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '6px',
                                                        backgroundColor: isCurrent ? 'var(--color-gold, #F5C542)' : 'var(--surface-elevated, #f4f4f5)',
                                                        color: isCurrent ? '#0a0a0a' : 'var(--text-secondary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {st.type === 'video' ? <Play size={13} /> : <FileText size={13} />}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                                                        Langkah {i + 1}
                                                    </div>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {st.title}
                                                    </div>
                                                </div>
                                            </div>
                                            {completed && <CheckCircle size={16} style={{ color: 'var(--accent-green, #16a34a)' }} />}
                                        </button>
                                    )
                                })}

                                {hasQuiz && (
                                    <button
                                        onClick={() => {
                                            setPhase('quiz')
                                            setIsDrawerOpen(false)
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: `1px solid ${phase === 'quiz' ? 'var(--color-gold, #F5C542)' : 'var(--surface-border, #e4e4e7)'}`,
                                            backgroundColor: phase === 'quiz' ? 'rgba(245, 197, 66, 0.12)' : 'var(--surface-card, #ffffff)',
                                            color: phase === 'quiz' ? 'var(--color-burnt-orange, #D97706)' : 'var(--text-primary)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            marginTop: '12px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    backgroundColor: phase === 'quiz' ? 'var(--color-gold, #F5C542)' : 'var(--surface-elevated, #f4f4f5)',
                                                    color: phase === 'quiz' ? '#0a0a0a' : 'var(--text-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <HelpCircle size={14} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Evaluasi</div>
                                                <div style={{ fontSize: '13px', fontWeight: 600 }}>Latihan & Kuis ({currentQuestions.length} Soal)</div>
                                            </div>
                                        </div>
                                        {completed && <CheckCircle size={16} style={{ color: 'var(--accent-green, #16a34a)' }} />}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* =========================================================
                5. LEARNING GUIDE MODAL: Toggled by Panduan Button
                ========================================================= */}
            <AnimatePresence>
                {isGuideOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            zIndex: 100,
                        }}
                        onClick={() => setIsGuideOpen(false)}
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 15, opacity: 0, scale: 0.98 }}
                            style={{
                                width: '100%',
                                maxWidth: '480px',
                                backgroundColor: 'var(--surface-card, #ffffff)',
                                border: '1px solid var(--surface-border, #e4e4e7)',
                                borderRadius: '12px',
                                padding: '24px',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '19px', fontWeight: 700 }}>
                                    Panduan Belajar Modul
                                </h3>
                                <button
                                    onClick={() => setIsGuideOpen(false)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span style={{ fontSize: '18px' }}>📶</span>
                                    <div>
                                        <strong style={{ color: 'var(--text-primary)' }}>Koneksi & Video:</strong> Pastikan internetmu stabil dengan kecepatan minimum 5 Mbps untuk streaming 720p - 1080p tanpa kendala.
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span style={{ fontSize: '18px' }}>📑</span>
                                    <div>
                                        <strong style={{ color: 'var(--text-primary)' }}>Navigasi Materi:</strong> Gunakan menu dropdown di bagian atas atau tombol navigasi di bagian bawah untuk berpindah antar langkah.
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span style={{ fontSize: '18px' }}>📝</span>
                                    <div>
                                        <strong style={{ color: 'var(--text-primary)' }}>Latihan Pemahaman:</strong> Setiap modul dilengkapi sesi latihan. Jawab seluruh pertanyaan latihan untuk membuka penyelesaian modul dan mengklaim XP.
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span style={{ fontSize: '18px' }}>⚔️</span>
                                    <div>
                                        <strong style={{ color: 'var(--text-primary)' }}>Bonus Kelas RPG:</strong> {hasClassBonus ? (
                                            <span style={{ color: 'var(--color-burnt-orange, #D97706)', fontWeight: 600 }}>
                                                Kelasmu ({avatarClass}) mendapatkan BONUS +{bonusXp} XP ({CLASS_BONUS_PERCENT}%) untuk kategori modul ini!
                                            </span>
                                        ) : (
                                            <span>Raih +{module.xp_reward} XP setelah menyelesaikan modul ini.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsGuideOpen(false)}
                                style={{
                                    width: '100%',
                                    marginTop: '22px',
                                    padding: '11px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--color-gold, #F5C542)',
                                    color: '#0a0a0a',
                                    border: 'none',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Mengerti, Lanjutkan Belajar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* =========================================================
                6. COMPLETION FEEDBACK MODAL: Level up & XP Claim
                ========================================================= */}
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
                            style={{
                                width: '100%',
                                maxWidth: '420px',
                                padding: '24px',
                                backgroundColor: 'var(--surface-card, #ffffff)',
                                borderRadius: '12px',
                                border: '1px solid var(--surface-border, #e4e4e7)',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800, color: 'var(--accent-green, #16a34a)' }}>
                                    {completionFeedback.alreadyClaimed ? 'Modul Sudah Selesai' : '🎉 Modul Berhasil Diselesaikan!'}
                                </h3>
                                <button
                                    onClick={() => setCompletionFeedback(null)}
                                    style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Base XP</span>
                                    <span style={{ fontWeight: 700 }}>+{completionFeedback.baseAward}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Bonus Kelas</span>
                                    <span style={{ fontWeight: 700, color: completionFeedback.bonusAmount > 0 ? 'var(--color-burnt-orange, #D97706)' : 'var(--text-muted)' }}>
                                        +{completionFeedback.bonusAmount}
                                    </span>
                                </div>
                                <div style={{ height: '1px', backgroundColor: 'var(--surface-border, #e4e4e7)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Total Reward</span>
                                    <span style={{ fontWeight: 800, color: 'var(--color-burnt-orange, #D97706)' }}>+{completionFeedback.totalAwarded} XP</span>
                                </div>
                            </div>

                            {completionFeedback.leveledUp && completionFeedback.newLevel && (
                                <div
                                    style={{
                                        marginBottom: '16px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(245, 197, 66, 0.4)',
                                        backgroundColor: 'rgba(245, 197, 66, 0.12)',
                                        fontSize: '13px',
                                        color: 'var(--color-burnt-orange, #D97706)',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <Sparkles size={16} /> Level Up! Kamu sekarang Level {completionFeedback.newLevel}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setCompletionFeedback(null)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--surface-border, #e4e4e7)',
                                        backgroundColor: 'var(--surface-elevated, #f4f4f5)',
                                        color: 'var(--text-primary)',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Tetap di Sini
                                </button>
                                <button
                                    onClick={() => router.push('/modules')}
                                    style={{
                                        flex: 1,
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: 'var(--color-gold, #F5C542)',
                                        color: '#0a0a0a',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Kembali ke Modul
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
