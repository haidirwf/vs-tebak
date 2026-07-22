'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface FirstTimeTutorialProps {
    userId: string
    isNewUser: boolean
    blocked?: boolean
    forceShow?: boolean
}

type TourStep = {
    id: string
    selector: string
    title: string
    description: string
    route: string
}

const STEPS: TourStep[] = [
    {
        id: 'modules',
        selector: '[data-tour="nav-modules"]',
        title: 'Ini Tombol Modul',
        description: 'Mulai dari sini untuk belajar materi, ngerjain quiz, dan kumpulin XP utama.',
        route: '/modules',
    },
    {
        id: 'battle',
        selector: '[data-tour="nav-battle"]',
        title: 'Ini Tombol Battle',
        description: 'Masuk ke mode tanding quiz cepat untuk nguji skill dan dapat XP tambahan.',
        route: '/battle',
    },
    {
        id: 'voucher',
        selector: '[data-tour="nav-voucher"]',
        title: 'Ini Tombol Voucher',
        description: 'XP yang terkumpul bisa ditukar jadi voucher di tab ini.',
        route: '/voucher',
    },
    {
        id: 'leaderboard',
        selector: '[data-tour="nav-leaderboard"]',
        title: 'Ini Tombol Leaderboard',
        description: 'Di sini kamu bisa lihat peringkat dan bandingkan progresmu dengan pemain lain.',
        route: '/leaderboard',
    },
    {
        id: 'profile',
        selector: '[data-tour="nav-profile"]',
        title: 'Ini Tombol Profil',
        description: 'Di sini kamu lihat level, streak, badge, dan statistik progres akunmu.',
        route: '/profile',
    },
]

type SpotRect = { top: number; left: number; width: number; height: number }

export default function FirstTimeTutorial({ userId, isNewUser, blocked = false, forceShow = false }: FirstTimeTutorialProps) {
    const storageKey = useMemo(() => `sq:tutorial:v3:${userId}`, [userId])
    const [stepIndex, setStepIndex] = useState(0)
    const [rect, setRect] = useState<SpotRect | null>(null)
    const [phase, setPhase] = useState<'welcome' | 'tour'>('welcome')
    const [open, setOpen] = useState(() => {
        if (typeof window === 'undefined') return false
        const dismissed = window.localStorage.getItem(storageKey) === 'done'
        return forceShow || (!dismissed && isNewUser)
    })

    const step = STEPS[stepIndex]
    const isLast = stepIndex === STEPS.length - 1
    const panelWidth = 400
    const panelHeight = 220

    useEffect(() => {
        if (!open || !step) return

        const measure = () => {
            const target = document.querySelector(step.selector) as HTMLElement | null
            if (!target) {
                setRect(null)
                return
            }
            if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }
            const r = target.getBoundingClientRect()
            setRect({
                top: Math.max(8, r.top - 8),
                left: Math.max(8, r.left - 8),
                width: r.width + 16,
                height: r.height + 16,
            })
        }

        const onResizeOrScroll = () => requestAnimationFrame(measure)
        const initial = requestAnimationFrame(measure)
        window.addEventListener('resize', onResizeOrScroll)
        window.addEventListener('scroll', onResizeOrScroll, true)

        return () => {
            cancelAnimationFrame(initial)
            window.removeEventListener('resize', onResizeOrScroll)
            window.removeEventListener('scroll', onResizeOrScroll, true)
        }
    }, [open, step])

    function closeTutorial() {
        window.localStorage.setItem(storageKey, 'done')
        setOpen(false)
    }

    if (!open || blocked || !step) return null

    const viewW = typeof window !== 'undefined' ? window.innerWidth : 1200
    const viewH = typeof window !== 'undefined' ? window.innerHeight : 800
    const isMobile = viewW <= 768
    const panelPos = rect
        ? (() => {
              if (isMobile) {
                  return { left: 8, top: Math.max(8, viewH - 250) }
              }
              const gap = 14
              const canRight = rect.left + rect.width + gap + panelWidth <= viewW - 8
              const canLeft = rect.left - gap - panelWidth >= 8
              const left = canRight
                  ? rect.left + rect.width + gap
                  : canLeft
                      ? rect.left - panelWidth - gap
                      : Math.max(8, viewW - panelWidth - 8)
              const top = Math.max(8, Math.min(rect.top + rect.height / 2 - panelHeight / 2, viewH - panelHeight - 8))
              return { left, top }
          })()
        : { left: 12, top: Math.max(8, viewH - panelHeight - 12) }

    if (phase === 'welcome') {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}
                >
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.44)' }} />
                    <motion.div
                        initial={{ y: 10, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 8, opacity: 0, scale: 0.98 }}
                        className="card"
                        style={{
                            width: 'min(440px, calc(100vw - 24px))',
                            borderRadius: '12px',
                            padding: '18px',
                            zIndex: 1302,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 800 }}>
                                Selamat Datang!
                            </h3>
                            <button
                                type="button"
                                onClick={closeTutorial}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-secondary)',
                                    display: 'grid',
                                    placeItems: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '14px' }}>
                            Kami kasih tur singkat buat nunjukin tombol-tombol penting biar kamu langsung paham alurnya.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setPhase('tour')}
                                style={{
                                    border: 'none',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--accent-gold)',
                                    color: 'var(--bg-primary)',
                                    padding: '10px 14px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                }}
                            >
                                Mulai Tur
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        )
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, zIndex: 1300, pointerEvents: 'auto' }}
            >
                {rect ? (
                    <>
                        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: `${rect.top}px`, backgroundColor: 'rgba(0,0,0,0.52)' }} />
                        <div style={{ position: 'fixed', left: 0, top: `${rect.top}px`, width: `${rect.left}px`, height: `${rect.height}px`, backgroundColor: 'rgba(0,0,0,0.52)' }} />
                        <div style={{ position: 'fixed', left: `${rect.left + rect.width}px`, top: `${rect.top}px`, width: `calc(100vw - ${rect.left + rect.width}px)`, height: `${rect.height}px`, backgroundColor: 'rgba(0,0,0,0.52)' }} />
                        <div style={{ position: 'fixed', left: 0, top: `${rect.top + rect.height}px`, width: '100vw', height: `calc(100vh - ${rect.top + rect.height}px)`, backgroundColor: 'rgba(0,0,0,0.52)' }} />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                top: rect.top,
                                left: rect.left,
                                width: rect.width,
                                height: rect.height,
                                borderRadius: '10px',
                                border: '2px solid var(--accent-gold)',
                                pointerEvents: 'none',
                                zIndex: 1301,
                            }}
                        />
                    </>
                ) : (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.52)' }} />
                )}

                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 8, opacity: 0 }}
                    className="card"
                    style={{
                        position: 'fixed',
                        left: `${panelPos.left}px`,
                        top: `${panelPos.top}px`,
                        width: isMobile ? 'calc(100vw - 16px)' : `min(${panelWidth}px, calc(100vw - 16px))`,
                        zIndex: 1302,
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: isMobile ? '14px' : '16px',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '10px', marginBottom: '8px' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '3px' }}>
                                Tutorial Navigasi • {stepIndex + 1}/{STEPS.length}
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '18px' : '22px', fontWeight: 800, lineHeight: 1.1 }}>
                                {step.title}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={closeTutorial}
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)',
                                display: 'grid',
                                placeItems: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '12px' : '13px', lineHeight: 1.6, marginBottom: '12px' }}>
                        {step.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button
                            type="button"
                            disabled={stepIndex === 0}
                            onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                backgroundColor: 'var(--bg-tertiary)',
                                color: stepIndex === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                                padding: isMobile ? '8px 10px' : '9px 12px',
                                fontWeight: 700,
                                cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <ChevronLeft size={14} />
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (isLast) {
                                    closeTutorial()
                                    return
                                }
                                setStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1))
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                border: 'none',
                                borderRadius: '8px',
                                backgroundColor: 'var(--accent-cyan)',
                                color: 'var(--bg-primary)',
                                padding: isMobile ? '8px 10px' : '9px 12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                            }}
                        >
                            {isLast ? 'Selesai' : 'Next'}
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
