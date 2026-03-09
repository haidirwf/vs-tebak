'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Hash, Shuffle, Sword, Loader2, X } from 'lucide-react'

const CATEGORIES = [
    { value: 'coding', label: 'Coding', emoji: '💻' },
    { value: 'design', label: 'Desain', emoji: '🎨' },
    { value: 'productivity', label: 'Produktivitas', emoji: '⚡' },
    { value: 'general', label: 'Umum', emoji: '🎯' },
]

export default function BattlePage() {
    const router = useRouter()
    const [mode, setMode] = useState<'select' | 'create' | 'join' | 'matchmaking'>('select')
    const [roomCode, setRoomCode] = useState('')
    const [category, setCategory] = useState('general')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pendingBattleId, setPendingBattleId] = useState<string | null>(null)
    const [availableRooms, setAvailableRooms] = useState<any[]>([])
    const pollingRef = useRef<NodeJS.Timeout | null>(null)
    const roomsPollingRef = useRef<NodeJS.Timeout | null>(null)

    // Fetch available rooms
    useEffect(() => {
        if (mode !== 'select') return
        const fetchRooms = async () => {
            try {
                const res = await fetch('/api/battle/list')
                if (res.ok) {
                    const data = await res.json()
                    setAvailableRooms(data.rooms || [])
                }
            } catch (e) {
                console.error(e)
            }
        }
        fetchRooms()
        roomsPollingRef.current = setInterval(fetchRooms, 3000)
        return () => clearInterval(roomsPollingRef.current!)
    }, [mode])

    // When matchmaking, poll the battle row until an opponent joins
    useEffect(() => {
        if (mode !== 'matchmaking' || !pendingBattleId) return

        pollingRef.current = setInterval(async () => {
            const res = await fetch(`/api/battle/${pendingBattleId}`)
            if (!res.ok) return
            const data = await res.json()
            if (data.status === 'active') {
                clearInterval(pollingRef.current!)
                router.push(`/battle/${pendingBattleId}`)
            }
        }, 2000)

        // Cleanup function for tab close / refresh
        const handleUnload = () => {
            if (pendingBattleId && mode === 'matchmaking') {
                // Use beacon so it fires even as the document is unloading
                navigator.sendBeacon(`/api/battle/${pendingBattleId}`, JSON.stringify({ method: 'DELETE' }))
            }
        }

        window.addEventListener('beforeunload', handleUnload)

        return () => {
            clearInterval(pollingRef.current!)
            window.removeEventListener('beforeunload', handleUnload)
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
        clearInterval(pollingRef.current!)
        if (pendingBattleId) {
            await fetch(`/api/battle/${pendingBattleId}`, { method: 'DELETE' })
        }
        setPendingBattleId(null)
        setMode('select')
    }

    return (
        <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
                    ⚔️ Battle Arena
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Quiz 1v1 real-time — Buktikan skillmu!</p>
            </div>

            {/* Matchmaking loading state */}
            {mode === 'matchmaking' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: '40vh', gap: '24px', textAlign: 'center',
                }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                        <Loader2 size={56} style={{ color: 'var(--accent-green)' }} />
                    </motion.div>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                            Mencari Lawan...
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            Menunggu pemain lain bergabung. Ini bisa memakan beberapa saat.
                        </p>
                    </div>
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
                </motion.div>
            )}

            {mode === 'select' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    {[
                        { label: 'Buat Room', icon: <Sword size={28} />, desc: 'Buat room baru dan undang teman', action: () => setMode('create'), color: 'var(--accent-gold)' },
                        { label: 'Join Room', icon: <Hash size={28} />, desc: 'Masukkan kode room dari teman', action: () => setMode('join'), color: 'var(--accent-cyan)' },
                        { label: 'Matchmaking', icon: <Shuffle size={28} />, desc: 'Cari lawan secara otomatis', action: handleMatchmaking, color: 'var(--accent-green)' },
                    ].map((item) => (
                        <motion.button
                            key={item.label}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={item.action}
                            disabled={loading}
                            style={{
                                padding: '28px 16px', borderRadius: '4px', cursor: 'pointer',
                                backgroundColor: 'var(--bg-secondary)', border: `1px solid ${item.color}33`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                                color: item.color, transition: 'all 0.2s',
                            }}
                        >
                            {item.icon}
                            <div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>{item.desc}</div>
                            </div>
                        </motion.button>
                    ))}
                </motion.div>
            )}

            {/* Tersedia UI (Room List) */}
            {mode === 'select' && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginTop: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700 }}>
                            🔥 Daftar Room Tersedia
                        </h2>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            *Diperbarui live
                        </span>
                    </div>

                    {availableRooms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            Belum ada room yang terbuka saat ini. Jadilah yang pertama membuat room!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {availableRooms.map((room) => {
                                const catEmoji = CATEGORIES.find(c => c.value === room.category)?.emoji || '🎯'
                                const catLabel = CATEGORIES.find(c => c.value === room.category)?.label || 'Umum'

                                // Format time HH:MM
                                const roomTime = new Date(room.created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit', minute: '2-digit'
                                })

                                return (
                                    <div key={room.id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ fontSize: '24px' }}>{catEmoji}</div>
                                            <div>
                                                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                                    Room {room.host_name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                                                    <span>⏰ {roomTime}</span>
                                                    <span>🏷️ {catLabel}</span>
                                                    <span>🗝️ {room.room_code}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleJoin(room.room_code)}
                                            disabled={loading}
                                            style={{
                                                padding: '8px 24px', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer',
                                                backgroundColor: 'rgba(0, 212, 255, 0.1)', border: '1px solid var(--accent-cyan)',
                                                color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700,
                                            }}
                                        >
                                            {loading ? '...' : 'JOIN'}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
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
                    <div style={{ display: 'flex', gap: '12px' }}>
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
                    <div style={{ display: 'flex', gap: '12px' }}>
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
