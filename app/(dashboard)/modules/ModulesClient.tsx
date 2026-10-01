'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Module, UserModule, ModuleCategory } from '@/types'
import { Search, BookOpen, Clock, Zap, CheckCircle, Flame, Loader2 } from 'lucide-react'
import { classHasBonusForCategory } from '@/lib/game/xp'

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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    coding: <BookOpen size={20} />,
    design: <Zap size={20} />,
    productivity: <Clock size={20} />,
    business: <Flame size={20} />,
}

export default function ModulesClient({ modules, userModules, avatarClass }: ModulesClientProps) {
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState<ModuleCategory | 'all'>('all')
    const [navigatingSlug, setNavigatingSlug] = useState<string | null>(null)

    const getUserModule = (moduleId: string) => userModules.find(um => um.module_id === moduleId)

    const filtered = modules.filter(m => {
        const matchCategory = activeCategory === 'all' || m.category === activeCategory
        const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) ||
            (m.description?.toLowerCase().includes(search.toLowerCase()))
        return matchCategory && matchSearch
    })

    return (
        <div className="responsive-page modules-page" style={{ padding: '24px', position: 'relative' }}>
            {/* Top Loading Bar when navigating to a module */}
            {navigatingSlug && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        backgroundColor: 'rgba(245, 197, 66, 0.15)',
                        zIndex: 9999,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            backgroundColor: '#F5C542',
                            boxShadow: '0 0 12px #F5C542',
                            animation: 'indeterminateProgress 1.2s infinite ease-in-out',
                            width: '35%',
                        }}
                    />
                </div>
            )}
            {/* Header with glass effect background */}
            <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '4px', color: '#ffffff' }}>
                    📚 Modul Belajar
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Jelajahi berbagai modul interaktif untuk menguasai skill.
                </p>
            </div>

            {/* Controls Row */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        aria-label="Cari modul"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari modul atau topik..."
                        style={{
                            width: '100%', paddingLeft: '44px', paddingRight: '16px',
                            paddingTop: '10px', paddingBottom: '10px',
                            backgroundColor: 'var(--surface-canvas)', border: '1px solid var(--surface-border)',
                            borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px',
                            outline: 'none', transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#F5C542'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                        <motion.button
                            key={cat.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveCategory(cat.value)}
                            style={{
                                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
                                backgroundColor: activeCategory === cat.value ? '#F5C542' : 'var(--surface-elevated)',
                                border: `1px solid ${activeCategory === cat.value ? '#EAB308' : 'var(--surface-border)'}`,
                                color: activeCategory === cat.value ? '#0a0a0a' : 'var(--text-secondary)',
                                fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: activeCategory === cat.value ? 600 : 400,
                                display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.2s ease',
                                boxShadow: activeCategory === cat.value ? '0 0 16px rgba(245, 197, 66, 0.35)' : 'none',
                            }}
                        >
                            <span style={{ fontSize: '15px' }}>{cat.emoji}</span> {cat.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Modules Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--surface-card)', borderRadius: '14px', border: '1px dashed var(--surface-border)' }}>
                    <BookOpen size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)', opacity: 0.2 }} />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 400, marginBottom: '8px' }}>Tidak Ada Modul</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Coba ubah kata kunci atau pilih kategori lain.</p>
                </div>
            ) : (
                <div className="modules-grid">
                    {filtered.map((module, i) => {
                        const userModule = getUserModule(module.id)
                        const isCompleted = userModule?.status === 'completed'
                        const isInProgress = userModule?.status === 'in_progress'
                        const progress = userModule?.progress_percent || 0
                        const catColor = CATEGORY_COLORS[module.category] || 'var(--accent-cyan)'
                        const icon = CATEGORY_ICONS[module.category] || <BookOpen size={20} />

                        return (
                            <motion.div
                                key={module.id}
                                className="modules-grid-item"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -6 }}
                            >
                                <Link
                                    href={`/modules/${module.slug}`}
                                    onClick={() => setNavigatingSlug(module.slug)}
                                    className="modules-card-link"
                                    style={{ textDecoration: 'none', display: 'block', height: '100%', position: 'relative' }}
                                >
                                    <div className="card modules-card" style={{
                                        padding: '24px', cursor: 'pointer', height: '100%',
                                        position: 'relative',
                                        borderRadius: '17.1429px',
                                        backgroundColor: 'var(--surface-card)',
                                        border: `1px solid ${isCompleted ? 'rgba(8, 195, 128, 0.4)' : 'var(--surface-border)'}`,
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
                                    }}>
                                        {/* Loading Overlay */}
                                        {navigatingSlug === module.slug && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    backgroundColor: 'rgba(10, 10, 10, 0.82)',
                                                    backdropFilter: 'blur(4px)',
                                                    WebkitBackdropFilter: 'blur(4px)',
                                                    zIndex: 10,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px',
                                                    borderRadius: '17px',
                                                }}
                                            >
                                                <Loader2
                                                    size={30}
                                                    className="animate-spin"
                                                    style={{ color: '#F5C542' }}
                                                />
                                                <span
                                                    style={{
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#ffffff',
                                                        fontFamily: 'var(--font-heading)',
                                                        letterSpacing: '0.02em',
                                                    }}
                                                >
                                                    Membuka Modul...
                                                </span>
                                            </div>
                                        )}

                                        {/* Status Icon Background */}
                                        <div style={{
                                            position: 'absolute', top: '-10px', right: '-10px',
                                            opacity: 0.05, transform: 'rotate(-15deg)', color: catColor
                                        }}>
                                            {icon}
                                        </div>

                                        {/* Top Section: Category & Badge */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '4px 10px', backgroundColor: `${catColor}12`,
                                                borderRadius: '6px', border: `1px solid ${catColor}28`
                                            }}>
                                                <div style={{ color: catColor }}>{icon}</div>
                                                <span style={{
                                                    fontSize: '11px', fontWeight: 600, color: catColor,
                                                    fontFamily: 'var(--font-heading)', textTransform: 'uppercase',
                                                }}>
                                                    {module.category}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {isCompleted && (
                                                    <div style={{
                                                        backgroundColor: 'rgba(8, 195, 128, 0.1)',
                                                        color: 'var(--accent-green)',
                                                        padding: '4px 10px', borderRadius: '6px',
                                                        border: '1px solid rgba(8, 195, 128, 0.25)',
                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                        fontSize: '11px', fontWeight: 600
                                                    }}>
                                                        <CheckCircle size={14} /> Selesai
                                                    </div>
                                                )}
                                                {!isCompleted && classHasBonusForCategory(avatarClass, module.category) && (
                                                    <div style={{
                                                        fontSize: '10px', fontWeight: 600, color: '#F5C542',
                                                        backgroundColor: 'rgba(245, 197, 66, 0.1)', border: '1px solid rgba(245, 197, 66, 0.25)',
                                                        padding: '4px 10px', borderRadius: '6px', fontFamily: 'var(--font-heading)',
                                                        display: 'flex', alignItems: 'center', gap: '4px'
                                                    }}>
                                                        <Flame size={12} fill="currentColor" /> BONUS
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="modules-card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 1 }}>
                                            {/* Title */}
                                            <h3 style={{
                                                 fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 400,
                                                 lineHeight: 1.3, marginBottom: '8px', color: 'var(--text-primary)',
                                                 letterSpacing: '-0.01em'
                                             }}>
                                                 {module.title}
                                             </h3>

                                             {/* Description */}
                                             {module.description && (
                                                 <p className="modules-card-description-fill" style={{
                                                     fontSize: '13px', color: 'var(--text-secondary)',
                                                     marginBottom: '20px', lineHeight: 1.6,
                                                     display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                                                     overflow: 'hidden'
                                                 }}>
                                                     {module.description}
                                                 </p>
                                             )}

                                             {/* Progress Bar (if in progress) */}
                                             {isInProgress && (
                                                 <div style={{ marginBottom: '20px' }}>
                                                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                         <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>PROGRES</span>
                                                         <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>{progress}%</span>
                                                     </div>
                                                     <div style={{ height: '4px', backgroundColor: '#141414', borderRadius: '4px', overflow: 'hidden' }}>
                                                         <motion.div
                                                             initial={{ width: 0 }}
                                                             animate={{ width: `${progress}%` }}
                                                             style={{ height: '100%', borderRadius: '4px', backgroundColor: '#F5C542' }}
                                                         />
                                                     </div>
                                                 </div>
                                             )}
                                         </div>

                                         {/* Meta Footer */}
                                         <div className="modules-card-meta-row" style={{
                                             display: 'flex', gap: '16px', marginTop: 'auto',
                                             paddingTop: '16px', borderTop: '1px solid #222222',
                                             position: 'relative', zIndex: 1
                                         }}>
                                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                 <Clock size={14} className="text-muted" /> {module.duration_minutes}m
                                             </div>
                                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#F5C542', fontWeight: 600 }}>
                                                 <Zap size={14} fill="currentColor" /> {module.xp_reward} XP
                                             </div>

                                             <div style={{
                                                 fontSize: '11px', color: DIFFICULTY_COLORS[module.difficulty],
                                                 fontFamily: 'var(--font-heading)', fontWeight: 600, textTransform: 'uppercase',
                                                 marginLeft: 'auto', padding: '3px 8px', backgroundColor: `${DIFFICULTY_COLORS[module.difficulty]}10`,
                                                 borderRadius: '6px', border: `1px solid ${DIFFICULTY_COLORS[module.difficulty]}25`
                                             }}>
                                                 {module.difficulty}
                                             </div>
                                         </div>

                                         {/* Bottom Highlight Line */}
                                         <div style={{
                                             position: 'absolute', bottom: 0, left: 0, right: 0,
                                             height: '2px', backgroundColor: isCompleted ? '#22C55E' : '#F5C542',
                                             opacity: isCompleted ? 1 : 0.4
                                         }} />
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
