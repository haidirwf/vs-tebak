export type BotDifficulty = 'easy' | 'medium' | 'hard'

export interface BotDifficultyConfig {
    id: BotDifficulty
    label: string
    sublabel: string
    badge: string
    color: string
    bgColor: string
    borderColor: string
    botName: string
    botClass: 'warrior' | 'mage' | 'archer' | 'healer'
    botLevel: number
    botAccuracy: number
    minDelaySec: number
    maxDelaySec: number
    baseDamage: number
    xpReward: number
    description: string
    icon: string
}

export const BOT_DIFFICULTIES: Record<BotDifficulty, BotDifficultyConfig> = {
    easy: {
        id: 'easy',
        label: 'Mudah',
        sublabel: 'Pemula',
        badge: '🟢 Mudah',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.35)',
        botName: 'AI Novice Drone',
        botClass: 'archer',
        botLevel: 5,
        botAccuracy: 0.48,
        minDelaySec: 5.5,
        maxDelaySec: 9.5,
        baseDamage: 8,
        xpReward: 25,
        description: 'Respons santai & akurasi 48%. Ideal untuk pemula dan pemanasan materi.',
        icon: '🌱',
    },
    medium: {
        id: 'medium',
        label: 'Sedang',
        sublabel: 'Standar',
        badge: '🟡 Sedang',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.12)',
        borderColor: 'rgba(245, 158, 11, 0.35)',
        botName: 'AI Sentinel Guard',
        botClass: 'mage',
        botLevel: 12,
        botAccuracy: 0.72,
        minDelaySec: 3.2,
        maxDelaySec: 6.5,
        baseDamage: 12,
        xpReward: 40,
        description: 'Akurasi 72% dan ritme seimbang. Uji ketepatan dengan tantangan kompetitif.',
        icon: '⚡',
    },
    hard: {
        id: 'hard',
        label: 'Sulit',
        sublabel: 'Master',
        badge: '🔴 Sulit',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.12)',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        botName: 'AI Cyber Overlord',
        botClass: 'warrior',
        botLevel: 25,
        botAccuracy: 0.92,
        minDelaySec: 1.8,
        maxDelaySec: 3.8,
        baseDamage: 18,
        xpReward: 65,
        description: 'Akurasi 92% dan serangan agresif. Menguji reflek & ketepatan maksimal!',
        icon: '🔥',
    },
}

export const BOT_DIFFICULTY_LIST: BotDifficultyConfig[] = [
    BOT_DIFFICULTIES.easy,
    BOT_DIFFICULTIES.medium,
    BOT_DIFFICULTIES.hard,
]
