'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

interface BadgeUnlockModalProps {
    badge: {
        id: string
        name: string
        description: string | null
        icon_url: string | null
    }
    onClose: () => void
}

export default function BadgeUnlockModal({ badge, onClose }: BadgeUnlockModalProps) {
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
                    transition={{ type: 'spring', duration: 0.6, bounce: 0.35 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '2px solid var(--accent-cyan)',
                        borderRadius: '8px',
                        padding: '36px',
                        textAlign: 'center',
                        maxWidth: '380px',
                        width: '90%',
                    }}
                >
                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                        <Trophy size={42} style={{ color: 'var(--accent-cyan)' }} />
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '13px',
                        letterSpacing: '3px',
                        color: 'var(--accent-cyan)',
                        marginBottom: '10px',
                    }}>
                        BADGE UNLOCKED!
                    </div>
                    <div style={{ fontSize: '42px', marginBottom: '8px' }}>
                        {badge.icon_url || '🏅'}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
                        {badge.name}
                    </h3>
                    {badge.description && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                            {badge.description}
                        </p>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            borderRadius: '4px',
                            backgroundColor: 'var(--accent-cyan)',
                            color: 'var(--bg-primary)',
                            padding: '10px 30px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        LANJUTKAN
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
