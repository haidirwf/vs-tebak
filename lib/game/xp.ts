// lib/game/xp.ts — XP & Level Calculation System

export const XP_REWARDS = {
    completeModule: 50,
    winBattle: 80,
    loseBattle: 20,
    dailyQuest: 30,
    streakBonus: 15,
    firstLogin: 25,
} as const

export type XPRewardKey = keyof typeof XP_REWARDS

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
 * Calculate the XP bonus amount for a given class and activity.
 * @param avatarClass - The user's character class
 * @param category - The activity category (e.g. 'coding', 'design', 'productivity', 'battle_win', 'battle_loss')
 * @param baseAmount - The base XP before bonus
 * @returns The bonus XP (0 if no match)
 */
export function getClassXpBonus(avatarClass: string, category: string, baseAmount: number): number {
    if (CLASS_BONUS_MAP[avatarClass] === category) {
        return Math.floor(baseAmount * CLASS_BONUS_PERCENT / 100)
    }
    return 0
}

/**
 * Check if a class gets a bonus for a specific module category.
 * Useful for UI indicators on module cards.
 */
export function classHasBonusForCategory(avatarClass: string, moduleCategory: string): boolean {
    return CLASS_BONUS_MAP[avatarClass] === moduleCategory
}

