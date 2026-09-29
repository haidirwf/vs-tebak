'use client'

import { motion } from 'framer-motion'
import { BookOpen, Zap, Flame, Star, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
    modulesCompleted: number
    totalXp: number
    streak: number
    level: number
}

export default function DashboardStats({ modulesCompleted, totalXp, streak, level }: DashboardStatsProps) {
    const stats = [
        {
            label: 'Level Saat Ini',
            sublabel: 'Tier Hero',
            value: level,
            icon: <Star size={18} />,
            color: 'var(--accent-gold)',
            bg: 'var(--accent-gold-bg)',
            border: 'var(--accent-gold-border)',
        },
        {
            label: 'Total XP',
            sublabel: 'Akumulasi Poin',
            value: totalXp.toLocaleString(),
            icon: <Zap size={18} />,
            color: 'var(--accent-cyan)',
            bg: 'var(--accent-cyan-bg)',
            border: 'var(--accent-cyan-border)',
        },
        {
            label: 'Modul Selesai',
            sublabel: 'Materi Tuntas',
            value: modulesCompleted,
            icon: <BookOpen size={18} />,
            color: 'var(--accent-green)',
            bg: 'var(--accent-green-bg)',
            border: 'var(--accent-green-border)',
        },
        {
            label: 'Streak Hari',
            sublabel: 'Konsistensi Login',
            value: `${streak} Hari`,
            icon: <Flame size={18} />,
            color: 'var(--accent-red)',
            bg: 'var(--accent-red-bg)',
            border: 'var(--accent-red-border)',
        },
    ]

    return (
        <div className="card" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-bone)' }}>
                    <TrendingUp size={16} style={{ color: 'var(--color-gold)' }} />
                    Statistik Hero
                </h3>
                <span className="section-eyebrow" style={{ fontSize: '11px', color: 'var(--color-ash)' }}>REAL-TIME</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2, borderColor: 'var(--color-smoke)' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 20, delay: i * 0.04 }}
                        style={{
                            backgroundColor: 'var(--surface-elevated)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '8px',
                            padding: '12px',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'default',
                            transition: 'border-color 0.2s ease',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    backgroundColor: stat.bg,
                                    border: `1px solid ${stat.border}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: stat.color,
                                }}
                            >
                                {stat.icon}
                            </div>
                            <span className="section-eyebrow" style={{ fontSize: '10px', color: 'var(--color-ash)' }}>
                                {stat.sublabel}
                            </span>
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--color-ash)', fontWeight: 500, marginBottom: '2px' }}>
                            {stat.label}
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-bone)', letterSpacing: '-0.02em' }}>
                            {stat.value}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

