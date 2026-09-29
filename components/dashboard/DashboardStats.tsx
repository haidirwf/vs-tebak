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
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} style={{ color: 'var(--accent-cyan)' }} />
                    Statistik Hero
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>REAL-TIME</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -3, scale: 1.02, borderColor: stat.color }}
                        transition={{ type: 'spring', stiffness: 350, damping: 20, delay: i * 0.05 }}
                        style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '14px 12px',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'default',
                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
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
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                {stat.sublabel}
                            </span>
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: '2px' }}>
                            {stat.label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, color: stat.color, letterSpacing: '0.02em' }}>
                            {stat.value}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

