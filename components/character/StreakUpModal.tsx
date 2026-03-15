'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface StreakUpModalProps {
    oldStreak: number
    newStreak: number
    onClose: () => void
}

export default function StreakUpModal({ oldStreak, newStreak, onClose }: StreakUpModalProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '2px solid var(--accent-red)',
                        borderRadius: '8px',
                        padding: '40px',
                        textAlign: 'center',
                        maxWidth: '380px',
                        width: '90%',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                x: Math.cos(i * 45 * (Math.PI / 180)) * 80,
                                y: Math.sin(i * 45 * (Math.PI / 180)) * 80,
                            }}
                            transition={{ duration: 1.2, delay: i * 0.08, repeat: Infinity, repeatDelay: 1 }}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '6px',
                                height: '6px',
                                backgroundColor: 'var(--accent-red)',
                                borderRadius: '50%',
                            }}
                        />
                    ))}

                    <motion.div
                        animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, delay: 0.3, repeat: Infinity, repeatDelay: 2 }}
                        style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}
                    >
                        <Flame size={48} style={{ color: 'var(--accent-red)' }} />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '13px',
                            letterSpacing: '3px',
                            color: 'var(--accent-red)',
                            marginBottom: '8px',
                            opacity: 0.9,
                        }}>
                            STREAK UP!
                        </div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '52px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                            {oldStreak} <span style={{ color: 'var(--accent-red)', fontSize: '32px' }}>→</span> {newStreak}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ marginTop: '16px', marginBottom: '24px' }}
                    >
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Mantap! Streak harianmu naik jadi {newStreak} hari.
                        </p>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onClose}
                        style={{
                            backgroundColor: 'var(--accent-red)',
                            color: 'var(--text-primary)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '10px 32px',
                            fontFamily: 'var(--font-heading)',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        LANJUTKAN
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
