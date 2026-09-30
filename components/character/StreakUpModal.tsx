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
                        border: '1px solid rgba(239, 68, 68, 0.35)',
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

                    {/* Flame Icon Badge */}
                    <div
                        style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '14px',
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}
                    >
                        <Flame size={24} style={{ color: 'var(--accent-red)' }} />
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
                            marginBottom: '10px',
                        }}
                    >
                        <Sparkles size={12} />
                        Streak Harian Naik
                    </div>

                    {/* Streak Transition Indicator */}
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
                            {oldStreak}
                        </div>
                        <span style={{ color: 'var(--accent-red)', fontSize: '20px', fontWeight: 600 }}>→</span>
                        <div
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '32px',
                                fontWeight: 700,
                                color: '#ffffff',
                                backgroundColor: 'rgba(239, 68, 68, 0.14)',
                                border: '1px solid rgba(239, 68, 68, 0.45)',
                                borderRadius: '10px',
                                padding: '6px 18px',
                                minWidth: '65px',
                            }}
                        >
                            {newStreak}
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
                        Kamu telah aktif belajar selama <strong style={{ color: '#ffffff' }}>{newStreak} hari</strong> berturut-turut. Jaga api semangat belajarmu tetap menyala!
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
