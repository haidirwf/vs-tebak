'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import BadgeIcon from '@/components/character/BadgeIcon'

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
                        border: '1px solid rgba(56, 189, 248, 0.35)',
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

                    {/* Badge Icon Hero */}
                    <div
                        style={{
                            width: '76px',
                            height: '76px',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(245, 197, 66, 0.1)',
                            border: '1px solid rgba(245, 197, 66, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '8px auto 16px',
                        }}
                    >
                        <BadgeIcon icon={badge.icon_url} size={44} color="#F5C542" />
                    </div>

                    <div
                        style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#F5C542',
                            marginBottom: '6px',
                        }}
                    >
                        Lencana Baru Terbuka
                    </div>

                    <h3
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            margin: '0 0 6px',
                        }}
                    >
                        {badge.name}
                    </h3>

                    {badge.description && (
                        <p
                            style={{
                                color: 'var(--color-fog)',
                                fontSize: '12.5px',
                                lineHeight: 1.45,
                                margin: '0 0 20px',
                            }}
                        >
                            {badge.description}
                        </p>
                    )}

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
                            backgroundColor: 'var(--accent-cyan)',
                            color: '#000000',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Koleksi Lencana
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
