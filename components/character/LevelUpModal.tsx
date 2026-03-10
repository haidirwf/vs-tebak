'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

interface LevelUpModalProps {
    oldLevel: number
    newLevel: number
    onClose: () => void
}

export default function LevelUpModal({ oldLevel, newLevel, onClose }: LevelUpModalProps) {
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
                    position: 'fixed', inset: 0, zIndex: 1000,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                        border: '2px solid var(--accent-gold)',
                        borderRadius: '8px', padding: '48px', textAlign: 'center',
                        maxWidth: '380px', width: '90%', position: 'relative', overflow: 'hidden',
                    }}
                >
                    {/* Animated particles */}
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
                                position: 'absolute', top: '50%', left: '50%',
                                width: '6px', height: '6px',
                                backgroundColor: 'var(--accent-gold)',
                                borderRadius: '50%',
                            }}
                        />
                    ))}

                    {/* Icon */}
                    <motion.div
                        animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, delay: 0.3, repeat: Infinity, repeatDelay: 2 }}
                        style={{ marginBottom: '16px' }}
                    >
                        <ArrowUp size={48} style={{ color: 'var(--accent-gold)', margin: '0 auto' }} />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div style={{
                            fontFamily: 'var(--font-heading)', fontSize: '13px', letterSpacing: '3px',
                            color: 'var(--accent-gold)', marginBottom: '8px', opacity: 0.8,
                        }}>
                            LEVEL UP!
                        </div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '52px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                            {oldLevel} <span style={{ color: 'var(--accent-gold)', fontSize: '32px' }}>→</span> {newLevel}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ marginTop: '16px', marginBottom: '24px' }}
                    >
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Selamat! Kamu naik ke Level {newLevel}! 🎉
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                            Skill dan stats karaktermu meningkat!
                        </p>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onClose}
                        style={{
                            backgroundColor: 'var(--accent-gold)', color: 'var(--bg-primary)',
                            border: 'none', borderRadius: '4px', padding: '10px 32px',
                            fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700,
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
