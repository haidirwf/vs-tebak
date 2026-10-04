'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { battleSounds } from '@/lib/game/battle-sounds'
import { Sparkles, Check, ArrowRight, HelpCircle, X, Zap } from 'lucide-react'

interface LessonTourGuideProps {
    isOpen: boolean
    onClose: () => void
    onComplete?: () => void
}

type TourStep = {
    targetSelector: string
    title: string
    description: string
    badge: string
}

const TOUR_STEPS: TourStep[] = [
    {
        targetSelector: '[data-tour="progress-bar"]',
        title: 'Progress Belajar Real-Time',
        description: 'Pantau persentase membaca dan kemajuan materi milikmu di sini secara terukur.',
        badge: 'Langkah 1/4',
    },
    {
        targetSelector: '[data-tour="nav-buttons"]',
        title: 'Navigasi Bab Pembelajaran',
        description: 'Gunakan tombol navigasi melayang ini untuk berpindah bab materi dengan cepat dan nyaman.',
        badge: 'Langkah 2/4',
    },
    {
        targetSelector: '[data-tour="quiz-reward"]',
        title: 'Kuis Evaluasi & Reward XP',
        description: 'Uji pemahamanmu dan raih bonus poin XP untuk menaikkan level karakter pahlawanmu.',
        badge: 'Langkah 3/4',
    },
]

export default function LessonTourGuide({
    isOpen,
    onClose,
    onComplete,
}: LessonTourGuideProps) {
    const { setLessonTourCompleted } = useOnboardingStore()
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [isMiniTaskPhase, setIsMiniTaskPhase] = useState(false)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [isCorrect, setIsCorrect] = useState(false)
    const [showFloatingXp, setShowFloatingXp] = useState(false)

    const [rect, setRect] = useState<DOMRect | null>(null)

    const isHighlightPhase = currentStepIndex < TOUR_STEPS.length && !isMiniTaskPhase
    const currentStep = TOUR_STEPS[currentStepIndex]

    // Update target bounding box on window resize / step change
    useEffect(() => {
        if (!isOpen || !isHighlightPhase || !currentStep) return

        function updateTargetRect() {
            const el = document.querySelector(currentStep.targetSelector)
            if (el) {
                const b = el.getBoundingClientRect()
                setRect(b)
            } else {
                setRect(null)
            }
        }

        updateTargetRect()
        const timer = setTimeout(updateTargetRect, 100)
        window.addEventListener('resize', updateTargetRect)
        window.addEventListener('scroll', updateTargetRect, true)

        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', updateTargetRect)
            window.removeEventListener('scroll', updateTargetRect, true)
        }
    }, [isOpen, currentStepIndex, isHighlightPhase, currentStep])

    if (!isOpen) return null

    function handleNextStep() {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            setCurrentStepIndex((prev) => prev + 1)
        } else {
            setIsMiniTaskPhase(true)
        }
    }

    function handleAnswerMiniTask(optionIdx: number) {
        if (selectedOption !== null) return
        setSelectedOption(optionIdx)

        if (optionIdx === 1) {
            setIsCorrect(true)
            setShowFloatingXp(true)

            try {
                battleSounds.playCorrectAnswer()
            } catch {}

            setTimeout(() => {
                setLessonTourCompleted(true)
                onComplete?.()
                onClose()
            }, 1800)
        } else {
            try {
                battleSounds.playWrongAnswer()
            } catch {}
        }
    }

    return (
        <AnimatePresence>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9998,
                    pointerEvents: 'auto',
                }}
            >
                {/* Dark Backdrop Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.78)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                    }}
                    onClick={onClose}
                />

                {/* Target Spotlight Highlight Ring */}
                {isHighlightPhase && rect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            top: rect.top - 6,
                            left: rect.left - 6,
                            width: rect.width + 12,
                            height: rect.height + 12,
                            borderRadius: '12px',
                            border: '2px solid var(--accent-cyan)',
                            boxShadow: '0 0 24px rgba(0, 212, 255, 0.5), inset 0 0 12px rgba(0, 212, 255, 0.2)',
                            zIndex: 9999,
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* Floating Tooltip Card */}
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        zIndex: 10000,
                        pointerEvents: 'none',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{
                            width: '100%',
                            maxWidth: '460px',
                            padding: '22px',
                            borderRadius: '16px',
                            backgroundColor: '#141414',
                            border: '1px solid #313131',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
                            pointerEvents: 'auto',
                            position: 'relative',
                        }}
                    >
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '4px',
                            }}
                        >
                            <X size={18} />
                        </button>

                        {!isMiniTaskPhase ? (
                            /* SPOTLIGHT STEPS 1-3 */
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            backgroundColor: 'rgba(0, 212, 255, 0.12)',
                                            border: '1px solid rgba(0, 212, 255, 0.3)',
                                            color: 'var(--accent-cyan)',
                                        }}
                                    >
                                        {currentStep.badge}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        Panduan Fitur Modul
                                    </span>
                                </div>

                                <h3
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        margin: '0 0 8px 0',
                                    }}
                                >
                                    {currentStep.title}
                                </h3>

                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                                    {currentStep.description}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {TOUR_STEPS.map((_, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: idx === currentStepIndex ? 'var(--accent-cyan)' : '#313131',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            backgroundColor: 'var(--accent-cyan)',
                                            color: 'var(--bg-primary)',
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Coba Latihan Cepat' : 'Lanjut'}</span>
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* INTERACTIVE MINI-TASK (STEP 4) */
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            color: 'var(--accent-gold)',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <Sparkles size={12} />
                                        <span>Simulasi Latihan Cepat</span>
                                    </div>

                                    <h3
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '17px',
                                            fontWeight: 700,
                                            color: '#ffffff',
                                            margin: '0 0 6px 0',
                                        }}
                                    >
                                        Uji Pemahaman Singkat
                                    </h3>

                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                        Apa cara paling efektif untuk cepat mahir materi IT & Bisnis di Skillungo?
                                    </p>
                                </div>

                                {/* Mini Question Options */}
                                <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                                    {[
                                        {
                                            label: 'A. Belajar marathon semalaman tanpa jeda istirahat',
                                            isRight: false,
                                        },
                                        {
                                            label: 'B. Menjaga Streak Harian & latihan rutin 10 menit setiap hari',
                                            isRight: true,
                                        },
                                    ].map((opt, idx) => {
                                        let bg = '#181818'
                                        let border = '#282828'
                                        let color = '#ffffff'

                                        if (selectedOption === idx) {
                                            if (opt.isRight) {
                                                bg = 'rgba(34, 197, 94, 0.12)'
                                                border = 'var(--accent-green)'
                                                color = 'var(--accent-green)'
                                            } else {
                                                bg = 'rgba(239, 68, 68, 0.12)'
                                                border = 'var(--accent-red)'
                                                color = 'var(--accent-red)'
                                            }
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                disabled={selectedOption !== null}
                                                onClick={() => handleAnswerMiniTask(idx)}
                                                style={{
                                                    padding: '12px 14px',
                                                    borderRadius: '10px',
                                                    border: `1.5px solid ${border}`,
                                                    backgroundColor: bg,
                                                    color: color,
                                                    textAlign: 'left',
                                                    fontSize: '12.5px',
                                                    fontWeight: 600,
                                                    cursor: selectedOption !== null ? 'default' : 'pointer',
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        )
                                    })}
                                </div>

                                {selectedOption !== null && !isCorrect && (
                                    <div style={{ color: 'var(--accent-red)', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>
                                        Jawaban kurang tepat. Coba pilih opsi B yang menjaga konsistensi harian!
                                    </div>
                                )}

                                {/* FLOATING XP NUMBERS ANIMATION */}
                                {showFloatingXp && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                        animate={{ opacity: 1, y: -20, scale: 1.2 }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        style={{
                                            position: 'absolute',
                                            top: '30%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            backgroundColor: 'rgba(245, 158, 11, 0.95)',
                                            color: '#000000',
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 800,
                                            fontSize: '18px',
                                            boxShadow: '0 0 20px rgba(245, 158, 11, 0.6)',
                                            zIndex: 10001,
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        <Zap size={20} fill="#000" />
                                        <span>+25 XP BONUS SIMULASI!</span>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    )
}
