'use client'

import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Zap, History } from 'lucide-react'
import { motion } from 'framer-motion'

interface RecentActivityProps {
    modules: Array<{
        completed_at: string | null
        modules: { title: string; category: string; xp_reward: number } | null
    }>
    xpLogs: Array<{
        xp_amount: number
        reason: string | null
        created_at: string
    }>
}

function formatReason(reason: string | null): string {
    if (!reason) return 'XP Petualangan Didapat'
    const cleaned = reason
        .replace(/\s*\[(?:module|dailyquest):[^\]]+\]/gi, '')
        .replace(/\s*\[battle:[^\]]+\]/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
    return cleaned || 'XP Petualangan Didapat'
}

export default function RecentActivity({ modules, xpLogs }: RecentActivityProps) {
    return (
        <div
            className="card"
            style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '17.1429px',
                backgroundColor: '#080808',
                border: '1px solid #292929',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(255, 72, 0, 0.1)',
                            border: '1px solid rgba(255, 72, 0, 0.28)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ff4800',
                        }}
                    >
                        <History size={18} />
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 400, letterSpacing: '-0.01em', margin: 0, color: 'var(--text-primary)' }}>
                            Aktivitas Terbaru
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Riwayat perolehan XP & modul
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#121212',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        border: '1px solid #292929',
                    }}
                >
                    <span style={{ fontSize: '11px', color: '#ff4800', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                        {xpLogs.length} Log
                    </span>
                </div>
            </div>

            {xpLogs.length === 0 && modules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '13px', backgroundColor: '#121212', borderRadius: '12px', border: '1px dashed #292929' }}>
                    Belum ada aktivitas. Mulai petualangan modul atau duel arena sekarang! 🚀
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {xpLogs.slice(0, 5).map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ x: 3, borderColor: '#ff4800' }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                backgroundColor: '#0d0d0d',
                                border: '1px solid #222222',
                                transition: 'border-color 0.2s ease',
                            }}
                        >
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8.57143px',
                                    backgroundColor: 'rgba(255, 72, 0, 0.1)',
                                    border: '1px solid rgba(255, 72, 0, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ff4800',
                                    flexShrink: 0,
                                }}
                            >
                                <Zap size={14} />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {formatReason(log.reason)}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: idLocale })}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#ff4800',
                                        backgroundColor: 'rgba(255, 72, 0, 0.1)',
                                        border: '1px solid rgba(255, 72, 0, 0.25)',
                                        padding: '3px 10px',
                                        borderRadius: '9999px',
                                    }}
                                >
                                    +{log.xp_amount} XP
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

