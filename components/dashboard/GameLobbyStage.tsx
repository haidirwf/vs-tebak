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
                    {/* --- TALI / ROAD JALUR PETUALANGAN UTAMA DI ARENA --- */}
                    <div
                        className="stage-grand-road"
                        style={{
                            position: 'absolute',
                            top: '52%',
                            left: '5%',
                            right: '5%',
                            height: '24px',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: 0,
                            pointerEvents: 'none',
                        }}
                    >
                        {/* Jembatan Tali / Jalan Kiri: Menghubungkan Materi Sebelumnya ke Center */}
                        <div
                            style={{
                                flex: 1,
                                height: '14px',
                                borderRadius: '7px',
                                background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.22) 0%, rgba(34, 197, 94, 0.6) 100%)',
                                borderTop: '2.5px solid rgba(34, 197, 94, 0.85)',
                                borderBottom: '2.5px solid rgba(34, 197, 94, 0.85)',
                                boxShadow: '0 0 16px rgba(34, 197, 94, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: '2px',
                                    borderTop: '2px dashed rgba(255, 255, 255, 0.65)',
                                    position: 'absolute',
                                }}
                            />
                            <div
                                style={{
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid rgba(34, 197, 94, 0.5)',
                                    color: 'var(--accent-green)',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-heading)',
                                    position: 'relative',
                                    zIndex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                }}
                            >
                                <span>Jalur Selesai</span>
                                <ArrowRight size={11} />
                            </div>
                        </div>

                        {/* Spacer di bawah pedestal karakter agar platform arena tampak kokoh di atas jalan */}
                        <div style={{ width: '270px', flexShrink: 0 }} />

                        {/* Jembatan Tali / Jalan Kanan: Menghubungkan Center ke Materi Berikutnya */}
                        <div
                            style={{
                                flex: 1,
                                height: '14px',
                                borderRadius: '7px',
                                background: 'linear-gradient(90deg, rgba(245, 197, 66, 0.45) 0%, rgba(255, 255, 255, 0.08) 100%)',
                                borderTop: '2.5px dashed rgba(245, 197, 66, 0.8)',
                                borderBottom: '2.5px dashed rgba(245, 197, 66, 0.8)',
                                boxShadow: '0 0 16px rgba(245, 197, 66, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: '2px',
                                    borderTop: '2px dashed rgba(255, 255, 255, 0.4)',
                                    position: 'absolute',
                                }}
                            />
                            <div
                                style={{
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid rgba(245, 197, 66, 0.5)',
                                    color: 'var(--color-gold-text)',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-heading)',
                                    position: 'relative',
                                    zIndex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                }}
                            >
                                <span>Langkah Selanjutnya</span>
                                <ArrowRight size={11} />
                            </div>
                        </div>
                    </div>

                    {/* PETA JALUR / ROADMAP BAB MATERI DI ATAS KARAKTER */}
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
                                    {/* Tali / Garis Penghubung antar langkah di bar */}
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

                    {/* Three-Column Stage Layout (Left Lesson - Center Hero & Active Lesson - Right Lesson) */}
                    <div
                        className="stage-nodes-layout"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(220px, 1fr) minmax(360px, 1.4fr) minmax(220px, 1fr)',
                            alignItems: 'center',
                            width: '100%',
                            maxWidth: '1160px',
                            gap: '24px',
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        {/* 1. NODE KIRI: Materi Sebelumnya di Dalam Modul yang Sama */}
                        <div className="stage-side-node prev-node" style={{ display: 'flex', justifyContent: 'center' }}>
                            {prevStep ? (
                                <Link
                                    href={`/modules/${currentModule.slug}?step=${prevStepIndex}`}
                                    style={{ textDecoration: 'none', width: '100%', maxWidth: '260px' }}
                                >
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        style={{
                                            backgroundColor: 'var(--surface-elevated)',
                                            border: `1px solid ${isPrevStepCompleted ? 'rgba(34, 197, 94, 0.35)' : 'var(--surface-border)'}`,
                                            borderRadius: '12px',
                                            padding: '16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            boxShadow: 'var(--shadow-card)',
                                            transition: 'border-color 0.2s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ color: 'var(--accent-cyan)' }}>
                                                    {getStepTypeIcon(prevStep.type)}
                                                </span>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                                                    Langkah {prevStepIndex! + 1}
                                                </span>
                                            </div>

                                            {/* Centang Selesai */}
                                            {isPrevStepCompleted ? (
                                                <div
                                                    style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        color: 'var(--accent-green)',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    <CheckCircle2 size={13} />
                                                    <span>Selesai</span>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Belum selesai</span>
                                            )}
                                        </div>

                                        <h4
                                            style={{
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '13.5px',
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
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

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                            <span>Materi sebelumnya</span>
                                        </div>
                                    </motion.div>
                                </Link>
                            ) : (
                                /* Fallback jika sedang di langkah pertama */
                                <div
                                    style={{
                                        backgroundColor: 'var(--surface-elevated)',
                                        border: '1px dashed var(--surface-border)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        width: '100%',
                                        maxWidth: '260px',
                                        opacity: 0.65,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                    }}
                                >
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                                        Awal Modul
                                    </span>
                                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', margin: 0, color: 'var(--text-secondary)' }}>
                                        Ini adalah langkah pertama
                                    </h4>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        Mulailah materi di tengah
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 2. CENTERPIECE: Karakter Hero di Atas Pedestal & Materi Saat Ini */}
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
                                <div style={{ position: 'relative', zIndex: 2, marginBottom: '-26px' }}>
                                    <CharacterVisual
                                        role={profile.avatar_class}
                                        equipped={equipped}
                                        size={220}
                                        showAura={true}
                                        animationState="idle"
                                        interactive={false}
                                    />
                                </div>

                                {/* Platform Arena Pedestal 3D */}
                                <div
                                    style={{
                                        width: '240px',
                                        height: '58px',
                                        borderRadius: '50%',
                                        background: `radial-gradient(ellipse at center, ${roleCfg.color}28 0%, rgba(20, 20, 20, 0.95) 75%)`,
                                        border: `1.5px solid ${roleCfg.border}`,
                                        boxShadow: `0 14px 32px rgba(0, 0, 0, 0.5), inset 0 0 18px ${roleCfg.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 1,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '188px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: '1px dashed rgba(255, 255, 255, 0.22)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Card Materi Saat Ini (Active Lesson Step Highlight) */}
                            <div
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: 'var(--color-gold-text)' }}>
                                            {getStepTypeIcon(activeStep.type)}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                color: 'var(--color-gold-text)',
                                                fontFamily: 'var(--font-heading)',
                                            }}
                                        >
                                            {getStepTypeLabel(activeStep.type)}
                                        </span>
                                    </div>

                                    {/* Status Centang Selesai atau Indikator Aktif */}
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
                                            Langkah {activeStepIndex + 1} dari {steps.length}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h3
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            margin: 0,
                                            lineHeight: 1.35,
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {activeStep.title}
                                    </h3>
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
                                        {activeStep.content.replace(/[#*`]/g, '').slice(0, 120)}...
                                    </p>
                                </div>

                                {/* Progress bar modul */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span>Progres Modul {currentModule.title}</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {isModuleCompleted ? '100% Selesai' : `${moduleProgressPct}%`}
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

                                {/* Main Game Action CTA */}
                                <Link
                                    href={`/modules/${currentModule.slug}?step=${activeStepIndex}`}
                                    style={{ textDecoration: 'none', width: '100%', marginTop: '2px' }}
                                >
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
                                        <span>{isActiveStepCompleted ? 'Pelajari Ulang Materi' : 'Lanjut Belajar Materi Ini'}</span>
                                        <ArrowRight size={15} />
                                    </motion.button>
                                </Link>
                            </div>
                        </div>

                        {/* 3. NODE KANAN: Materi Berikutnya di Dalam Modul yang Sama */}
                        <div className="stage-side-node next-node" style={{ display: 'flex', justifyContent: 'center' }}>
                            {nextStep ? (
                                <Link
                                    href={`/modules/${currentModule.slug}?step=${nextStepIndex}`}
                                    style={{ textDecoration: 'none', width: '100%', maxWidth: '260px' }}
                                >
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        style={{
                                            backgroundColor: 'var(--surface-elevated)',
                                            border: `1px solid ${isNextStepCompleted ? 'rgba(34, 197, 94, 0.35)' : 'var(--surface-border)'}`,
                                            borderRadius: '12px',
                                            padding: '16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            boxShadow: 'var(--shadow-card)',
                                            transition: 'border-color 0.2s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ color: 'var(--color-gold-text)' }}>
                                                    {getStepTypeIcon(nextStep.type)}
                                                </span>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                                                    Langkah {nextStepIndex! + 1}
                                                </span>
                                            </div>

                                            {/* Centang Selesai jika user sudah menyelesaikannya */}
                                            {isNextStepCompleted ? (
                                                <div
                                                    style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        color: 'var(--accent-green)',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    <CheckCircle2 size={13} />
                                                    <span>Selesai</span>
                                                </div>
                                            ) : (
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
                                            )}
                                        </div>

                                        <h4
                                            style={{
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '13.5px',
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
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

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                            <span>Materi berikutnya</span>
                                        </div>
                                    </motion.div>
                                </Link>
                            ) : (
                                /* Fallback jika sedang di langkah terakhir */
                                <div
                                    style={{
                                        backgroundColor: 'var(--surface-elevated)',
                                        border: '1px dashed var(--surface-border)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        width: '100%',
                                        maxWidth: '260px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green)' }}>
                                        <CheckCircle2 size={14} />
                                        <span style={{ fontSize: '11px', fontWeight: 600 }}>Tuntas Akhir</span>
                                    </div>
                                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', margin: 0, color: 'var(--text-primary)' }}>
                                        Materi Terakhir Modul
                                    </h4>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        Semua bab telah tuntas
                                    </span>
                                </div>
                            )}
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
                        zIndex: 3,
                        flexShrink: 0,
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
