'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Sparkles, X, ChevronRight } from 'lucide-react'

interface LevelUpModalProps {
    oldLevel: number
    newLevel: number
    onClose: () => void
}

export default function LevelUpModal({ oldLevel, newLevel, onClose }: LevelUpModalProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 6000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-overlay"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    overflow: 'hidden',
                    touchAction: 'none',
                    overscrollBehavior: 'none',
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.94, opacity: 0, y: 10 }}
                    transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="modal-dialog-card"
                    style={{
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--accent-gold-border)',
                        borderRadius: '16px',
                        padding: '28px 22px 24px',
                        textAlign: 'center',
                        maxWidth: '380px',
                        width: '100%',
                        position: 'relative',
                        boxShadow: 'var(--shadow-modal)',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                        }}
                    >
                        <X size={16} />
                    </button>

                    {/* Minimalist Icon Badge */}
                    <div
                        style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '14px',
                            backgroundColor: 'var(--accent-gold-bg)',
                            border: '1px solid var(--accent-gold-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 14px',
                        }}
                    >
                        <ArrowUp size={24} style={{ color: 'var(--accent-gold-text)' }} />
                    </div>

                    {/* Subtitle / Header */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontFamily: 'var(--font-inter)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: 'var(--accent-gold-text)',
                            textTransform: 'uppercase',
                            marginBottom: '12px',
                        }}
                    >
                        <Sparkles size={12} />
                        Level Up
                    </div>

                    {/* Level Transition Indicator */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '26px',
                                fontWeight: 700,
                                color: 'var(--text-secondary)',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '10px',
                                padding: '6px 16px',
                                minWidth: '60px',
                            }}
                        >
                            {oldLevel}
                        </div>
                        <span style={{ color: 'var(--accent-gold-text)', fontSize: '20px', fontWeight: 700 }}>→</span>
                        <div
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '30px',
                                fontWeight: 700,
                                color: 'var(--accent-gold-text)',
                                backgroundColor: 'var(--accent-gold-bg)',
                                border: '1px solid var(--accent-gold-border)',
                                borderRadius: '10px',
                                padding: '6px 18px',
                                minWidth: '65px',
                            }}
                        >
                            {newLevel}
                        </div>
                    </div>

                    <h3
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '17px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            margin: '0 0 6px',
                        }}
                    >
                        Selamat! Kamu naik ke Level {newLevel}
                    </h3>
                    <p
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '13px',
                            lineHeight: 1.5,
                            margin: '0 0 20px',
                        }}
                    >
                        Keahlian dan atribut karaktermu kini semakin kuat. Terus selesaikan tantangan untuk membuka lebih banyak reward!
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-signal-orange"
                        style={{
                            width: '100%',
                            padding: '11px 18px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        <Sparkles size={14} /> Lanjutkan Belajar <ChevronRight size={14} />
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
