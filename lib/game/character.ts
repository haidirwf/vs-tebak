// lib/game/character.ts — Character Roles, Stats & Calculation Engine
import { AvatarClass } from '@/types'
import { getItemById, GameItem, ItemSlot } from './items'

export interface CharacterRoleInfo {
    id: AvatarClass
    name: string
    title: string
    subtitle: string
    tagline: string
    description: string
    themeColor: string
    secondaryColor: string
    accentGlow: string
    avatarEmoji: string
    baseStats: {
        hp: number
        mp: number
        atk: number
        def: number
        crit: number
        speed: number
    }
    perk: {
        name: string
        effect: string
        description: string
    }
}

export const CHARACTER_ROLES: Record<AvatarClass, CharacterRoleInfo> = {
    warrior: {
        id: 'warrior',
        name: 'Warrior',
        title: 'Pendekar Baja',
        subtitle: 'The Iron Vanguard',
        tagline: 'Pertahanan kokoh dengan tebasan pedang berdaya hancur tinggi.',
        description: 'Pakar coding dan logika sistem. Memiliki ketahanan HP dan fisik tertinggi, cocok untuk duel maraton panjang.',
        themeColor: '#ef4444',
        secondaryColor: '#f97316',
        accentGlow: 'rgba(239, 68, 68, 0.4)',
        avatarEmoji: '⚔️',
        baseStats: {
            hp: 120,
            mp: 40,
            atk: 28,
            def: 22,
            crit: 10,
            speed: 12,
        },
        perk: {
            name: 'Iron Will',
            effect: '+15% Base ATK & -10% Kerusakan Salah Jawab',
            description: 'Setiap jawaban benar memberikan daya serang lebih tinggi dan meminimalisir luka saat keliru.',
        },
    },
    mage: {
        id: 'mage',
        name: 'Mage',
        title: 'Penyihir Elemen',
        subtitle: 'The Arcane Scholar',
        tagline: 'Ledakan sihir berkecepatan tinggi dengan manipulasi mana tak terbatas.',
        description: 'Pakar desain antarmuka & kreativitas. Mengandalkan ledakan critical magis untuk merontokkan skor lawan seketika.',
        themeColor: '#38bdf8',
        secondaryColor: '#a855f7',
        accentGlow: 'rgba(56, 189, 248, 0.4)',
        avatarEmoji: '🔮',
        baseStats: {
            hp: 85,
            mp: 120,
            atk: 32,
            def: 12,
            crit: 22,
            speed: 14,
        },
        perk: {
            name: 'Arcane Surge',
            effect: '+20% Critical Chance & Pemulihan MP Cepat',
            description: 'Serangan berpeluang meledak menghasilkan 1.5x skor poin dalam duel.',
        },
    },
    archer: {
        id: 'archer',
        name: 'Archer',
        title: 'Pemanah Bayangan',
        subtitle: 'The Swift Ranger',
        tagline: 'Kecepatan kilat dengan bidikan presisi sebelum lawan menyadarinya.',
        description: 'Pakar kuis cepat dan refleksi taktik. Memiliki waktu timer ekstra untuk membaca soal secara jernih.',
        themeColor: '#10b981',
        secondaryColor: '#22c55e',
        accentGlow: 'rgba(16, 185, 129, 0.4)',
        avatarEmoji: '🏹',
        baseStats: {
            hp: 95,
            mp: 60,
            atk: 26,
            def: 14,
            crit: 25,
            speed: 28,
        },
        perk: {
            name: 'Quickdraw Insight',
            effect: '+2 Detik Waktu Ronde & +15% Akurasi Kritis',
            description: 'Memberikan detik ekstra untuk memikirkan jawaban kuis tanpa terburu-buru.',
        },
    },
    healer: {
        id: 'healer',
        name: 'Healer',
        title: 'Tabib Cahaya',
        subtitle: 'The Divine Protector',
        tagline: 'Perlindungan suci pemulih kesehatan dan penolak segala kegagalan.',
        description: 'Pakar produktivitas dan stamina belajar. Menciptakan shield pelindung dari jawaban berturut-turut.',
        themeColor: '#F5C542',
        secondaryColor: '#eab308',
        accentGlow: 'rgba(245, 197, 66, 0.4)',
        avatarEmoji: '✨',
        baseStats: {
            hp: 110,
            mp: 80,
            atk: 22,
            def: 18,
            crit: 12,
            speed: 15,
        },
        perk: {
            name: 'Sanctuary Shield',
            effect: '+25% Regenerasi Shield Tiap Streak & +15% XP',
            description: 'Menjaga streak jawaban benar menghasilkan shield penahan poin lawan dan bonus XP.',
        },
    },
}

export type EquippedItemsMap = Partial<Record<ItemSlot, string>>

export interface TotalCharacterStats {
    hp: number
    mp: number
    atk: number
    def: number
    crit: number
    speed: number
    levelBonus: number
    equippedItemsList: GameItem[]
    battleBuffs: {
        extraAtkPoints: number      // e.g. +35 points
        damageReductionPct: number  // e.g. 20%
        critChancePct: number       // e.g. 25%
        extraTimerSec: number       // e.g. +3s
        extraXpPct: number          // e.g. +15%
        shieldRegenPoints: number   // e.g. +12
    }
}

export function calculateCharacterStats(
    roleKey: AvatarClass,
    level: number = 1,
    equipped: EquippedItemsMap = {}
): TotalCharacterStats {
    const role = CHARACTER_ROLES[roleKey] || CHARACTER_ROLES.warrior
    const levelScale = Math.max(1, level)
    const levelBonus = (levelScale - 1) * 2

    const equippedList: GameItem[] = []
    let extraAtkPoints = 0
    let damageReductionPct = 0
    let critChancePct = role.baseStats.crit
    let extraTimerSec = 0
    let extraXpPct = 0
    let shieldRegenPoints = 0

    // Role inherent baseline buffs
    if (roleKey === 'warrior') {
        extraAtkPoints += 5
        damageReductionPct += 10
    } else if (roleKey === 'mage') {
        critChancePct += 10
    } else if (roleKey === 'archer') {
        extraTimerSec += 2
        critChancePct += 5
    } else if (roleKey === 'healer') {
        shieldRegenPoints += 10
        extraXpPct += 10
    }

    // Sum equipped items
    for (const slot of ['weapon', 'head', 'armor', 'accessory'] as ItemSlot[]) {
        const itemId = equipped[slot]
        if (!itemId) continue
        const item = getItemById(itemId)
        if (!item) continue
        equippedList.push(item)

        const buff = item.buff
        switch (buff.type) {
            case 'atk_bonus':
                extraAtkPoints += buff.value
                break
            case 'def_bonus':
                damageReductionPct += buff.value
                break
            case 'crit_rate':
                critChancePct += buff.value
                break
            case 'time_bonus':
                extraTimerSec += buff.value
                break
            case 'xp_bonus':
                extraXpPct += buff.value
                break
            case 'shield_regen':
                shieldRegenPoints += buff.value
                break
        }
    }

    return {
        hp: role.baseStats.hp + levelBonus * 5,
        mp: role.baseStats.mp + levelBonus * 3,
        atk: role.baseStats.atk + levelBonus + extraAtkPoints,
        def: role.baseStats.def + levelBonus + Math.floor(damageReductionPct / 3),
        crit: Math.min(75, critChancePct),
        speed: role.baseStats.speed + Math.floor(levelBonus / 2),
        levelBonus,
        equippedItemsList: equippedList,
        battleBuffs: {
            extraAtkPoints,
            damageReductionPct: Math.min(60, damageReductionPct),
            critChancePct: Math.min(75, critChancePct),
            extraTimerSec,
            extraXpPct,
            shieldRegenPoints,
        },
    }
}
