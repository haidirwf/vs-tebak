'use client'

import { motion } from 'framer-motion'
import { BookOpen, Zap, Flame, Star } from 'lucide-react'

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
            value: level,
            icon: <Star size={18} />,
            color: 'var(--accent-gold)',
        },
        {
            label: 'Total XP',
            value: totalXp.toLocaleString(),
            icon: <Zap size={18} />,
            color: 'var(--accent-cyan)',
        },
        {
            label: 'Modul Selesai',
            value: modulesCompleted,
            icon: <BookOpen size={18} />,
            color: 'var(--accent-green)',
        },
        {
            label: 'Streak Hari',
            value: streak,
            icon: <Flame size={18} />,
            color: 'var(--accent-red)',
        },
    ]

    return (
        <div className="card" style={{ padding: '20px', height: '100%' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                Statistik
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '12px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: stat.color }}>
                            {stat.icon}
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{stat.label}</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: stat.color }}>
                            {stat.value}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
