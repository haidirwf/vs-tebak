// lib/game/items.ts — Character Equipment & Items Catalog
import { AvatarClass } from '@/types'

export type ItemSlot = 'weapon' | 'head' | 'armor' | 'accessory'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type BuffType = 
    | 'atk_bonus'      // Extra score point per correct answer
    | 'def_bonus'      // Percentage damage reduction on wrong answer
    | 'crit_rate'      // Critical chance for 1.5x score
    | 'time_bonus'     // Extra seconds for round timer
    | 'xp_bonus'       // Percentage XP bonus after battle
    | 'shield_regen'   // Extra shield on correct answer streak

export interface ItemBuff {
    type: BuffType
    value: number
    label: string
}

export interface GameItem {
    id: string
    name: string
    slot: ItemSlot
    class_req: AvatarClass | 'all'
    rarity: ItemRarity
    cost_xp: number
    icon: string
    image_url?: string
    description: string
    buff: ItemBuff
    is_starter?: boolean
}

export interface RarityTheme {
    label: string
    labelId: string
    stars: string
    tier: number
    color: string
    border: string
    bg: string
    cardBg: string
    cardBorder: string
    cardShadow: string
    cardHoverShadow: string
    topBeam: string | null
    sheenOverlay: string | null
    pedestalBg: string
    pedestalBorder: string
    pedestalShadow: string
    badgeBg: string
    badgeBorder: string
    badgeColor: string
    buffBg: string
    buffBorder: string
    buffColor: string
    priceColor: string
    ctaAffordStyle?: {
        bg: string
        color: string
        border: string
        shadow?: string
    }
}

export const RARITY_CONFIG: Record<ItemRarity, RarityTheme> = {
    common: {
        label: 'Common',
        labelId: 'Biasa',
        stars: '★',
        tier: 1,
        color: 'var(--text-secondary)',
        border: 'var(--surface-border)',
        bg: 'var(--surface-elevated)',
        cardBg: 'linear-gradient(180deg, rgba(30, 41, 59, 0.45) 0%, rgba(15, 23, 42, 0.8) 100%)',
        cardBorder: 'rgba(148, 163, 184, 0.2)',
        cardShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
        cardHoverShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
        topBeam: null,
        sheenOverlay: null,
        pedestalBg: 'rgba(255, 255, 255, 0.04)',
        pedestalBorder: '1px solid rgba(148, 163, 184, 0.2)',
        pedestalShadow: 'none',
        badgeBg: 'rgba(255, 255, 255, 0.05)',
        badgeBorder: 'rgba(148, 163, 184, 0.25)',
        badgeColor: '#94a3b8',
        buffBg: 'rgba(148, 163, 184, 0.1)',
        buffBorder: 'rgba(148, 163, 184, 0.25)',
        buffColor: '#94a3b8',
        priceColor: '#94a3b8',
    },
    rare: {
        label: 'Rare',
        labelId: 'Langka',
        stars: '★★',
        tier: 2,
        color: 'var(--accent-cyan)',
        border: 'var(--accent-cyan-border)',
        bg: 'var(--accent-cyan-bg)',
        cardBg: 'linear-gradient(180deg, rgba(8, 51, 68, 0.45) 0%, rgba(12, 74, 110, 0.2) 35%, rgba(15, 23, 42, 0.88) 100%)',
        cardBorder: 'rgba(56, 189, 248, 0.45)',
        cardShadow: '0 6px 20px -2px rgba(14, 165, 233, 0.2)',
        cardHoverShadow: '0 8px 28px -2px rgba(14, 165, 233, 0.35)',
        topBeam: 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.9) 50%, transparent 100%)',
        sheenOverlay: null,
        pedestalBg: 'radial-gradient(circle, rgba(56, 189, 248, 0.24) 0%, rgba(14, 116, 144, 0.08) 75%)',
        pedestalBorder: '1.5px solid rgba(56, 189, 248, 0.5)',
        pedestalShadow: '0 0 14px rgba(56, 189, 248, 0.22)',
        badgeBg: 'rgba(56, 189, 248, 0.14)',
        badgeBorder: 'rgba(56, 189, 248, 0.4)',
        badgeColor: '#38bdf8',
        buffBg: 'rgba(56, 189, 248, 0.12)',
        buffBorder: 'rgba(56, 189, 248, 0.32)',
        buffColor: '#38bdf8',
        priceColor: '#38bdf8',
    },
    epic: {
        label: 'Epic',
        labelId: 'Epik',
        stars: '★★★',
        tier: 3,
        color: 'var(--accent-purple)',
        border: 'var(--accent-purple-border)',
        bg: 'var(--accent-purple-bg)',
        cardBg: 'linear-gradient(180deg, rgba(88, 28, 135, 0.45) 0%, rgba(126, 34, 206, 0.18) 35%, rgba(15, 23, 42, 0.9) 100%)',
        cardBorder: 'rgba(192, 132, 252, 0.55)',
        cardShadow: '0 8px 26px -2px rgba(168, 85, 247, 0.28), inset 0 1px 0 rgba(192, 132, 252, 0.25)',
        cardHoverShadow: '0 12px 34px -2px rgba(168, 85, 247, 0.45), inset 0 1px 0 rgba(192, 132, 252, 0.4)',
        topBeam: 'linear-gradient(90deg, transparent 0%, rgba(192, 132, 252, 1) 50%, transparent 100%)',
        sheenOverlay: 'radial-gradient(ellipse at 80% 0%, rgba(192, 132, 252, 0.14) 0%, transparent 70%)',
        pedestalBg: 'radial-gradient(circle, rgba(192, 132, 252, 0.32) 0%, rgba(88, 28, 135, 0.12) 75%)',
        pedestalBorder: '1.5px solid rgba(192, 132, 252, 0.65)',
        pedestalShadow: '0 0 18px rgba(192, 132, 252, 0.32)',
        badgeBg: 'rgba(168, 85, 247, 0.2)',
        badgeBorder: 'rgba(192, 132, 252, 0.5)',
        badgeColor: '#c084fc',
        buffBg: 'rgba(168, 85, 247, 0.16)',
        buffBorder: 'rgba(192, 132, 252, 0.38)',
        buffColor: '#c084fc',
        priceColor: '#c084fc',
    },
    legendary: {
        label: 'Legendary',
        labelId: 'Legendaris',
        stars: '★★★★',
        tier: 4,
        color: 'var(--color-gold-text)',
        border: 'var(--accent-gold-border)',
        bg: 'var(--accent-gold-bg)',
        cardBg: 'linear-gradient(180deg, rgba(180, 83, 9, 0.42) 0%, rgba(217, 119, 6, 0.18) 35%, rgba(15, 23, 42, 0.94) 100%)',
        cardBorder: 'rgba(251, 191, 36, 0.75)',
        cardShadow: '0 10px 32px -2px rgba(245, 158, 11, 0.35), inset 0 1px 0 rgba(254, 240, 138, 0.45)',
        cardHoverShadow: '0 14px 42px -2px rgba(245, 158, 11, 0.52), inset 0 1px 0 rgba(254, 240, 138, 0.65)',
        topBeam: 'linear-gradient(90deg, transparent 0%, #f59e0b 25%, #fef08a 50%, #f59e0b 75%, transparent 100%)',
        sheenOverlay: 'radial-gradient(ellipse at 85% 0%, rgba(251, 191, 36, 0.22) 0%, transparent 65%)',
        pedestalBg: 'radial-gradient(circle, rgba(251, 191, 36, 0.42) 0%, rgba(180, 83, 9, 0.18) 75%)',
        pedestalBorder: '1.5px solid rgba(251, 191, 36, 0.85)',
        pedestalShadow: '0 0 22px rgba(251, 191, 36, 0.42), inset 0 0 8px rgba(254, 240, 138, 0.25)',
        badgeBg: 'linear-gradient(90deg, rgba(245, 158, 11, 0.28), rgba(217, 119, 6, 0.2))',
        badgeBorder: 'rgba(251, 191, 36, 0.7)',
        badgeColor: '#fbbf24',
        buffBg: 'rgba(245, 158, 11, 0.18)',
        buffBorder: 'rgba(251, 191, 36, 0.45)',
        buffColor: '#fbbf24',
        priceColor: '#fbbf24',
        ctaAffordStyle: {
            bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#111827',
            border: '1px solid #fef08a',
            shadow: '0 4px 14px rgba(245, 158, 11, 0.45)',
        },
    },
}

export function getItemRarityRank(rarity: ItemRarity): number {
    switch (rarity) {
        case 'legendary': return 4
        case 'epic': return 3
        case 'rare': return 2
        case 'common': return 1
        default: return 0
    }
}

export const GAME_ITEMS: GameItem[] = [
    // ==========================================
    // WEAPONS (WARRIOR)
    // ==========================================
    {
        id: 'wpn_warrior_starter',
        name: 'Pedang Latih Kayu',
        slot: 'weapon',
        class_req: 'warrior',
        rarity: 'common',
        cost_xp: 0,
        icon: '🗡️',
        image_url: '/images/items/wpn_warrior_starter.jpg',
        description: 'Pedang latihan dasar untuk pemula Warrior.',
        buff: { type: 'atk_bonus', value: 5, label: '+5 Poin Jawaban Benar' },
        is_starter: true,
    },
    {
        id: 'wpn_iron_broadsword',
        name: 'Iron Broadsword',
        slot: 'weapon',
        class_req: 'warrior',
        rarity: 'rare',
        cost_xp: 250,
        icon: '⚔️',
        image_url: '/images/items/wpn_iron_broadsword.jpg',
        description: 'Bilah baja tempa kokoh yang menambah daya serang duel.',
        buff: { type: 'atk_bonus', value: 12, label: '+12 Poin Jawaban Benar' },
    },
    {
        id: 'wpn_flame_claymore',
        name: 'Crimson Claymore',
        slot: 'weapon',
        class_req: 'warrior',
        rarity: 'epic',
        cost_xp: 600,
        icon: '🔥',
        image_url: '/images/items/wpn_flame_claymore.jpg',
        description: 'Pedang besar beraliran api penakluk rintangan coding berat.',
        buff: { type: 'atk_bonus', value: 20, label: '+20 Poin Jawaban Benar' },
    },
    {
        id: 'wpn_dragon_slayer',
        name: 'Excalibur Dragon Blade',
        slot: 'weapon',
        class_req: 'warrior',
        rarity: 'legendary',
        cost_xp: 1500,
        icon: '⚡',
        image_url: '/images/items/wpn_dragon_slayer.jpg',
        description: 'Senjata pusaka kuno. Menghancurkan soal duel dengan efisiensi maksimal.',
        buff: { type: 'atk_bonus', value: 35, label: '+35 Poin Jawaban Benar' },
    },

    // ==========================================
    // WEAPONS (MAGE)
    // ==========================================
    {
        id: 'wpn_mage_starter',
        name: 'Tongkat Sihir Murid',
        slot: 'weapon',
        class_req: 'mage',
        rarity: 'common',
        cost_xp: 0,
        icon: '🪄',
        image_url: '/images/items/wpn_mage_starter.jpg',
        description: 'Tongkat kayu pemandu mantra dasar desain dan estetika.',
        buff: { type: 'atk_bonus', value: 5, label: '+5 Poin Jawaban Benar' },
        is_starter: true,
    },
    {
        id: 'wpn_crystal_staff',
        name: 'Arcane Crystal Staff',
        slot: 'weapon',
        class_req: 'mage',
        rarity: 'rare',
        cost_xp: 250,
        icon: '🔮',
        image_url: '/images/items/wpn_crystal_staff.jpg',
        description: 'Kristal kuarsa beresonansi energi magis tinggi.',
        buff: { type: 'crit_rate', value: 10, label: '+10% Peluang Serangan Kritis' },
    },
    {
        id: 'wpn_astral_wand',
        name: 'Astral Nebula Wand',
        slot: 'weapon',
        class_req: 'mage',
        rarity: 'epic',
        cost_xp: 600,
        icon: '✨',
        image_url: '/images/items/wpn_mage_starter.jpg',
        description: 'Memanipulasi koordinat kosmik untuk mendobrak skor duel.',
        buff: { type: 'crit_rate', value: 18, label: '+18% Peluang Serangan Kritis' },
    },
    {
        id: 'wpn_archmage_orb',
        name: 'Archmage Genesis Core',
        slot: 'weapon',
        class_req: 'mage',
        rarity: 'legendary',
        cost_xp: 1500,
        icon: '🌌',
        image_url: '/images/items/wpn_crystal_staff.jpg',
        description: 'Inti energi primordial alam semesta untuk ledakan serangan puncak.',
        buff: { type: 'crit_rate', value: 28, label: '+28% Peluang Serangan Kritis' },
    },

    // ==========================================
    // WEAPONS (ARCHER)
    // ==========================================
    {
        id: 'wpn_archer_starter',
        name: 'Busur Pemburu Hutan',
        slot: 'weapon',
        class_req: 'archer',
        rarity: 'common',
        cost_xp: 0,
        icon: '🏹',
        image_url: '/images/items/wpn_archer_starter.jpg',
        description: 'Busur tali rami fleksibel untuk latihan memanah sasaran.',
        buff: { type: 'time_bonus', value: 2, label: '+2 Detik Waktu Ronde' },
        is_starter: true,
    },
    {
        id: 'wpn_recurve_bow',
        name: 'Composite Wind Bow',
        slot: 'weapon',
        class_req: 'archer',
        rarity: 'rare',
        cost_xp: 250,
        icon: '🎯',
        image_url: '/images/items/wpn_archer_starter.jpg',
        description: 'Didesain aerodinamis memberi tempo lebih lama dalam berpikir.',
        buff: { type: 'time_bonus', value: 3, label: '+3 Detik Waktu Ronde' },
    },
    {
        id: 'wpn_shadow_cross',
        name: 'Phantom Crossbow',
        slot: 'weapon',
        class_req: 'archer',
        rarity: 'epic',
        cost_xp: 600,
        icon: '⚡',
        image_url: '/images/items/wpn_celestial_bow.jpg',
        description: 'Tembakan presisi tinggi menembus tebakan tersulit.',
        buff: { type: 'atk_bonus', value: 18, label: '+18 Poin Jawaban Benar' },
    },
    {
        id: 'wpn_celestial_bow',
        name: 'Celestial Artemis Bow',
        slot: 'weapon',
        class_req: 'archer',
        rarity: 'legendary',
        cost_xp: 1500,
        icon: '💫',
        image_url: '/images/items/wpn_celestial_bow.jpg',
        description: 'Anak panah cahaya tanpa meleset sedetik pun.',
        buff: { type: 'crit_rate', value: 25, label: '+25% Peluang Serangan Kritis' },
    },

    // ==========================================
    // WEAPONS (HEALER)
    // ==========================================
    {
        id: 'wpn_healer_starter',
        name: 'Tongkat Doa Kayu',
        slot: 'weapon',
        class_req: 'healer',
        rarity: 'common',
        cost_xp: 0,
        icon: '📿',
        image_url: '/images/items/wpn_radiant_scepter.jpg',
        description: 'Tongkat pelindung sederhana pemancarkan ketenangan batin.',
        buff: { type: 'def_bonus', value: 10, label: '+10% Pengurangan Kerusakan' },
        is_starter: true,
    },
    {
        id: 'wpn_radiant_scepter',
        name: 'Radiant Dawn Scepter',
        slot: 'weapon',
        class_req: 'healer',
        rarity: 'rare',
        cost_xp: 250,
        icon: '🔱',
        image_url: '/images/items/wpn_radiant_scepter.jpg',
        description: 'Menyalurkan aura penyembuh saat menghadapi soal sengit.',
        buff: { type: 'shield_regen', value: 12, label: '+12 Shield Tiap Streak Benar' },
    },
    {
        id: 'wpn_divine_censer',
        name: 'Divine Sanctuary Bell',
        slot: 'weapon',
        class_req: 'healer',
        rarity: 'epic',
        cost_xp: 600,
        icon: '🔔',
        image_url: '/images/items/wpn_radiant_scepter.jpg',
        description: 'Dentang loncur suci meredam semua serangan lawan.',
        buff: { type: 'def_bonus', value: 25, label: '+25% Pengurangan Kerusakan' },
    },
    {
        id: 'wpn_seraph_staff',
        name: 'Seraphim Crown Staff',
        slot: 'weapon',
        class_req: 'healer',
        rarity: 'legendary',
        cost_xp: 1500,
        icon: '🕊️',
        image_url: '/images/items/wpn_radiant_scepter.jpg',
        description: 'Sayap malaikat pelindung tanpa celah kekalahan.',
        buff: { type: 'xp_bonus', value: 25, label: '+25% Bonus XP Duel' },
    },

    // ==========================================
    // HEADGEAR (ALL / ROLE)
    // ==========================================
    {
        id: 'hd_novice_band',
        name: 'Ikat Kepala Pelajar',
        slot: 'head',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 0,
        icon: '🎗️',
        image_url: '/images/items/hd_knight_helm.jpg',
        description: 'Simbol semangat belajar pemula pantang menyerah.',
        buff: { type: 'xp_bonus', value: 5, label: '+5% Bonus XP' },
        is_starter: true,
    },
    {
        id: 'hd_knight_helm',
        name: 'Steel Knight Visor',
        slot: 'head',
        class_req: 'warrior',
        rarity: 'rare',
        cost_xp: 200,
        icon: '🪖',
        image_url: '/images/items/hd_knight_helm.jpg',
        description: 'Pelindung kepala baja kokoh tahan banting.',
        buff: { type: 'def_bonus', value: 12, label: '+12% Pengurangan Kerusakan' },
    },
    {
        id: 'hd_wizard_hat',
        name: 'Starfall Wizard Hat',
        slot: 'head',
        class_req: 'mage',
        rarity: 'rare',
        cost_xp: 200,
        icon: '🧙',
        image_url: '/images/items/hd_knight_helm.jpg',
        description: 'Topi kerucut bertabur bintang peningkat konsentrasi pikiran.',
        buff: { type: 'crit_rate', value: 8, label: '+8% Peluang Serangan Kritis' },
    },
    {
        id: 'hd_scout_hood',
        name: 'Shadow Scout Hood',
        slot: 'head',
        class_req: 'archer',
        rarity: 'rare',
        cost_xp: 200,
        icon: '🥷',
        image_url: '/images/items/hd_knight_helm.jpg',
        description: 'Tudung kamuflase memudahkan membaca celah lawan.',
        buff: { type: 'time_bonus', value: 2, label: '+2 Detik Waktu Ronde' },
    },
    {
        id: 'hd_cleric_circlet',
        name: 'Halo of Blessing',
        slot: 'head',
        class_req: 'healer',
        rarity: 'rare',
        cost_xp: 200,
        icon: '👑',
        image_url: '/images/items/hd_knight_helm.jpg',
        description: 'Mahkota lingkaran cahaya penerang logika.',
        buff: { type: 'shield_regen', value: 10, label: '+10 Shield Tiap Streak Benar' },
    },
    {
        id: 'hd_cyber_goggles',
        name: 'Cybernetic HUD Visor',
        slot: 'head',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 500,
        icon: '🥽',
        image_url: '/images/items/hd_knight_helm.jpg',
        description: 'Tampilan real-time analitis untuk memecahkan kode jawaban seketika.',
        buff: { type: 'atk_bonus', value: 15, label: '+15 Poin Jawaban Benar' },
    },
    {
        id: 'hd_crown_sovereign',
        name: 'Crown of High Scholars',
        slot: 'head',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1200,
        icon: '👑',
        image_url: '/images/items/hd_knight_helm.jpg',
        description: 'Mahkota kehormatan bagi penguasa papan peringkat.',
        buff: { type: 'xp_bonus', value: 20, label: '+20% Bonus XP' },
    },

    // ==========================================
    // ARMOR / OUTFIT
    // ==========================================
    {
        id: 'arm_novice_tunic',
        name: 'Jubah Pelajar Dasar',
        slot: 'armor',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 0,
        icon: '🥋',
        image_url: '/images/items/arm_plate_cuirass.jpg',
        description: 'Pakaian katun sederhana nyaman dipakai belajar seharian.',
        buff: { type: 'def_bonus', value: 5, label: '+5% Pengurangan Kerusakan' },
        is_starter: true,
    },
    {
        id: 'arm_plate_cuirass',
        name: 'Heavy Plate Cuirass',
        slot: 'armor',
        class_req: 'warrior',
        rarity: 'rare',
        cost_xp: 220,
        icon: '🛡️',
        image_url: '/images/items/arm_plate_cuirass.jpg',
        description: 'Baju zirah pelat baja meredam benturan salah tebak.',
        buff: { type: 'def_bonus', value: 15, label: '+15% Pengurangan Kerusakan' },
    },
    {
        id: 'arm_silk_robe',
        name: 'Mystic Silk Vestment',
        slot: 'armor',
        class_req: 'mage',
        rarity: 'rare',
        cost_xp: 220,
        icon: '👘',
        image_url: '/images/items/arm_plate_cuirass.jpg',
        description: 'Tenunan sutra bermuatan aura intan.',
        buff: { type: 'atk_bonus', value: 10, label: '+10 Poin Jawaban Benar' },
    },
    {
        id: 'arm_leather_tunic',
        name: 'Ranger Leather Tunic',
        slot: 'armor',
        class_req: 'archer',
        rarity: 'rare',
        cost_xp: 220,
        icon: '🧥',
        image_url: '/images/items/arm_plate_cuirass.jpg',
        description: 'Kulit lentur membuat pergerakan tangan sangat gesit.',
        buff: { type: 'time_bonus', value: 2, label: '+2 Detik Waktu Ronde' },
    },
    {
        id: 'arm_guardian_coat',
        name: 'Aegis Guardian Mantle',
        slot: 'armor',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 550,
        icon: '🛡️',
        image_url: '/images/items/arm_plate_cuirass.jpg',
        description: 'Mantel pelindung legendaris peredam kegagalan.',
        buff: { type: 'def_bonus', value: 22, label: '+22% Pengurangan Kerusakan' },
    },
    {
        id: 'arm_draconic_regalia',
        name: 'Draconic Emperor Armor',
        slot: 'armor',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1400,
        icon: '🐉',
        image_url: '/images/items/arm_plate_cuirass.jpg',
        description: 'Sisik naga purba tak tertembus kegugupan saat bertanding.',
        buff: { type: 'atk_bonus', value: 25, label: '+25 Poin Jawaban Benar' },
    },

    // ==========================================
    // ACCESSORY / AURA
    // ==========================================
    {
        id: 'acc_luck_ring',
        name: 'Cincin Tembaga Keberuntungan',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 0,
        icon: '💍',
        image_url: '/images/items/acc_chrono_pendant.jpg',
        description: 'Aksesoris permulaan pembawa keberuntungan duel.',
        buff: { type: 'crit_rate', value: 5, label: '+5% Peluang Serangan Kritis' },
        is_starter: true,
    },
    {
        id: 'acc_flame_aura',
        name: 'Blazing Spirit Aura',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'rare',
        cost_xp: 250,
        icon: '🔥',
        image_url: '/images/items/acc_valkyrie_wings.jpg',
        description: 'Kobaran api tekad memacu serangan bertubi-tubi.',
        buff: { type: 'atk_bonus', value: 10, label: '+10 Poin Jawaban Benar' },
    },
    {
        id: 'acc_chrono_pendant',
        name: 'Chrono Time Pendant',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 650,
        icon: '⏳',
        image_url: '/images/items/acc_chrono_pendant.jpg',
        description: 'Mengendalikan aliran waktu ronde tebak kata.',
        buff: { type: 'time_bonus', value: 3, label: '+3 Detik Waktu Ronde' },
    },
    {
        id: 'acc_valkyrie_wings',
        name: 'Valkyrie Ascendant Wings',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1600,
        icon: '🪽',
        image_url: '/images/items/acc_valkyrie_wings.jpg',
        description: 'Sayap pahlawan tak terkalahkan membawa kemenangan mutlak.',
        buff: { type: 'xp_bonus', value: 30, label: '+30% Bonus XP Duel' },
    },
]

export function getItemById(id: string): GameItem | undefined {
    return GAME_ITEMS.find(item => item.id === id)
}

export function getStarterItemsForClass(cls: AvatarClass): GameItem[] {
    return GAME_ITEMS.filter(item => {
        if (!item.is_starter) return false
        return item.class_req === cls || item.class_req === 'all'
    })
}

export function getItemsBySlot(slot: ItemSlot): GameItem[] {
    return GAME_ITEMS.filter(item => item.slot === slot)
}

export function getItemsForClass(cls: AvatarClass): GameItem[] {
    return GAME_ITEMS.filter(item => item.class_req === 'all' || item.class_req === cls)
}
