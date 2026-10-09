'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp } from 'lucide-react'

interface LearningAnalyticsProps {
    completedModules: Array<{
        completed_at: string | null
        modules: { title: string; category: string; xp_reward: number } | null
    }>
    xpLogs: Array<{ xp_amount: number; reason: string | null; created_at: string }>
    totalXp: number
    level: number
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
    coding: { label: 'Coding', color: '#F5C542', bg: 'rgba(245, 197, 66, 0.1)', border: 'rgba(245, 197, 66, 0.25)' },
    design: { label: 'Desain', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.1)', border: 'rgba(56, 189, 248, 0.25)' },
    productivity: { label: 'Produktivitas', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.25)' },
    business: { label: 'Bisnis', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.25)' },
}

export default function LearningAnalytics({ completedModules, xpLogs, totalXp }: LearningAnalyticsProps) {
    const [viewMode, setViewMode] = useState<'weekly' | 'category'>('weekly')

    // 1. Hitung distribusi XP 7 hari terakhir (Senin - Minggu)
    const weeklyData = useMemo(() => {
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
        const today = new Date()
        const result = []

        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(today.getDate() - i)
            const dateStr = d.toISOString().slice(0, 10)
            const dayName = days[d.getDay()]

            // Ambil total XP di tanggal tersebut
            const dayXp = xpLogs
                .filter(log => log.created_at?.slice(0, 10) === dateStr)
                .reduce((sum, log) => sum + (log.xp_amount || 0), 0)

            result.push({
                day: dayName,
                date: dateStr,
                xp: dayXp,
                isToday: i === 0,
            })
        }

        const maxXp = Math.max(...result.map(r => r.xp), 150)
        return { items: result, maxXp }
    }, [xpLogs])

    // 2. Hitung penguasaan kategori dari modul yang selesai
    const categoryStats = useMemo(() => {
        const counts: Record<string, number> = { coding: 0, design: 0, productivity: 0, business: 0 }
        completedModules.forEach(cm => {
            const cat = cm.modules?.category || 'coding'
            if (counts[cat] !== undefined) counts[cat] += 1
            else counts.coding += 1
        })

        const totalCompleted = completedModules.length || 1
        return Object.entries(counts).map(([cat, count]) => {
            const meta = CATEGORY_META[cat] || CATEGORY_META.coding
            const percent = Math.round((count / totalCompleted) * 100)
            return {
                category: cat,
                label: meta.label,
                count,
                percent,
                color: meta.color,
                bg: meta.bg,
                border: meta.border,
            }
        })
    }, [completedModules])

    return (
        <div
            className="card"
            style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '12px',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                boxShadow: 'var(--shadow-card)',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(245, 197, 66, 0.1)',
                            border: '1px solid rgba(245, 197, 66, 0.28)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#F5C542',
                            flexShrink: 0,
                        }}
                    >
                        <BarChart3 size={17} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 500, letterSpacing: '-0.01em', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Analisa Pembelajaran
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Metrik konsistensi & performa hero
                        </span>
                    </div>
                </div>

                {/* Switcher Tab */}
                <div
                    style={{
                        display: 'flex',
                        backgroundColor: 'var(--surface-elevated)',
                        padding: '3px',
                        borderRadius: '8px',
                        border: '1px solid var(--surface-border)',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setViewMode('weekly')}
                        style={{
                            padding: '6px 14px',
                            fontSize: '11.5px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: viewMode === 'weekly' ? 700 : 500,
                            borderRadius: '6px',
                            border: `1px solid ${viewMode === 'weekly' ? 'var(--accent-gold-border)' : 'transparent'}`,
                            cursor: 'pointer',
                            backgroundColor: viewMode === 'weekly' ? 'var(--accent-gold-bg)' : 'transparent',
                            color: viewMode === 'weekly' ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Grafik XP 7 Hari
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('category')}
                        style={{
                            padding: '6px 14px',
                            fontSize: '11.5px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: viewMode === 'category' ? 700 : 500,
                            borderRadius: '6px',
                            border: `1px solid ${viewMode === 'category' ? 'var(--accent-gold-border)' : 'transparent'}`,
                            cursor: 'pointer',
                            backgroundColor: viewMode === 'category' ? 'var(--accent-gold-bg)' : 'transparent',
                            color: viewMode === 'category' ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Fokus Bidang
                    </button>
                </div>
            </div>

            {/* TAB 1: Diagram Batang XP 7 Hari */}
            {viewMode === 'weekly' && (
                <div>
                    <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '6px', padding: '0 2px 10px', borderBottom: '1px solid var(--surface-border)' }}>
                        {weeklyData.items.map((item) => {
                            const barHeightPercent = Math.max(8, Math.round((item.xp / weeklyData.maxXp) * 100))
                            return (
                                <div
                                    key={item.date}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        height: '100%',
                                        justifyContent: 'flex-end',
                                        gap: '6px',
                                    }}
                                >
                                    {/* Tooltip / value */}
                                    <span style={{ fontSize: '10px', color: item.xp > 0 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                                        {item.xp > 0 ? `+${item.xp}` : '0'}
                                    </span>

                                    {/* Bar Element */}
                                    <div
                                        style={{
                                            width: '100%',
                                            maxWidth: '28px',
                                            height: `${barHeightPercent}%`,
                                            background: item.xp > 0 ? 'linear-gradient(180deg, #FDE047 0%, #F5C542 100%)' : 'var(--surface-elevated)',
                                            borderRadius: '6px 6px 2px 2px',
                                            border: item.isToday
                                                ? '2px solid #EAB308'
                                                : item.xp > 0
                                                ? '1px solid #EAB308'
                                                : '1px solid var(--surface-border)',
                                            transition: 'height 0.6s cubic-bezier(0.2, 0, 0, 1)',
                                        }}
                                    />

                                    {/* Day Label */}
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: item.isToday ? 700 : 500,
                                            color: item.isToday ? 'var(--color-gold-text)' : 'var(--text-secondary)',
                                        }}
                                    >
                                        {item.day}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                            <TrendingUp size={14} style={{ color: '#22C55E', flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', lineHeight: 1.3 }}>Konsistensi belajar harian tercatat otomatis</span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--color-gold-text)', fontFamily: 'var(--font-heading)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                            Total: {totalXp.toLocaleString()} XP
                        </span>
                    </div>
                </div>
            )}

            {/* TAB 2: Progress Distribusi Kategori Modul */}
            {viewMode === 'category' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {categoryStats.map(stat => (
                        <div key={stat.category}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stat.color }} />
                                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {stat.label}
                                    </span>
                                </div>
                                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '11px' }}>
                                    {stat.count} Modul Tuntas ({stat.percent}%)
                                </span>
                            </div>

                            <div style={{ height: '6px', backgroundColor: 'var(--surface-elevated)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(stat.percent > 0 ? stat.percent : 4, 0)}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        borderRadius: '4px',
                                        backgroundColor: stat.color,
                                    }}
                                />
                            </div>
                        </div>
                    ))}

                    <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        *Selesaikan beragam kategori modul untuk memperluas portofolio keahlian digital kamu.
                    </p>
                </div>
            )}
        </div>
    )
}
