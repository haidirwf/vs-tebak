'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Sparkles, X } from 'lucide-react'

interface StreakUpModalProps {
    oldStreak: number
    newStreak: number
    onClose: () => void
}

export default function StreakUpModal({ oldStreak, newStreak, onClose }: StreakUpModalProps) {
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
                    className="card"
                    style={{
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        borderRadius: '16px',
                        padding: '24px 20px',
                        textAlign: 'center',
                        maxWidth: '360px',
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

                    {/* Flame Icon Badge with dynamic flame pulse and aura */}
                    <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 16px' }}>
                        {/* Outer ambient glow pulse */}
                        <motion.div
                            animate={{
                                scale: [1, 1.25, 1],
                                opacity: [0.35, 0.7, 0.35],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            style={{
                                position: 'absolute',
                                inset: -4,
                                borderRadius: '18px',
                                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                                filter: 'blur(8px)',
                            }}
                        />

                        {/* Floating sparks around badge */}
                        {[
                            { top: '-4px', left: '10px', delay: 0 },
                            { top: '6px', right: '-4px', delay: 0.4 },
                            { bottom: '2px', left: '-2px', delay: 0.8 },
                        ].map((spark, idx) => (
                            <motion.div
                                key={idx}
                                animate={{
                                    y: [-2, -8, -2],
                                    opacity: [0, 1, 0],
                                    scale: [0.8, 1.2, 0.8],
                                }}
                                transition={{
                                    duration: 1.6,
                                    repeat: Infinity,
                                    delay: spark.delay,
                                    ease: 'easeInOut',
                                }}
                                style={{
                                    position: 'absolute',
                                    ...spark,
                                    color: 'var(--accent-red)',
                                    pointerEvents: 'none',
                                }}
                            >
                                <Sparkles size={11} />
                            </motion.div>
                        ))}

                        <motion.div
                            animate={{
                                scale: [1, 1.06, 1],
                            }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '16px',
                                backgroundColor: 'rgba(239, 68, 68, 0.14)',
                                border: '1px solid rgba(239, 68, 68, 0.45)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                zIndex: 1,
                            }}
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.15, 1],
                                    rotate: [0, -5, 5, 0],
                                }}
                                transition={{
                                    duration: 1.4,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Flame size={28} style={{ color: 'var(--accent-red)' }} />
                            </motion.div>
                        </motion.div>
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
                            color: 'var(--accent-red)',
                            textTransform: 'uppercase',
                            marginBottom: '12px',
                        }}
                    >
                        <Sparkles size={12} />
                        Streak Harian Naik
                    </div>

                    {/* Streak Transition Indicator with animated arrival */}
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
                                color: 'var(--color-silver)',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '10px',
                                padding: '6px 14px',
                                minWidth: '55px',
                            }}
                        >
                            {oldStreak}
                        </div>
                        <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ color: 'var(--accent-red)', fontSize: '20px', fontWeight: 600 }}
                        >
                            →
                        </motion.span>
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: [0.6, 1.15, 1], opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '32px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                backgroundColor: 'rgba(239, 68, 68, 0.16)',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                borderRadius: '10px',
                                padding: '6px 18px',
                                minWidth: '65px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                            }}
                        >
                            <Flame size={18} style={{ color: 'var(--accent-red)' }} />
                            {newStreak}
                        </motion.div>
                    </div>

                    <h3
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            margin: '0 0 6px',
                        }}
                    >
                        Konsistensi Luar Biasa!
                    </h3>
                    <p
                        style={{
                            color: 'var(--color-fog)',
                            fontSize: '12.5px',
                            lineHeight: 1.45,
                            margin: '0 0 20px',
                        }}
                    >
                        Kamu telah aktif belajar selama <strong style={{ color: 'var(--text-primary)' }}>{newStreak} hari</strong> berturut-turut. Jaga api semangat belajarmu tetap menyala!
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
                            backgroundColor: 'var(--accent-red)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Lanjutkan
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
