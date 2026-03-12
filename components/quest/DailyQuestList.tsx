'use client'

import { motion } from 'framer-motion'
import { UserDailyQuest, DailyQuest } from '@/types'
import { CheckCircle, Book, Swords, Flame as StreakIcon, Zap } from 'lucide-react'

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
        <div className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800 }}>
                        QUEST HARIAN
                    </h3>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                    {completedCount}/{quests.length} SELESAI
                </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: quests.length ? `${(completedCount / quests.length) * 100}%` : '0%' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        backgroundColor: 'var(--accent-green)',
                        boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)'
                    }}
                />
            </div>

            {quests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                    Belum ada quest hari ini. <br />Istirahat sejenak, Hero!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {quests.map((quest, i) => {
                        const progress = getProgress(quest.id)
                        const isCompleted = progress?.is_completed ?? false
                        const currentVal = progress?.current_value ?? 0
                        const color = QUEST_COLORS[quest.quest_type as keyof typeof QUEST_COLORS] || 'var(--accent-cyan)'
                        const icon = QUEST_ICONS[quest.quest_type as keyof typeof QUEST_ICONS] || <Zap size={16} />

                        return (
                            <motion.div
                                key={quest.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ x: 4 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '16px', borderRadius: '8px',
                                    backgroundColor: isCompleted ? 'rgba(255, 255, 255, 0.01)' : 'var(--bg-secondary)',
                                    border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                                    position: 'relative',
                                    opacity: isCompleted ? 0.7 : 1,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '8px',
                                    backgroundColor: isCompleted ? 'rgba(34,197,94,0.1)' : `${color}10`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: isCompleted ? 'var(--accent-green)' : color,
                                    border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.2)' : `${color}20`}`,
                                    flexShrink: 0
                                }}>
                                    {isCompleted ? <CheckCircle size={20} /> : icon}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                                        fontFamily: 'var(--font-heading)',
                                        textDecoration: isCompleted ? 'line-through' : 'none',
                                        marginBottom: '2px'
                                    }}>
                                        {quest.title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                        {quest.description}
                                    </div>

                                    {quest.target_value > 1 && !isCompleted && (
                                        <div style={{ height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((currentVal / quest.target_value) * 100, 100)}%` }}
                                                style={{ height: '100%', backgroundColor: color }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <div style={{
                                        backgroundColor: isCompleted ? 'rgba(34,197,94,0.1)' : 'rgba(245,197,66,0.1)',
                                        border: `1px solid ${isCompleted ? 'var(--accent-green)40' : 'rgba(245,197,66,0.2)'}`,
                                        borderRadius: '4px', padding: '4px 8px',
                                        fontFamily: 'var(--font-heading)', fontSize: '12px',
                                        color: isCompleted ? 'var(--accent-green)' : 'var(--accent-gold)',
                                        fontWeight: 800,
                                    }}>
                                        +{quest.xp_reward} XP
                                    </div>
                                    {quest.target_value > 1 && !isCompleted && (
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                                            {currentVal} / {quest.target_value}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Background Decoration */}
            <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px', backgroundColor: 'var(--accent-cyan)',
                filter: 'blur(60px)', opacity: 0.05, pointerEvents: 'none'
            }} />
        </div>
    )
}
