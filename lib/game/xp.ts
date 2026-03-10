// lib/game/xp.ts — XP & Level Calculation System

export const XP_REWARDS = {
    completeModule: 50,
    winBattle: 80,
    loseBattle: 20,
    dailyQuest: 30,
    streakBonus: 15,
    firstLogin: 25,
    focusSession: 20,
} as const

export type XPRewardKey = keyof typeof XP_REWARDS
export type ClassBonusContext = 'coding' | 'design' | 'battle_win' | 'productivity' | 'battle_loss' | string

export function getXpRequired(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5))
}

export function calculateLevel(totalXp: number): {
    level: number
    currentXp: number
    xpToNext: number
    totalXp: number
} {
    let level = 1
    let remaining = totalXp

    while (remaining >= getXpRequired(level)) {
        remaining -= getXpRequired(level)
        level++
    }

    return {
        level,
        currentXp: remaining,
        xpToNext: getXpRequired(level),
        totalXp,
    }
}

export function getXpProgress(currentXp: number, xpToNext: number): number {
    if (xpToNext === 0) return 100
    return Math.min(100, Math.floor((currentXp / xpToNext) * 100))
}

export const AVATAR_CLASS_STATS = {
    warrior: { str: 8, int: 4, agi: 5, wis: 3, label: 'Warrior', emoji: '⚔️', description: 'STR tinggi, cocok untuk modul coding' },
    mage: { str: 3, int: 9, agi: 4, wis: 5, label: 'Mage', emoji: '🔮', description: 'INT tinggi, cocok untuk modul desain' },
    archer: { str: 5, int: 5, agi: 9, wis: 4, label: 'Archer', emoji: '🏹', description: 'AGI tinggi, cocok untuk quiz battle' },
    healer: { str: 4, int: 5, agi: 4, wis: 9, label: 'Healer', emoji: '✨', description: 'WIS tinggi, cocok untuk modul produktivitas' },
} as const

// ============ CLASS BONUS SYSTEM ============

export const CLASS_BONUS_PERCENT = 25

/** Maps each class to the activity category that triggers its bonus */
export const CLASS_BONUS_MAP: Record<string, string> = {
    warrior: 'coding',
    mage: 'design',
    archer: 'battle_win',
    healer: 'productivity',
}

/**
 * Return XP multiplier for a class and activity context.
 * 1.25 when bonus is active, 1.0 otherwise.
 */
export function getClassXpBonus(avatarClass: string, context: ClassBonusContext): number {
    const normalizedClass = avatarClass?.toLowerCase()
    const normalizedContext = context?.toLowerCase()
    return CLASS_BONUS_MAP[normalizedClass] === normalizedContext ? 1 + (CLASS_BONUS_PERCENT / 100) : 1
}

export function getClassBonusAmount(avatarClass: string, context: ClassBonusContext, baseAmount: number): number {
    const multiplier = getClassXpBonus(avatarClass, context)
    if (multiplier <= 1 || !Number.isFinite(baseAmount) || baseAmount <= 0) return 0
    return Math.floor(baseAmount * (multiplier - 1))
}

/**
 * Check if a class gets a bonus for a specific module category.
 * Useful for UI indicators on module cards.
 */
export function classHasBonusForCategory(avatarClass: string, moduleCategory: string): boolean {
    return CLASS_BONUS_MAP[avatarClass?.toLowerCase()] === moduleCategory?.toLowerCase()
}

export function getClassBonusDescription(avatarClass: string): string {
    const normalizedClass = avatarClass?.toLowerCase()
    switch (normalizedClass) {
        case 'warrior':
            return `Warrior: +${CLASS_BONUS_PERCENT}% XP saat menyelesaikan modul kategori coding.`
        case 'mage':
            return `Mage: +${CLASS_BONUS_PERCENT}% XP saat menyelesaikan modul kategori design.`
        case 'archer':
            return `Archer: +${CLASS_BONUS_PERCENT}% XP saat menang battle.`
        case 'healer':
            return `Healer: +${CLASS_BONUS_PERCENT}% XP saat menyelesaikan modul kategori productivity.`
        default:
            return `Tidak ada bonus class yang terdeteksi.`
    }
}
