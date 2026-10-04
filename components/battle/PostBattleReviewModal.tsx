'use client'

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
    if (!isOpen) return null

    const correctCount = reviews.filter(r => r.isCorrect).length
    const totalCount = reviews.length

    return (
        <AnimatePresence>
            <div
                className="modal-overlay"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1050,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    overflowY: 'auto',
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="card"
                    style={{
                        backgroundColor: '#141414',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '16px',
                        padding: '24px 20px',
                        maxWidth: '560px',
                        width: '100%',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.95)',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div>
                            <h3
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    margin: '0 0 4px',
                                }}
                            >
                                Pembahasan Soal Duel
                            </h3>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {correctCount} dari {totalCount} jawaban dijawab dengan benar
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Tutup"
                            style={{
                                background: 'none',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
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
                            paddingRight: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            marginBottom: '16px',
                            flex: 1,
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
                                            backgroundColor: '#1a1a1a',
                                            borderRadius: '12px',
                                            border: `1px solid ${item.isCorrect ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                                            padding: '14px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                        }}
                                    >
                                        {/* Status Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                                Soal {idx + 1}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    backgroundColor: item.isCorrect ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                                    border: `1px solid ${item.isCorrect ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                                    color: item.isCorrect ? 'var(--color-vector-green)' : 'var(--accent-red)',
                                                }}
                                            >
                                                {item.isCorrect ? <Check size={12} /> : <AlertCircle size={12} />}
                                                {item.isCorrect ? 'Benar' : item.selectedOption === null ? 'Waktu Habis' : 'Kurang Tepat'}
                                            </span>
                                        </div>

                                        {/* Question Text */}
                                        <div
                                            style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#ffffff',
                                                lineHeight: 1.45,
                                            }}
                                        >
                                            {item.questionText}
                                        </div>

                                        {/* Answers Comparison */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                                            <div
                                                style={{
                                                    padding: '8px 10px',
                                                    borderRadius: '8px',
                                                    backgroundColor: item.isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                                    border: `1px solid ${item.isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                                    color: item.isCorrect ? 'var(--color-vector-green)' : 'var(--accent-red)',
                                                }}
                                            >
                                                <span style={{ fontWeight: 600, color: 'var(--text-secondary)', marginRight: '6px' }}>Jawaban Anda:</span>
                                                {selectedText}
                                            </div>

                                            {!item.isCorrect && (
                                                <div
                                                    style={{
                                                        padding: '8px 10px',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'rgba(34, 197, 94, 0.08)',
                                                        border: '1px solid rgba(34, 197, 94, 0.25)',
                                                        color: 'var(--color-vector-green)',
                                                    }}
                                                >
                                                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)', marginRight: '6px' }}>Kunci Jawaban:</span>
                                                    {correctText}
                                                </div>
                                            )}
                                        </div>

                                        {/* Explanation Note */}
                                        {item.explanation && (
                                            <div
                                                style={{
                                                    marginTop: '2px',
                                                    padding: '8px 10px',
                                                    borderRadius: '8px',
                                                    backgroundColor: 'rgba(56, 189, 248, 0.06)',
                                                    border: '1px solid rgba(56, 189, 248, 0.2)',
                                                    fontSize: '11.5px',
                                                    color: '#bae6fd',
                                                    lineHeight: 1.45,
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '6px',
                                                }}
                                            >
                                                <BookOpen size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                width: '100%',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#ffffff',
                                fontSize: '12.5px',
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
}
