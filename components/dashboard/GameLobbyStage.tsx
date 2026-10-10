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
    School,
    MapPin,
    Shield,
    CheckCircle2,
    Sparkles,
    Play,
    FileText,
    HelpCircle,
    Layers,
    ChevronDown,
    ArrowDown,
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

    // Previous lesson step within this module
    const prevStepIndex = activeStepIndex > 0 ? activeStepIndex - 1 : null
    const prevStep = prevStepIndex !== null ? steps[prevStepIndex] : null
    const isPrevStepCompleted = prevStepIndex !== null ? (isModuleCompleted || prevStepIndex < completedStepsCount) : false

    // Next lesson step within this module
    const nextStepIndex = activeStepIndex < steps.length - 1 ? activeStepIndex + 1 : null
    const nextStep = nextStepIndex !== null ? steps[nextStepIndex] : null
    const isNextStepCompleted = nextStepIndex !== null ? (isModuleCompleted || nextStepIndex < completedStepsCount) : false

    const effectiveStreak = profile.last_active && profile.streak_count > 0
        ? getEffectiveStreak(profile.last_active, profile.streak_count)
        : profile.streak_count

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {/* 1. STAGE PANEL UTAMA (Game Lobby Canvas Fullscreen di Desktop) */}
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
                        top: '30%',
                        left: '50%',
                        transform: 'translate(-50%, -30%)',
                        width: '800px',
                        height: '520px',
                        background: `radial-gradient(ellipse at center, ${roleCfg.color}18 0%, rgba(245, 197, 66, 0.05) 50%, transparent 75%)`,
                        filter: 'blur(50px)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                {/* --- A. TOP BAR: HERO IDENTITY, RESOURCES & MODULE SELECTOR --- */}
                <div
                    style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--surface-border)',
                        backgroundColor: 'var(--surface-elevated)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                        position: 'relative',
                        zIndex: 3,
                        flexShrink: 0,
                    }}
                >
                    {/* Identitas Hero */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: '1 1 auto' }}>
                        {/* Avatar Frame Mini */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div
                                style={{
                                    width: '52px',
                                    height: '52px',
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

                    {/* Module Selector & Resource Gauges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Selector Modul Aktif */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                backgroundColor: 'var(--surface-card)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '10px',
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
                                    paddingRight: '4px',
                                    maxWidth: '180px',
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

                        {/* Streak Box */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '5px 12px',
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
                            </div>

                            {/* Mini 7-day indicators */}
                            <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
                                {weekDays.map((day, idx) => (
                                    <div
                                        key={idx}
                                        title={`${day.dayName}: ${day.hasActivity ? 'Aktif' : 'Kosong'}`}
                                        style={{
                                            width: '7px',
                                            height: '13px',
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

                        {/* XP Gauge */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 12px',
                                backgroundColor: 'var(--surface-card)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '10px',
                            }}
                        >
                            <Zap size={16} style={{ color: 'var(--accent-cyan)' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                                {(profile.xp || 0).toLocaleString()} XP
                            </span>
                        </div>

                        {/* Link Kustomisasi Gear */}
                        <Link href="/character" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
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
                                <span>Gear</span>
                            </motion.button>
                        </Link>
                    </div>
                </div>

                {/* Level Progress Line */}
                <div style={{ width: '100%', height: '3px', backgroundColor: 'var(--surface-border)', position: 'relative', zIndex: 2, flexShrink: 0 }}>
                    <div
                        style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            backgroundColor: 'var(--brand-primary)',
                            transition: 'width 0.8s ease',
                        }}
                    />
                </div>

                {/* --- B. CENTER STAGE: HERO ARENA & ALUR MATERI DALAM MODUL --- */}
                <div
                    className="stage-center-content"
                    style={{
                        padding: '28px 24px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {/* --- 1. PETA JALUR / ROADMAP BAB MATERI DI ATAS KARAKTER --- */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '16px',
                            padding: '6px 14px',
                            backgroundColor: 'var(--surface-elevated)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '10px',
                            zIndex: 2,
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                        }}
                    >
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', marginRight: '6px' }}>
                            Jalur Materi {currentModule.title}:
                        </span>
                        {steps.map((st, idx) => {
                            const isDone = isModuleCompleted || idx < completedStepsCount
                            const isCurrent = idx === activeStepIndex
                            return (
                                <React.Fragment key={st.id || idx}>
                                    {idx > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', margin: '0 3px' }}>
                                            <div
                                                style={{
                                                    width: '18px',
                                                    height: '3px',
                                                    borderRadius: '2px',
                                                    backgroundColor: idx <= completedStepsCount
                                                        ? 'var(--accent-green)'
                                                        : 'var(--surface-border)',
                                                    transition: 'all 0.3s ease',
                                                }}
                                            />
                                            <span style={{ fontSize: '9px', color: idx <= completedStepsCount ? 'var(--accent-green)' : 'var(--text-muted)', marginLeft: '-2px' }}>
                                                ▸
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setManualStepIndex(idx)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
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
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {isDone ? (
                                            <CheckCircle2 size={12} style={{ color: 'var(--accent-green)' }} />
                                        ) : (
                                            <span>{idx + 1}.</span>
                                        )}
                                        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {st.title.replace(/^([0-9]+\.\s*|Video Pembelajaran:\s*|Pengenalan:\s*)/i, '')}
                                        </span>
                                    </button>
                                </React.Fragment>
                            )
                        })}
                    </div>

                    {/* --- 2. HERO CHARACTER & ARENA PEDESTAL SHOWCASE --- */}
                    <div
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                            zIndex: 2,
                        }}
                    >
                        <div style={{ position: 'relative', zIndex: 2, marginBottom: '-24px' }}>
                            <CharacterVisual
                                role={profile.avatar_class}
                                equipped={equipped}
                                size={200}
                                showAura={true}
                                animationState="idle"
                                interactive={false}
                            />
                        </div>

                        {/* Platform Arena Pedestal 3D */}
                        <div
                            style={{
                                width: '220px',
                                height: '52px',
                                borderRadius: '50%',
                                background: `radial-gradient(ellipse at center, ${roleCfg.color}28 0%, rgba(20, 20, 20, 0.95) 75%)`,
                                border: `1.5px solid ${roleCfg.border}`,
                                boxShadow: `0 14px 32px rgba(0, 0, 0, 0.5), inset 0 0 16px ${roleCfg.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1,
                            }}
                        >
                            <div
                                style={{
                                    width: '172px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    border: '1px dashed rgba(255, 255, 255, 0.22)',
                                }}
                            />
                        </div>
                    </div>

                    {/* --- 3. THE 3-STATION MATERIAL ROADWAY (Clear Hierarchy: Past Checkpoint -> Main Quest -> Future Checkpoint) --- */}
                    <div className="stage-materials-roadway">
                        {/* A. STATION 1 (KIRI): MATERI SEBELUMNYA (Subdued Past Checkpoint) */}
                        <div
                            className="stage-side-station prev-station"
                            style={{
                                flex: '0 1 240px',
                                width: '100%',
                                maxWidth: '240px',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Anchor Pegs di sisi kanan kartu */}
                            <div
                                className="hidden lg:flex"
                                style={{
                                    position: 'absolute',
                                    right: '-4px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    zIndex: 3,
                                    pointerEvents: 'none',
                                }}
                            >
                                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#444', border: '1px solid #666' }} />
                                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#444', border: '1px solid #666' }} />
                            </div>

                            {prevStep ? (
                                <Link
                                    href={`/modules/${currentModule.slug}?step=${prevStepIndex}`}
                                    style={{ textDecoration: 'none', width: '100%' }}
                                >
                                    <motion.div
                                        whileHover={{ y: -3, opacity: 0.95 }}
                                        style={{
                                            backgroundColor: 'rgba(20, 20, 22, 0.75)',
                                            border: `1px solid ${isPrevStepCompleted ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                                            borderRadius: '12px',
                                            padding: '14px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            opacity: 0.72,
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>
                                                    {getStepTypeIcon(prevStep.type)}
                                                </span>
                                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                                                    Langkah {prevStepIndex! + 1}
                                                </span>
                                            </div>

                                            {isPrevStepCompleted ? (
                                                <div
                                                    style={{
                                                        padding: '1px 6px',
                                                        borderRadius: '6px',
                                                        backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                                        border: '1px solid rgba(34, 197, 94, 0.25)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        color: 'var(--accent-green)',
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    <CheckCircle2 size={11} />
                                                    <span>Selesai</span>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Materi lalu</span>
                                            )}
                                        </div>

                                        <h4
                                            style={{
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: 'var(--text-secondary)',
                                                margin: 0,
                                                lineHeight: 1.35,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {prevStep.title}
                                        </h4>

                                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                            Bab sebelumnya
                                        </span>
                                    </motion.div>
                                </Link>
                            ) : (
                                <div
                                    style={{
                                        backgroundColor: 'rgba(20, 20, 22, 0.5)',
                                        border: '1px dashed rgba(255, 255, 255, 0.08)',
                                        borderRadius: '12px',
                                        padding: '14px 16px',
                                        width: '100%',
                                        opacity: 0.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                    }}
                                >
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                                        Titik Awal Modul
                                    </span>
                                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '12.5px', margin: 0, color: 'var(--text-muted)' }}>
                                        Langkah Pertama
                                    </h4>
                                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                        Mulai di stasiun tengah
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* B. BRIDGE 1 (HORIZONTAL DESKTOP): TALI & JALUR SELESAI */}
                        <div
                            className="stage-road-bridge"
                            style={{
                                flex: '1 1 70px',
                                minWidth: '40px',
                                maxWidth: '110px',
                                height: '34px',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 0,
                            }}
                        >
                            {/* Tali Atas */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '2.5px',
                                    background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.85) 50%, rgba(34, 197, 94, 0.4) 100%)',
                                    borderRadius: '2px',
                                }}
                            />

                            {/* Badan Jalan Paved */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '24px',
                                    background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.14) 0%, rgba(18, 18, 20, 0.95) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        transform: 'translateY(-50%)',
                                        borderTop: '2px dashed rgba(255, 255, 255, 0.55)',
                                    }}
                                />
                                <div
                                    style={{
                                        padding: '2px 7px',
                                        borderRadius: '6px',
                                        backgroundColor: 'var(--surface-card)',
                                        border: '1px solid rgba(34, 197, 94, 0.45)',
                                        color: 'var(--accent-green)',
                                        fontSize: '9.5px',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-heading)',
                                        position: 'relative',
                                        zIndex: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <CheckCircle2 size={10} />
                                    <span>Jalur selesai</span>
                                    <ArrowRight size={10} />
                                </div>
                            </div>

                            {/* Tali Bawah */}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '2.5px',
                                    background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.85) 50%, rgba(34, 197, 94, 0.4) 100%)',
                                    borderRadius: '2px',
                                }}
                            />
                        </div>

                        {/* BRIDGE 1 (VERTICAL MOBILE) */}
                        <div className="stage-road-bridge-vertical bridge-completed-vert">
                            <div
                                style={{
                                    padding: '3px 10px',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid rgba(34, 197, 94, 0.4)',
                                    color: 'var(--accent-green)',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <CheckCircle2 size={11} />
                                <span>Jalur selesai</span>
                                <ArrowDown size={11} />
                            </div>
                        </div>

                        {/* C. STATION 2 (TENGAH): MATERI SAAT INI (THE UNDISPUTED HERO QUEST) */}
                        <div
                            className="active-station"
                            style={{
                                flex: '1 1 420px',
                                width: '100%',
                                maxWidth: '430px',
                                position: 'relative',
                                zIndex: 2,
                            }}
                        >
                            {/* Anchor Pegs di sisi kiri dan kanan kartu */}
                            <div
                                className="hidden lg:flex"
                                style={{
                                    position: 'absolute',
                                    left: '-4px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    zIndex: 3,
                                    pointerEvents: 'none',
                                }}
                            >
                                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#555', border: '1px solid #777' }} />
                                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#555', border: '1px solid #777' }} />
                            </div>
                            <div
                                className="hidden lg:flex"
                                style={{
                                    position: 'absolute',
                                    right: '-4px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    zIndex: 3,
                                    pointerEvents: 'none',
                                }}
                            >
                                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#555', border: '1px solid #777' }} />
                                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#555', border: '1px solid #777' }} />
                            </div>

                            {/* THE DOMINANT HERO QUEST CARD */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                style={{
                                    backgroundColor: 'var(--surface-elevated)',
                                    border: '1.5px solid var(--accent-gold-border)',
                                    borderRadius: '14px',
                                    padding: '20px 22px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65), 0 0 24px rgba(245, 197, 66, 0.1)',
                                    position: 'relative',
                                }}
                            >
                                {/* Focal Header: Clear Stage Mission Tag */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
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

                                    {isActiveStepCompleted ? (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                                color: 'var(--accent-green)',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            <CheckCircle2 size={13} />
                                            <span>Selesai</span>
                                        </div>
                                    ) : (
                                        <span
                                            style={{
                                                fontSize: '10.5px',
                                                fontWeight: 600,
                                                color: 'var(--accent-cyan)',
                                                backgroundColor: 'var(--accent-cyan-bg)',
                                                border: '1px solid var(--accent-cyan-border)',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                            }}
                                        >
                                            {getStepTypeLabel(activeStep.type)}
                                        </span>
                                    )}
                                </div>

                                {/* Active Lesson Title (Prominent, High Contrast) */}
                                <div>
                                    <h3
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '18px',
                                            fontWeight: 700,
                                            color: 'var(--text-primary)',
                                            margin: 0,
                                            lineHeight: 1.3,
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {activeStep.title}
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: '12.5px',
                                            color: 'var(--text-secondary)',
                                            margin: '6px 0 0',
                                            lineHeight: 1.45,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {activeStep.content.replace(/[#*`]/g, '').slice(0, 130)}...
                                    </p>
                                </div>

                                {/* Progress Track */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span>Progres Modul {currentModule.title}</span>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {isModuleCompleted ? '100% Tuntas' : `${moduleProgressPct}%`}
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--surface-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${moduleProgressPct}%`,
                                                height: '100%',
                                                backgroundColor: isModuleCompleted ? 'var(--accent-green)' : 'var(--brand-primary)',
                                                borderRadius: '4px',
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* THE UNDISPUTED PRIMARY CALL TO ACTION BUTTON */}
                                <Link
                                    href={`/modules/${currentModule.slug}?step=${activeStepIndex}`}
                                    style={{ textDecoration: 'none', width: '100%', marginTop: '4px' }}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            width: '100%',
                                            padding: '12px 20px',
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
                                            boxShadow: 'var(--shadow-signal-orange)',
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        <span>{isActiveStepCompleted ? 'Pelajari Ulang Materi' : 'Lanjut Belajar Materi Ini'}</span>
                                        <ArrowRight size={16} />
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </div>

                        {/* D. BRIDGE 2 (HORIZONTAL DESKTOP): TALI & JALUR LANGKAH BERIKUTNYA */}
                        <div
                            className="stage-road-bridge"
                            style={{
                                flex: '1 1 70px',
                                minWidth: '40px',
                                maxWidth: '110px',
                                height: '34px',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 0,
                            }}
                        >
                            {/* Tali Atas Emas */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '2.5px',
                                    background: 'linear-gradient(90deg, rgba(245, 197, 66, 0.8) 0%, rgba(245, 197, 66, 0.3) 100%)',
                                    borderRadius: '2px',
                                }}
                            />

                            {/* Badan Jalan Emas */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '24px',
                                    background: 'linear-gradient(180deg, rgba(245, 197, 66, 0.12) 0%, rgba(18, 18, 20, 0.95) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        transform: 'translateY(-50%)',
                                        borderTop: '2px dashed rgba(255, 255, 255, 0.4)',
                                    }}
                                />
                                <div
                                    style={{
                                        padding: '2px 7px',
                                        borderRadius: '6px',
                                        backgroundColor: 'var(--surface-card)',
                                        border: '1px solid rgba(245, 197, 66, 0.4)',
                                        color: 'var(--color-gold-text)',
                                        fontSize: '9.5px',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-heading)',
                                        position: 'relative',
                                        zIndex: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Sparkles size={10} />
                                    <span>Langkah lanjut</span>
                                    <ArrowRight size={10} />
                                </div>
                            </div>

                            {/* Tali Bawah Emas */}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '2.5px',
                                    background: 'linear-gradient(90deg, rgba(245, 197, 66, 0.8) 0%, rgba(245, 197, 66, 0.3) 100%)',
                                    borderRadius: '2px',
                                }}
                            />
                        </div>

                        {/* BRIDGE 2 (VERTICAL MOBILE) */}
                        <div className="stage-road-bridge-vertical bridge-upcoming-vert">
                            <div
                                style={{
                                    padding: '3px 10px',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid rgba(245, 197, 66, 0.4)',
                                    color: 'var(--color-gold-text)',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <Sparkles size={11} />
                                <span>Langkah berikutnya</span>
                                <ArrowDown size={11} />
                            </div>
                        </div>

                        {/* E. STATION 3 (KANAN): MATERI BERIKUTNYA (Subdued Upcoming Checkpoint) */}
                        <div
                            className="stage-side-station next-station"
                            style={{
                                flex: '0 1 240px',
                                width: '100%',
                                maxWidth: '240px',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Anchor Pegs di sisi kiri kartu */}
                            <div
                                className="hidden lg:flex"
                                style={{
                                    position: 'absolute',
                                    left: '-4px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    zIndex: 3,
                                    pointerEvents: 'none',
                                }}
                            >
                                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#444', border: '1px solid #666' }} />
                                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#444', border: '1px solid #666' }} />
                            </div>

                            {nextStep ? (
                                <Link
                                    href={`/modules/${currentModule.slug}?step=${nextStepIndex}`}
                                    style={{ textDecoration: 'none', width: '100%' }}
                                >
                                    <motion.div
                                        whileHover={{ y: -3, opacity: 0.95 }}
                                        style={{
                                            backgroundColor: 'rgba(20, 20, 22, 0.65)',
                                            border: `1px dashed ${isNextStepCompleted ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.12)'}`,
                                            borderRadius: '12px',
                                            padding: '14px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            opacity: 0.65,
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>
                                                    {getStepTypeIcon(nextStep.type)}
                                                </span>
                                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                                                    Langkah {nextStepIndex! + 1}
                                                </span>
                                            </div>

                                            {isNextStepCompleted ? (
                                                <div
                                                    style={{
                                                        padding: '1px 6px',
                                                        borderRadius: '6px',
                                                        backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                                        border: '1px solid rgba(34, 197, 94, 0.25)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        color: 'var(--accent-green)',
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    <CheckCircle2 size={11} />
                                                    <span>Selesai</span>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '10px', color: 'var(--color-gold-text)' }}>Berikutnya</span>
                                            )}
                                        </div>

                                        <h4
                                            style={{
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: 'var(--text-secondary)',
                                                margin: 0,
                                                lineHeight: 1.35,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {nextStep.title}
                                        </h4>

                                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                            Bab selanjutnya
                                        </span>
                                    </motion.div>
                                </Link>
                            ) : (
                                <div
                                    style={{
                                        backgroundColor: 'rgba(20, 20, 22, 0.5)',
                                        border: '1px dashed rgba(255, 255, 255, 0.08)',
                                        borderRadius: '12px',
                                        padding: '14px 16px',
                                        width: '100%',
                                        opacity: 0.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green)' }}>
                                        <CheckCircle2 size={13} />
                                        <span style={{ fontSize: '10.5px', fontWeight: 600 }}>Tuntas Akhir</span>
                                    </div>
                                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '12.5px', margin: 0, color: 'var(--text-muted)' }}>
                                        Materi Terakhir Modul
                                    </h4>
                                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                        Semua bab telah tuntas
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- C. BOTTOM ROW: SLEEK GAME COMMAND DOCK (Clear Separation as Utility Navigation) --- */}
                <div
                    style={{
                        padding: '12px 24px 16px',
                        borderTop: '1px solid var(--surface-border)',
                        backgroundColor: 'rgba(18, 18, 20, 0.95)',
                        position: 'relative',
                        zIndex: 3,
                        flexShrink: 0,
                    }}
                >
                    <div className="stage-command-dock">
                        {/* 1. DOCK ITEM: PUSAT MODUL */}
                        <Link href="/modules" className="stage-dock-item">
                            <div
                                style={{
                                    width: '34px',
                                    height: '34px',
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
                                <BookOpen size={16} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                    Pusat Modul
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '2px' }}>
                                    Katalog silabus belajar
                                </div>
                            </div>
                            <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </Link>

                        {/* 2. DOCK ITEM: ARENA DUEL 1V1 */}
                        <Link href="/battle" className="stage-dock-item">
                            <div
                                style={{
                                    width: '34px',
                                    height: '34px',
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
                                <Swords size={16} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                    Arena Duel 1v1
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '2px' }}>
                                    Tantang duel siswa lain
                                </div>
                            </div>
                            <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </Link>

                        {/* 3. DOCK ITEM: TOKO PERLENGKAPAN */}
                        <Link href="/shop" className="stage-dock-item">
                            <div
                                style={{
                                    width: '34px',
                                    height: '34px',
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
                                <ShoppingBag size={16} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                    Toko Perlengkapan
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '2px' }}>
                                    Tukar XP & perlengkapan
                                </div>
                            </div>
                            <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
