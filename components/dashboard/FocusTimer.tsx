// components/dashboard/FocusTimer.tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Play, Pause, RotateCcw, Zap, CheckCircle } from 'lucide-react'
import { useFocusStore } from '@/stores/focusStore'
import { useUserStore } from '@/stores/userStore'

const FOCUS_SESSION_XP = 20

export default function FocusTimer() {
    const { isActive, timeLeft, isFinished, startTimer, pauseTimer, resetTimer, tick, sessionsCount } = useFocusStore()
    const { profile, updateXP } = useUserStore()
    const [rewardClaimed, setRewardClaimed] = useState(false)
    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleFinish = useCallback(async () => {
        if (rewardClaimed) return
        
        setRewardClaimed(true)
        // Update database via XP API to trigger quest progress tracking
        if (profile?.id) {
            const res = await fetch('/api/xp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'focus_session' }),
            })

            const data = await res.json()
            if (typeof data.newXp === 'number') {
                updateXP(data.newXp, {
                    newStreak: typeof data.streak === 'number' ? data.streak : undefined,
                    newLastActive: typeof data.lastActive === 'string' || data.lastActive === null ? data.lastActive : undefined,
                    streakUpdated: data.streakUpdated === true,
                    earnedBadges: Array.isArray(data.earnedBadges) ? data.earnedBadges : undefined,
                })
            }
        }
        
        // Auto reset after 3 seconds of success state
        resetTimeoutRef.current = setTimeout(() => {
            setRewardClaimed(false)
            resetTimer()
        }, 5000)
    }, [profile?.id, resetTimer, rewardClaimed, updateXP])

    useEffect(() => {
        if (!isActive || timeLeft <= 0) return
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [isActive, timeLeft, tick])

    useEffect(() => {
        if (!isActive || timeLeft !== 0) return
        const doneTimer = setTimeout(() => {
            void handleFinish()
        }, 0)
        return () => clearTimeout(doneTimer)
    }, [isActive, timeLeft, handleFinish])

    useEffect(() => {
        return () => {
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current)
        }
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const progress = (1 - timeLeft / (25 * 60)) * 100

    return (
        <div className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Timer size={18} className="text-gold" />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700 }}>
                        Focus Timer
                    </h3>
                </div>
                <div style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)'
                }}>
                    {sessionsCount} Sesi Selesai
                </div>
            </div>

            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ 
                    fontSize: '48px', 
                    fontFamily: 'var(--font-heading)', 
                    fontWeight: 700, 
                    color: isActive ? 'var(--accent-gold)' : 'var(--text-primary)',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                    textShadow: isActive ? '0 0 20px rgba(245, 197, 66, 0.3)' : 'none'
                }}>
                    {formatTime(timeLeft)}
                </div>

                {/* Progress Ring / Bar */}
                <div style={{ 
                    height: '6px', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderRadius: '3px', 
                    width: '100%', 
                    maxWidth: '240px', 
                    margin: '0 auto 24px',
                    overflow: 'hidden'
                }}>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        style={{ height: '100%', backgroundColor: 'var(--accent-gold)' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {!isActive ? (
                        <motion.button
                            type="button"
                            aria-label="Mulai sesi fokus"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startTimer}
                            style={{
                                backgroundColor: 'var(--accent-gold)',
                                color: 'var(--bg-primary)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '10px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '14px',
                                fontFamily: 'var(--font-heading)'
                            }}
                        >
                            <Play size={16} fill="currentColor" /> MULAI FOKUS
                        </motion.button>
                    ) : (
                        <motion.button
                            type="button"
                            aria-label="Jeda sesi fokus"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={pauseTimer}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                padding: '10px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '14px'
                            }}
                        >
                            <Pause size={16} fill="currentColor" /> JEDA
                        </motion.button>
                    )}

                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(232, 64, 64, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetTimer}
                        style={{
                            backgroundColor: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            width: '42px',
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        title="Reset"
                    >
                        <RotateCcw size={16} />
                    </motion.button>
                </div>
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
                {isFinished && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(20, 20, 20, 0.9)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            textAlign: 'center',
                            padding: '20px'
                        }}
                    >
                        <div style={{ color: 'var(--accent-green)', marginBottom: '16px' }}>
                            <CheckCircle size={48} />
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                            Sesi Selesai!
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                            Kerja bagus! Kamu tetap fokus selama 25 menit.
                        </p>
                        <div style={{ 
                            backgroundColor: 'rgba(245, 197, 66, 0.1)', 
                            border: '1px solid var(--accent-gold)',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--accent-gold)',
                            fontWeight: 700,
                            fontFamily: 'var(--font-heading)'
                        }}>
                            <Zap size={16} fill="currentColor" /> +{FOCUS_SESSION_XP} XP DIAKUISISI
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative background element */}
            <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '100px',
                height: '100px',
                border: '2px dashed var(--border)',
                borderRadius: '50%',
                opacity: 0.2,
                pointerEvents: 'none'
            }} />
        </div>
    )
}
