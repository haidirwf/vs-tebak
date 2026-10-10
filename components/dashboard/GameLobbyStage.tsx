'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Profile, Module, UserModule, AvatarClass } from '@/types'
import { AVATAR_CLASS_STATS, getXpProgress } from '@/lib/game/xp'
import { resolveEquippedMap } from '@/lib/game/character'
import { getEffectiveStreak } from '@/lib/game/streak'
import CharacterVisual from '@/components/character/CharacterVisual'
import {
    Flame,
    Zap,
    BookOpen,
    Swords,
    ShoppingBag,
    ChevronRight,
    ArrowRight,
    School,
    MapPin,
    Shield,
    CheckCircle2,
    Sparkles,
    Clock,
} from 'lucide-react'
import { startOfWeek, addDays, format, parseISO, isSameDay } from 'date-fns'

interface GameLobbyStageProps {
    profile: Profile
    modulesCompletedCount?: number
    xpLogs?: Array<{ xp_amount: number; reason: string | null; created_at: string }>
    modules?: Module[]
    userModules?: UserModule[]
}

const CLASS_CONFIG: Record<AvatarClass, { color: string; bg: string; border: string; desc: string; roleBonus: string; icon: string }> = {
    warrior: {
        color: 'var(--accent-red)',
        bg: 'var(--accent-red-bg)',
        border: 'var(--accent-red-border)',
        desc: 'Pejuang Kode & Logika Algoritma',
        roleBonus: '+25% XP Modul Coding',
        icon: '⚔️',
    },
    mage: {
        color: 'var(--accent-cyan)',
        bg: 'var(--accent-cyan-bg)',
        border: 'var(--accent-cyan-border)',
        desc: 'Penyihir UI/UX & Kreativitas Digital',
        roleBonus: '+25% XP Modul Desain',
        icon: '🔮',
    },
    archer: {
        color: 'var(--accent-green)',
        bg: 'var(--accent-green-bg)',
        border: 'var(--accent-green-border)',
        desc: 'Pemanah Presisi & Penguasa Duel PvP',
        roleBonus: '+25% XP Menang Battle',
        icon: '🏹',
    },
    healer: {
        color: 'var(--accent-gold)',
        bg: 'var(--accent-gold-bg)',
        border: 'var(--accent-gold-border)',
        desc: 'Penyokong Produktivitas & Konsistensi',
        roleBonus: '+25% XP Modul Produktivitas',
        icon: '✨',
    },
}

const FALLBACK_MODULES: Module[] = [
    {
        id: 'html-css',
        slug: 'html-css-dasar',
        title: 'HTML & CSS Dasar',
        description: 'Dasar-dasar web dan penataan tampilan materi visual.',
        category: 'coding',
        difficulty: 'beginner',
        xp_reward: 50,
        duration_minutes: 45,
        thumbnail_url: null,
        content: null,
        is_published: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'js-basic',
        slug: 'javascript-untuk-pemula',
        title: 'JavaScript untuk Pemula',
        description: 'Logika pemrograman dasar, kondisi, dan interaktivitas.',
        category: 'coding',
        difficulty: 'beginner',
        xp_reward: 75,
        duration_minutes: 60,
        thumbnail_url: null,
        content: null,
        is_published: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'react-basic',
        slug: 'react-dasar-komponen-state',
        title: 'React Dasar: Komponen & State',
        description: 'Komponen modular, props hierarki, dan state dinamis.',
        category: 'coding',
        difficulty: 'intermediate',
        xp_reward: 70,
        duration_minutes: 55,
        thumbnail_url: null,
        content: null,
        is_published: true,
        created_at: new Date().toISOString(),
    },
]

export default function GameLobbyStage({
    profile,
    xpLogs = [],
    modules = [],
    userModules = [],
}: GameLobbyStageProps) {
    const classStat = AVATAR_CLASS_STATS[profile.avatar_class] || AVATAR_CLASS_STATS['warrior']
    const roleCfg = CLASS_CONFIG[profile.avatar_class] || CLASS_CONFIG['warrior']

    // Resolve equipped items for character visual
    const equipped = useMemo(() => {
        return resolveEquippedMap(profile.avatar_class, profile.equipped_items, true)
    }, [profile.avatar_class, profile.equipped_items])

    // Level XP Progress calculations
    let xpInLevel = profile.xp
    for (let l = 1; l < profile.level; l++) {
        xpInLevel -= Math.floor(100 * Math.pow(l, 1.5))
    }
    const currentXpProgress = Math.max(0, xpInLevel)
    const progressPercent = getXpProgress(currentXpProgress, profile.xp_to_next_level)

    // 7-day Duolingo-style streak tracker data
    const weekDays = useMemo(() => {
        const now = new Date()
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Senin = 1
        const activeDates = new Set<string>()

        for (const log of xpLogs) {
            if (log.created_at) {
                activeDates.add(log.created_at.slice(0, 10))
            }
        }

        const effectiveStreak = profile.last_active && profile.streak_count > 0
            ? getEffectiveStreak(profile.last_active, profile.streak_count)
            : 0

        if (profile.last_active && effectiveStreak > 0) {
            try {
                const lastActiveDate = parseISO(profile.last_active.slice(0, 10))
                for (let i = 0; i < effectiveStreak; i++) {
                    const d = addDays(lastActiveDate, -i)
                    activeDates.add(format(d, 'yyyy-MM-dd'))
                }
            } catch {
                // Ignore parse errors
            }
        }

        const daysLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
        const days = []

        for (let i = 0; i < 7; i++) {
            const dayDate = addDays(weekStart, i)
            const dateStr = format(dayDate, 'yyyy-MM-dd')
            const isToday = isSameDay(dayDate, now)
            const isPast = dayDate < now && !isToday
            const hasActivity = activeDates.has(dateStr)

            days.push({
                dateStr,
                dayName: daysLabels[i],
                isToday,
                isPast,
                hasActivity,
            })
        }

        return days
    }, [profile.last_active, profile.streak_count, xpLogs])

    // Map user progress to find active module and adjacent nodes
    const userModulesMap = useMemo(() => {
        const map = new Map<string, UserModule>()
        for (const um of userModules) {
            map.set(um.module_id, um)
        }
        return map
    }, [userModules])

    const { currentModule, prevModule, nextModule, currentModuleProgress, isCompleted } = useMemo(() => {
        const list = modules && modules.length > 0 ? modules : FALLBACK_MODULES

        // 1. Check module with status 'in_progress'
        let current = list.find(m => userModulesMap.get(m.id)?.status === 'in_progress')

        // 2. If none, check first uncompleted module
        if (!current) {
            current = list.find(m => userModulesMap.get(m.id)?.status !== 'completed')
        }

        // 3. Fallback to first module
        if (!current) {
            current = list[0]
        }

        const currentIndex = list.findIndex(m => m.id === current?.id)
        const prev = currentIndex > 0 ? list[currentIndex - 1] : list[list.length - 1]
        const next = currentIndex < list.length - 1 ? list[currentIndex + 1] : list[0]

        const uMod = current ? userModulesMap.get(current.id) : null
        const completed = uMod?.status === 'completed'
        const prog = uMod?.progress_percent || (completed ? 100 : 0)

        return {
            currentModule: current || list[0],
            prevModule: prev || list[0],
            nextModule: next || list[list.length - 1],
            currentModuleProgress: prog,
            isCompleted: completed,
        }
    }, [modules, userModulesMap])

    const effectiveStreak = profile.last_active && profile.streak_count > 0
        ? getEffectiveStreak(profile.last_active, profile.streak_count)
        : profile.streak_count

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {/* 1. STAGE PANEL UTAMA (Game Lobby Canvas) */}
            <div
                className="card hero-stage-container"
                style={{
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '14px',
                    boxShadow: 'var(--shadow-panel)',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Radial Aura Latar Arena */}
                <div
                    style={{
                        position: 'absolute',
                        top: '20%',
                        left: '50%',
                        transform: 'translate(-50%, -20%)',
                        width: '700px',
                        height: '420px',
                        background: `radial-gradient(ellipse at center, ${roleCfg.color}15 0%, rgba(245, 197, 66, 0.04) 45%, transparent 70%)`,
                        filter: 'blur(40px)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                {/* --- A. TOP BAR: HERO IDENTITY & RESOURCES --- */}
                <div
                    style={{
                        padding: '18px 24px',
                        borderBottom: '1px solid var(--surface-border)',
                        backgroundColor: 'var(--surface-elevated)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    {/* Identitas Hero */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: '1 1 auto' }}>
                        {/* Avatar Frame Mini */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div
                                style={{
                                    width: '54px',
                                    height: '54px',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: `1px solid ${roleCfg.border}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '26px',
                                }}
                            >
                                {classStat.emoji}
                            </div>
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    right: '-4px',
                                    backgroundColor: 'var(--brand-primary)',
                                    color: 'var(--brand-primary-text)',
                                    fontWeight: 700,
                                    fontSize: '10px',
                                    padding: '1px 6px',
                                    borderRadius: '6px',
                                    fontFamily: 'var(--font-heading)',
                                    border: '1px solid rgba(245, 197, 66, 0.4)',
                                }}
                            >
                                Lv.{profile.level}
                            </div>
                        </div>

                        {/* Title, Kelas & Sekolah */}
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    {profile.username}
                                </span>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: roleCfg.color,
                                        backgroundColor: roleCfg.bg,
                                        border: `1px solid ${roleCfg.border}`,
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                    }}
                                >
                                    {classStat.label}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '4px' }}>
                                {profile.school_name && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <School size={12} style={{ color: 'var(--color-gold-text)' }} />
                                        <span>{profile.school_name}</span>
                                    </div>
                                )}
                                {profile.city && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} style={{ color: 'var(--accent-cyan)' }} />
                                        <span>{profile.city}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resource Gauges (Streak, XP, Link Gear) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Streak Box */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                backgroundColor: 'var(--surface-card)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '10px',
                            }}
                        >
                            <Flame size={16} style={{ color: '#F59E0B' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                                    {effectiveStreak} Hari
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                    Streak login
                                </span>
                            </div>

                            {/* Mini 7-day indicators */}
                            <div style={{ display: 'flex', gap: '3px', marginLeft: '6px' }}>
                                {weekDays.map((day, idx) => (
                                    <div
                                        key={idx}
                                        title={`${day.dayName}: ${day.hasActivity ? 'Aktif' : 'Kosong'}`}
                                        style={{
                                            width: '8px',
                                            height: '14px',
                                            borderRadius: '3px',
                                            backgroundColor: day.hasActivity
                                                ? '#F5C542'
                                                : day.isToday
                                                    ? 'rgba(245, 197, 66, 0.3)'
                                                    : 'var(--surface-border)',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* XP Gauge */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                backgroundColor: 'var(--surface-card)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '10px',
                            }}
                        >
                            <Zap size={16} style={{ color: 'var(--accent-cyan)' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                                    {(profile.xp || 0).toLocaleString()} XP
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                    Total akumulasi
                                </span>
                            </div>
                        </div>

                        {/* Link Kustomisasi Karakter */}
                        <Link href="/character" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '7px 12px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: '10px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-heading)',
                                }}
                            >
                                <Shield size={14} style={{ color: roleCfg.color }} />
                                <span>Gear Hero</span>
                            </motion.button>
                        </Link>
                    </div>
                </div>

                {/* Level Progress Line */}
                <div style={{ width: '100%', height: '3px', backgroundColor: 'var(--surface-border)', position: 'relative', zIndex: 2 }}>
                    <div
                        style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            backgroundColor: 'var(--brand-primary)',
                            transition: 'width 0.8s ease',
                        }}
                    />
                </div>

                {/* --- B. CENTER STAGE: HERO ADVENTURE & PATH PROGRESSION --- */}
                <div
                    style={{
                        padding: '36px 24px 28px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {/* Connecting Energy Beam / Track Line di Background */}
                    <div
                        className="stage-rail-line"
                        style={{
                            position: 'absolute',
                            top: '42%',
                            left: '8%',
                            right: '8%',
                            height: '2px',
                            background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 20%, ${roleCfg.color}40 50%, rgba(255, 255, 255, 0.1) 80%, transparent 100%)`,
                            zIndex: 0,
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Three-Column Stage Layout (Left Node - Center Hero & Quest - Right Node) */}
                    <div
                        className="stage-nodes-layout"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(200px, 1fr) minmax(320px, 1.4fr) minmax(200px, 1fr)',
                            alignItems: 'center',
                            width: '100%',
                            maxWidth: '1100px',
                            gap: '24px',
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        {/* 1. NODE KIRI: Materi Sebelumnya (Fondasi Pembelajaran) */}
                        <div className="stage-side-node prev-node" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Link href={`/modules/${prevModule.slug}`} style={{ textDecoration: 'none', width: '100%', maxWidth: '240px' }}>
                                <motion.div
                                    whileHover={{ y: -3 }}
                                    style={{
                                        backgroundColor: 'var(--surface-elevated)',
                                        border: '1px solid var(--surface-border)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        transition: 'border-color 0.2s ease',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                                            Materi Sebelumnya
                                        </span>
                                        <div
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--accent-green)',
                                            }}
                                        >
                                            <CheckCircle2 size={13} />
                                        </div>
                                    </div>

                                    <h4
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            margin: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {prevModule.title}
                                    </h4>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-green)' }}>
                                        <span>Selesai dipelajari</span>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>

                        {/* 2. CENTERPIECE: Karakter Hero di Atas Pedestal & Modul Saat Ini */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                position: 'relative',
                            }}
                        >
                            {/* Wrapper Karakter & Platform Pedestal */}
                            <div
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px',
                                }}
                            >
                                {/* Visual Karakter Interaktif */}
                                <div style={{ position: 'relative', zIndex: 2, marginBottom: '-28px' }}>
                                    <CharacterVisual
                                        role={profile.avatar_class}
                                        equipped={equipped}
                                        size={210}
                                        showAura={true}
                                        animationState="idle"
                                        interactive={false}
                                    />
                                </div>

                                {/* Platform Arena Pedestal 3D */}
                                <div
                                    style={{
                                        width: '230px',
                                        height: '56px',
                                        borderRadius: '50%',
                                        background: `radial-gradient(ellipse at center, ${roleCfg.color}25 0%, rgba(20, 20, 20, 0.95) 75%)`,
                                        border: `1.5px solid ${roleCfg.border}`,
                                        boxShadow: `0 12px 28px rgba(0, 0, 0, 0.5), inset 0 0 16px ${roleCfg.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 1,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '180px',
                                            height: '38px',
                                            borderRadius: '50%',
                                            border: '1px dashed rgba(255, 255, 255, 0.2)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Card Modul Saat Ini (Active Quest Highlight) */}
                            <div
                                style={{
                                    width: '100%',
                                    maxWidth: '380px',
                                    backgroundColor: 'var(--surface-elevated)',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    boxShadow: 'var(--shadow-card)',
                                    position: 'relative',
                                    zIndex: 2,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                    <span
                                        style={{
                                            fontSize: '10.5px',
                                            fontWeight: 600,
                                            color: 'var(--color-gold-text)',
                                            fontFamily: 'var(--font-heading)',
                                        }}
                                    >
                                        Modul Saat Ini
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span
                                            style={{
                                                fontSize: '10.5px',
                                                fontWeight: 600,
                                                color: 'var(--accent-cyan)',
                                                backgroundColor: 'var(--accent-cyan-bg)',
                                                border: '1px solid var(--accent-cyan-border)',
                                                padding: '2px 6px',
                                                borderRadius: '5px',
                                            }}
                                        >
                                            +{currentModule.xp_reward} XP
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h3
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            margin: 0,
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {currentModule.title}
                                    </h3>
                                    {currentModule.description && (
                                        <p
                                            style={{
                                                fontSize: '12px',
                                                color: 'var(--text-secondary)',
                                                margin: '4px 0 0',
                                                lineHeight: 1.4,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {currentModule.description}
                                        </p>
                                    )}
                                </div>

                                {/* Progress bar modul */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span>Progres Belajar</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {isCompleted ? '100% Selesai' : `${currentModuleProgress}%`}
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--surface-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${currentModuleProgress}%`,
                                                height: '100%',
                                                backgroundColor: isCompleted ? 'var(--accent-green)' : 'var(--brand-primary)',
                                                borderRadius: '4px',
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Main Game Action CTA */}
                                <Link href={`/modules/${currentModule.slug}`} style={{ textDecoration: 'none', width: '100%', marginTop: '2px' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 18px',
                                            borderRadius: '8px',
                                            backgroundColor: 'var(--brand-primary)',
                                            color: 'var(--brand-primary-text)',
                                            border: '1px solid var(--brand-primary-border)',
                                            fontWeight: 700,
                                            fontSize: '13px',
                                            fontFamily: 'var(--font-heading)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: 'var(--shadow-signal-orange)',
                                        }}
                                    >
                                        <span>{isCompleted ? 'Pelajari Ulang' : currentModuleProgress > 0 ? 'Lanjut Belajar' : 'Mulai Belajar'}</span>
                                        <ArrowRight size={15} />
                                    </motion.button>
                                </Link>
                            </div>
                        </div>

                        {/* 3. NODE KANAN: Materi Berikutnya (Next Quest Node) */}
                        <div className="stage-side-node next-node" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Link href={`/modules/${nextModule.slug}`} style={{ textDecoration: 'none', width: '100%', maxWidth: '240px' }}>
                                <motion.div
                                    whileHover={{ y: -3 }}
                                    style={{
                                        backgroundColor: 'var(--surface-elevated)',
                                        border: '1px solid var(--surface-border)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        transition: 'border-color 0.2s ease',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                                            Materi Berikutnya
                                        </span>
                                        <div
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                backgroundColor: 'rgba(245, 197, 66, 0.12)',
                                                border: '1px solid rgba(245, 197, 66, 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--color-gold-text)',
                                            }}
                                        >
                                            <Sparkles size={13} />
                                        </div>
                                    </div>

                                    <h4
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            margin: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {nextModule.title}
                                    </h4>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <Clock size={12} />
                                        <span>+{nextModule.xp_reward} XP • {nextModule.duration_minutes || 45}m</span>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* --- C. BOTTOM ROW: THE 3 GAME COMMAND CARDS (Shop, Module, Battle) --- */}
                <div
                    style={{
                        padding: '16px 24px 20px',
                        borderTop: '1px solid var(--surface-border)',
                        backgroundColor: 'var(--surface-elevated)',
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    <div
                        className="game-deck-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '16px',
                            width: '100%',
                        }}
                    >
                        {/* 1. KARTU TOKO (SHOP) */}
                        <Link href="/shop" style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: '12px',
                                    padding: '16px 18px',
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: 'var(--shadow-card)',
                                    transition: 'border-color 0.2s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '8px',
                                            backgroundColor: 'var(--accent-gold-bg)',
                                            border: '1px solid var(--accent-gold-border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--color-gold-text)',
                                        }}
                                    >
                                        <ShoppingBag size={18} />
                                    </div>
                                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                                </div>

                                <div>
                                    <h4
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            margin: '0 0 4px',
                                        }}
                                    >
                                        Toko Perlengkapan
                                    </h4>
                                    <p
                                        style={{
                                            fontSize: '12px',
                                            color: 'var(--text-secondary)',
                                            margin: 0,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        Tukarkan XP dengan voucher kantin dan gear pahlawan.
                                    </p>
                                </div>
                            </motion.div>
                        </Link>

                        {/* 2. KARTU MODUL (MODULE - PRIMARY CENTER ACTION) */}
                        <Link href="/modules" style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid var(--brand-primary-border)',
                                    borderRadius: '12px',
                                    padding: '16px 18px',
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: 'var(--shadow-signal-orange)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(245, 197, 66, 0.16)',
                                            border: '1px solid var(--brand-primary-border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--color-gold-text)',
                                        }}
                                    >
                                        <BookOpen size={18} />
                                    </div>
                                    <ChevronRight size={16} style={{ color: 'var(--brand-primary)' }} />
                                </div>

                                <div>
                                    <h4
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            margin: '0 0 4px',
                                        }}
                                    >
                                        Pusat Modul
                                    </h4>
                                    <p
                                        style={{
                                            fontSize: '12px',
                                            color: 'var(--text-secondary)',
                                            margin: 0,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        Jelajahi seluruh kurikulum dan taklukkan silabus belajar.
                                    </p>
                                </div>
                            </motion.div>
                        </Link>

                        {/* 3. KARTU BATTLE (BATTLE) */}
                        <Link href="/battle" style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: '12px',
                                    padding: '16px 18px',
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: 'var(--shadow-card)',
                                    transition: 'border-color 0.2s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '8px',
                                            backgroundColor: 'var(--accent-red-bg)',
                                            border: '1px solid var(--accent-red-border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--accent-red)',
                                        }}
                                    >
                                        <Swords size={18} />
                                    </div>
                                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                                </div>

                                <div>
                                    <h4
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            margin: '0 0 4px',
                                        }}
                                    >
                                        Arena Pertarungan
                                    </h4>
                                    <p
                                        style={{
                                            fontSize: '12px',
                                            color: 'var(--text-secondary)',
                                            margin: 0,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        Duel kuis 1v1 realtime antar siswa atau latihan bot.
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
