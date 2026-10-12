'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Trophy,
    Flame,
    Building2,
    Users,
    Zap,
    Search,
    X,
    ChevronRight,
    GraduationCap,
    TrendingUp,
} from 'lucide-react'

const CLASS_EMOJIS: Record<string, string> = {
    warrior: '⚔️',
    mage: '🔮',
    archer: '🏹',
    healer: '✨',
}

const CLASS_NAMES: Record<string, string> = {
    warrior: 'Warrior',
    mage: 'Mage',
    archer: 'Archer',
    healer: 'Healer',
}

const CLASS_COLORS: Record<string, string> = {
    warrior: 'var(--accent-red)',
    mage: 'var(--accent-cyan)',
    archer: 'var(--accent-green)',
    healer: 'var(--accent-gold)',
}

interface LeaderboardUser {
    id: string
    username: string
    full_name: string | null
    school_name: string | null
    city: string | null
    avatar_class: string
    level: number
    xp: number
    streak_count: number
}

interface SchoolEntry {
    school: string
    city: string
    totalXp: number
    members: number
}

interface LeaderboardClientProps {
    allTime: LeaderboardUser[]
    weekly: LeaderboardUser[]
    schoolRanking: SchoolEntry[]
    currentUserId: string | null
}

type Tab = 'all' | 'weekly' | 'school'

export default function LeaderboardClient({
    allTime,
    weekly,
    schoolRanking,
    currentUserId,
}: LeaderboardClientProps) {
    const [tab, setTab] = useState<Tab>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Aggregate summary stats
    const stats = useMemo(() => {
        const totalStudents = allTime.length
        const totalXpSum = allTime.reduce((acc, curr) => acc + (curr.xp || 0), 0)
        const totalSchools = schoolRanking.length
        return {
            totalStudents,
            totalXpSum,
            totalSchools,
        }
    }, [allTime, schoolRanking])

    // Filtered lists based on search
    const filteredUsers = useMemo(() => {
        const list = tab === 'all' ? allTime : weekly
        if (!searchQuery.trim()) return list
        const q = searchQuery.toLowerCase().trim()
        return list.filter(
            (u) =>
                u.username.toLowerCase().includes(q) ||
                (u.full_name && u.full_name.toLowerCase().includes(q)) ||
                (u.school_name && u.school_name.toLowerCase().includes(q)) ||
                (u.city && u.city.toLowerCase().includes(q))
        )
    }, [tab, allTime, weekly, searchQuery])

    const filteredSchools = useMemo(() => {
        if (!searchQuery.trim()) return schoolRanking
        const q = searchQuery.toLowerCase().trim()
        return schoolRanking.filter(
            (s) =>
                s.school.toLowerCase().includes(q) ||
                (s.city && s.city.toLowerCase().includes(q))
        )
    }, [schoolRanking, searchQuery])

    const isSearching = searchQuery.trim().length > 0

    // Top school max XP for relative progress bar
    const maxSchoolXp = useMemo(() => {
        if (schoolRanking.length === 0) return 1
        return Math.max(...schoolRanking.map((s) => s.totalXp || 1), 1)
    }, [schoolRanking])

    // Tabs definition
    const tabs: { key: Tab; label: string; icon: typeof Trophy; desc: string }[] = [
        { key: 'all', label: 'All Time', icon: Trophy, desc: 'Akumulasi total XP' },
        { key: 'weekly', label: 'Streak King', icon: Flame, desc: 'Konsistensi harian' },
        { key: 'school', label: 'Per Sekolah', icon: Building2, desc: 'Peringkat institusi' },
    ]

    // Active student list for podium and list
    const activeStudentList = tab === 'all' ? allTime : weekly
    const top3Students = !isSearching && activeStudentList.length >= 3 ? activeStudentList.slice(0, 3) : []
    const remainingStudents = !isSearching ? filteredUsers.slice(3) : filteredUsers

    // Top 3 schools
    const top3Schools = !isSearching && schoolRanking.length >= 3 ? schoolRanking.slice(0, 3) : []
    const remainingSchools = !isSearching ? filteredSchools.slice(3) : filteredSchools

    // Current user rank & metrics
    const myRankData = useMemo(() => {
        if (!currentUserId || tab === 'school') return null
        const list = tab === 'all' ? allTime : weekly
        const myIndex = list.findIndex((u) => u.id === currentUserId)
        if (myIndex === -1) return null
        const me = list[myIndex]
        const prevUser = myIndex > 0 ? list[myIndex - 1] : null
        let gapToNext: number | null = null
        if (prevUser) {
            gapToNext = tab === 'all' ? prevUser.xp - me.xp : prevUser.streak_count - me.streak_count
        }
        return {
            rank: myIndex + 1,
            user: me,
            gapToNext,
            isTopThree: myIndex < 3,
        }
    }, [currentUserId, tab, allTime, weekly])

    return (
        <div
            className="responsive-page"
            style={{
                maxWidth: '880px',
                margin: '0 auto',
                paddingBottom: myRankData && !myRankData.isTopThree ? '120px' : '36px',
            }}
        >
            {/* Header Section */}
            <div style={{ marginBottom: '24px' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                backgroundColor: 'var(--accent-gold-bg)',
                                border: '1px solid var(--accent-gold-border)',
                                color: 'var(--accent-gold-text)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Trophy size={22} />
                        </div>
                        <div>
                            <h1
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    letterSpacing: '-0.01em',
                                    margin: 0,
                                    color: 'var(--text-primary)',
                                }}
                            >
                                Papan Peringkat
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '2px 0 0' }}>
                                Prestasi dan dedikasi pelajar terbaik di seluruh Indonesia
                            </p>
                        </div>
                    </div>
                </div>

                {/* Summary Stat Strip */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '10px',
                    }}
                >
                    <div
                        style={{
                            padding: '12px 14px',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <div
                            style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--surface-elevated)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-secondary)',
                                flexShrink: 0,
                            }}
                        >
                            <Users size={16} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pelajar Terdaftar</div>
                            <div
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {stats.totalStudents.toLocaleString()} Siswa
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '12px 14px',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <div
                            style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--accent-gold-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--accent-gold-text)',
                                flexShrink: 0,
                            }}
                        >
                            <Zap size={16} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Akumulasi XP</div>
                            <div
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: 'var(--color-gold-text)',
                                }}
                            >
                                {stats.totalXpSum.toLocaleString()} XP
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '12px 14px',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <div
                            style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--surface-elevated)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-secondary)',
                                flexShrink: 0,
                            }}
                        >
                            <Building2 size={16} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sekolah Bersaing</div>
                            <div
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {stats.totalSchools.toLocaleString()} Institusi
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation & Search Controls */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '22px',
                }}
            >
                {/* Tabs */}
                <div
                    style={{
                        display: 'flex',
                        gap: '6px',
                        backgroundColor: 'var(--surface-elevated)',
                        padding: '4px',
                        borderRadius: '10px',
                        border: '1px solid var(--surface-border)',
                        flexWrap: 'wrap',
                    }}
                >
                    {tabs.map((t) => {
                        const Icon = t.icon
                        const isActive = tab === t.key
                        return (
                            <button
                                key={t.key}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => {
                                    setTab(t.key)
                                    setSearchQuery('')
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: isActive ? 'var(--surface-card)' : 'transparent',
                                    border: `1px solid ${isActive ? 'var(--surface-border)' : 'transparent'}`,
                                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '13px',
                                    fontWeight: isActive ? 600 : 500,
                                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <Icon
                                    size={14}
                                    color={
                                        isActive
                                            ? t.key === 'weekly'
                                                ? 'var(--accent-red)'
                                                : 'var(--color-gold-text)'
                                            : 'currentColor'
                                    }
                                />
                                <span>{t.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Search Bar */}
                <div
                    style={{
                        position: 'relative',
                        flex: '1',
                        minWidth: '220px',
                        maxWidth: '320px',
                    }}
                >
                    <Search
                        size={14}
                        style={{
                            position: 'absolute',
                            left: '11px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                            pointerEvents: 'none',
                        }}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                            tab === 'school'
                                ? 'Cari nama sekolah atau kota...'
                                : 'Cari nama, sekolah, kota...'
                        }
                        style={{
                            width: '100%',
                            padding: '8px 32px 8px 32px',
                            fontSize: '12.5px',
                            borderRadius: '8px',
                            border: '1px solid var(--surface-border)',
                            backgroundColor: 'var(--surface-card)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.15s ease',
                        }}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label="Bersihkan pencarian"
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* If searching, show result info */}
            {isSearching && (
                <div
                    style={{
                        marginBottom: '14px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <span>
                        Menampilkan hasil pencarian untuk &ldquo;<strong>{searchQuery}</strong>&rdquo; (
                        {tab === 'school' ? filteredSchools.length : filteredUsers.length} ditemukan)
                    </span>
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-gold-text)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: 0,
                        }}
                    >
                        Tampilkan semua
                    </button>
                </div>
            )}

            {/* TAB: ALL TIME / WEEKLY */}
            {(tab === 'all' || tab === 'weekly') && (
                <>
                    {/* Top 3 Podium (Only displayed when not searching) */}
                    {top3Students.length === 3 && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '10px',
                                alignItems: 'flex-end',
                                marginBottom: '24px',
                                width: '100%',
                            }}
                        >
                            {/* Rank 2 - Silver (Left) */}
                            {(() => {
                                const u = top3Students[1]
                                return (
                                    <Link
                                        href={`/pelajar/${encodeURIComponent(u.username)}`}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            whileHover={{ y: -3 }}
                                            style={{
                                                backgroundColor: 'var(--surface-card)',
                                                border: '1.5px solid #94a3b8',
                                                borderRadius: '12px',
                                                padding: '16px 10px 12px',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                boxShadow: 'var(--shadow-card)',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    color: '#64748b',
                                                    backgroundColor: 'rgba(148, 163, 184, 0.12)',
                                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    marginBottom: '10px',
                                                }}
                                            >
                                                🥈 Peringkat 2
                                            </div>

                                            <div
                                                style={{
                                                    width: '52px',
                                                    height: '52px',
                                                    borderRadius: '12px',
                                                    backgroundColor: 'var(--surface-elevated)',
                                                    border: `2px solid ${CLASS_COLORS[u.avatar_class] || '#94a3b8'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '24px',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                {CLASS_EMOJIS[u.avatar_class] || '🎮'}
                                            </div>

                                            <div
                                                style={{
                                                    fontFamily: 'var(--font-heading)',
                                                    fontSize: '13.5px',
                                                    fontWeight: 700,
                                                    color: 'var(--text-primary)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '100%',
                                                }}
                                            >
                                                {u.username}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    color: 'var(--text-muted)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '100%',
                                                    margin: '1px 0 8px',
                                                }}
                                            >
                                                {u.school_name || 'Sekolah Indonesia'}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: '11.5px',
                                                    fontWeight: 700,
                                                    color: 'var(--text-primary)',
                                                    backgroundColor: 'var(--surface-elevated)',
                                                    border: '1px solid var(--surface-border)',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    width: 'calc(100% - 12px)',
                                                    boxSizing: 'border-box',
                                                }}
                                            >
                                                {tab === 'all'
                                                    ? `${u.xp.toLocaleString()} XP`
                                                    : `${u.streak_count} Hari 🔥`}
                                            </div>
                                        </motion.div>
                                    </Link>
                                )
                            })()}

                            {/* Rank 1 - Champion Gold (Center & Elevated) */}
                            {(() => {
                                const u = top3Students[0]
                                return (
                                    <Link
                                        href={`/pelajar/${encodeURIComponent(u.username)}`}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ y: -4 }}
                                            style={{
                                                backgroundColor: 'var(--surface-card)',
                                                backgroundImage:
                                                    'linear-gradient(180deg, var(--accent-gold-bg) 0%, var(--surface-card) 60%)',
                                                border: '2px solid var(--accent-gold-border)',
                                                borderRadius: '12px',
                                                padding: '18px 10px 14px',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 16px rgba(245, 197, 66, 0.18)',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: '11.5px',
                                                    fontWeight: 700,
                                                    color: 'var(--accent-gold-text)',
                                                    backgroundColor: 'var(--accent-gold-bg)',
                                                    border: '1px solid var(--accent-gold-border)',
                                                    padding: '2px 9px',
                                                    borderRadius: '6px',
                                                    marginBottom: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                }}
                                            >
                                                <span>👑</span>
                                                <span>Juara 1</span>
                                            </div>

                                            <div
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    borderRadius: '14px',
                                                    backgroundColor: 'var(--surface-elevated)',
                                                    border: '2.5px solid var(--accent-gold)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '28px',
                                                    marginBottom: '8px',
                                                    boxShadow: '0 2px 8px rgba(245, 197, 66, 0.25)',
                                                }}
                                            >
                                                {CLASS_EMOJIS[u.avatar_class] || '🎮'}
                                            </div>

                                            <div
                                                style={{
                                                    fontFamily: 'var(--font-heading)',
                                                    fontSize: '14.5px',
                                                    fontWeight: 700,
                                                    color: 'var(--text-primary)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '100%',
                                                }}
                                            >
                                                {u.username}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    color: 'var(--text-muted)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '100%',
                                                    margin: '1px 0 8px',
                                                }}
                                            >
                                                {u.school_name || 'Sekolah Indonesia'}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    color: 'var(--accent-gold-text)',
                                                    backgroundColor: 'var(--accent-gold-bg)',
                                                    border: '1px solid var(--accent-gold-border)',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    width: 'calc(100% - 12px)',
                                                    boxSizing: 'border-box',
                                                }}
                                            >
                                                {tab === 'all'
                                                    ? `${u.xp.toLocaleString()} XP`
                                                    : `${u.streak_count} Hari 🔥`}
                                            </div>
                                        </motion.div>
                                    </Link>
                                )
                            })()}

                            {/* Rank 3 - Bronze (Right) */}
                            {(() => {
                                const u = top3Students[2]
                                return (
                                    <Link
                                        href={`/pelajar/${encodeURIComponent(u.username)}`}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            whileHover={{ y: -3 }}
                                            style={{
                                                backgroundColor: 'var(--surface-card)',
                                                border: '1.5px solid #d97706',
                                                borderRadius: '12px',
                                                padding: '16px 10px 12px',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                boxShadow: 'var(--shadow-card)',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    color: '#b45309',
                                                    backgroundColor: 'rgba(217, 119, 6, 0.12)',
                                                    border: '1px solid rgba(217, 119, 6, 0.3)',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    marginBottom: '10px',
                                                }}
                                            >
                                                🥉 Peringkat 3
                                            </div>

                                            <div
                                                style={{
                                                    width: '52px',
                                                    height: '52px',
                                                    borderRadius: '12px',
                                                    backgroundColor: 'var(--surface-elevated)',
                                                    border: `2px solid ${CLASS_COLORS[u.avatar_class] || '#d97706'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '24px',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                {CLASS_EMOJIS[u.avatar_class] || '🎮'}
                                            </div>

                                            <div
                                                style={{
                                                    fontFamily: 'var(--font-heading)',
                                                    fontSize: '13.5px',
                                                    fontWeight: 700,
                                                    color: 'var(--text-primary)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '100%',
                                                }}
                                            >
                                                {u.username}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    color: 'var(--text-muted)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '100%',
                                                    margin: '1px 0 8px',
                                                }}
                                            >
                                                {u.school_name || 'Sekolah Indonesia'}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: '11.5px',
                                                    fontWeight: 700,
                                                    color: 'var(--text-primary)',
                                                    backgroundColor: 'var(--surface-elevated)',
                                                    border: '1px solid var(--surface-border)',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    width: 'calc(100% - 12px)',
                                                    boxSizing: 'border-box',
                                                }}
                                            >
                                                {tab === 'all'
                                                    ? `${u.xp.toLocaleString()} XP`
                                                    : `${u.streak_count} Hari 🔥`}
                                            </div>
                                        </motion.div>
                                    </Link>
                                )
                            })()}
                        </div>
                    )}

                    {/* Student List View */}
                    <div
                        className="card"
                        style={{
                            borderRadius: '12px',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-card)',
                        }}
                    >
                        {/* Table Header Row */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 16px',
                                backgroundColor: 'var(--surface-elevated)',
                                borderBottom: '1px solid var(--surface-border)',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                            }}
                        >
                            <span>Peringkat & Pelajar</span>
                            <span>{tab === 'all' ? 'Pencapaian XP' : 'Pencapaian Streak'}</span>
                        </div>

                        {remainingStudents.map((user) => {
                            // Find absolute rank in the global list
                            const originalRank =
                                activeStudentList.findIndex((u) => u.id === user.id) + 1
                            const isMe = user.id === currentUserId

                            return (
                                <Link
                                    key={user.id}
                                    href={`/pelajar/${encodeURIComponent(user.username)}`}
                                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                                >
                                    <motion.div
                                        whileHover={{ backgroundColor: 'var(--surface-elevated)' }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 16px',
                                            borderBottom: '1px solid var(--surface-border)',
                                            backgroundColor: isMe ? 'rgba(245, 197, 66, 0.08)' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s ease',
                                        }}
                                    >
                                        {/* Rank Badge */}
                                        <div
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '6px',
                                                backgroundColor:
                                                    originalRank <= 3
                                                        ? 'var(--accent-gold-bg)'
                                                        : 'var(--surface-elevated)',
                                                border: `1px solid ${
                                                    originalRank <= 3
                                                        ? 'var(--accent-gold-border)'
                                                        : 'var(--surface-border)'
                                                }`,
                                                color:
                                                    originalRank <= 3
                                                        ? 'var(--accent-gold-text)'
                                                        : 'var(--text-secondary)',
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {originalRank}
                                        </div>

                                        {/* Avatar */}
                                        <div
                                            style={{
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '8px',
                                                backgroundColor: 'var(--surface-elevated)',
                                                border: `1.5px solid ${
                                                    CLASS_COLORS[user.avatar_class] || 'var(--surface-border)'
                                                }`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '17px',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {CLASS_EMOJIS[user.avatar_class] || '🎮'}
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span
                                                    style={{
                                                        fontFamily: 'var(--font-heading)',
                                                        fontSize: '13.5px',
                                                        fontWeight: 700,
                                                        color: 'var(--text-primary)',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {user.username}
                                                </span>
                                                {isMe && (
                                                    <span
                                                        style={{
                                                            fontSize: '10px',
                                                            color: 'var(--accent-gold-text)',
                                                            backgroundColor: 'var(--accent-gold-bg)',
                                                            border: '1px solid var(--accent-gold-border)',
                                                            padding: '1px 6px',
                                                            borderRadius: '6px',
                                                            fontWeight: 700,
                                                            lineHeight: 1.2,
                                                        }}
                                                    >
                                                        Kamu
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    color: 'var(--text-muted)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    marginTop: '1px',
                                                }}
                                            >
                                                {user.school_name || 'Sekolah Belum Diisi'}
                                                {user.city ? ` · ${user.city}` : ''}
                                                <span> · Lv. {user.level} · {CLASS_NAMES[user.avatar_class] || 'Hero'}</span>
                                            </div>
                                        </div>

                                        {/* Score Metric */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                textAlign: 'right',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontFamily: 'var(--font-heading)',
                                                        fontSize: '13.5px',
                                                        fontWeight: 700,
                                                        color:
                                                            tab === 'all'
                                                                ? 'var(--color-gold-text)'
                                                                : 'var(--accent-red)',
                                                    }}
                                                >
                                                    {tab === 'all'
                                                        ? `${user.xp.toLocaleString()} XP`
                                                        : `${user.streak_count} Hari 🔥`}
                                                </div>
                                            </div>
                                            <ChevronRight size={14} color="var(--text-muted)" />
                                        </div>
                                    </motion.div>
                                </Link>
                            )
                        })}

                        {remainingStudents.length === 0 && (
                            <div
                                style={{
                                    padding: '48px 16px',
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                    fontSize: '13px',
                                }}
                            >
                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                    Tidak ada data yang cocok
                                </div>
                                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                    Coba ubah kata kunci pencarian Anda
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* TAB: PER SEKOLAH */}
            {tab === 'school' && (
                <>
                    {/* Top 3 Schools Highlight (When not searching) */}
                    {top3Schools.length === 3 && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '10px',
                                marginBottom: '20px',
                            }}
                        >
                            {top3Schools.map((school, idx) => {
                                const medalColor =
                                    idx === 0
                                        ? 'var(--accent-gold-border)'
                                        : idx === 1
                                        ? '#94a3b8'
                                        : '#d97706'
                                const medalLabel = idx === 0 ? '🥇 Juara 1' : idx === 1 ? '🥈 Peringkat 2' : '🥉 Peringkat 3'

                                return (
                                    <div
                                        key={school.school}
                                        style={{
                                            backgroundColor: 'var(--surface-card)',
                                            border: `1.5px solid ${medalColor}`,
                                            borderRadius: '12px',
                                            padding: '14px',
                                            boxShadow: 'var(--shadow-card)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    color:
                                                        idx === 0
                                                            ? 'var(--accent-gold-text)'
                                                            : idx === 1
                                                            ? '#64748b'
                                                            : '#b45309',
                                                    backgroundColor:
                                                        idx === 0
                                                            ? 'var(--accent-gold-bg)'
                                                            : 'var(--surface-elevated)',
                                                    border: `1px solid ${medalColor}`,
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                }}
                                            >
                                                {medalLabel}
                                            </span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {school.members} Pelajar
                                            </span>
                                        </div>

                                        <div>
                                            <div
                                                style={{
                                                    fontFamily: 'var(--font-heading)',
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    color: 'var(--text-primary)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {school.school}
                                            </div>
                                            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                                {school.city || 'Indonesia'}
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '14px',
                                                fontWeight: 700,
                                                color: 'var(--color-gold-text)',
                                                marginTop: 'auto',
                                            }}
                                        >
                                            {school.totalXp.toLocaleString()} XP
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* School List View */}
                    <div
                        className="card"
                        style={{
                            borderRadius: '12px',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-card)',
                        }}
                    >
                        {/* Table Header Row */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 16px',
                                backgroundColor: 'var(--surface-elevated)',
                                borderBottom: '1px solid var(--surface-border)',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                            }}
                        >
                            <span>Peringkat & Institusi Sekolah</span>
                            <span>Total Akumulasi XP</span>
                        </div>

                        {remainingSchools.map((school, i) => {
                            const originalRank =
                                schoolRanking.findIndex((s) => s.school === school.school) + 1
                            const progressPercent = Math.min(
                                100,
                                Math.max(8, Math.round((school.totalXp / maxSchoolXp) * 100))
                            )

                            return (
                                <motion.div
                                    key={school.school}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid var(--surface-border)',
                                        transition: 'background-color 0.15s ease',
                                    }}
                                >
                                    {/* Rank Badge */}
                                    <div
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            backgroundColor:
                                                originalRank <= 3
                                                    ? 'var(--accent-gold-bg)'
                                                    : 'var(--surface-elevated)',
                                            border: `1px solid ${
                                                originalRank <= 3
                                                    ? 'var(--accent-gold-border)'
                                                    : 'var(--surface-border)'
                                            }`,
                                            color:
                                                originalRank <= 3
                                                    ? 'var(--accent-gold-text)'
                                                    : 'var(--text-secondary)',
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {originalRank}
                                    </div>

                                    {/* School Icon */}
                                    <div
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '8px',
                                            backgroundColor: 'var(--surface-elevated)',
                                            border: '1px solid var(--surface-border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-secondary)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <GraduationCap size={18} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '13.5px',
                                                fontWeight: 700,
                                                color: 'var(--text-primary)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {school.school}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                color: 'var(--text-muted)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                marginTop: '1px',
                                            }}
                                        >
                                            {school.city || 'Indonesia'} · {school.members} Pelajar Terdaftar
                                        </div>

                                        {/* Proportional XP bar */}
                                        <div
                                            style={{
                                                height: '4px',
                                                width: '100%',
                                                maxWidth: '180px',
                                                backgroundColor: 'var(--surface-elevated)',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                marginTop: '6px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${progressPercent}%`,
                                                    backgroundColor: 'var(--accent-gold)',
                                                    borderRadius: '4px',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div
                                            style={{
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '13.5px',
                                                fontWeight: 700,
                                                color: 'var(--color-gold-text)',
                                            }}
                                        >
                                            {school.totalXp.toLocaleString()} XP
                                        </div>
                                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                            ~{Math.round(school.totalXp / Math.max(1, school.members)).toLocaleString()} XP/siswa
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}

                        {remainingSchools.length === 0 && (
                            <div
                                style={{
                                    padding: '48px 16px',
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                    fontSize: '13px',
                                }}
                            >
                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏫</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                    Tidak ada sekolah yang cocok
                                </div>
                                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                    Coba ubah kata kunci nama sekolah atau kota
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Sticky "My Rank" Dock (If user is logged in & not already in top 3 of current tab) */}
            {myRankData && !myRankData.isTopThree && (
                <div className="leaderboard-my-rank-dock">
                    <div
                        style={{
                            maxWidth: '880px',
                            margin: '0 auto',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--accent-gold-border)',
                            borderRadius: '12px',
                            padding: '10px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                            pointerEvents: 'auto',
                            gap: '12px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <div
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--accent-gold-bg)',
                                    border: '1px solid var(--accent-gold-border)',
                                    color: 'var(--accent-gold-text)',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '14px',
                                    fontWeight: 800,
                                    flexShrink: 0,
                                }}
                            >
                                #{myRankData.rank}
                            </div>

                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {myRankData.user.username}{' '}
                                    <span style={{ fontSize: '11px', color: 'var(--accent-gold-text)', fontWeight: 600 }}>
                                        (Peringkat Anda)
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: '11px',
                                        color: 'var(--text-secondary)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {myRankData.gapToNext !== null && myRankData.gapToNext > 0 ? (
                                        <span>
                                            Kurang{' '}
                                            <strong style={{ color: 'var(--color-gold-text)' }}>
                                                {myRankData.gapToNext.toLocaleString()} {tab === 'all' ? 'XP' : 'Hari'}
                                            </strong>{' '}
                                            lagi untuk naik ke peringkat #{myRankData.rank - 1}
                                        </span>
                                    ) : (
                                        <span>Terus belajar dan selesaikan misi untuk naik peringkat!</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <div
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '14px',
                                    fontWeight: 800,
                                    color: tab === 'all' ? 'var(--color-gold-text)' : 'var(--accent-red)',
                                }}
                            >
                                {tab === 'all'
                                    ? `${myRankData.user.xp.toLocaleString()} XP`
                                    : `${myRankData.user.streak_count} Hari 🔥`}
                            </div>

                            <Link
                                href={`/pelajar/${encodeURIComponent(myRankData.user.username)}`}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--color-gold-text)',
                                    backgroundColor: 'var(--accent-gold-bg)',
                                    border: '1px solid var(--accent-gold-border)',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <span>Profil</span>
                                <ChevronRight size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
