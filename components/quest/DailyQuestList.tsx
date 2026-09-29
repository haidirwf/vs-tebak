'use client'

import { motion } from 'framer-motion'
import { UserDailyQuest, DailyQuest } from '@/types'
import { CheckCircle, Book, Swords, Flame as StreakIcon, Zap, Target } from 'lucide-react'

interface DailyQuestListProps {
    quests: DailyQuest[]
    userQuests: UserDailyQuest[]
}

const QUEST_ICONS = {
    complete_module: <Book size={16} />,
    win_battle: <Swords size={16} />,
    maintain_streak: <StreakIcon size={16} />,
    earn_xp: <Zap size={16} />,
}

const QUEST_COLORS = {
    complete_module: { color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-bg)', border: 'var(--accent-cyan-border)' },
    win_battle: { color: 'var(--accent-red)', bg: 'var(--accent-red-bg)', border: 'var(--accent-red-border)' },
    maintain_streak: { color: 'var(--accent-green)', bg: 'var(--accent-green-bg)', border: 'var(--accent-green-border)' },
    earn_xp: { color: 'var(--accent-gold)', bg: 'var(--accent-gold-bg)', border: 'var(--accent-gold-border)' },
}

export default function DailyQuestList({ quests, userQuests }: DailyQuestListProps) {
    const getProgress = (questId: string) => {
        return userQuests.find(uq => uq.quest_id === questId)
    }

    const completedCount = quests.filter(q => getProgress(q.id)?.is_completed).length
    const progressPercent = quests.length > 0 ? Math.round((completedCount / quests.length) * 100) : 0

    return (
        <div className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
            {/* Header Box serasi dengan komponen lain */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--accent-green-bg)',
                            border: '1px solid var(--accent-green-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-green)',
                        }}
                    >
                        <Target size={18} />
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                            Quest Harian
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
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                    }}
                >
                    <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                        {completedCount} / {quests.length} Selesai
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '18px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-green) 100%)',
                        boxShadow: '0 0 10px rgba(34, 197, 94, 0.35)',
                    }}
                />
            </div>

            {quests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '13px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                    Belum ada quest hari ini. Istirahat sejenak, Hero! ☕
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {quests.map((quest, i) => {
                        const progress = getProgress(quest.id)
                        const isCompleted = progress?.is_completed ?? false
                        const currentVal = progress?.current_value ?? 0
                        const qMeta = QUEST_COLORS[quest.quest_type as keyof typeof QUEST_COLORS] || QUEST_COLORS.complete_module
                        const icon = QUEST_ICONS[quest.quest_type as keyof typeof QUEST_ICONS] || <Zap size={16} />

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
                                    gap: '14px',
                                    padding: '12px 14px',
                                    borderRadius: '8px',
                                    backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.03)' : 'var(--bg-tertiary)',
                                    border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                                    position: 'relative',
                                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                                }}
                            >
                                <div
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        backgroundColor: isCompleted ? 'rgba(34,197,94,0.12)' : qMeta.bg,
                                        border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : qMeta.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isCompleted ? 'var(--accent-green)' : qMeta.color,
                                        flexShrink: 0,
                                    }}
                                >
                                    {isCompleted ? <CheckCircle size={18} /> : icon}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: 700,
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
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: quest.target_value > 1 && !isCompleted ? '6px' : '0' }}>
                                        {quest.description}
                                    </div>

                                    {quest.target_value > 1 && !isCompleted && (
                                        <div style={{ height: '4px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((currentVal / quest.target_value) * 100, 100)}%` }}
                                                style={{ height: '100%', backgroundColor: qMeta.color }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                                    <span
                                        style={{
                                            backgroundColor: isCompleted ? 'rgba(34,197,94,0.1)' : 'var(--accent-gold-bg)',
                                            border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'var(--accent-gold-border)'}`,
                                            borderRadius: '4px',
                                            padding: '3px 8px',
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '11px',
                                            color: isCompleted ? 'var(--accent-green)' : 'var(--accent-gold)',
                                            fontWeight: 800,
                                        }}
                                    >
                                        +{quest.xp_reward} XP
                                    </span>
                                    {quest.target_value > 1 && !isCompleted && (
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
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

