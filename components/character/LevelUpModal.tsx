'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Sparkles, X } from 'lucide-react'

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
                    overscrollBehavior: 'contain',
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.94, opacity: 0, y: 10 }}
                    transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="card"
                    style={{
                        backgroundColor: '#141414',
                        border: '1px solid rgba(245, 197, 66, 0.35)',
                        borderRadius: '16px',
                        padding: '24px 20px',
                        textAlign: 'center',
                        maxWidth: '360px',
                        width: '100%',
                        position: 'relative',
                        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.95)',
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
                            color: 'var(--color-fog)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
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
                            backgroundColor: 'rgba(245, 197, 66, 0.12)',
                            border: '1px solid rgba(245, 197, 66, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}
                    >
                        <ArrowUp size={24} style={{ color: 'var(--color-gold)' }} />
                    </div>

                    {/* Subtitle / Header */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontFamily: 'var(--font-inter)',
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            color: 'var(--color-gold)',
                            textTransform: 'uppercase',
                            marginBottom: '10px',
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
                            marginBottom: '14px',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '28px',
                                fontWeight: 700,
                                color: 'var(--color-silver)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                padding: '6px 16px',
                                minWidth: '60px',
                            }}
                        >
                            {oldLevel}
                        </div>
                        <span style={{ color: 'var(--color-gold)', fontSize: '20px', fontWeight: 600 }}>→</span>
                        <div
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '32px',
                                fontWeight: 700,
                                color: '#ffffff',
                                backgroundColor: 'rgba(245, 197, 66, 0.14)',
                                border: '1px solid rgba(245, 197, 66, 0.45)',
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
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#ffffff',
                            margin: '0 0 6px',
                        }}
                    >
                        Selamat! Kamu naik ke Level {newLevel}
                    </h3>
                    <p
                        style={{
                            color: 'var(--color-fog)',
                            fontSize: '12.5px',
                            lineHeight: 1.45,
                            margin: '0 0 20px',
                        }}
                    >
                        Keahlian dan atribut karaktermu kini semakin kuat. Terus selesaikan tantangan untuk membuka lebih banyak reward!
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            backgroundColor: 'var(--color-gold)',
                            color: '#000000',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Lanjutkan Belajar
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
