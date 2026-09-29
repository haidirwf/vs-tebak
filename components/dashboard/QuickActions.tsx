'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Swords, BookOpen, Ticket, Trophy, Compass, ArrowUpRight } from 'lucide-react'

const ACTIONS = [
    {
        title: 'Mulai Modul',
        desc: 'Pelajari materi coding & kumpulkan XP',
        href: '/modules',
        icon: BookOpen,
        color: 'var(--accent-cyan)',
        bg: 'var(--accent-cyan-bg)',
        border: 'var(--accent-cyan-border)',
        badge: 'Belajar',
    },
    {
        title: 'Battle Arena',
        desc: 'Duel 1v1 realtime vs player lain',
        href: '/battle',
        icon: Swords,
        color: 'var(--accent-red)',
        bg: 'var(--accent-red-bg)',
        border: 'var(--accent-red-border)',
        badge: 'PvP Panas',
    },
    {
        title: 'Toko Voucher',
        desc: 'Tukarkan saldo koin/XP dengan diskon',
        href: '/voucher',
        icon: Ticket,
        color: 'var(--accent-gold)',
        bg: 'var(--accent-gold-bg)',
        border: 'var(--accent-gold-border)',
        badge: 'Reward',
    },
    {
        title: 'Papan Peringkat',
        desc: 'Lihat posisi rank kamu di sekolah',
        href: '/leaderboard',
        icon: Trophy,
        color: 'var(--accent-green)',
        bg: 'var(--accent-green-bg)',
        border: 'var(--accent-green-border)',
        badge: 'Top Hero',
    },
]

export default function QuickActions() {
    return (
        <div className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass size={18} style={{ color: 'var(--accent-gold)' }} />
                    Aksi Cepat & Petualangan
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>PILIH JALUR</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                {ACTIONS.map((action, i) => {
                    const Icon = action.icon
                    return (
                        <Link key={action.title} href={action.href} style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ y: -3, scale: 1.02, borderColor: action.color }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                                style={{
                                    padding: '14px 12px',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div
                                        style={{
                                            width: '34px',
                                            height: '34px',
                                            borderRadius: '6px',
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
                                    <ArrowUpRight size={14} style={{ color: 'var(--text-muted)' }} />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {action.title}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                                        {action.desc}
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
