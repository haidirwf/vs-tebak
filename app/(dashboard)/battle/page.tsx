'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Swords, 
    KeyRound, 
    Shuffle, 
    Bot, 
    Loader2, 
    X, 
    Clock, 
    Zap, 
    Flame, 
    RefreshCw, 
    ArrowRight, 
    Plus
} from 'lucide-react'

const CATEGORIES = [
    { value: 'coding', label: 'Coding', emoji: '💻' },
    { value: 'design', label: 'Desain', emoji: '🎨' },
    { value: 'productivity', label: 'Produktivitas', emoji: '⚡' },
    { value: 'business', label: 'Bisnis', emoji: '📈' },
    { value: 'general', label: 'Umum', emoji: '🎯' },
]

const MATCHMAKING_TIMEOUT_MS = 45_000
const MATCHMAKING_POLL_BASE_MS = 1_500
const MATCHMAKING_POLL_MAX_MS = 5_000

interface AvailableRoom {
    id: string
    room_code: string
    category: string
    created_at: string
    host_name: string
}

export default function BattlePage() {
    const router = useRouter()
    const [mode, setMode] = useState<'select' | 'create' | 'join' | 'matchmaking'>('select')
    const [roomCode, setRoomCode] = useState('')
    const [category, setCategory] = useState('general')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pendingBattleId, setPendingBattleId] = useState<string | null>(null)
    const [matchmakingTimedOut, setMatchmakingTimedOut] = useState(false)
    const [matchmakingElapsedSec, setMatchmakingElapsedSec] = useState(0)
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([])
    const [refreshingRooms, setRefreshingRooms] = useState(false)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)
    const matchmakingTimerRef = useRef<NodeJS.Timeout | null>(null)
    const roomsPollingRef = useRef<NodeJS.Timeout | null>(null)
    const cancelRequestedRef = useRef(false)

    const fetchRooms = async () => {
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
        try {
            const res = await fetch('/api/battle/list')
            if (res.ok) {
                const data = await res.json()
                const rooms = Array.isArray(data.rooms) ? (data.rooms as AvailableRoom[]) : []
                setAvailableRooms(rooms)
            }
        } catch (e: any) {
            console.error(e)
        }
    }

    const handleManualRefresh = async () => {
        setRefreshingRooms(true)
        await fetchRooms()
        setTimeout(() => setRefreshingRooms(false), 500)
    }

    // Fetch available rooms on mount and periodic poll
    useEffect(() => {
        fetchRooms()
        roomsPollingRef.current = setInterval(fetchRooms, 15000)
        return () => {
            if (roomsPollingRef.current) clearInterval(roomsPollingRef.current)
        }
    }, [])

    // When matchmaking, poll the battle row until an opponent joins
    useEffect(() => {
        if (mode !== 'matchmaking' || !pendingBattleId) return

        cancelRequestedRef.current = false
        const startedAt = Date.now()
        let attempts = 0
        let stopped = false

        const cancelPendingRoom = () => {
            if (cancelRequestedRef.current) return
            cancelRequestedRef.current = true
            const endpoint = `/api/battle/${pendingBattleId}`
            if (navigator.sendBeacon) {
                const payload = new Blob([JSON.stringify({ reason: 'page_leave' })], { type: 'application/json' })
                navigator.sendBeacon(endpoint, payload)
                return
            }
            fetch(endpoint, { method: 'DELETE', keepalive: true }).catch(() => { })
        }

        const runPoll = async () => {
            if (stopped) return

            const elapsed = Date.now() - startedAt
            setMatchmakingElapsedSec(Math.floor(elapsed / 1000))

            if (elapsed >= MATCHMAKING_TIMEOUT_MS) {
                stopped = true
                clearTimeout(pollingRef.current!)
                clearInterval(matchmakingTimerRef.current!)
                setMatchmakingTimedOut(true)
                setError('Belum menemukan lawan. Silakan coba lagi.')
                cancelPendingRoom()
                setPendingBattleId(null)
                return
            }

            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
                pollingRef.current = setTimeout(runPoll, MATCHMAKING_POLL_MAX_MS)
                return
            }

            const res = await fetch(`/api/battle/${pendingBattleId}`)
            if (!res.ok) {
                if (res.status === 403 || res.status === 404) {
                    stopped = true
                    clearTimeout(pollingRef.current!)
                    clearInterval(matchmakingTimerRef.current!)
                    setPendingBattleId(null)
                    setMode('select')
                    setError('Room matchmaking sudah tidak tersedia. Coba lagi.')
                }
                return
            }
            const data = await res.json()
            if (data.status === 'active') {
                stopped = true
                clearTimeout(pollingRef.current!)
                clearInterval(matchmakingTimerRef.current!)
                router.push(`/battle/${pendingBattleId}`)
                return
            }

            attempts += 1
            const delay = Math.min(MATCHMAKING_POLL_BASE_MS + attempts * 350, MATCHMAKING_POLL_MAX_MS)
            pollingRef.current = setTimeout(runPoll, delay)
        }

        matchmakingTimerRef.current = setInterval(() => {
            setMatchmakingElapsedSec(Math.floor((Date.now() - startedAt) / 1000))
        }, 1000)
        runPoll()

        const handleUnload = () => {
            if (pendingBattleId && mode === 'matchmaking') {
                cancelPendingRoom()
            }
        }

        window.addEventListener('beforeunload', handleUnload)

        return () => {
            stopped = true
            clearTimeout(pollingRef.current!)
            clearInterval(matchmakingTimerRef.current!)
            window.removeEventListener('beforeunload', handleUnload)
            if (pendingBattleId && mode === 'matchmaking') {
                cancelPendingRoom()
            }
        }
    }, [mode, pendingBattleId, router])

    async function handleCreate() {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/battle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category }),
        })
        const data = await res.json()
        if (data.error) { setError(data.error); setLoading(false); return }
        router.push(`/battle/${data.battle.id}`)
    }

    async function handleJoin(e?: React.MouseEvent | string, directCode?: string) {
        const codeToJoin = typeof e === 'string' ? e : directCode || roomCode
        if (!codeToJoin.trim()) { setError('Masukkan kode room'); return }
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/battle?code=${codeToJoin.toUpperCase().trim()}`)
        const data = await res.json()
        if (data.error) { setError(data.error); setLoading(false); return }
        router.push(`/battle/${data.battle.id}`)
    }

    async function handleMatchmaking() {
        setLoading(true)
        setError(null)
        setMatchmakingTimedOut(false)
        setMatchmakingElapsedSec(0)
        const res = await fetch('/api/battle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: 'general', matchmaking: true }),
        })
        const data = await res.json()
        setLoading(false)
        if (data.error) { setError(data.error); return }

        if (data.joined) {
            router.push(`/battle/${data.battle.id}`)
            return
        }

        setPendingBattleId(data.battle.id)
        setMode('matchmaking')
    }

    async function handleCancelMatchmaking() {
        clearTimeout(pollingRef.current!)
        clearInterval(matchmakingTimerRef.current!)
        if (pendingBattleId) {
            cancelRequestedRef.current = true
            await fetch(`/api/battle/${pendingBattleId}`, { method: 'DELETE' })
        }
        setPendingBattleId(null)
        setMatchmakingTimedOut(false)
        setMatchmakingElapsedSec(0)
        setMode('select')
    }

    const actionButtons = [
        {
            key: 'create',
            label: 'Buat Room',
            tag: 'HOST ARENA',
            icon: <Swords size={22} />,
            desc: 'Bikin arena kuis sendiri & undang rekan bertanding.',
            cta: 'Atur Room',
            action: () => { setError(null); setMode('create') },
            color: '#F5C542',
            bg: 'rgba(245, 197, 66, 0.08)',
            border: 'rgba(245, 197, 66, 0.35)',
            glow: 'rgba(245, 197, 66, 0.25)',
        },
        {
            key: 'join',
            label: 'Join Room',
            tag: 'KODE 6-DIGIT',
            icon: <KeyRound size={22} />,
            desc: 'Masuk ke arena lawan menggunakan kode undangan.',
            cta: 'Input Kode',
            action: () => { setError(null); setMode('join') },
            color: '#38bdf8',
            bg: 'rgba(56, 189, 248, 0.08)',
            border: 'rgba(56, 189, 248, 0.35)',
            glow: 'rgba(56, 189, 248, 0.25)',
        },
        {
            key: 'matchmaking',
            label: 'Matchmaking',
            tag: 'AUTO 1V1',
            icon: <Flame size={22} />,
            desc: 'Cari penantang online seimbang secara otomatis.',
            cta: 'Cari Lawan',
            action: handleMatchmaking,
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.08)',
            border: 'rgba(16, 185, 129, 0.35)',
            glow: 'rgba(16, 185, 129, 0.25)',
        },
        {
            key: 'practice',
            label: 'Vs Computer',
            tag: 'SOLO BOT',
            icon: <Bot size={22} />,
            desc: 'Latihan solo asah taktik melawan AI Sentinel.',
            cta: 'Mulai Latihan',
            action: () => router.push('/battle/computer'),
            color: '#a855f7',
            bg: 'rgba(168, 85, 247, 0.08)',
            border: 'rgba(168, 85, 247, 0.35)',
            glow: 'rgba(168, 85, 247, 0.25)',
        },
    ]

    return (
        <div className="responsive-page battle-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Title */}
            <div style={{ marginBottom: '28px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '9999px',
                            backgroundColor: 'var(--color-signal-orange)',
                            boxShadow: '0 0 8px var(--color-signal-orange)',
                        }}
                    />
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-inter)', fontWeight: 600, color: 'var(--color-signal-orange)', letterSpacing: '0.08em' }}>
                        REALTIME 1V1 MULTIPLAYER ARENA
                    </span>
                </div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '6px', color: '#ffffff' }}>
                    ⚔️ Battle Arena
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Pilih mode duel untuk menguji ketepatan analisismu, atau tantang pemain yang sedang online di bawah.
                </p>
            </div>

            {/* Layout: 4 Buttons on TOP, List BELOW */}
            <div className="battle-select-layout">
                {/* 4 Action Buttons Grid */}
                <div className="battle-select-actions">
                    {actionButtons.map((item) => (
                        <motion.div
                            key={item.key}
                            whileHover={{ y: -4, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={item.action}
                            style={{ cursor: 'pointer', height: '100%' }}
                        >
                            <div
                                style={{
                                    height: '100%',
                                    padding: '20px',
                                    borderRadius: '17.1429px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid var(--surface-border)',
                                    borderTop: `2px solid ${item.color}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.25s ease',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                                }}
                            >
                                {/* Top row: Icon and Badge */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '10px',
                                            backgroundColor: item.bg,
                                            border: `1px solid ${item.border}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: item.color,
                                            boxShadow: `0 0 16px ${item.glow}`,
                                        }}
                                    >
                                        {item.icon}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: '10px',
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 700,
                                            letterSpacing: '0.06em',
                                            color: item.color,
                                            backgroundColor: item.bg,
                                            border: `1px solid ${item.border}`,
                                            padding: '3px 8px',
                                            borderRadius: '9999px',
                                        }}
                                    >
                                        {item.tag}
                                    </span>
                                </div>

                                {/* Title & Subtitle */}
                                <div>
                                    <h3
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '17px',
                                            fontWeight: 700,
                                            color: '#ffffff',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        {item.label}
                                    </h3>
                                    <p
                                        style={{
                                            color: 'var(--color-fog)',
                                            fontSize: '12px',
                                            lineHeight: 1.45,
                                            margin: 0,
                                        }}
                                    >
                                        {item.desc}
                                    </p>
                                </div>

                                {/* Footer CTA */}
                                <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            color: item.color,
                                            fontFamily: 'var(--font-heading)',
                                            letterSpacing: '0.04em',
                                        }}
                                    >
                                        {item.cta}
                                    </span>
                                    <ArrowRight size={13} style={{ color: item.color }} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Available Rooms List on BOTTOM */}
                <div
                    className="product-demo-panel battle-room-panel"
                    style={{
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                            paddingBottom: '16px',
                            marginBottom: '16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '9999px',
                                        backgroundColor: 'var(--color-vector-green)',
                                        boxShadow: '0 0 8px var(--color-vector-green)',
                                    }}
                                />
                                <h2
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '17px',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        margin: 0,
                                    }}
                                >
                                    🔥 Daftar Room Publik Tersedia
                                </h2>
                            </div>
                            <p style={{ color: 'var(--color-fog)', fontSize: '12px', margin: '4px 0 0 0' }}>
                                Tantang pemain lain yang sedang menunggu lawan di lobby publik
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: availableRooms.length > 0 ? 'var(--color-vector-green)' : 'var(--color-steel)',
                                    backgroundColor: availableRooms.length > 0 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                                    border: `1px solid ${availableRooms.length > 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                                    padding: '4px 10px',
                                    borderRadius: '9999px',
                                    fontFamily: 'var(--font-mono)',
                                }}
                            >
                                {availableRooms.length} Room Terbuka
                            </span>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={handleManualRefresh}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 12px',
                                    borderRadius: '9999px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    color: 'var(--color-silver)',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                <RefreshCw size={12} className={refreshingRooms ? 'animate-spin' : ''} />
                                Segarkan
                            </motion.button>
                        </div>
                    </div>

                    {/* Room list content */}
                    {availableRooms.length === 0 ? (
                        <div
                            className="battle-room-empty"
                            style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '14px',
                                border: '1px dashed rgba(255, 255, 255, 0.1)',
                                color: 'var(--color-fog)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                            }}
                        >
                            <div
                                style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '14px',
                                    backgroundColor: 'rgba(245, 197, 66, 0.08)',
                                    border: '1px solid rgba(245, 197, 66, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    marginBottom: '4px',
                                }}
                            >
                                🛡️
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                                Belum Ada Room Publik Terbuka
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--color-steel)', maxWidth: '420px', margin: 0, lineHeight: 1.5 }}>
                                Saat ini belum ada penantang yang membuka room. Buat room baru dan jadilah host pertama, atau coba mode Matchmaking!
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setError(null); setMode('create') }}
                                className="btn-signal-orange"
                                style={{
                                    marginTop: '8px',
                                    padding: '8px 18px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <Plus size={14} /> Buat Room Sekarang
                            </motion.button>
                        </div>
                    ) : (
                        <div className="battle-room-list">
                            {availableRooms.map((room) => {
                                const catEmoji = CATEGORIES.find(c => c.value === room.category)?.emoji || '🎯'
                                const catLabel = CATEGORIES.find(c => c.value === room.category)?.label || 'Umum'
                                const roomTime = new Date(room.created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })

                                return (
                                    <div
                                        key={room.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: '12px',
                                            padding: '14px 18px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div
                                                style={{
                                                    width: '44px',
                                                    height: '44px',
                                                    backgroundColor: 'rgba(245, 197, 66, 0.1)',
                                                    borderRadius: '10px',
                                                    border: '1px solid rgba(245, 197, 66, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '22px',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {catEmoji}
                                            </div>
                                            <div>
                                                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '14px', color: '#ffffff', marginBottom: '3px' }}>
                                                    Room {room.host_name}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--color-fog)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-steel)' }}>
                                                        <Clock size={11} /> {roomTime}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-signal-orange)' }}>
                                                        <Zap size={11} /> {catLabel}
                                                    </span>
                                                    <span
                                                        style={{
                                                            backgroundColor: 'rgba(245, 197, 66, 0.12)',
                                                            border: '1px solid rgba(245, 197, 66, 0.3)',
                                                            padding: '1px 7px',
                                                            borderRadius: '9999px',
                                                            fontFamily: 'var(--font-mono)',
                                                            fontWeight: 700,
                                                            color: 'var(--color-signal-orange)',
                                                            fontSize: '11px',
                                                        }}
                                                    >
                                                        #{room.room_code}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleJoin(room.room_code)}
                                            disabled={loading}
                                            className="btn-signal-orange"
                                            style={{
                                                padding: '8px 18px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Swords size={13} /> {loading ? '...' : 'TANTANG DUEL'}
                                        </motion.button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Buat Room */}
            <AnimatePresence>
                {mode === 'create' && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.78)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '16px',
                        }}
                        onClick={() => setMode('select')}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="product-demo-panel"
                            style={{
                                width: '100%',
                                maxWidth: '520px',
                                padding: '28px',
                                border: '1px solid rgba(245, 197, 66, 0.35)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: 'var(--color-signal-orange)', boxShadow: '0 0 8px var(--color-signal-orange)' }} />
                                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                                        Buat Room Battle 1v1
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMode('select')}
                                    style={{
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
                                    <X size={18} />
                                </button>
                            </div>

                            <p style={{ color: 'var(--color-fog)', fontSize: '13px', marginBottom: '18px', lineHeight: 1.5 }}>
                                Pilih topik soal untuk pertandingan. Setelah room terbuat, kamu akan mendapatkan kode akses untuk dibagikan ke teman.
                            </p>

                            <div style={{ marginBottom: '22px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-steel)', marginBottom: '10px', fontWeight: 600 }}>
                                    Kategori Soal
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '8px' }}>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setCategory(cat.value)}
                                            style={{
                                                padding: '12px 8px',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                backgroundColor: category === cat.value ? 'rgba(245, 197, 66, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                                border: `1px solid ${category === cat.value ? 'var(--color-signal-orange)' : 'rgba(255, 255, 255, 0.1)'}`,
                                                color: category === cat.value ? 'var(--color-signal-orange)' : 'var(--color-silver)',
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div style={{ color: 'var(--accent-red)', fontSize: '12px', marginBottom: '16px', padding: '8px 12px', backgroundColor: 'rgba(232, 64, 64, 0.1)', borderRadius: '8px', border: '1px solid rgba(232, 64, 64, 0.3)' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setMode('select')}
                                    className="btn-dark-outline"
                                    style={{ padding: '10px 20px', fontSize: '13px' }}
                                >
                                    Batal
                                </button>
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCreate}
                                    disabled={loading}
                                    className="btn-signal-orange"
                                    style={{ padding: '10px 24px', fontSize: '13px', fontWeight: 700 }}
                                >
                                    {loading ? 'Membuat Room...' : 'BUAT ROOM SEKARANG'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Join Room */}
            <AnimatePresence>
                {mode === 'join' && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.78)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '16px',
                        }}
                        onClick={() => { setMode('select'); setRoomCode(''); setError(null) }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="product-demo-panel"
                            style={{
                                width: '100%',
                                maxWidth: '460px',
                                padding: '28px',
                                border: '1px solid rgba(56, 189, 248, 0.35)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                                        Join Room Battle
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setMode('select'); setRoomCode(''); setError(null) }}
                                    style={{
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
                                    <X size={18} />
                                </button>
                            </div>

                            <p style={{ color: 'var(--color-fog)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
                                Masukkan 6-digit kode room yang dibagikan oleh teman atau penyelenggara duel:
                            </p>

                            <div style={{ marginBottom: '22px' }}>
                                <input
                                    autoFocus
                                    aria-label="Kode room"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    placeholder="ABCDEF"
                                    maxLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        border: '1px solid rgba(56, 189, 248, 0.4)',
                                        borderRadius: '12px',
                                        color: '#38bdf8',
                                        fontSize: '24px',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 800,
                                        textAlign: 'center',
                                        letterSpacing: '8px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        boxShadow: '0 0 16px rgba(56, 189, 248, 0.15)',
                                    }}
                                />
                            </div>

                            {error && (
                                <div style={{ color: 'var(--accent-red)', fontSize: '12px', marginBottom: '16px', padding: '8px 12px', backgroundColor: 'rgba(232, 64, 64, 0.1)', borderRadius: '8px', border: '1px solid rgba(232, 64, 64, 0.3)' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => { setMode('select'); setRoomCode(''); setError(null) }}
                                    className="btn-dark-outline"
                                    style={{ padding: '10px 20px', fontSize: '13px' }}
                                >
                                    Batal
                                </button>
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleJoin}
                                    disabled={loading || roomCode.trim().length === 0}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '9999px',
                                        border: 'none',
                                        backgroundColor: '#38bdf8',
                                        color: '#050505',
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: loading || roomCode.trim().length === 0 ? 'not-allowed' : 'pointer',
                                        opacity: loading || roomCode.trim().length === 0 ? 0.6 : 1,
                                        boxShadow: '0 0 14px rgba(56, 189, 248, 0.4)',
                                    }}
                                >
                                    {loading ? 'Bergabung...' : 'GABUNG ROOM'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Matchmaking radar */}
            <AnimatePresence>
                {mode === 'matchmaking' && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '16px',
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            className="product-demo-panel"
                            style={{
                                width: '100%',
                                maxWidth: '440px',
                                padding: '36px 28px',
                                textAlign: 'center',
                                border: '1px solid rgba(16, 185, 129, 0.35)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
                            }}
                        >
                            {/* Animated Radar Pulse */}
                            <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <motion.div
                                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: '9999px',
                                        border: '2px solid rgba(16, 185, 129, 0.5)',
                                    }}
                                />
                                <div
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '16px',
                                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#10b981',
                                        fontSize: '28px',
                                        boxShadow: '0 0 24px rgba(16, 185, 129, 0.3)',
                                    }}
                                >
                                    <Shuffle size={28} />
                                </div>
                            </div>

                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                                {matchmakingTimedOut ? 'Waktu Matchmaking Habis' : 'Mencari Lawan Duel...'}
                            </h2>
                            <p style={{ color: 'var(--color-fog)', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                                {matchmakingTimedOut
                                    ? 'Belum ada lawan yang cocok saat ini. Coba kembali atau buat room sendiri.'
                                    : 'Sistem sedang mencarikan lawan seimbang secara otomatis. Mohon tunggu...'}
                            </p>

                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 12px',
                                    borderRadius: '9999px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontSize: '12px',
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--color-silver)',
                                    marginBottom: '24px',
                                }}
                            >
                                <Clock size={12} /> Waktu Tunggu: {matchmakingElapsedSec}s
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                {matchmakingTimedOut ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => { setMode('select'); setError(null) }}
                                            className="btn-dark-outline"
                                            style={{ padding: '10px 20px', fontSize: '13px' }}
                                        >
                                            Kembali
                                        </button>
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleMatchmaking}
                                            disabled={loading}
                                            style={{
                                                padding: '10px 22px',
                                                borderRadius: '9999px',
                                                border: 'none',
                                                backgroundColor: '#10b981',
                                                color: '#050505',
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '13px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Coba Lagi
                                        </motion.button>
                                    </>
                                ) : (
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCancelMatchmaking}
                                        style={{
                                            padding: '10px 24px',
                                            borderRadius: '9999px',
                                            backgroundColor: 'rgba(232, 64, 64, 0.1)',
                                            border: '1px solid rgba(232, 64, 64, 0.35)',
                                            color: 'var(--accent-red)',
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        <X size={15} /> Batalkan Pencarian
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
