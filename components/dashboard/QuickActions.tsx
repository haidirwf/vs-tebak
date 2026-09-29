'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Swords, BookOpen, Ticket, Trophy, Compass, ArrowUpRight, Sparkles, Flame } from 'lucide-react'

interface QuickActionsProps {
    modulesCompletedCount?: number
}

export default function QuickActions({ modulesCompletedCount = 0 }: QuickActionsProps) {
    const actions = [
        {
            title: 'Modul Belajar',
            subtitle: `${modulesCompletedCount} Modul Selesai`,
            desc: 'Tingkatkan skill coding, desain, & produktivitas',
            href: '/modules',
            icon: BookOpen,
            color: 'var(--accent-cyan)',
            bg: 'var(--accent-cyan-bg)',
            border: 'var(--accent-cyan-border)',
            cta: 'Buka Modul',
            badge: 'Materi',
        },
        {
            title: 'Battle Arena 1v1',
            subtitle: 'PvP Kuis Realtime',
            desc: 'Tantang teman atau cari lawan acak beradu cepat',
            href: '/battle',
            icon: Swords,
            color: 'var(--accent-red)',
            bg: 'var(--accent-red-bg)',
            border: 'var(--accent-red-border)',
            cta: 'Masuk Arena',
            badge: 'Duel Panas',
        },
        {
            title: 'Toko Voucher',
            subtitle: 'Klaim Diskon Kantin',
            desc: 'Tukarkan tabungan XP dengan voucher jajan nyata',
            href: '/voucher',
            icon: Ticket,
            color: 'var(--accent-gold)',
            bg: 'var(--accent-gold-bg)',
            border: 'var(--accent-gold-border)',
            cta: 'Katalog Voucher',
            badge: 'Hadiah',
        },
        {
            title: 'Leaderboard',
            subtitle: 'Peringkat Sekolah',
            desc: 'Cek posisi sekolahmu & ranking top hero nasional',
            href: '/leaderboard',
            icon: Trophy,
            color: 'var(--accent-green)',
            bg: 'var(--accent-green-bg)',
            border: 'var(--accent-green-border)',
            cta: 'Lihat Rank',
            badge: 'Prestasi',
        },
    ]

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {actions.map((action, i) => {
                const Icon = action.icon
                return (
                    <Link key={action.title} href={action.href} style={{ textDecoration: 'none' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: i * 0.06 }}
                            whileHover={{ y: -4, borderColor: action.color }}
                            whileTap={{ scale: 0.98 }}
                            className="card hover-lift"
                            style={{
                                padding: '18px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden',
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px solid var(--border)',
                                cursor: 'pointer',
                            }}
                        >
                            {/* Subtle Ambient Glow in card corner */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    right: '-20px',
                                    width: '80px',
                                    height: '80px',
                                    background: `radial-gradient(circle, ${action.color}20 0%, transparent 70%)`,
                                    pointerEvents: 'none',
                                }}
                            />

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            backgroundColor: action.bg,
                                            border: `1px solid ${action.border}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: action.color,
                                            boxShadow: `0 4px 12px ${action.color}15`,
                                        }}
                                    >
                                        <Icon size={20} />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span
                                            style={{
                                                fontSize: '10px',
                                                fontFamily: 'var(--font-heading)',
                                                fontWeight: 700,
                                                color: action.color,
                                                backgroundColor: action.bg,
                                                border: `1px solid ${action.border}`,
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {action.badge}
                                        </span>
                                        <ArrowUpRight size={15} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                </div>

                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                    {action.title}
                                </div>
                                <div style={{ fontSize: '11px', color: action.color, fontWeight: 600, marginBottom: '6px' }}>
                                    {action.subtitle}
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                                    {action.desc}
                                </p>
                            </div>

                            <div
                                style={{
                                    marginTop: '16px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-heading)',
                                    color: action.color,
                                }}
                            >
                                <span>{action.cta}</span>
                                <ArrowUpRight size={14} />
                            </div>
                        </motion.div>
                    </Link>
                )
            })}
        </div>
    )
}
