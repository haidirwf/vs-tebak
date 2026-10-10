'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Profile, Module, UserModule, AvatarClass, LessonStep } from '@/types'
import { AVATAR_CLASS_STATS, getXpProgress } from '@/lib/game/xp'
import { resolveEquippedMap } from '@/lib/game/character'
import { getEffectiveStreak } from '@/lib/game/streak'
import CharacterVisual from '@/components/character/CharacterVisual'
import { MODULE_LESSONS_MAP, getCuratedStepsForModule } from '@/lib/content/module-lessons'
import {
    Flame,
    Zap,
    BookOpen,
    Swords,
    ShoppingBag,
    ChevronRight,
    ArrowRight,
    Shield,
    CheckCircle2,
    Play,
    FileText,
    HelpCircle,
    Layers,
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

function resolveModuleLessons(mod: Module): LessonStep[] {
    if (!mod) return []

    // 1. Direct curated match
    const curated = getCuratedStepsForModule(mod.slug)
    if (curated && curated.length > 0) return curated

    // 2. Fuzzy alias prefix match
    const keys = Object.keys(MODULE_LESSONS_MAP)
    const foundKey = keys.find(k => mod.slug.startsWith(k) || k.startsWith(mod.slug))
    if (foundKey && MODULE_LESSONS_MAP[foundKey]) {
        return MODULE_LESSONS_MAP[foundKey]
    }

    // 3. Raw content from database
    if (Array.isArray(mod.content) && mod.content.length > 0) {
        return mod.content as LessonStep[]
    }

    // 4. Default structured steps
    return [
        {
            id: 'step-intro',
            title: `Pengenalan Dasar: ${mod.title}`,
            type: 'text',
            content: mod.description || `Materi dasar untuk memahami ${mod.title}.`,
        },
        {
            id: 'step-video',
            title: `Video Pembelajaran: ${mod.title}`,
            type: 'video',
            content: 'https://www.youtube.com/watch?v=3U1AhjEf7DM',
        },
        {
            id: 'step-core',
            title: `Implementasi & Komponen: ${mod.title}`,
            type: 'text',
            content: `Studi kasus dan penerapan mendalam materi ${mod.title}.`,
        },
        {
            id: 'step-quiz',
            title: `Evaluasi & Kuis Pemahaman: ${mod.title}`,
            type: 'quiz',
            content: `Kuis latihan untuk menguji penguasaan materi ${mod.title}.`,
        },
    ]
}

function getStepTypeIcon(type?: string) {
    switch (type) {
        case 'video':
            return <Play size={13} fill="currentColor" />
        case 'quiz':
            return <HelpCircle size={13} />
        case 'text':
        default:
            return <FileText size={13} />
    }
}

function getStepTypeLabel(type?: string) {
    switch (type) {
        case 'video':
            return 'Video Materi'
        case 'quiz':
            return 'Kuis Latihan'
        case 'text':
        default:
            return 'Bacaan & Konsep'
    }
}

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

    // Map user modules progress
    const userModulesMap = useMemo(() => {
        const map = new Map<string, UserModule>()
        for (const um of userModules) {
            map.set(um.module_id, um)
        }
        return map
    }, [userModules])

    const moduleList = useMemo(() => {
        return modules && modules.length > 0 ? modules : FALLBACK_MODULES
    }, [modules])

    // State for module selection
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

    // Active module selection:
    // User selected module OR module currently in progress OR first incomplete module
    const currentModule = useMemo(() => {
        if (selectedModuleId) {
            const found = moduleList.find(m => m.id === selectedModuleId)
            if (found) return found
        }
        const inProgress = moduleList.find(m => userModulesMap.get(m.id)?.status === 'in_progress')
        if (inProgress) return inProgress

        const notCompleted = moduleList.find(m => userModulesMap.get(m.id)?.status !== 'completed')
        if (notCompleted) return notCompleted

        return moduleList[0]
    }, [selectedModuleId, moduleList, userModulesMap])

    // Steps / Lessons within the selected module
    const steps = useMemo(() => {
        return resolveModuleLessons(currentModule)
    }, [currentModule])

    // User's progress in this specific module
    const userMod = userModulesMap.get(currentModule.id)
    const isModuleCompleted = userMod?.status === 'completed'
    const moduleProgressPct = userMod?.progress_percent || (isModuleCompleted ? 100 : 0)

    // Calculate completed steps based on user's module progress
    const completedStepsCount = isModuleCompleted
        ? steps.length
        : Math.min(steps.length, Math.floor((moduleProgressPct / 100) * steps.length))

    // Interactive step preview state within this module
    const [manualStepIndex, setManualStepIndex] = useState<number | null>(null)

    // Reset manual step when module changes
    const activeStepIndex = useMemo(() => {
        if (manualStepIndex !== null && manualStepIndex >= 0 && manualStepIndex < steps.length) {
            return manualStepIndex
        }
        if (isModuleCompleted) {
            return Math.max(0, steps.length - 1)
        }
        return Math.min(steps.length - 1, completedStepsCount)
    }, [manualStepIndex, steps.length, isModuleCompleted, completedStepsCount])

    const activeStep = steps[activeStepIndex] || steps[0]
    const isActiveStepCompleted = isModuleCompleted || activeStepIndex < completedStepsCount

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
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-panel)',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Radial Aura Latar Arena */}
                <div
                    style={{
                        position: 'absolute',
                        top: '40%',
                        left: '25%',
                        transform: 'translate(-50%, -50%)',
                        width: '500px',
                        height: '400px',
                        background: `radial-gradient(ellipse at center, ${roleCfg.color}15 0%, rgba(245, 197, 66, 0.04) 50%, transparent 75%)`,
                        filter: 'blur(50px)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                {/* --- A. TOP BAR: HERO IDENTITY, RESOURCES & MODULE SELECTOR --- */}
                <div
                    style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--surface-border)',
                        backgroundColor: 'var(--surface-elevated)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        position: 'relative',
                        zIndex: 3,
                    }}
                >
                    {/* Identitas Hero */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '10px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: `1px solid ${roleCfg.border}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '22px',
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
                                    color: '#0a0a0a',
                                    fontWeight: 700,
                                    fontSize: '9.5px',
                                    padding: '1px 5px',
                                    borderRadius: '5px',
                                    fontFamily: 'var(--font-heading)',
                                }}
                            >
                                Lv.{profile.level}
                            </div>
                        </div>

                        <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
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
                                        padding: '1px 7px',
                                        borderRadius: '5px',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {profile.avatar_class}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Resources & Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Selector Modul Aktif */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                backgroundColor: 'var(--surface-card)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '8px',
                            }}
                        >
                            <Layers size={14} style={{ color: 'var(--color-gold-text)', flexShrink: 0 }} />
                            <select
                                aria-label="Pilih Modul Pembelajaran"
                                value={currentModule.id}
                                onChange={(e) => {
                                    setSelectedModuleId(e.target.value)
                                    setManualStepIndex(null)
                                }}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    fontSize: '12px',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    outline: 'none',
                                    maxWidth: '220px',
                                }}
                            >
                                {moduleList.map((m) => {
                                    const u = userModulesMap.get(m.id)
                                    const done = u?.status === 'completed'
                                    return (
                                        <option key={m.id} value={m.id} style={{ backgroundColor: '#141414', color: '#ffffff' }}>
                                            {m.title} {done ? '✓' : ''}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>

                        {/* Streak Badge */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                backgroundColor: 'var(--surface-card)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '8px',
                            }}
                        >
                            <Flame size={15} style={{ color: '#F59E0B' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                                {effectiveStreak} Hari
                            </span>
                            <div style={{ display: 'flex', gap: '2px', marginLeft: '2px' }}>
                                {weekDays.map((day, idx) => (
                                    <div
                                        key={idx}
                                        title={`${day.dayName}: ${day.hasActivity ? 'Aktif' : 'Kosong'}`}
                                        style={{
                                            width: '6px',
                                            height: '11px',
                                            borderRadius: '2px',
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

                        {/* XP Badge */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                backgroundColor: 'var(--surface-card)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '8px',
                            }}
                        >
                            <Zap size={14} style={{ color: 'var(--accent-cyan)' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                                {(profile.xp || 0).toLocaleString()} XP
                            </span>
                        </div>

                        {/* Link Kustomisasi Gear */}
                        <Link href="/character" style={{ textDecoration: 'none' }}>
                            <button
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '5px 10px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                <Shield size={13} style={{ color: roleCfg.color }} />
                                <span>Gear</span>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* --- B. CENTER STAGE: BALANCED TWO-COLUMN ARENA (Hero Showcase + Active Quest) --- */}
                <div style={{ padding: '24px 20px', position: 'relative', zIndex: 1 }}>
                    <div className="stage-main-grid">
                        {/* 1. KOLOM KIRI: HERO AVATAR & LEVEL PROGRESSION */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                            }}
                        >
                            {/* Visual Avatar */}
                            <div style={{ position: 'relative', zIndex: 2, marginBottom: '-20px' }}>
                                <CharacterVisual
                                    role={profile.avatar_class}
                                    equipped={equipped}
                                    size={185}
                                    showAura={true}
                                    animationState="idle"
                                    interactive={false}
                                />
                            </div>

                            {/* Pedestal Platform */}
                            <div
                                style={{
                                    width: '180px',
                                    height: '38px',
                                    borderRadius: '50%',
                                    background: `radial-gradient(ellipse at center, ${roleCfg.color}25 0%, var(--surface-card) 75%)`,
                                    border: `1.5px solid ${roleCfg.border}`,
                                    boxShadow: `0 8px 20px rgba(0, 0, 0, 0.18), inset 0 0 12px ${roleCfg.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1,
                                    marginBottom: '16px',
                                }}
                            >
                                <div
                                    style={{
                                        width: '140px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        border: `1px dashed ${roleCfg.color}44`,
                                    }}
                                />
                            </div>

                            {/* Level Progression Bar */}
                            <div style={{ width: '100%', maxWidth: '240px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Level {profile.level}</span>
                                    <span>{progressPercent}% ke Lv.{profile.level + 1}</span>
                                </div>
                                <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--surface-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${progressPercent}%`,
                                            height: '100%',
                                            backgroundColor: 'var(--brand-primary)',
                                            borderRadius: '3px',
                                            transition: 'width 0.4s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. KOLOM KANAN: KARTU MISI MODUL AKTIF */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px',
                                padding: '20px 22px',
                                borderRadius: '14px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--accent-gold-border)',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                            }}
                        >
                            {/* Header Misi & Tipe Materi */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Zap size={14} style={{ color: 'var(--color-gold-text)' }} />
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            color: 'var(--color-gold-text)',
                                            fontFamily: 'var(--font-heading)',
                                        }}
                                    >
                                        Misi Aktif • Langkah {activeStepIndex + 1} dari {steps.length}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span
                                        style={{
                                            fontSize: '10.5px',
                                            fontWeight: 600,
                                            color: 'var(--accent-cyan)',
                                            backgroundColor: 'var(--accent-cyan-bg)',
                                            border: '1px solid var(--accent-cyan-border)',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                    >
                                        {getStepTypeIcon(activeStep.type)}
                                        <span>{getStepTypeLabel(activeStep.type)}</span>
                                    </span>

                                    {isActiveStepCompleted && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '2px 7px',
                                                borderRadius: '6px',
                                                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                                color: 'var(--accent-green)',
                                                fontSize: '10.5px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            <CheckCircle2 size={12} />
                                            <span>Selesai</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stepper Jalur Bab Horizontal */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 10px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: '8px',
                                    overflowX: 'auto',
                                }}
                            >
                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap', marginRight: '4px' }}>
                                    Bab:
                                </span>
                                {steps.map((st, idx) => {
                                    const isDone = isModuleCompleted || idx < completedStepsCount
                                    const isCurrent = idx === activeStepIndex
                                    return (
                                        <button
                                            key={st.id || idx}
                                            onClick={() => setManualStepIndex(idx)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '3px 8px',
                                                borderRadius: '5px',
                                                backgroundColor: isCurrent
                                                    ? 'var(--accent-gold-bg)'
                                                    : isDone
                                                        ? 'rgba(34, 197, 94, 0.08)'
                                                        : 'transparent',
                                                border: `1px solid ${isCurrent ? 'var(--accent-gold-border)' : isDone ? 'rgba(34, 197, 94, 0.25)' : 'var(--surface-border)'}`,
                                                color: isCurrent
                                                    ? 'var(--color-gold-text)'
                                                    : isDone
                                                        ? 'var(--accent-green)'
                                                        : 'var(--text-muted)',
                                                fontSize: '11px',
                                                fontWeight: isCurrent ? 700 : 500,
                                                fontFamily: 'var(--font-heading)',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {isDone ? (
                                                <CheckCircle2 size={11} style={{ color: 'var(--accent-green)' }} />
                                            ) : (
                                                <span>{idx + 1}.</span>
                                            )}
                                            <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {st.title.replace(/^([0-9]+\.\s*|Video Pembelajaran:\s*|Pengenalan:\s*)/i, '')}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Judul & Cuplikan Materi */}
                            <div>
                                <h3
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '17px',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        margin: '0 0 6px',
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {activeStep.title}
                                </h3>
                                <p
                                    style={{
                                        fontSize: '12.5px',
                                        color: 'var(--text-secondary)',
                                        margin: 0,
                                        lineHeight: 1.45,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {activeStep.content.replace(/[#*`]/g, '').slice(0, 140)}...
                                </p>
                            </div>

                            {/* Progres Modul */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                    <span>Progres {currentModule.title}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {isModuleCompleted ? '100% Tuntas' : `${moduleProgressPct}%`}
                                    </span>
                                </div>
                                <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--surface-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${moduleProgressPct}%`,
                                            height: '100%',
                                            backgroundColor: isModuleCompleted ? 'var(--accent-green)' : 'var(--brand-primary)',
                                            borderRadius: '3px',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Primary Action Button */}
                            <Link
                                href={`/modules/${currentModule.slug}?step=${activeStepIndex}`}
                                style={{ textDecoration: 'none', width: '100%', marginTop: '2px' }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    style={{
                                        width: '100%',
                                        padding: '11px 18px',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--brand-primary)',
                                        color: '#0a0a0a',
                                        border: '1px solid var(--brand-primary-border)',
                                        fontWeight: 800,
                                        fontSize: '13.5px',
                                        fontFamily: 'var(--font-heading)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <span>{isActiveStepCompleted ? 'Pelajari Ulang Materi' : 'Lanjut Belajar Materi Ini'}</span>
                                    <ArrowRight size={15} />
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* --- C. BOTTOM ROW: SLEEK GAME COMMAND DOCK --- */}
                <div
                    style={{
                        padding: '12px 20px',
                        borderTop: '1px solid var(--surface-border)',
                        backgroundColor: 'rgba(18, 18, 20, 0.95)',
                        position: 'relative',
                        zIndex: 3,
                    }}
                >
                    <div className="stage-command-dock">
                        {/* 1. Pusat Modul */}
                        <Link href="/modules" className="stage-dock-item">
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--accent-gold-bg)',
                                    border: '1px solid var(--accent-gold-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-gold-text)',
                                    flexShrink: 0,
                                }}
                            >
                                <BookOpen size={15} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                    Pusat Modul
                                </div>
                                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '2px' }}>
                                    Katalog silabus belajar
                                </div>
                            </div>
                            <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </Link>

                        {/* 2. Arena Duel 1v1 */}
                        <Link href="/battle" className="stage-dock-item">
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--accent-red-bg)',
                                    border: '1px solid var(--accent-red-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-red)',
                                    flexShrink: 0,
                                }}
                            >
                                <Swords size={15} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                    Arena Duel 1v1
                                </div>
                                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '2px' }}>
                                    Tantang duel siswa lain
                                </div>
                            </div>
                            <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </Link>

                        {/* 3. Toko Perlengkapan */}
                        <Link href="/shop" className="stage-dock-item">
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-cyan)',
                                    flexShrink: 0,
                                }}
                            >
                                <ShoppingBag size={15} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                    Toko Perlengkapan
                                </div>
                                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '2px' }}>
                                    Tukar XP & perlengkapan
                                </div>
                            </div>
                            <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
