'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Swords, BookOpen, Ticket, Trophy, Compass, ArrowUpRight, Sparkles, Flame, ShoppingBag } from 'lucide-react'

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
            title: 'Toko Petualang',
            subtitle: 'Voucher & Aksesoris',
            desc: 'Tukarkan tabungan XP dengan voucher kantin atau gear pahlawan',
            href: '/shop',
            icon: ShoppingBag,
            color: 'var(--accent-gold)',
            bg: 'var(--accent-gold-bg)',
            border: 'var(--accent-gold-border)',
            cta: 'Buka Toko',
            badge: 'Toko & Hadiah',
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
                            whileHover={{ y: -3, borderColor: 'rgba(255, 255, 255, 0.3)' }}
                            whileTap={{ scale: 0.98 }}
                            className="card hover-lift"
                            style={{
                                padding: '20px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden',
                                backgroundColor: 'var(--surface-card)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '17.1429px',
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
                                    background: `radial-gradient(circle, ${action.color}25 0%, transparent 70%)`,
                                    pointerEvents: 'none',
                                }}
                            />

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '8.57143px',
                                            backgroundColor: action.bg,
                                            border: `1px solid ${action.border}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: action.color,
                                        }}
                                    >
                                        <Icon size={18} />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                fontFamily: 'var(--font-inter)',
                                                fontWeight: 500,
                                                color: action.color,
                                                backgroundColor: action.bg,
                                                border: `1px solid ${action.border}`,
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                            }}
                                        >
                                            {action.badge}
                                        </span>
                                        <ArrowUpRight size={14} style={{ color: 'var(--color-steel)' }} />
                                    </div>
                                </div>

                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 400, color: '#ffffff', marginBottom: '4px', letterSpacing: '-0.015em' }}>
                                    {action.title}
                                </div>
                                <div style={{ fontSize: '11px', color: action.color, fontWeight: 500, marginBottom: '6px', fontFamily: 'var(--font-inter)' }}>
                                    {action.subtitle}
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--color-fog)', margin: 0, lineHeight: 1.5 }}>
                                    {action.desc}
                                </p>
                            </div>

                            <div
                                style={{
                                    marginTop: '16px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    fontFamily: 'var(--font-inter)',
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
