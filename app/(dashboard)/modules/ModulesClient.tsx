'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Module, UserModule, ModuleCategory } from '@/types'
import { Search, BookOpen, Clock, Zap, CheckCircle, Flame } from 'lucide-react'
import { classHasBonusForCategory, CLASS_BONUS_PERCENT } from '@/lib/game/xp'

interface ModulesClientProps {
    modules: Module[]
    userModules: UserModule[]
    avatarClass: string
}

const CATEGORIES: { value: ModuleCategory | 'all'; label: string; emoji: string }[] = [
    { value: 'all', label: 'Semua', emoji: '🎯' },
    { value: 'coding', label: 'Coding', emoji: '💻' },
    { value: 'design', label: 'Desain', emoji: '🎨' },
    { value: 'productivity', label: 'Produktivitas', emoji: '⚡' },
    { value: 'business', label: 'Bisnis', emoji: '📈' },
]

const DIFFICULTY_COLORS: Record<string, string> = {
    beginner: 'var(--accent-green)',
    intermediate: 'var(--accent-gold)',
    advanced: 'var(--accent-red)',
}

const CATEGORY_COLORS: Record<string, string> = {
    coding: 'var(--accent-cyan)',
    design: 'var(--accent-gold)',
    productivity: 'var(--accent-green)',
    business: 'var(--accent-red)',
}

export default function ModulesClient({ modules, userModules, avatarClass }: ModulesClientProps) {
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState<ModuleCategory | 'all'>('all')

    const getUserModule = (moduleId: string) => userModules.find(um => um.module_id === moduleId)

    const filtered = modules.filter(m => {
        const matchCategory = activeCategory === 'all' || m.category === activeCategory
        const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) ||
            (m.description?.toLowerCase().includes(search.toLowerCase()))
        return matchCategory && matchSearch
    })

    return (
        <div className="responsive-page modules-page" style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
                    Modul Belajar
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {modules.length} modul tersedia — tingkatkan skill digitalmu!
                </p>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari modul..."
                    style={{
                        width: '100%', maxWidth: '400px', paddingLeft: '40px', paddingRight: '16px',
                        paddingTop: '10px', paddingBottom: '10px',
                        backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        borderRadius: '4px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                    }}
                />
            </div>

            {/* Category Filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                    <motion.button
                        key={cat.value}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveCategory(cat.value)}
                        style={{
                            padding: '6px 14px', borderRadius: '4px', cursor: 'pointer',
                            backgroundColor: activeCategory === cat.value ? 'rgba(245,197,66,0.1)' : 'var(--bg-secondary)',
                            border: `1px solid ${activeCategory === cat.value ? 'var(--accent-gold)' : 'var(--border)'}`,
                            color: activeCategory === cat.value ? 'var(--accent-gold)' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                    >
                        <span>{cat.emoji}</span> {cat.label}
                    </motion.button>
                ))}
            </div>

            {/* Modules Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
                    <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p>Modul tidak ditemukan</p>
                </div>
            ) : (
                <div className="modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {filtered.map((module, i) => {
                        const userModule = getUserModule(module.id)
                        const isCompleted = userModule?.status === 'completed'
                        const isInProgress = userModule?.status === 'in_progress'
                        const progress = userModule?.progress_percent || 0
                        const catColor = CATEGORY_COLORS[module.category] || 'var(--accent-cyan)'

                        return (
                            <motion.div
                                key={module.id}
                                className="modules-grid-item"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -2 }}
                            >
                                <Link href={`/modules/${module.slug}`} className="modules-card-link" style={{ textDecoration: 'none', display: 'block' }}>
                                    <div className="card modules-card" style={{
                                        padding: '16px', cursor: 'pointer',
                                        border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                                        transition: 'border-color 0.2s',
                                    }}>
                                        {/* Category Badge + Status */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{
                                                fontSize: '11px', fontWeight: 600, color: catColor,
                                                backgroundColor: `${catColor}15`, border: `1px solid ${catColor}30`,
                                                padding: '2px 8px', borderRadius: '3px', fontFamily: 'var(--font-heading)',
                                                textTransform: 'uppercase',
                                            }}>
                                                {module.category}
                                            </span>
                                            {isCompleted && (
                                                <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />
                                            )}
                                            {!isCompleted && classHasBonusForCategory(avatarClass, module.category) && (
                                                <span style={{
                                                    fontSize: '10px', fontWeight: 700, color: 'var(--accent-green)',
                                                    backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                                                    padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-heading)',
                                                    display: 'flex', alignItems: 'center', gap: '3px',
                                                }}>
                                                    <Flame size={9} /> +{CLASS_BONUS_PERCENT}% XP
                                                </span>
                                            )}
                                        </div>

                                        <div className="modules-card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            {/* Title */}
                                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                                                {module.title}
                                            </h3>

                                            {/* Description */}
                                            {module.description && (
                                                <p className="modules-card-description-fill" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                                                    {module.description}
                                                </p>
                                            )}

                                            {/* Progress Bar (if in progress) */}
                                            {isInProgress && (
                                                <div style={{ marginBottom: '10px' }}>
                                                    <div style={{ height: '3px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', backgroundColor: 'var(--accent-cyan)', width: `${progress}%` }} />
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>{progress}% selesai</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Meta */}
                                        <div className="modules-card-meta-row" style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                <Clock size={11} /> {module.duration_minutes}m
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-gold)' }}>
                                                <Zap size={11} /> +{module.xp_reward} XP
                                            </span>
                                            <span style={{
                                                fontSize: '10px', color: DIFFICULTY_COLORS[module.difficulty],
                                                fontFamily: 'var(--font-heading)', fontWeight: 600, textTransform: 'uppercase',
                                                marginLeft: 'auto',
                                            }}>
                                                {module.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
