'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertCircle, BookOpen } from 'lucide-react'

export interface QuizReviewItem {
    questionText: string
    options: string[]
    correctOption: number
    selectedOption: number | null
    explanation?: string | null
    isCorrect: boolean
}

interface PostBattleReviewModalProps {
    isOpen: boolean
    onClose: () => void
    reviews: QuizReviewItem[]
}

export default function PostBattleReviewModal({ isOpen, onClose, reviews }: PostBattleReviewModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!isOpen || !mounted || typeof document === 'undefined') return null

    const correctCount = reviews.filter(r => r.isCorrect).length
    const totalCount = reviews.length

    const modalContent = (
        <AnimatePresence>
            <div
                className="modal-overlay"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2000,
                    backgroundColor: 'rgba(0, 0, 0, 0.82)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ type: 'spring', duration: 0.35, bounce: 0.12 }}
                    onClick={(e) => e.stopPropagation()}
                    className="card quiz-review-modal-card"
                    style={{
                        backgroundColor: '#141414',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.95)',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '12px',
                            marginBottom: '14px',
                            paddingBottom: '12px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            flexShrink: 0,
                        }}
                    >
                        <div>
                            <h3
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '17px',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    margin: '0 0 3px',
                                }}
                            >
                                Pembahasan Soal Duel
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <span>{correctCount} dari {totalCount} benar</span>
                                <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
                                <span style={{ color: correctCount === totalCount ? 'var(--color-vector-green)' : '#F5C542', fontWeight: 600 }}>
                                    Akurasi {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Tutup"
                            style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Question List */}
                    <div
                        style={{
                            overflowY: 'auto',
                            paddingRight: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            marginBottom: '14px',
                            minHeight: 0,
                            flex: '1 1 auto',
                        }}
                    >
                        {reviews.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                Belum ada riwayat soal yang tercatat pada sesi ini.
                            </div>
                        ) : (
                            reviews.map((item, idx) => {
                                const selectedText = item.selectedOption !== null ? item.options[item.selectedOption] : 'Waktu habis (tidak menjawab)'
                                const correctText = item.options[item.correctOption]

                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            backgroundColor: '#181818',
                                            borderRadius: '12px',
                                            border: `1px solid ${item.isCorrect ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                                            padding: '12px 14px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                        }}
                                    >
                                        {/* Status Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                                Soal #{idx + 1}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '10.5px',
                                                    fontWeight: 600,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    padding: '2px 7px',
                                                    borderRadius: '6px',
                                                    backgroundColor: item.isCorrect ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                                    border: `1px solid ${item.isCorrect ? 'rgba(34, 197, 94, 0.28)' : 'rgba(239, 68, 68, 0.28)'}`,
                                                    color: item.isCorrect ? 'var(--color-vector-green)' : 'var(--accent-red)',
                                                }}
                                            >
                                                {item.isCorrect ? <Check size={12} /> : <AlertCircle size={12} />}
                                                {item.isCorrect ? 'Jawaban Benar' : item.selectedOption === null ? 'Waktu Habis' : 'Jawaban Salah'}
                                            </span>
                                        </div>

                                        {/* Question Text */}
                                        <div
                                            style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#ffffff',
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {item.questionText}
                                        </div>

                                        {/* Answers Comparison Grid (side-by-side on desktop, stacked on mobile) */}
                                        <div className="quiz-review-answer-grid">
                                            {/* Your Answer */}
                                            <div
                                                style={{
                                                    padding: '8px 10px',
                                                    borderRadius: '8px',
                                                    backgroundColor: item.isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                                    border: `1px solid ${item.isCorrect ? 'rgba(34, 197, 94, 0.22)' : 'rgba(239, 68, 68, 0.22)'}`,
                                                    gridColumn: item.isCorrect ? '1 / -1' : undefined,
                                                }}
                                            >
                                                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                                    Jawaban Kamu:
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        color: item.isCorrect ? 'var(--color-vector-green)' : 'var(--accent-red)',
                                                        lineHeight: 1.35,
                                                    }}
                                                >
                                                    {selectedText}
                                                </div>
                                            </div>

                                            {/* Correct Answer if you were wrong */}
                                            {!item.isCorrect && (
                                                <div
                                                    style={{
                                                        padding: '8px 10px',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'rgba(34, 197, 94, 0.08)',
                                                        border: '1px solid rgba(34, 197, 94, 0.22)',
                                                    }}
                                                >
                                                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                                        Kunci Jawaban:
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '12px',
                                                            fontWeight: 500,
                                                            color: 'var(--color-vector-green)',
                                                            lineHeight: 1.35,
                                                        }}
                                                    >
                                                        {correctText}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Explanation Note */}
                                        {item.explanation && (
                                            <div
                                                style={{
                                                    padding: '8px 10px',
                                                    borderRadius: '8px',
                                                    backgroundColor: 'rgba(56, 189, 248, 0.06)',
                                                    border: '1px solid rgba(56, 189, 248, 0.18)',
                                                    fontSize: '11.5px',
                                                    color: '#bae6fd',
                                                    lineHeight: 1.4,
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '6px',
                                                }}
                                            >
                                                <BookOpen size={13} style={{ flexShrink: 0, marginTop: '2px', color: '#38bdf8' }} />
                                                <div>
                                                    <strong style={{ color: '#e0f2fe' }}>Pembahasan: </strong>
                                                    {item.explanation}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', flexShrink: 0 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                width: '100%',
                                padding: '9px 16px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            Tutup Pembahasan
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )

    return createPortal(modalContent, document.body)
}
