'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, BookOpen, Swords, Zap, CheckCircle2 } from 'lucide-react'

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
    coding: { label: 'Coding', color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-bg)', border: 'var(--accent-cyan-border)' },
    design: { label: 'Desain', color: 'var(--accent-gold)', bg: 'var(--accent-gold-bg)', border: 'var(--accent-gold-border)' },
    productivity: { label: 'Produktivitas', color: 'var(--accent-green)', bg: 'var(--accent-green-bg)', border: 'var(--accent-green-border)' },
    business: { label: 'Bisnis', color: 'var(--accent-red)', bg: 'var(--accent-red-bg)', border: 'var(--accent-red-border)' },
}

export default function LearningAnalytics({ completedModules, xpLogs, totalXp, level }: LearningAnalyticsProps) {
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
        <div className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
            {/* Header & Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--accent-cyan-bg)',
                            border: '1px solid var(--accent-cyan-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-cyan)',
                        }}
                    >
                        <BarChart3 size={18} />
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                            Diagram Analisa Pembelajaran
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Metrik & performa keaktifan hero
                        </span>
                    </div>
                </div>

                {/* Switcher Tab */}
                <div
                    style={{
                        display: 'flex',
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '3px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setViewMode('weekly')}
                        style={{
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 700,
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: viewMode === 'weekly' ? 'var(--accent-cyan)' : 'transparent',
                            color: viewMode === 'weekly' ? '#000000' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Grafik XP 7 Hari
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('category')}
                        style={{
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 700,
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: viewMode === 'category' ? 'var(--accent-cyan)' : 'transparent',
                            color: viewMode === 'category' ? '#000000' : 'var(--text-secondary)',
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
                    <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', padding: '0 4px 10px', borderBottom: '1px solid var(--border)' }}>
                        {weeklyData.items.map((item, idx) => {
                            const barHeightPercent = Math.max(12, Math.round((item.xp / weeklyData.maxXp) * 100))
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
                                    <span style={{ fontSize: '10px', color: item.xp > 0 ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                                        {item.xp > 0 ? `+${item.xp}` : '0'}
                                    </span>

                                    {/* Bar Element */}
                                    <div
                                        style={{
                                            width: '100%',
                                            maxWidth: '32px',
                                            height: `${barHeightPercent}%`,
                                            backgroundColor: item.isToday ? 'var(--accent-cyan)' : item.xp > 0 ? 'rgba(0, 212, 255, 0.45)' : 'var(--bg-tertiary)',
                                            borderRadius: '6px 6px 2px 2px',
                                            border: `1px solid ${item.isToday ? 'var(--accent-cyan)' : 'var(--border)'}`,
                                            transition: 'height 0.6s cubic-bezier(0.2, 0, 0, 1)',
                                            boxShadow: item.isToday ? '0 0 12px rgba(0, 212, 255, 0.3)' : 'none',
                                        }}
                                    />

                                    {/* Day Label */}
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: item.isToday ? 800 : 600,
                                            color: item.isToday ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                        }}
                                    >
                                        {item.day}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <TrendingUp size={14} style={{ color: 'var(--accent-green)' }} />
                            <span>Konsistensi belajar harian kamu tercatat otomatis</span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'var(--font-heading)' }}>
                            Total: {totalXp.toLocaleString()} XP
                        </span>
                    </div>
                </div>
            )}

            {/* TAB 2: Progress Distribusi Kategori Modul */}
            {viewMode === 'category' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {categoryStats.map(stat => (
                        <div key={stat.category}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stat.color }} />
                                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {stat.label}
                                    </span>
                                </div>
                                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '11px' }}>
                                    {stat.count} Modul Tuntas ({stat.percent}%)
                                </span>
                            </div>

                            <div style={{ height: '7px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(stat.percent > 0 ? stat.percent : 4, 0)}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        backgroundColor: stat.color,
                                        boxShadow: `0 0 8px ${stat.color}40`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}

                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        *Selesaikan beragam kategori modul untuk memperluas portofolio keahlian digital kamu.
                    </p>
                </div>
            )}
        </div>
    )
}
