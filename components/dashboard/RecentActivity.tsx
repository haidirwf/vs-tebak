'use client'

import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Zap, History, Swords, BookOpen, Target } from 'lucide-react'
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

function getActivityMeta(reason: string | null) {
    const raw = (reason || '').toLowerCase()
    if (raw.includes('battle') || raw.includes('duel') || raw.includes('pvp')) {
        return {
            Icon: Swords,
            color: '#ef4444',
            bg: 'rgba(239, 68, 68, 0.12)',
            border: 'rgba(239, 68, 68, 0.28)',
            badgeBg: 'rgba(239, 68, 68, 0.1)',
            badgeBorder: 'rgba(239, 68, 68, 0.25)',
        }
    }
    if (raw.includes('modul') || raw.includes('materi') || raw.includes('tahap')) {
        return {
            Icon: BookOpen,
            color: '#38bdf8',
            bg: 'rgba(56, 189, 248, 0.12)',
            border: 'rgba(56, 189, 248, 0.28)',
            badgeBg: 'rgba(56, 189, 248, 0.1)',
            badgeBorder: 'rgba(56, 189, 248, 0.25)',
        }
    }
    if (raw.includes('quest') || raw.includes('misi') || raw.includes('daily')) {
        return {
            Icon: Target,
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.28)',
            badgeBg: 'rgba(16, 185, 129, 0.1)',
            badgeBorder: 'rgba(16, 185, 129, 0.25)',
        }
    }
    return {
        Icon: Zap,
        color: '#F5C542',
        bg: 'rgba(245, 197, 66, 0.1)',
        border: 'rgba(245, 197, 66, 0.28)',
        badgeBg: 'rgba(245, 197, 66, 0.1)',
        badgeBorder: 'rgba(245, 197, 66, 0.25)',
    }
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
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
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
                        <History size={17} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 500, letterSpacing: '-0.01em', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                        backgroundColor: 'var(--surface-elevated)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--surface-border)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <span style={{ fontSize: '11px', color: '#F5C542', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                        {xpLogs.length} Log
                    </span>
                </div>
            </div>

            {xpLogs.length === 0 && modules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '13px', backgroundColor: 'var(--surface-elevated)', borderRadius: '12px', border: '1px dashed var(--surface-border)' }}>
                    Belum ada aktivitas. Mulai petualangan modul atau duel arena sekarang! 🚀
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {xpLogs.slice(0, 5).map((log, i) => {
                        const meta = getActivityMeta(log.reason)
                        const MetaIcon = meta.Icon
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ x: 3, borderColor: meta.color }}
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
                                        borderRadius: '8px',
                                        backgroundColor: meta.bg,
                                        border: `1px solid ${meta.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: meta.color,
                                        flexShrink: 0,
                                    }}
                                >
                                    <MetaIcon size={15} />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {formatReason(log.reason)}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: idLocale })}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: meta.color,
                                            backgroundColor: meta.badgeBg,
                                            border: `1px solid ${meta.badgeBorder}`,
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        +{log.xp_amount} XP
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

