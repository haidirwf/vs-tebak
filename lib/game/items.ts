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
        cardBg: 'var(--rarity-card-bg-common)',
        cardBorder: 'var(--rarity-card-border-common)',
        cardShadow: 'var(--rarity-card-shadow-common)',
        cardHoverShadow: 'var(--rarity-card-hover-shadow-common)',
        topBeam: null,
        sheenOverlay: null,
        pedestalBg: 'var(--rarity-pedestal-bg-common)',
        pedestalBorder: 'var(--rarity-pedestal-border-common)',
        pedestalShadow: 'var(--rarity-pedestal-shadow-common)',
        badgeBg: 'var(--rarity-badge-bg-common)',
        badgeBorder: 'var(--rarity-badge-border-common)',
        badgeColor: 'var(--rarity-badge-color-common)',
        buffBg: 'var(--rarity-buff-bg-common)',
        buffBorder: 'var(--rarity-buff-border-common)',
        buffColor: 'var(--rarity-buff-color-common)',
        priceColor: 'var(--rarity-price-color-common)',
    },
    rare: {
        label: 'Rare',
        labelId: 'Langka',
        stars: '★★',
        tier: 2,
        color: 'var(--accent-cyan)',
        border: 'var(--accent-cyan-border)',
        bg: 'var(--accent-cyan-bg)',
        cardBg: 'var(--rarity-card-bg-rare)',
        cardBorder: 'var(--rarity-card-border-rare)',
        cardShadow: 'var(--rarity-card-shadow-rare)',
        cardHoverShadow: 'var(--rarity-card-hover-shadow-rare)',
        topBeam: 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.9) 50%, transparent 100%)',
        sheenOverlay: null,
        pedestalBg: 'var(--rarity-pedestal-bg-rare)',
        pedestalBorder: 'var(--rarity-pedestal-border-rare)',
        pedestalShadow: 'var(--rarity-pedestal-shadow-rare)',
        badgeBg: 'var(--rarity-badge-bg-rare)',
        badgeBorder: 'var(--rarity-badge-border-rare)',
        badgeColor: 'var(--rarity-badge-color-rare)',
        buffBg: 'var(--rarity-buff-bg-rare)',
        buffBorder: 'var(--rarity-buff-border-rare)',
        buffColor: 'var(--rarity-buff-color-rare)',
        priceColor: 'var(--rarity-price-color-rare)',
    },
    epic: {
        label: 'Epic',
        labelId: 'Epik',
        stars: '★★★',
        tier: 3,
        color: 'var(--accent-purple)',
        border: 'var(--accent-purple-border)',
        bg: 'var(--accent-purple-bg)',
        cardBg: 'var(--rarity-card-bg-epic)',
        cardBorder: 'var(--rarity-card-border-epic)',
        cardShadow: 'var(--rarity-card-shadow-epic)',
        cardHoverShadow: 'var(--rarity-card-hover-shadow-epic)',
        topBeam: 'linear-gradient(90deg, transparent 0%, rgba(192, 132, 252, 1) 50%, transparent 100%)',
        sheenOverlay: 'radial-gradient(ellipse at 80% 0%, rgba(192, 132, 252, 0.14) 0%, transparent 70%)',
        pedestalBg: 'var(--rarity-pedestal-bg-epic)',
        pedestalBorder: 'var(--rarity-pedestal-border-epic)',
        pedestalShadow: 'var(--rarity-pedestal-shadow-epic)',
        badgeBg: 'var(--rarity-badge-bg-epic)',
        badgeBorder: 'var(--rarity-badge-border-epic)',
        badgeColor: 'var(--rarity-badge-color-epic)',
        buffBg: 'var(--rarity-buff-bg-epic)',
        buffBorder: 'var(--rarity-buff-border-epic)',
        buffColor: 'var(--rarity-buff-color-epic)',
        priceColor: 'var(--rarity-price-color-epic)',
    },
    legendary: {
        label: 'Legendary',
        labelId: 'Legendaris',
        stars: '★★★★',
        tier: 4,
        color: 'var(--color-gold-text)',
        border: 'var(--accent-gold-border)',
        bg: 'var(--accent-gold-bg)',
        cardBg: 'var(--rarity-card-bg-legendary)',
        cardBorder: 'var(--rarity-card-border-legendary)',
        cardShadow: 'var(--rarity-card-shadow-legendary)',
        cardHoverShadow: 'var(--rarity-card-hover-shadow-legendary)',
        topBeam: 'linear-gradient(90deg, transparent 0%, #f59e0b 25%, #fef08a 50%, #f59e0b 75%, transparent 100%)',
        sheenOverlay: 'radial-gradient(ellipse at 85% 0%, rgba(251, 191, 36, 0.22) 0%, transparent 65%)',
        pedestalBg: 'var(--rarity-pedestal-bg-legendary)',
        pedestalBorder: 'var(--rarity-pedestal-border-legendary)',
        pedestalShadow: 'var(--rarity-pedestal-shadow-legendary)',
        badgeBg: 'var(--rarity-badge-bg-legendary)',
        badgeBorder: 'var(--rarity-badge-border-legendary)',
        badgeColor: 'var(--rarity-badge-color-legendary)',
        buffBg: 'var(--rarity-buff-bg-legendary)',
        buffBorder: 'var(--rarity-buff-border-legendary)',
        buffColor: 'var(--rarity-buff-color-legendary)',
        priceColor: 'var(--rarity-price-color-legendary)',
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
        image_url: '/images/items/wpn_warrior_starter.webp',
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
        image_url: '/images/items/wpn_iron_broadsword.webp',
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
        image_url: '/images/items/wpn_flame_claymore.webp',
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
        image_url: '/images/items/wpn_dragon_slayer.webp',
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
        image_url: '/images/items/wpn_mage_starter.webp',
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
        image_url: '/images/items/wpn_crystal_staff.webp',
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
        image_url: '/images/items/wpn_mage_starter.webp',
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
        image_url: '/images/items/wpn_archmage_orb.webp',
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
        image_url: '/images/items/wpn_archer_starter.webp',
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
        image_url: '/images/items/wpn_archer_starter.webp',
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
        image_url: '/images/items/wpn_celestial_bow.webp',
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
        image_url: '/images/items/wpn_celestial_bow.webp',
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
        image_url: '/images/items/wpn_radiant_scepter.webp',
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
        image_url: '/images/items/wpn_radiant_scepter.webp',
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
        image_url: '/images/items/wpn_radiant_scepter.webp',
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
        image_url: '/images/items/wpn_radiant_scepter.webp',
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
        image_url: '/images/items/hd_knight_helm.webp',
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
        image_url: '/images/items/hd_knight_helm.webp',
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
        image_url: '/images/items/hd_knight_helm.webp',
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
        image_url: '/images/items/hd_knight_helm.webp',
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
        image_url: '/images/items/hd_knight_helm.webp',
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
        image_url: '/images/items/hd_knight_helm.webp',
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
        image_url: '/images/items/hd_knight_helm.webp',
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
        image_url: '/images/items/arm_plate_cuirass.webp',
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
        image_url: '/images/items/arm_plate_cuirass.webp',
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
        image_url: '/images/items/arm_plate_cuirass.webp',
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
        image_url: '/images/items/arm_plate_cuirass.webp',
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
        image_url: '/images/items/arm_plate_cuirass.webp',
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
        image_url: '/images/items/arm_plate_cuirass.webp',
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
        image_url: '/images/items/acc_chrono_pendant.webp',
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
        image_url: '/images/items/acc_valkyrie_wings.webp',
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
        image_url: '/images/items/acc_chrono_pendant.webp',
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
        image_url: '/images/items/acc_valkyrie_wings.webp',
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
