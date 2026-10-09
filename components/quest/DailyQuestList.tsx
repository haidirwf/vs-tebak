'use client'

import { motion } from 'framer-motion'
import { UserDailyQuest, DailyQuest } from '@/types'
import { CheckCircle, Book, Swords, Flame as StreakIcon, Zap, Target } from 'lucide-react'

interface DailyQuestListProps {
    quests: DailyQuest[]
    userQuests: UserDailyQuest[]
}

const QUEST_ICONS = {
    complete_module: <Book size={15} />,
    win_battle: <Swords size={15} />,
    maintain_streak: <StreakIcon size={15} />,
    earn_xp: <Zap size={15} />,
}

const QUEST_COLORS = {
    complete_module: { color: 'var(--accent-cyan)', bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.25)' },
    win_battle: { color: 'var(--accent-red)', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)' },
    maintain_streak: { color: 'var(--accent-green)', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.25)' },
    earn_xp: { color: 'var(--color-gold-text)', bg: 'var(--accent-gold-bg)', border: 'var(--accent-gold-border)' },
}

export default function DailyQuestList({ quests, userQuests }: DailyQuestListProps) {
    const getProgress = (questId: string) => {
        return userQuests.find(uq => uq.quest_id === questId)
    }

    const completedCount = quests.filter(q => getProgress(q.id)?.is_completed).length
    const progressPercent = quests.length > 0 ? Math.round((completedCount / quests.length) * 100) : 0

    return (
        <div
            className="card"
            style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '12px',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                boxShadow: 'var(--shadow-card)',
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
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.28)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-green)',
                            flexShrink: 0,
                        }}
                    >
                        <Target size={17} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 500, letterSpacing: '-0.01em', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Misi Harian
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Reset tiap tengah malam
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
                    <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                        {completedCount} / {quests.length} Selesai
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', backgroundColor: 'var(--surface-elevated)', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #F5C542 0%, #22C55E 100%)',
                    }}
                />
            </div>

            {quests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 20px', backgroundColor: 'var(--surface-elevated)', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>☕</div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>Belum ada misi baru hari ini</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Misi harian akan diperbarui otomatis saat tengah malam.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {quests.map((quest, i) => {
                        const progress = getProgress(quest.id)
                        const isCompleted = progress?.is_completed ?? false
                        const currentVal = progress?.current_value ?? 0
                        const qMeta = QUEST_COLORS[quest.quest_type as keyof typeof QUEST_COLORS] || QUEST_COLORS.complete_module
                        const icon = QUEST_ICONS[quest.quest_type as keyof typeof QUEST_ICONS] || <Zap size={15} />

                        return (
                            <motion.div
                                key={quest.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ x: 3, borderColor: isCompleted ? 'rgba(34,197,94,0.4)' : qMeta.color }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '10px',
                                    backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.06)' : 'var(--surface-elevated)',
                                    border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.25)' : 'var(--surface-border)'}`,
                                    position: 'relative',
                                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                                    minWidth: 0,
                                }}
                            >
                                <div
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        backgroundColor: isCompleted ? 'rgba(34,197,94,0.12)' : qMeta.bg,
                                        border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : qMeta.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isCompleted ? 'var(--accent-green)' : qMeta.color,
                                        flexShrink: 0,
                                    }}
                                >
                                    {isCompleted ? <CheckCircle size={15} /> : icon}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                                            fontFamily: 'var(--font-heading)',
                                            textDecoration: isCompleted ? 'line-through' : 'none',
                                            marginBottom: '2px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {quest.title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: quest.target_value > 1 && !isCompleted ? '4px' : '0', wordBreak: 'break-word', lineHeight: 1.3 }}>
                                        {quest.description}
                                    </div>

                                    {quest.target_value > 1 && !isCompleted && (
                                        <div style={{ height: '4px', backgroundColor: 'var(--surface-canvas)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((currentVal / quest.target_value) * 100, 100)}%` }}
                                                style={{ height: '100%', borderRadius: '4px', backgroundColor: qMeta.color }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                                    <span
                                        style={{
                                            backgroundColor: isCompleted ? 'rgba(34,197,94,0.1)' : 'var(--accent-gold-bg)',
                                            border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.25)' : 'var(--accent-gold-border)'}`,
                                            borderRadius: '6px',
                                            padding: '2px 8px',
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '11px',
                                            color: isCompleted ? 'var(--accent-green)' : 'var(--color-gold-text)',
                                            fontWeight: 700,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        +{quest.xp_reward} XP
                                    </span>
                                    {quest.target_value > 1 && !isCompleted && (
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-heading)' }}>
                                            {currentVal}/{quest.target_value}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}


