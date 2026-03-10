'use client'

import { motion } from 'framer-motion'
import { UserDailyQuest, DailyQuest } from '@/types'
import { CheckCircle, Circle } from 'lucide-react'

interface DailyQuestListProps {
    quests: DailyQuest[]
    userQuests: UserDailyQuest[]
}

const QUEST_COLORS = {
    complete_module: 'var(--accent-cyan)',
    win_battle: 'var(--accent-red)',
    maintain_streak: 'var(--accent-green)',
    earn_xp: 'var(--accent-gold)',
}

export default function DailyQuestList({ quests, userQuests }: DailyQuestListProps) {
    const getProgress = (questId: string) => {
        return userQuests.find(uq => uq.quest_id === questId)
    }

    const completedCount = quests.filter(q => getProgress(q.id)?.is_completed).length

    return (
        <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700 }}>
                    Quest Harian
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {completedCount}/{quests.length} selesai
                </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: quests.length ? `${(completedCount / quests.length) * 100}%` : '0%' }}
                    transition={{ duration: 0.5 }}
                    style={{ height: '100%', backgroundColor: 'var(--accent-cyan)' }}
                />
            </div>

            {quests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Belum ada quest hari ini
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {quests.map((quest, i) => {
                        const progress = getProgress(quest.id)
                        const isCompleted = progress?.is_completed ?? false
                        const currentVal = progress?.current_value ?? 0
                        const color = QUEST_COLORS[quest.quest_type as keyof typeof QUEST_COLORS] || 'var(--accent-cyan)'

                        return (
                            <motion.div
                                key={quest.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '12px', borderRadius: '4px',
                                    backgroundColor: isCompleted ? 'rgba(34,197,94,0.05)' : 'var(--bg-tertiary)',
                                    border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
                                }}
                            >
                                <div style={{ color: isCompleted ? 'var(--accent-green)' : color, flexShrink: 0 }}>
                                    {isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                                        {quest.title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {quest.description}
                                    </div>
                                    {quest.target_value > 1 && (
                                        <div style={{ marginTop: '4px', height: '3px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', backgroundColor: color, width: `${Math.min((currentVal / quest.target_value) * 100, 100)}%` }} />
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    backgroundColor: 'rgba(245,197,66,0.1)', border: '1px solid rgba(245,197,66,0.2)',
                                    borderRadius: '3px', padding: '2px 8px', flexShrink: 0,
                                    fontFamily: 'var(--font-heading)', fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600,
                                }}>
                                    +{quest.xp_reward} XP
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
