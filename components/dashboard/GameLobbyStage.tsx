'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
    ChevronLeft,
    ArrowRight,
    Shield,
    CheckCircle2,
    Play,
    FileText,
    HelpCircle,
    Layers,
    X,
    Search,
    Check,
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
        id: 'git-basic',
        slug: 'git-github-kolaborasi',
        title: 'Fondasi Version Control & Git Workflow',
        description: 'Penguasaan git commit, branch branching, dan kolaborasi tim.',
        category: 'coding',
        difficulty: 'intermediate',
        xp_reward: 80,
        duration_minutes: 50,
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
            title: `Implementasi Praktik: ${mod.title}`,
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

    // 7-day streak tracker
    const weekDays = useMemo(() => {
        const now = new Date()
        const weekStart = startOfWeek(now, { weekStartsOn: 1 })
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
    const [isModulePickerOpen, setIsModulePickerOpen] = useState(false)
    const [pickerCategory, setPickerCategory] = useState<string>('all')
    const [pickerSearch, setPickerSearch] = useState<string>('')

    // Active module selection
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

    // Active step index
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

    // Previous and Next steps
    const prevStepIndex = activeStepIndex > 0 ? activeStepIndex - 1 : null
    const prevStep = prevStepIndex !== null ? steps[prevStepIndex] : null
    const isPrevStepCompleted = prevStepIndex !== null && (isModuleCompleted || prevStepIndex < completedStepsCount)

    const nextStepIndex = activeStepIndex < steps.length - 1 ? activeStepIndex + 1 : null
    const nextStep = nextStepIndex !== null ? steps[nextStepIndex] : null
    const isNextStepCompleted = nextStepIndex !== null && (isModuleCompleted || nextStepIndex < completedStepsCount)

    const effectiveStreak = profile.last_active && profile.streak_count > 0
        ? getEffectiveStreak(profile.last_active, profile.streak_count)
        : profile.streak_count

    // Filtered modules for the picker modal
    const filteredModules = useMemo(() => {
        return moduleList.filter(m => {
            const matchesCat = pickerCategory === 'all' || m.category === pickerCategory
            const matchesSearch = !pickerSearch.trim() ||
                m.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                (m.description && m.description.toLowerCase().includes(pickerSearch.toLowerCase()))
            return matchesCat && matchesSearch
        })
    }, [moduleList, pickerCategory, pickerSearch])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {/* STAGE PANEL UTAMA (Sesuai Layout Referensi) */}
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
                {/* Radial Aura Latar Belakang Arena */}
                <div
                    style={{
                        position: 'absolute',
                        top: '45%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '680px',
                        height: '420px',
                        background: `radial-gradient(ellipse at center, ${roleCfg.color}15 0%, rgba(249, 115, 22, 0.05) 45%, transparent 75%)`,
                        filter: 'blur(60px)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                {/* --- A. TOP STATUS BAR: IDENTITAS HERO & RESOURCE --- */}
                <div
                    style={{
                        padding: '12px 20px',
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
                    {/* Identitas Hero & Level */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: 'var(--surface-card)',
                                border: `1px solid ${roleCfg.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                            }}
                        >
                            {classStat.emoji}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {profile.username}
                                </span>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: roleCfg.color,
                                        backgroundColor: roleCfg.bg,
                                        border: `1px solid ${roleCfg.border}`,
                                        padding: '1px 6px',
                                        borderRadius: '5px',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {profile.avatar_class} • Lv.{profile.level}
                                </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {progressPercent}% ke Level {profile.level + 1}
                            </div>
                        </div>
                    </div>

                    {/* Resources: Streak & XP & Gear */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                                            width: '5px',
                                            height: '10px',
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

                {/* --- B. ARENA TIMELINE TRACK (Sesuai Referensi Sketch Atas) --- */}
                <div
                    style={{
                        padding: '36px 20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    {/* Stepper Navigation Tracker */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            maxWidth: '780px',
                            marginBottom: '18px',
                        }}
                    >
                        <button
                            onClick={() => {
                                if (prevStepIndex !== null) setManualStepIndex(prevStepIndex)
                            }}
                            disabled={prevStepIndex === null}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                                color: prevStepIndex !== null ? 'var(--text-primary)' : 'var(--text-muted)',
                                cursor: prevStepIndex !== null ? 'pointer' : 'not-allowed',
                                opacity: prevStepIndex !== null ? 1 : 0.45,
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            <ChevronLeft size={14} />
                            <span>Sebelumnya</span>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                Bab {activeStepIndex + 1} dari {steps.length}
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {steps.map((st, idx) => {
                                    const isDone = isModuleCompleted || idx < completedStepsCount
                                    const isCur = idx === activeStepIndex
                                    return (
                                        <button
                                            key={st.id || idx}
                                            onClick={() => setManualStepIndex(idx)}
                                            title={st.title}
                                            style={{
                                                width: '9px',
                                                height: '9px',
                                                borderRadius: '3px',
                                                backgroundColor: isCur
                                                    ? '#f97316'
                                                    : isDone
                                                        ? 'var(--accent-green)'
                                                        : 'var(--surface-border)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 0,
                                            }}
                                        />
                                    )
                                })}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (nextStepIndex !== null) setManualStepIndex(nextStepIndex)
                            }}
                            disabled={nextStepIndex === null}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                                color: nextStepIndex !== null ? 'var(--text-primary)' : 'var(--text-muted)',
                                cursor: nextStepIndex !== null ? 'pointer' : 'not-allowed',
                                opacity: nextStepIndex !== null ? 1 : 0.45,
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            <span>Setelahnya</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    {/* Stage Linear 3 Node Grid: [Sebelumnya] - [Hero Saat Ini] - [Setelahnya] */}
                    <div
                        className="stage-track-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(120px, 190px) minmax(240px, 340px) minmax(120px, 190px)',
                            alignItems: 'end',
                            justifyContent: 'center',
                            gap: '16px',
                            width: '100%',
                            maxWidth: '820px',
                            position: 'relative',
                        }}
                    >
                        {/* 1. NODE KIRI: MATERI SEBELUMNYA */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                cursor: prevStepIndex !== null ? 'pointer' : 'default',
                                opacity: prevStepIndex !== null ? 1 : 0.45,
                                transition: 'transform 0.2s ease',
                            }}
                            onClick={() => {
                                if (prevStepIndex !== null) setManualStepIndex(prevStepIndex)
                            }}
                        >
                            {/* Label Teks di Atas Node Kiri */}
                            <div style={{ marginBottom: '14px', minHeight: '44px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                                    Materi sebelumnya
                                </div>
                                <div
                                    style={{
                                        fontSize: '11.5px',
                                        fontWeight: 700,
                                        color: prevStepIndex !== null ? 'var(--text-secondary)' : 'var(--text-muted)',
                                        maxWidth: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {prevStep ? prevStep.title.replace(/^([0-9]+\.\s*|Video Pembelajaran:\s*|Pengenalan:\s*)/i, '') : 'Awal Modul'}
                                </div>
                            </div>

                            {/* Node Lonjong / Oval Oranye-Merah (Sesuai Sketsa) */}
                            <motion.div
                                className="stage-track-node"
                                whileHover={prevStepIndex !== null ? { scale: 1.06, y: -4 } : {}}
                                whileTap={prevStepIndex !== null ? { scale: 0.95 } : {}}
                                style={{
                                    width: '74px',
                                    height: '104px',
                                    borderRadius: '50% 50% 48% 48% / 60% 60% 40% 40%',
                                    background: 'linear-gradient(180deg, #ea580c 0%, #c2410c 60%, #9a3412 100%)',
                                    border: '2.5px solid #f97316',
                                    boxShadow: '0 8px 22px rgba(234, 88, 12, 0.35)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    gap: '4px',
                                    position: 'relative',
                                }}
                            >
                                {isPrevStepCompleted ? (
                                    <CheckCircle2 size={24} style={{ color: '#ffffff' }} />
                                ) : (
                                    <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                                        {prevStepIndex !== null ? prevStepIndex + 1 : '•'}
                                    </div>
                                )}
                                <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.9 }}>
                                    {prevStepIndex !== null ? 'Bab ' + (prevStepIndex + 1) : 'Mulai'}
                                </span>
                            </motion.div>
                        </div>

                        {/* 2. NODE TENGAH: HERO BERDIRI DI MATERI SAAT INI */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                position: 'relative',
                                zIndex: 3,
                            }}
                        >
                            {/* Label Teks & Judul Materi Saat Ini di Atas Hero */}
                            <div
                                style={{
                                    marginBottom: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '5px',
                                    maxWidth: '300px',
                                }}
                            >
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#f97316', textTransform: 'none' }}>
                                    Materi saat ini
                                </div>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '15px',
                                        fontWeight: 800,
                                        color: 'var(--text-primary)',
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {activeStep.title}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                    <span
                                        style={{
                                            fontSize: '10px',
                                            fontWeight: 600,
                                            color: 'var(--accent-cyan)',
                                            backgroundColor: 'var(--accent-cyan-bg)',
                                            border: '1px solid var(--accent-cyan-border)',
                                            padding: '1px 6px',
                                            borderRadius: '5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                        }}
                                    >
                                        {getStepTypeIcon(activeStep.type)}
                                        <span>{getStepTypeLabel(activeStep.type)}</span>
                                    </span>
                                    {isActiveStepCompleted && (
                                        <span
                                            style={{
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                color: 'var(--accent-green)',
                                                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                                padding: '1px 6px',
                                                borderRadius: '5px',
                                            }}
                                        >
                                            Selesai ✓
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Karakter Pahlawan Berdiri di Atas Pedestal (Visual Tengah) */}
                            <div style={{ position: 'relative', marginBottom: '-16px' }}>
                                <CharacterVisual
                                    role={profile.avatar_class}
                                    equipped={equipped}
                                    size={185}
                                    showAura={true}
                                    animationState="idle"
                                    interactive={false}
                                />
                            </div>

                            {/* Pedestal Platform Hero Tepat di Atas Garis Lantai */}
                            <div
                                style={{
                                    width: '180px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: `radial-gradient(ellipse at center, ${roleCfg.color}35 0%, #1e1e24 75%)`,
                                    border: `2px solid ${roleCfg.border}`,
                                    boxShadow: `0 8px 22px rgba(0, 0, 0, 0.3), inset 0 0 12px ${roleCfg.color}25`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                }}
                            >
                                <div
                                    style={{
                                        width: '135px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        border: `1.5px dashed ${roleCfg.color}66`,
                                    }}
                                />
                            </div>

                            {/* Tombol CTA Masuk Materi */}
                            <Link
                                href={`/modules/${currentModule.slug}?step=${activeStepIndex}`}
                                style={{ textDecoration: 'none', marginTop: '12px' }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '7px 16px',
                                        borderRadius: '8px',
                                        backgroundColor: '#f97316',
                                        color: '#ffffff',
                                        border: '1px solid #ea580c',
                                        fontSize: '12.5px',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-heading)',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                                    }}
                                >
                                    <span>{isActiveStepCompleted ? 'Pelajari Ulang' : 'Buka Materi Ini'}</span>
                                    <ArrowRight size={13} />
                                </motion.button>
                            </Link>
                        </div>

                        {/* 3. NODE KANAN: MATERI SETELAHNYA */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                cursor: nextStepIndex !== null ? 'pointer' : 'default',
                                opacity: nextStepIndex !== null ? 1 : 0.45,
                                transition: 'transform 0.2s ease',
                            }}
                            onClick={() => {
                                if (nextStepIndex !== null) setManualStepIndex(nextStepIndex)
                            }}
                        >
                            {/* Label Teks di Atas Node Kanan */}
                            <div style={{ marginBottom: '14px', minHeight: '44px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                                    Materi setelahnya
                                </div>
                                <div
                                    style={{
                                        fontSize: '11.5px',
                                        fontWeight: 700,
                                        color: nextStepIndex !== null ? 'var(--text-secondary)' : 'var(--text-muted)',
                                        maxWidth: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {nextStep ? nextStep.title.replace(/^([0-9]+\.\s*|Video Pembelajaran:\s*|Pengenalan:\s*)/i, '') : 'Akhir Modul'}
                                </div>
                            </div>

                            {/* Node Lonjong / Oval Oranye-Merah (Sesuai Sketsa) */}
                            <motion.div
                                className="stage-track-node"
                                whileHover={nextStepIndex !== null ? { scale: 1.06, y: -4 } : {}}
                                whileTap={nextStepIndex !== null ? { scale: 0.95 } : {}}
                                style={{
                                    width: '74px',
                                    height: '104px',
                                    borderRadius: '50% 50% 48% 48% / 60% 60% 40% 40%',
                                    background: 'linear-gradient(180deg, #ea580c 0%, #c2410c 60%, #9a3412 100%)',
                                    border: '2.5px solid #f97316',
                                    boxShadow: '0 8px 22px rgba(234, 88, 12, 0.35)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    gap: '4px',
                                    position: 'relative',
                                }}
                            >
                                {isNextStepCompleted ? (
                                    <CheckCircle2 size={24} style={{ color: '#ffffff' }} />
                                ) : (
                                    <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                                        {nextStepIndex !== null ? nextStepIndex + 1 : '✓'}
                                    </div>
                                )}
                                <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.9 }}>
                                    {nextStepIndex !== null ? 'Bab ' + (nextStepIndex + 1) : 'Tuntas'}
                                </span>
                            </motion.div>
                        </div>
                    </div>

                    {/* --- GARIS LANTAI / FLOOR BASELINE (Garis Horizontal Membentang Sesuai Sketsa) --- */}
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '920px',
                            height: '3.5px',
                            backgroundColor: '#262626',
                            borderRadius: '2px',
                            marginTop: '22px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                            position: 'relative',
                        }}
                    >
                        {/* Aksen jalur aktif di tengah */}
                        <div
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: 0,
                                transform: 'translateX(-50%)',
                                width: '220px',
                                height: '3.5px',
                                background: 'linear-gradient(90deg, transparent, #f97316, transparent)',
                            }}
                        />
                    </div>
                </div>

                {/* --- C. BOTTOM ACTION DECK (Shop - (pilih)modul - Battle Sesuai Sketsa Bawah) --- */}
                <div
                    style={{
                        padding: '20px 24px 24px',
                        borderTop: '1px solid var(--surface-border)',
                        backgroundColor: 'rgba(16, 16, 18, 0.97)',
                        position: 'relative',
                        zIndex: 3,
                    }}
                >
                    <div
                        className="stage-trio-deck"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(130px, 180px) 1fr minmax(130px, 200px)',
                            alignItems: 'center',
                            gap: '20px',
                            width: '100%',
                            maxWidth: '960px',
                            margin: '0 auto',
                        }}
                    >
                        {/* 1. TOMBOL KIRI: SHOP (Kuning Emas Sesuai Sketsa) */}
                        <Link href="/shop" style={{ textDecoration: 'none', width: '100%' }}>
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    width: '100%',
                                    minHeight: '84px',
                                    borderRadius: '12px',
                                    backgroundColor: '#facc15',
                                    border: '2.5px solid #eab308',
                                    boxShadow: '0 8px 20px rgba(250, 204, 21, 0.28)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    padding: '12px 14px',
                                    transition: 'box-shadow 0.2s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#171717' }}>
                                    <ShoppingBag size={20} strokeWidth={2.6} />
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '22px',
                                            fontWeight: 900,
                                            letterSpacing: '-0.02em',
                                            lineHeight: 1,
                                        }}
                                    >
                                        Shop
                                    </span>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#713f12' }}>
                                    Toko & Gear
                                </span>
                            </motion.button>
                        </Link>

                        {/* 2. TENGAH: NAMA MODUL & TOMBOL (PILIH)MODUL (Sesuai Sketsa) */}
                        <div
                            className="stage-trio-deck-center"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: '8px',
                                padding: '0 8px',
                            }}
                        >
                            {/* Judul Modul Terpilih (Contoh di sketsa: Fondasi Version Control & Git Workflow) */}
                            <div style={{ maxWidth: '440px' }}>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '17px',
                                        fontWeight: 800,
                                        color: 'var(--text-primary)',
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {currentModule.title}
                                </div>
                                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {isModuleCompleted ? '100% Selesai' : `${moduleProgressPct}% Progres`} • Bab {activeStepIndex + 1} dari {steps.length}
                                </div>
                            </div>

                            {/* Tombol (pilih)modul (Oranye Sesuai Sketsa) */}
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setIsModulePickerOpen(true)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '10px 24px',
                                    borderRadius: '10px',
                                    backgroundColor: '#f97316',
                                    border: '2px solid #ea580c',
                                    boxShadow: '0 6px 18px rgba(249, 115, 22, 0.35)',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '15px',
                                    fontWeight: 800,
                                    minWidth: '180px',
                                }}
                            >
                                <Layers size={17} strokeWidth={2.4} />
                                <span>(pilih)modul</span>
                            </motion.button>
                        </div>

                        {/* 3. TOMBOL KANAN: BATTLE (Oranye Merah Sesuai Sketsa) */}
                        <Link href="/battle" style={{ textDecoration: 'none', width: '100%' }}>
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    width: '100%',
                                    minHeight: '84px',
                                    borderRadius: '12px',
                                    backgroundColor: '#f97316',
                                    border: '2.5px solid #ea580c',
                                    boxShadow: '0 8px 22px rgba(249, 115, 22, 0.38)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    padding: '12px 14px',
                                    transition: 'box-shadow 0.2s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#171717' }}>
                                    <Swords size={20} strokeWidth={2.6} />
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '22px',
                                            fontWeight: 900,
                                            letterSpacing: '-0.02em',
                                            lineHeight: 1,
                                        }}
                                    >
                                        Battle
                                    </span>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#431407' }}>
                                    Arena Duel 1v1
                                </span>
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- D. MODAL INTERAKTIF: PILIH MODUL PEMBELAJARAN --- */}
            <AnimatePresence>
                {isModulePickerOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(5px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                            padding: '16px',
                        }}
                        onClick={() => setIsModulePickerOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '580px',
                                maxHeight: '85vh',
                                backgroundColor: 'var(--surface-card)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                            }}
                        >
                            {/* Modal Header */}
                            <div
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid var(--surface-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BookOpen size={18} style={{ color: '#f97316' }} />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                                            Pilih Modul Pembelajaran
                                        </h3>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            Pilih kurikulum yang ingin kamu latih di panggung pahlawan
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModulePickerOpen(false)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--surface-border)',
                                        backgroundColor: 'var(--surface-elevated)',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Search & Category Tabs */}
                            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--surface-elevated)',
                                        border: '1px solid var(--surface-border)',
                                    }}
                                >
                                    <Search size={15} style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        placeholder="Cari modul atau topik..."
                                        value={pickerSearch}
                                        onChange={(e) => setPickerSearch(e.target.value)}
                                        style={{
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            outline: 'none',
                                            color: 'var(--text-primary)',
                                            fontSize: '13px',
                                            width: '100%',
                                        }}
                                    />
                                    {pickerSearch && (
                                        <button
                                            onClick={() => setPickerSearch('')}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                                    {[
                                        { id: 'all', label: 'Semua' },
                                        { id: 'coding', label: 'Coding' },
                                        { id: 'design', label: 'Desain' },
                                        { id: 'productivity', label: 'Produktivitas' },
                                        { id: 'business', label: 'Bisnis' },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setPickerCategory(tab.id)}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                border: `1px solid ${pickerCategory === tab.id ? '#f97316' : 'var(--surface-border)'}`,
                                                backgroundColor: pickerCategory === tab.id ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                                                color: pickerCategory === tab.id ? '#f97316' : 'var(--text-muted)',
                                                fontSize: '11.5px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* List Modul */}
                            <div style={{ padding: '14px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                {filteredModules.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                        Tidak ada modul yang cocok dengan pencarian.
                                    </div>
                                ) : (
                                    filteredModules.map((m) => {
                                        const uMod = userModulesMap.get(m.id)
                                        const done = uMod?.status === 'completed'
                                        const isSelected = m.id === currentModule.id
                                        const pct = uMod?.progress_percent || (done ? 100 : 0)

                                        return (
                                            <div
                                                key={m.id}
                                                onClick={() => {
                                                    setSelectedModuleId(m.id)
                                                    setManualStepIndex(null)
                                                    setIsModulePickerOpen(false)
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '12px',
                                                    padding: '12px 14px',
                                                    borderRadius: '10px',
                                                    backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.12)' : 'var(--surface-elevated)',
                                                    border: `1.5px solid ${isSelected ? '#f97316' : 'var(--surface-border)'}`,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                                    <div
                                                        style={{
                                                            width: '34px',
                                                            height: '34px',
                                                            borderRadius: '8px',
                                                            backgroundColor: isSelected ? '#f97316' : 'var(--surface-card)',
                                                            color: isSelected ? '#ffffff' : '#f97316',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {done ? <CheckCircle2 size={18} /> : <BookOpen size={16} />}
                                                    </div>
                                                    <div style={{ minWidth: 0, flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {m.title}
                                                            </span>
                                                            {done && (
                                                                <span style={{ fontSize: '10px', color: 'var(--accent-green)', fontWeight: 700 }}>
                                                                    Selesai
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {m.category} • {m.xp_reward} XP • {pct}% progres
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ flexShrink: 0 }}>
                                                    {isSelected ? (
                                                        <span
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '3px',
                                                                fontSize: '11px',
                                                                fontWeight: 700,
                                                                color: '#f97316',
                                                                padding: '3px 8px',
                                                                borderRadius: '6px',
                                                                backgroundColor: 'rgba(249, 115, 22, 0.16)',
                                                            }}
                                                        >
                                                            <Check size={12} />
                                                            <span>Aktif</span>
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                                                            Pilih
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
