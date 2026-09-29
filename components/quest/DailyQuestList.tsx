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
    earn_xp: { color: 'var(--color-gold)', bg: 'rgba(245, 197, 66, 0.08)', border: 'rgba(245, 197, 66, 0.25)' },
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
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.28)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-green)',
                        }}
                    >
                        <Target size={18} />
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 400, letterSpacing: '-0.01em', margin: 0, color: 'var(--text-primary)' }}>
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
                        backgroundColor: '#121212',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        border: '1px solid #292929',
                    }}
                >
                    <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                        {completedCount} / {quests.length} Selesai
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', backgroundColor: '#141414', borderRadius: '9999px', marginBottom: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        borderRadius: '9999px',
                        background: 'linear-gradient(90deg, #F5C542 0%, #22C55E 100%)',
                        boxShadow: '0 0 12px rgba(245, 197, 66, 0.35)',
                    }}
                />
            </div>

            {quests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '13px', backgroundColor: '#121212', borderRadius: '12px', border: '1px dashed #292929' }}>
                    Belum ada quest hari ini. Istirahat sejenak, Hero! ☕
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
                                    gap: '14px',
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.04)' : '#0d0d0d',
                                    border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.25)' : '#222222'}`,
                                    position: 'relative',
                                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                                }}
                            >
                                <div
                                    style={{
                                        width: '34px',
                                        height: '34px',
                                        borderRadius: '8.57143px',
                                        backgroundColor: isCompleted ? 'rgba(34,197,94,0.12)' : qMeta.bg,
                                        border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : qMeta.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isCompleted ? 'var(--accent-green)' : qMeta.color,
                                        flexShrink: 0,
                                    }}
                                >
                                    {isCompleted ? <CheckCircle size={16} /> : icon}
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
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: quest.target_value > 1 && !isCompleted ? '6px' : '0' }}>
                                        {quest.description}
                                    </div>

                                    {quest.target_value > 1 && !isCompleted && (
                                        <div style={{ height: '4px', backgroundColor: '#181818', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((currentVal / quest.target_value) * 100, 100)}%` }}
                                                style={{ height: '100%', borderRadius: '9999px', backgroundColor: qMeta.color }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                                    <span
                                        style={{
                                            backgroundColor: isCompleted ? 'rgba(34,197,94,0.1)' : 'rgba(245, 197, 66, 0.1)',
                                            border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.25)' : 'rgba(245, 197, 66, 0.25)'}`,
                                            borderRadius: '9999px',
                                            padding: '3px 10px',
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '11px',
                                            color: isCompleted ? 'var(--accent-green)' : 'var(--color-gold)',
                                            fontWeight: 600,
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


