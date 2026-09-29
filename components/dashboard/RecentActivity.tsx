'use client'

import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Zap, History, Sparkles } from 'lucide-react'
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
        <div className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
            {/* Header Box serasi dengan desain QuickLeaderboard & DailyQuestList */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--accent-gold-bg)',
                            border: '1px solid var(--accent-gold-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-gold)',
                        }}
                    >
                        <History size={18} />
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
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
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                    }}
                >
                    <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                        {xpLogs.length} Log
                    </span>
                </div>
            </div>

            {xpLogs.length === 0 && modules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '13px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
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
                            whileHover={{ x: 3, borderColor: 'var(--accent-gold)' }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border)',
                                transition: 'border-color 0.2s ease',
                            }}
                        >
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--accent-gold-bg)',
                                    border: '1px solid var(--accent-gold-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-gold)',
                                    flexShrink: 0,
                                }}
                            >
                                <Zap size={15} />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        color: 'var(--accent-gold)',
                                        backgroundColor: 'var(--accent-gold-bg)',
                                        border: '1px solid var(--accent-gold-border)',
                                        padding: '3px 8px',
                                        borderRadius: '4px',
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

