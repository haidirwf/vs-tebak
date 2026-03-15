import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Zap } from 'lucide-react'

interface RecentActivityProps {
    modules: Array<{
        completed_at: string | null
        modules: { title: string; category: string; xp_reward: number } | null
    } | Record<string, unknown>>
    xpLogs: Array<{
        xp_amount: number
        reason: string | null
        created_at: string
    }>
}

function formatReason(reason: string | null): string {
    if (!reason) return 'XP didapat'
    const cleaned = reason
        .replace(/\s*\[module:[^\]]+\]/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
    return cleaned || 'XP didapat'
}

export default function RecentActivity({ modules, xpLogs }: RecentActivityProps) {
    return (
        <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                Aktivitas Terbaru
            </h3>

            {xpLogs.length === 0 && modules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Belum ada aktivitas. Mulai belajar sekarang! 🚀
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {xpLogs.slice(0, 6).map((log, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 10px', borderRadius: '8px',
                            backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                        }}>
                            <Zap size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                                    {formatReason(log.reason)}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: idLocale })}
                                </div>
                            </div>
                            <span style={{
                                fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)',
                                backgroundColor: 'rgba(245,197,66,0.1)', padding: '2px 6px', borderRadius: '3px',
                            }}>
                                +{log.xp_amount}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
