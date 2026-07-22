'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Hash, Shuffle, Sword, Loader2, X, Clock, Zap } from 'lucide-react'

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
    const pollingRef = useRef<NodeJS.Timeout | null>(null)
    const matchmakingTimerRef = useRef<NodeJS.Timeout | null>(null)
    const roomsPollingRef = useRef<NodeJS.Timeout | null>(null)
    const cancelRequestedRef = useRef(false)

    // Fetch available rooms
    useEffect(() => {
        if (mode !== 'select') return
        const fetchRooms = async () => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
            try {
                const res = await fetch('/api/battle/list')
                if (res.ok) {
                    const data = await res.json()
                    const rooms = Array.isArray(data.rooms) ? data.rooms as AvailableRoom[] : []
                    setAvailableRooms(rooms)
                }
            } catch (e) {
                console.error(e)
            }
        }
        fetchRooms()
        roomsPollingRef.current = setInterval(fetchRooms, 8000)
        return () => clearInterval(roomsPollingRef.current!)
    }, [mode])

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
                // sendBeacon is always POST; server supports POST cancel for this use case.
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

        // Safety timer for elapsed label even when requests are delayed.
        matchmakingTimerRef.current = setInterval(() => {
            setMatchmakingElapsedSec(Math.floor((Date.now() - startedAt) / 1000))
        }, 1000)
        runPoll()

        // Cleanup function for tab close / refresh
        const handleUnload = () => {
            if (pendingBattleId && mode === 'matchmaking') {
                // Use beacon so it fires even as the document is unloading.
                cancelPendingRoom()
            }
        }

        window.addEventListener('beforeunload', handleUnload)

        return () => {
            stopped = true
            clearTimeout(pollingRef.current!)
            clearInterval(matchmakingTimerRef.current!)
            window.removeEventListener('beforeunload', handleUnload)
            // Also cleanup when user navigates to another page inside the app.
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
        // if called directly with a string as the first arg
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
            // Immediately navigates if we joined an existing room
            router.push(`/battle/${data.battle.id}`)
            return
        }

        // Otherwise we created a new room — start polling
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

    return (
        <div className="responsive-page battle-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
                    ⚔️ Battle Arena
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Quiz 1v1 real-time — Buktikan skillmu!</p>
            </div>

            {/* Matchmaking loading state */}
            {mode === 'matchmaking' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: 'calc(100vh - 200px)', width: '100%', gap: '24px', textAlign: 'center',
                }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                        <Loader2 size={56} style={{ color: 'var(--accent-green)' }} />
                    </motion.div>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                            {matchmakingTimedOut ? 'Matchmaking Timeout' : 'Mencari Lawan...'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {matchmakingTimedOut
                                ? 'Belum ada lawan yang cocok. Coba lagi atau kembali ke mode pilihan.'
                                : 'Menunggu pemain lain bergabung. Ini bisa memakan beberapa saat.'}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>
                            Waktu tunggu: {matchmakingElapsedSec}s
                        </p>
                    </div>
                    {matchmakingTimedOut ? (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={handleMatchmaking}
                                disabled={loading}
                                style={{
                                    padding: '10px 24px', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer',
                                    backgroundColor: 'rgba(34, 197, 94, 0.12)', border: '1px solid var(--accent-green)',
                                    color: 'var(--accent-green)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}
                            >
                                <Clock size={16} /> Coba Lagi
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => { setMode('select'); setError(null) }}
                                style={{
                                    padding: '10px 24px', borderRadius: '4px', cursor: 'pointer',
                                    backgroundColor: 'rgba(232, 64, 64, 0.1)', border: '1px solid var(--accent-red)',
                                    color: 'var(--accent-red)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}
                            >
                                <X size={16} /> Kembali
                            </motion.button>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleCancelMatchmaking}
                            style={{
                                marginTop: '12px', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer',
                                backgroundColor: 'rgba(232, 64, 64, 0.1)', border: '1px solid var(--accent-red)',
                                color: 'var(--accent-red)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}
                        >
                            <X size={16} /> Batalkan
                        </motion.button>
                    )}
                </motion.div>
            )}

            {mode === 'select' && (
                <motion.div className="battle-select-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '16px' }}>
                    <div className="battle-select-actions" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', 
                        gap: '20px',
                        marginBottom: '32px'
                    }}>
                        {[
                            { key: 'create', label: 'Buat Room', icon: <Sword size={24} />, desc: 'Buat arena tandingmu sendiri dan tantang temanmu sekarang.', action: () => setMode('create'), color: 'var(--accent-gold)', accent: 'rgba(245, 197, 66, 0.1)' },
                            { key: 'join', label: 'Join Room', icon: <Hash size={24} />, desc: 'Masuk ke arena yang sudah ada menggunakan kode akses rahasia.', action: () => setMode('join'), color: 'var(--accent-cyan)', accent: 'rgba(0, 212, 255, 0.1)' },
                            { key: 'matchmaking', label: 'Matchmaking', icon: <Shuffle size={24} />, desc: 'Sistem akan mencarikan lawan yang seimbang untukmu secara otomatis.', action: handleMatchmaking, color: 'var(--accent-green)', accent: 'rgba(34, 197, 94, 0.1)' },
                            { key: 'practice', label: 'Vs Computer', icon: <Zap size={24} />, desc: 'Latihan cepat melawan AI bot tanpa harus menunggu lawan online.', action: () => router.push('/battle/computer'), color: 'var(--accent-red)', accent: 'rgba(232, 64, 64, 0.1)' },
                        ].map((item) => (
                            <motion.div
                                key={item.label}
                                className={`battle-mode-card ${item.key === 'matchmaking' ? 'battle-mode-card-match' : ''}`}
                                whileHover={{ y: -8 }}
                                onClick={item.action}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card" style={{
                                    padding: '24px',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: `1px solid var(--border)`,
                                    borderBottom: `3px solid ${item.color}`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {/* Icon Background Detail */}
                                    <div style={{
                                        position: 'absolute', top: '-10px', right: '-10px',
                                        opacity: 0.05, transform: 'rotate(-15deg)', color: item.color
                                    }}>
                                        {item.icon}
                                    </div>

                                    <div style={{ 
                                        width: '48px', height: '48px', 
                                        backgroundColor: item.accent, 
                                        borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: item.color,
                                        border: `1px solid ${item.color}20`
                                    }}>
                                        {item.icon}
                                    </div>

                                    <div>
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)' }}>
                                            {item.label}
                                        </h3>
                                        <p className="battle-card-desc" style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                                            {item.desc}
                                        </p>
                                    </div>

                                    <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                                        <span style={{ 
                                            fontSize: '11px', fontWeight: 800, color: item.color, 
                                            fontFamily: 'var(--font-heading)', textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            PILIH MODE &rarr;
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="card battle-room-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700 }}>
                                🔥 Daftar Room Tersedia
                            </h2>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                *Diperbarui live
                            </span>
                        </div>

                        {availableRooms.length === 0 ? (
                            <div className="battle-room-empty" style={{ textAlign: 'center', padding: '32px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                Belum ada room yang terbuka saat ini. Jadilah yang pertama membuat room!
                            </div>
                        ) : (
                            <div className="battle-room-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {availableRooms.map((room) => {
                                    const catEmoji = CATEGORIES.find(c => c.value === room.category)?.emoji || '🎯'
                                    const catLabel = CATEGORIES.find(c => c.value === room.category)?.label || 'Umum'

                                    // Format time HH:MM
                                    const roomTime = new Date(room.created_at).toLocaleTimeString('id-ID', {
                                        hour: '2-digit', minute: '2-digit'
                                    })

                                    return (
                                        <div className="battle-room-row" key={room.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            position: 'relative', overflow: 'hidden',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                                                <div style={{ 
                                                    width: '52px', height: '52px', 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                                                    borderRadius: '10px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '24px', border: '1px solid var(--border)'
                                                }}>
                                                    {catEmoji}
                                                </div>
                                                <div>
                                                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                                        Room {room.host_name}
                                                    </div>
                                                    <div className="battle-room-meta" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', fontWeight: 500 }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {roomTime}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={12} className="text-gold" /> {catLabel}</span>
                                                        <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-cyan)' }}>#{room.room_code}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <motion.button
                                                type="button"
                                                aria-label={`Tantang room ${room.room_code}`}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleJoin(room.room_code)}
                                                disabled={loading}
                                                style={{
                                                    padding: '10px 24px', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer',
                                                    backgroundColor: 'var(--accent-gold)', border: 'none',
                                                    color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 800,
                                                    position: 'relative', zIndex: 1, boxShadow: '0 4px 12px rgba(245, 197, 66, 0.2)'
                                                }}
                                            >
                                                {loading ? '...' : 'TANTANG'}
                                            </motion.button>
                                            
                                            {/* Decorative glow */}
                                            <div style={{
                                                position: 'absolute', bottom: '-20px', right: '-20px',
                                                width: '60px', height: '60px', backgroundColor: 'var(--accent-gold)',
                                                filter: 'blur(40px)', opacity: 0.05
                                            }} />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {mode === 'create' && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '28px' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                        Buat Room Battle
                    </h2>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                            Pilih Kategori Soal
                        </label>
                        <div className="four-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                            {CATEGORIES.map(cat => (
                                <button key={cat.value} onClick={() => setCategory(cat.value)} style={{
                                    padding: '12px 8px', borderRadius: '4px', cursor: 'pointer',
                                    backgroundColor: category === cat.value ? 'rgba(245,197,66,0.1)' : 'var(--bg-tertiary)',
                                    border: `1px solid ${category === cat.value ? 'var(--accent-gold)' : 'var(--border)'}`,
                                    color: category === cat.value ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                    fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 600,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                }}>
                                    <span style={{ fontSize: '18px' }}>{cat.emoji}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {error && <div style={{ color: 'var(--accent-red)', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
                    <div className="battle-action-row" style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setMode('select')} style={{
                            padding: '10px 20px', borderRadius: '4px', cursor: 'pointer',
                            backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px',
                        }}>Batal</button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={loading} style={{
                            flex: 1, padding: '10px', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer',
                            backgroundColor: 'var(--accent-gold)', border: 'none',
                            color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700,
                        }}>
                            {loading ? 'Membuat...' : 'BUAT ROOM'}
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {mode === 'join' && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '28px' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                        Join Room Battle
                    </h2>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                            Kode Room (6 karakter)
                        </label>
                        <input
                            aria-label="Kode room"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            placeholder="ABCDEF"
                            maxLength={6}
                            style={{
                                width: '100%', padding: '12px 16px',
                                backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                                borderRadius: '4px', color: 'var(--text-primary)', fontSize: '20px',
                                fontFamily: 'var(--font-heading)', fontWeight: 700, textAlign: 'center',
                                letterSpacing: '4px', outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    {error && <div style={{ color: 'var(--accent-red)', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
                    <div className="battle-action-row" style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => { setMode('select'); setRoomCode(''); setError(null) }} style={{
                            padding: '10px 20px', borderRadius: '4px', cursor: 'pointer',
                            backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px',
                        }}>Batal</button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleJoin} disabled={loading} style={{
                            flex: 1, padding: '10px', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer',
                            backgroundColor: 'var(--accent-cyan)', border: 'none',
                            color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700,
                        }}>
                            {loading ? 'Bergabung...' : 'JOIN ROOM'}
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
