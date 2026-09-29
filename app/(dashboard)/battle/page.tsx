'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
    Plus,
    ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
    { value: 'coding', label: 'Coding', emoji: '💻' },
    { value: 'design', label: 'Desain', emoji: '🎨' },
    { value: 'productivity', label: 'Produktivitas', emoji: '⚡' },
    { value: 'business', label: 'Bisnis', emoji: '📈' },
    { value: 'general', label: 'Umum', emoji: '🎯' },
]

const MATCHMAKING_TIMEOUT_MS = 45_000

interface AvailableRoom {
    id: string
    room_code: string
    category: string
    created_at: string
    host_name: string
}

export default function BattlePage() {
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])
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
    const matchmakingTimerRef = useRef<NodeJS.Timeout | null>(null)
    const cancelRequestedRef = useRef(false)

    const fetchRooms = useCallback(async () => {
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
    }, [])

    const handleManualRefresh = async () => {
        setRefreshingRooms(true)
        await fetchRooms()
        setTimeout(() => setRefreshingRooms(false), 500)
    }

    // Subscribe to battle lobby updates via Supabase Realtime WebSocket (replaces 15s polling)
    useEffect(() => {
        fetchRooms()

        const channel = supabase
            .channel('lobby-rooms')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'battles',
                },
                () => {
                    // Update rooms list immediately when any room is created, joined, finished, or deleted
                    fetchRooms()
                }
            )
            .subscribe()

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchRooms()
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            supabase.removeChannel(channel)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [supabase, fetchRooms])

    // When matchmaking, listen via Supabase Realtime WebSocket for opponent joining (0 repeated Vercel API calls)
    useEffect(() => {
        if (mode !== 'matchmaking' || !pendingBattleId) return

        cancelRequestedRef.current = false
        const startedAt = Date.now()
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

        // Direct Supabase query fallback (bypasses Vercel Serverless Function completely)
        const checkStatusDirectly = async () => {
            if (stopped) return
            const { data: battleData } = await supabase
                .from('battles')
                .select('id, status, player2_id')
                .eq('id', pendingBattleId)
                .maybeSingle()

            if (battleData && (battleData.status === 'active' || battleData.player2_id)) {
                stopped = true
                if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current)
                router.push(`/battle/${pendingBattleId}`)
            }
        }

        // 1. Subscribe to Supabase Realtime WebSocket for instant opponent join notification
        const channel = supabase
            .channel(`matchmaking:${pendingBattleId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'battles',
                    filter: `id=eq.${pendingBattleId}`,
                },
                (payload) => {
                    const updated = payload.new as { status?: string; player2_id?: string }
                    if (updated.status === 'active' || updated.player2_id) {
                        stopped = true
                        if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current)
                        router.push(`/battle/${pendingBattleId}`)
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'battles',
                    filter: `id=eq.${pendingBattleId}`,
                },
                () => {
                    stopped = true
                    if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current)
                    setPendingBattleId(null)
                    setMode('select')
                    setError('Room matchmaking sudah tidak tersedia.')
                }
            )
            .subscribe()

        // 2. UI timer for elapsed seconds and timeout
        matchmakingTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startedAt
            setMatchmakingElapsedSec(Math.floor(elapsed / 1000))

            if (elapsed >= MATCHMAKING_TIMEOUT_MS) {
                stopped = true
                if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current)
                setMatchmakingTimedOut(true)
                setError('Belum menemukan lawan. Silakan coba lagi.')
                cancelPendingRoom()
                setPendingBattleId(null)
            }
        }, 1000)

        // 3. Direct Supabase safety checks: initial check + tab focus + relaxed 12s heartbeat
        checkStatusDirectly()

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !stopped) {
                checkStatusDirectly()
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        const fallbackInterval = setInterval(() => {
            if (!stopped) checkStatusDirectly()
        }, 12000)

        const handleUnload = () => {
            if (pendingBattleId && mode === 'matchmaking') {
                cancelPendingRoom()
            }
        }
        window.addEventListener('beforeunload', handleUnload)

        return () => {
            stopped = true
            clearInterval(fallbackInterval)
            if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current)
            supabase.removeChannel(channel)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('beforeunload', handleUnload)
            if (pendingBattleId && mode === 'matchmaking') {
                cancelPendingRoom()
            }
        }
    }, [mode, pendingBattleId, router, supabase])

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
        if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current)
        if (pendingBattleId) {
            cancelRequestedRef.current = true
            await fetch(`/api/battle/${pendingBattleId}`, { method: 'DELETE' }).catch(() => {})
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
            icon: <Swords size={20} />,
            desc: 'Buat arena tandingmu sendiri dan tantang temanmu sekarang.',
            mobileDesc: 'Bikin room & tantang teman',
            cta: 'Atur Room',
            mobileCta: 'Atur',
            action: () => { setError(null); setMode('create') },
            color: '#F5C542',
            bg: 'rgba(245, 197, 66, 0.1)',
            border: 'rgba(245, 197, 66, 0.35)',
        },
        {
            key: 'join',
            label: 'Join Room',
            icon: <KeyRound size={20} />,
            desc: 'Masuk ke arena yang sudah ada menggunakan kode akses rahasia.',
            mobileDesc: 'Masuk pakai kode room',
            cta: 'Input Kode',
            mobileCta: 'Masuk',
            action: () => { setError(null); setMode('join') },
            color: '#38bdf8',
            bg: 'rgba(56, 189, 248, 0.1)',
            border: 'rgba(56, 189, 248, 0.35)',
        },
        {
            key: 'matchmaking',
            label: 'Matchmaking',
            icon: <Flame size={20} />,
            desc: 'Sistem akan mencarikan lawan yang seimbang untukmu secara otomatis.',
            mobileDesc: 'Cari lawan otomatis',
            cta: 'Cari Lawan',
            mobileCta: 'Cari',
            action: handleMatchmaking,
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.1)',
            border: 'rgba(16, 185, 129, 0.35)',
        },
        {
            key: 'practice',
            label: 'Vs Computer',
            icon: <Bot size={20} />,
            desc: 'Latihan cepat melawan AI bot tanpa harus menunggu lawan online.',
            mobileDesc: 'Latihan lawan bot AI',
            cta: 'Mulai Latihan',
            mobileCta: 'Latihan',
            action: () => router.push('/battle/computer'),
            color: '#a855f7',
            bg: 'rgba(168, 85, 247, 0.1)',
            border: 'rgba(168, 85, 247, 0.35)',
        },
    ]

    return (
        <div className="responsive-page battle-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Title */}
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '4px', color: '#ffffff' }}>
                    ⚔️ Battle Arena
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Quiz 1v1 real-time — Buktikan skillmu!
                </p>
            </div>

            {/* Layout: 4 Buttons on TOP, List BELOW */}
            <div className="battle-select-layout">
                {/* 4 Action Buttons Grid */}
                <div className="battle-select-actions">
                    {actionButtons.map((item) => (
                        <motion.div
                            key={item.key}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={item.action}
                            style={{ cursor: 'pointer', height: '100%', minWidth: 0 }}
                        >
                            <div
                                className="battle-action-card"
                                style={{
                                    borderBottom: `2px solid ${item.color}`,
                                }}
                            >
                                <div
                                    className="battle-action-icon"
                                    style={{
                                        backgroundColor: item.bg,
                                        border: `1px solid ${item.border}`,
                                        color: item.color,
                                    }}
                                >
                                    {item.icon}
                                </div>

                                <div style={{ minWidth: 0 }}>
                                    <h3 className="battle-action-title">
                                        {item.label}
                                    </h3>
                                    <p className="battle-action-desc">
                                        <span className="desktop-desc">{item.desc}</span>
                                        <span className="mobile-desc">{item.mobileDesc}</span>
                                    </p>
                                </div>

                                {/* Footer CTA with Arrow */}
                                <div className="battle-action-footer">
                                    <span
                                        className="battle-action-cta"
                                        style={{ color: item.color }}
                                    >
                                        <span className="desktop-cta">{item.cta}</span>
                                        <span className="mobile-cta">{item.mobileCta}</span>
                                    </span>
                                    <ArrowRight size={13} style={{ color: item.color, flexShrink: 0 }} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Available Rooms List on BOTTOM */}
                <div
                    className="product-demo-panel battle-room-panel"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header */}
                    <div className="battle-room-header">
                        <div>
                            <h2 className="battle-room-title">
                                🔥 Daftar Room Tersedia
                            </h2>
                            <p className="battle-room-subtitle">
                                Tantang pemain lain yang sedang menunggu lawan di lobby
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: availableRooms.length > 0 ? 'var(--color-vector-green)' : 'var(--color-steel)',
                                    backgroundColor: availableRooms.length > 0 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                                    border: `1px solid ${availableRooms.length > 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    fontFamily: 'var(--font-mono)',
                                    whiteSpace: 'nowrap',
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
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    color: 'var(--color-silver)',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
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
                                        className="battle-room-row"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                            <div
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: 'rgba(245, 197, 66, 0.1)',
                                                    borderRadius: '10px',
                                                    border: '1px solid rgba(245, 197, 66, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '20px',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {catEmoji}
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '14px', color: '#ffffff', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    Room {room.host_name}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--color-fog)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                                                            padding: '1px 6px',
                                                            borderRadius: '5px',
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
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleJoin(room.room_code)}
                                            disabled={loading}
                                            className="btn-signal-orange battle-room-btn"
                                            style={{
                                                padding: '9px 18px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Swords size={13} /> {loading ? '...' : 'Tantang Duel'}
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
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                padding: '22px 18px',
                                border: '1px solid rgba(245, 197, 66, 0.35)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                                    Buat Room Battle
                                </h2>
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
                                <div className="battle-category-grid">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setCategory(cat.value)}
                                            style={{
                                                padding: '10px 6px',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                backgroundColor: category === cat.value ? 'rgba(245, 197, 66, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                                border: `1px solid ${category === cat.value ? 'var(--color-signal-orange)' : 'rgba(255, 255, 255, 0.1)'}`,
                                                color: category === cat.value ? 'var(--color-signal-orange)' : 'var(--color-silver)',
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '11.5px',
                                                fontWeight: 600,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px',
                                                minWidth: 0,
                                                overflow: 'hidden',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            <span style={{ fontSize: '18px' }}>{cat.emoji}</span>
                                            <span style={{ width: '100%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {cat.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div style={{ color: 'var(--accent-red)', fontSize: '12px', marginBottom: '16px', padding: '8px 12px', backgroundColor: 'rgba(232, 64, 64, 0.1)', borderRadius: '8px', border: '1px solid rgba(232, 64, 64, 0.3)', wordBreak: 'break-word' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => setMode('select')}
                                    className="btn-dark-outline"
                                    style={{ padding: '9px 18px', fontSize: '13px' }}
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
                                    style={{ padding: '9px 20px', fontSize: '13px', fontWeight: 700 }}
                                >
                                    {loading ? 'Membuat Room...' : 'Buat Room'}
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
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                padding: '22px 18px',
                                border: '1px solid rgba(56, 189, 248, 0.35)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                                    Join Room Battle
                                </h2>
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
                                        padding: '12px 14px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        border: '1px solid rgba(56, 189, 248, 0.4)',
                                        borderRadius: '12px',
                                        color: '#38bdf8',
                                        fontSize: '22px',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 800,
                                        textAlign: 'center',
                                        letterSpacing: '5px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        boxShadow: '0 0 16px rgba(56, 189, 248, 0.15)',
                                    }}
                                />
                            </div>

                            {error && (
                                <div style={{ color: 'var(--accent-red)', fontSize: '12px', marginBottom: '16px', padding: '8px 12px', backgroundColor: 'rgba(232, 64, 64, 0.1)', borderRadius: '8px', border: '1px solid rgba(232, 64, 64, 0.3)', wordBreak: 'break-word' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
                                        padding: '10px 22px',
                                        borderRadius: '10px',
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
                                    {loading ? 'Bergabung...' : 'Gabung Room'}
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
                                padding: '28px 20px',
                                textAlign: 'center',
                                border: '1px solid rgba(16, 185, 129, 0.35)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
                            }}
                        >
                            {/* Animated Radar Pulse */}
                            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <motion.div
                                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: '50%',
                                        border: '2px solid rgba(16, 185, 129, 0.5)',
                                    }}
                                />
                                <div
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '14px',
                                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#10b981',
                                        fontSize: '26px',
                                        boxShadow: '0 0 24px rgba(16, 185, 129, 0.3)',
                                    }}
                                >
                                    <Shuffle size={26} />
                                </div>
                            </div>

                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
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
                                    padding: '5px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontSize: '12px',
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--color-silver)',
                                    marginBottom: '20px',
                                }}
                            >
                                <Clock size={12} /> Waktu Tunggu: {matchmakingElapsedSec}s
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                {matchmakingTimedOut ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => { setMode('select'); setError(null) }}
                                            className="btn-dark-outline"
                                            style={{ padding: '9px 18px', fontSize: '13px' }}
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
                                                padding: '9px 20px',
                                                borderRadius: '10px',
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
                                            padding: '9px 20px',
                                            borderRadius: '10px',
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
