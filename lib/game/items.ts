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
    // 1. WEAPONS — COMMON (7 Items)
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
        id: 'wpn_healer_starter',
        name: 'Tongkat Doa Kayu',
        slot: 'weapon',
        class_req: 'healer',
        rarity: 'common',
        cost_xp: 0,
        icon: '📿',
        image_url: '/images/items/wpn_healer_starter.webp',
        description: 'Tongkat pelindung sederhana pemancarkan ketenangan batin.',
        buff: { type: 'def_bonus', value: 10, label: '+10% Pengurangan Kerusakan' },
        is_starter: true,
    },
    {
        id: 'wpn_novice_dagger',
        name: 'Belati Latih Gesit',
        slot: 'weapon',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 60,
        icon: '🗡️',
        image_url: '/images/items/wpn_novice_dagger.webp',
        description: 'Belati ringan berbilah tumpul untuk melatih refleks cepat.',
        buff: { type: 'atk_bonus', value: 6, label: '+6 Poin Jawaban Benar' },
    },
    {
        id: 'wpn_scholars_quill',
        name: 'Pena Kaligrafi Murid',
        slot: 'weapon',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 75,
        icon: '✒️',
        image_url: '/images/items/wpn_scholars_quill.webp',
        description: 'Pena berujung tembaga untuk mencatat rumus dan kosakata.',
        buff: { type: 'xp_bonus', value: 6, label: '+6% Bonus XP' },
    },
    {
        id: 'wpn_apprentice_wand',
        name: 'Tongkat Resonansi Pemula',
        slot: 'weapon',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 80,
        icon: '🪄',
        image_url: '/images/items/wpn_apprentice_wand.webp',
        description: 'Tongkat kayu pemandu frekuensi fokus saat menjawab.',
        buff: { type: 'time_bonus', value: 1, label: '+1 Detik Waktu Ronde' },
    },

    // ==========================================
    // 1. WEAPONS — RARE (8 Items)
    // ==========================================
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
        id: 'wpn_recurve_bow',
        name: 'Composite Wind Bow',
        slot: 'weapon',
        class_req: 'archer',
        rarity: 'rare',
        cost_xp: 250,
        icon: '🎯',
        image_url: '/images/items/wpn_recurve_bow.webp',
        description: 'Didesain aerodinamis memberi tempo lebih lama dalam berpikir.',
        buff: { type: 'time_bonus', value: 3, label: '+3 Detik Waktu Ronde' },
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
        id: 'wpn_runic_blade',
        name: 'Runic Steel Shortsword',
        slot: 'weapon',
        class_req: 'all',
        rarity: 'rare',
        cost_xp: 280,
        icon: '⚔️',
        image_url: '/images/items/wpn_runic_blade.webp',
        description: 'Pedang pendek berukirkan rune pengetahuan kuno.',
        buff: { type: 'atk_bonus', value: 14, label: '+14 Poin Jawaban Benar' },
    },
    {
        id: 'wpn_storm_bow',
        name: 'Thunder Gale Longbow',
        slot: 'weapon',
        class_req: 'archer',
        rarity: 'rare',
        cost_xp: 290,
        icon: '🏹',
        image_url: '/images/items/wpn_storm_bow.webp',
        description: 'Busur bersenar kawat perak pelepas panah halilintar.',
        buff: { type: 'crit_rate', value: 12, label: '+12% Peluang Serangan Kritis' },
    },
    {
        id: 'wpn_frost_codex',
        name: 'Frostbite Arcane Grimoire',
        slot: 'weapon',
        class_req: 'mage',
        rarity: 'rare',
        cost_xp: 270,
        icon: '📖',
        image_url: '/images/items/wpn_frost_codex.webp',
        description: 'Buku mantra berselimut kristal es pembeku waktu soal.',
        buff: { type: 'time_bonus', value: 3, label: '+3 Detik Waktu Ronde' },
    },
    {
        id: 'wpn_blessed_mace',
        name: 'Mace of Dawn Luminary',
        slot: 'weapon',
        class_req: 'healer',
        rarity: 'rare',
        cost_xp: 280,
        icon: '🔨',
        image_url: '/images/items/wpn_blessed_mace.webp',
        description: 'Gada suci pemecah keraguan dengan denyut pemulihan perisai.',
        buff: { type: 'shield_regen', value: 14, label: '+14 Shield Tiap Streak Benar' },
    },

    // ==========================================
    // 1. WEAPONS — EPIC (8 Items)
    // ==========================================
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
        id: 'wpn_astral_wand',
        name: 'Astral Nebula Wand',
        slot: 'weapon',
        class_req: 'mage',
        rarity: 'epic',
        cost_xp: 600,
        icon: '✨',
        image_url: '/images/items/wpn_astral_wand.webp',
        description: 'Memanipulasi koordinat kosmik untuk mendobrak skor duel.',
        buff: { type: 'crit_rate', value: 18, label: '+18% Peluang Serangan Kritis' },
    },
    {
        id: 'wpn_shadow_cross',
        name: 'Phantom Crossbow',
        slot: 'weapon',
        class_req: 'archer',
        rarity: 'epic',
        cost_xp: 600,
        icon: '⚡',
        image_url: '/images/items/wpn_shadow_cross.webp',
        description: 'Tembakan presisi tinggi menembus tebakan tersulit.',
        buff: { type: 'atk_bonus', value: 18, label: '+18 Poin Jawaban Benar' },
    },
    {
        id: 'wpn_divine_censer',
        name: 'Divine Sanctuary Bell',
        slot: 'weapon',
        class_req: 'healer',
        rarity: 'epic',
        cost_xp: 600,
        icon: '🔔',
        image_url: '/images/items/wpn_divine_censer.webp',
        description: 'Dentang lonceng suci meredam semua serangan lawan.',
        buff: { type: 'def_bonus', value: 25, label: '+25% Pengurangan Kerusakan' },
    },
    {
        id: 'wpn_void_scythe',
        name: 'Void Reaver Scythe',
        slot: 'weapon',
        class_req: 'warrior',
        rarity: 'epic',
        cost_xp: 650,
        icon: '⛏️',
        image_url: '/images/items/wpn_void_scythe.webp',
        description: 'Sabit energi bayangan pemotong komplikasi soal seketika.',
        buff: { type: 'atk_bonus', value: 24, label: '+24 Poin Jawaban Benar' },
    },
    {
        id: 'wpn_plasma_crossbow',
        name: 'Hyperion Plasma Arbalest',
        slot: 'weapon',
        class_req: 'archer',
        rarity: 'epic',
        cost_xp: 680,
        icon: '⚡',
        image_url: '/images/items/wpn_plasma_crossbow.webp',
        description: 'Busur silang berpeluru plasma dengan hentakan kritis tinggi.',
        buff: { type: 'crit_rate', value: 20, label: '+20% Peluang Serangan Kritis' },
    },
    {
        id: 'wpn_celestial_prism',
        name: 'Prism of Infinite Nebula',
        slot: 'weapon',
        class_req: 'mage',
        rarity: 'epic',
        cost_xp: 700,
        icon: '💎',
        image_url: '/images/items/wpn_celestial_prism.webp',
        description: 'Prisma berkilau pembias gelombang sihir kosmik multi-warna.',
        buff: { type: 'atk_bonus', value: 22, label: '+22 Poin Jawaban Benar' },
    },
    {
        id: 'wpn_aegis_flail',
        name: 'Holy Aegis Radiant Flail',
        slot: 'weapon',
        class_req: 'healer',
        rarity: 'epic',
        cost_xp: 620,
        icon: '⛓️',
        image_url: '/images/items/wpn_aegis_flail.webp',
        description: 'Senjata rantai berlonceng suci penepis kegagalan tebak.',
        buff: { type: 'def_bonus', value: 24, label: '+24% Pengurangan Kerusakan' },
    },

    // ==========================================
    // 1. WEAPONS — LEGENDARY (7 Items)
    // ==========================================
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
    {
        id: 'wpn_seraph_staff',
        name: 'Seraphim Crown Staff',
        slot: 'weapon',
        class_req: 'healer',
        rarity: 'legendary',
        cost_xp: 1500,
        icon: '🕊️',
        image_url: '/images/items/wpn_seraph_staff.webp',
        description: 'Sayap malaikat pelindung tanpa celah kekalahan.',
        buff: { type: 'xp_bonus', value: 25, label: '+25% Bonus XP Duel' },
    },
    {
        id: 'wpn_chronos_blade',
        name: 'Blade of Temporal Singularity',
        slot: 'weapon',
        class_req: 'warrior',
        rarity: 'legendary',
        cost_xp: 1600,
        icon: '⏳',
        image_url: '/images/items/wpn_chronos_blade.webp',
        description: 'Pedang pengontrol dimensi waktu penembus skor batas tertinggi.',
        buff: { type: 'atk_bonus', value: 40, label: '+40 Poin Jawaban Benar' },
    },
    {
        id: 'wpn_supernova_cannon',
        name: 'Solar Flare Hand Cannon',
        slot: 'weapon',
        class_req: 'archer',
        rarity: 'legendary',
        cost_xp: 1650,
        icon: '💥',
        image_url: '/images/items/wpn_supernova_cannon.webp',
        description: 'Artileri mini tenaga supernova dengan daya ledak kritis dahsyat.',
        buff: { type: 'crit_rate', value: 32, label: '+32% Peluang Serangan Kritis' },
    },
    {
        id: 'wpn_astral_staff_eternity',
        name: 'Scepter of Eternal Cosmos',
        slot: 'weapon',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1700,
        icon: '🌌',
        image_url: '/images/items/wpn_astral_staff_eternity.webp',
        description: 'Tongkat penguasa galaksi yang melipatgandakan perolehan XP duel.',
        buff: { type: 'xp_bonus', value: 35, label: '+35% Bonus XP Duel' },
    },

    // ==========================================
    // 2. HEADGEAR — COMMON (4 Items)
    // ==========================================
    {
        id: 'hd_novice_band',
        name: 'Ikat Kepala Pelajar',
        slot: 'head',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 0,
        icon: '🎗️',
        image_url: '/images/items/hd_novice_band.webp',
        description: 'Simbol semangat belajar pemula pantang menyerah.',
        buff: { type: 'xp_bonus', value: 5, label: '+5% Bonus XP' },
        is_starter: true,
    },
    {
        id: 'hd_straw_hat',
        name: 'Topi Jerami Penjelajah',
        slot: 'head',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 50,
        icon: '👒',
        image_url: '/images/items/hd_straw_hat.webp',
        description: 'Topi jerami ringan pelindung dari kepanikan duel maraton.',
        buff: { type: 'time_bonus', value: 1, label: '+1 Detik Waktu Ronde' },
    },
    {
        id: 'hd_scholar_cap',
        name: 'Toga Sarjana Muda',
        slot: 'head',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 70,
        icon: '🎓',
        image_url: '/images/items/hd_scholar_cap.webp',
        description: 'Toga hitam kebanggaan pelajar rajin pengumpul wawasan.',
        buff: { type: 'xp_bonus', value: 6, label: '+6% Bonus XP' },
    },
    {
        id: 'hd_leather_eyepatch',
        name: 'Eyepatch Fokus Tempur',
        slot: 'head',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 65,
        icon: '👁️',
        image_url: '/images/items/hd_leather_eyepatch.webp',
        description: 'Penutup mata penajam konsentrasi dan insting menebak.',
        buff: { type: 'atk_bonus', value: 5, label: '+5 Poin Jawaban Benar' },
    },

    // ==========================================
    // 2. HEADGEAR — RARE (6 Items)
    // ==========================================
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
        image_url: '/images/items/hd_wizard_hat.webp',
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
        image_url: '/images/items/hd_scout_hood.webp',
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
        image_url: '/images/items/hd_cleric_circlet.webp',
        description: 'Mahkota lingkaran cahaya penerang logika.',
        buff: { type: 'shield_regen', value: 10, label: '+10 Shield Tiap Streak Benar' },
    },
    {
        id: 'hd_tactical_beret',
        name: 'Beret Komando Taktis',
        slot: 'head',
        class_req: 'all',
        rarity: 'rare',
        cost_xp: 220,
        icon: '🧢',
        image_url: '/images/items/hd_tactical_beret.webp',
        description: 'Baret militer penempa disiplin membaca cepat.',
        buff: { type: 'atk_bonus', value: 11, label: '+11 Poin Jawaban Benar' },
    },
    {
        id: 'hd_silver_laurel',
        name: 'Mahkota Daun Perak',
        slot: 'head',
        class_req: 'all',
        rarity: 'rare',
        cost_xp: 240,
        icon: '🌿',
        image_url: '/images/items/hd_silver_laurel.webp',
        description: 'Rangkaian daun perak kuno lambang kecemerlangan akal.',
        buff: { type: 'xp_bonus', value: 12, label: '+12% Bonus XP' },
    },

    // ==========================================
    // 2. HEADGEAR — EPIC (4 Items)
    // ==========================================
    {
        id: 'hd_cyber_goggles',
        name: 'Cybernetic HUD Visor',
        slot: 'head',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 500,
        icon: '🥽',
        image_url: '/images/items/hd_cyber_goggles.webp',
        description: 'Tampilan real-time analitis untuk memecahkan kode jawaban seketika.',
        buff: { type: 'atk_bonus', value: 15, label: '+15 Poin Jawaban Benar' },
    },
    {
        id: 'hd_valkyrie_helm',
        name: 'Valkyrie Winged Diadem',
        slot: 'head',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 540,
        icon: '🪽',
        image_url: '/images/items/hd_valkyrie_helm.webp',
        description: 'Tiara bersayap perak peningkat intuisi serangan kritis.',
        buff: { type: 'crit_rate', value: 15, label: '+15% Peluang Serangan Kritis' },
    },
    {
        id: 'hd_shadow_mask',
        name: 'Phantom Veil of Anubis',
        slot: 'head',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 520,
        icon: '🎭',
        image_url: '/images/items/hd_shadow_mask.webp',
        description: 'Topeng bayangan mistis penangkal kepanikan saat waktu menipis.',
        buff: { type: 'def_bonus', value: 20, label: '+20% Pengurangan Kerusakan' },
    },
    {
        id: 'hd_chrono_monocle',
        name: 'Chrono Chronometer Monocle',
        slot: 'head',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 560,
        icon: '🧐',
        image_url: '/images/items/hd_chrono_monocle.webp',
        description: 'Lensa kristal analitik penyingkap petunjuk dalam sekejap.',
        buff: { type: 'time_bonus', value: 3, label: '+3 Detik Waktu Ronde' },
    },

    // ==========================================
    // 2. HEADGEAR — LEGENDARY (4 Items)
    // ==========================================
    {
        id: 'hd_crown_sovereign',
        name: 'Crown of High Scholars',
        slot: 'head',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1200,
        icon: '👑',
        image_url: '/images/items/hd_crown_sovereign.webp',
        description: 'Mahkota kehormatan bagi penguasa papan peringkat.',
        buff: { type: 'xp_bonus', value: 20, label: '+20% Bonus XP' },
    },
    {
        id: 'hd_emperor_crown',
        name: 'Imperial Crown of Absolute Wisdom',
        slot: 'head',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1350,
        icon: '👑',
        image_url: '/images/items/hd_emperor_crown.webp',
        description: 'Mahkota kaisar ilmuwan dengan aura dominasi duel tak terbantahkan.',
        buff: { type: 'atk_bonus', value: 28, label: '+28 Poin Jawaban Benar' },
    },
    {
        id: 'hd_celestial_halo',
        name: 'Halo of Ascended Seraph',
        slot: 'head',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1400,
        icon: '✨',
        image_url: '/images/items/hd_celestial_halo.webp',
        description: 'Cincin cahaya suci para dewa yang terus memulihkan pelindung diri.',
        buff: { type: 'shield_regen', value: 20, label: '+20 Shield Tiap Streak Benar' },
    },
    {
        id: 'hd_dragon_crest',
        name: 'Horned Crest of the Dragon King',
        slot: 'head',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1450,
        icon: '🐲',
        image_url: '/images/items/hd_dragon_crest.webp',
        description: 'Mahkota tanduk naga purba dengan tatapan mengintimidasi lawan.',
        buff: { type: 'crit_rate', value: 24, label: '+24% Peluang Serangan Kritis' },
    },

    // ==========================================
    // 3. ARMOR — COMMON (4 Items)
    // ==========================================
    {
        id: 'arm_novice_tunic',
        name: 'Jubah Pelajar Dasar',
        slot: 'armor',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 0,
        icon: '🥋',
        image_url: '/images/items/arm_novice_tunic.webp',
        description: 'Pakaian katun sederhana nyaman dipakai belajar seharian.',
        buff: { type: 'def_bonus', value: 5, label: '+5% Pengurangan Kerusakan' },
        is_starter: true,
    },
    {
        id: 'arm_linen_vest',
        name: 'Rompi Rami Penjelajah',
        slot: 'armor',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 55,
        icon: '🦺',
        image_url: '/images/items/arm_linen_vest.webp',
        description: 'Rompi berkantong banyak untuk menyimpan catatan modul.',
        buff: { type: 'time_bonus', value: 1, label: '+1 Detik Waktu Ronde' },
    },
    {
        id: 'arm_padded_jacket',
        name: 'Jaket Busa Pelindung',
        slot: 'armor',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 65,
        icon: '🧥',
        image_url: '/images/items/arm_padded_jacket.webp',
        description: 'Jaket tebal peredam benturan mental saat tebakan meleset.',
        buff: { type: 'def_bonus', value: 6, label: '+6% Pengurangan Kerusakan' },
    },
    {
        id: 'arm_apprentice_robe',
        name: 'Jubah Magang Hitam',
        slot: 'armor',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 75,
        icon: '🥋',
        image_url: '/images/items/arm_apprentice_robe.webp',
        description: 'Jubah katun gelap yang menyamarkan kegugupan pemula.',
        buff: { type: 'atk_bonus', value: 6, label: '+6 Poin Jawaban Benar' },
    },

    // ==========================================
    // 3. ARMOR — RARE (5 Items)
    // ==========================================
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
        image_url: '/images/items/arm_silk_robe.webp',
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
        image_url: '/images/items/arm_leather_tunic.webp',
        description: 'Kulit lentur membuat pergerakan tangan sangat gesit.',
        buff: { type: 'time_bonus', value: 2, label: '+2 Detik Waktu Ronde' },
    },
    {
        id: 'arm_cleric_vestment',
        name: 'Vestment of Blessed Hope',
        slot: 'armor',
        class_req: 'healer',
        rarity: 'rare',
        cost_xp: 230,
        icon: '🥻',
        image_url: '/images/items/arm_cleric_vestment.webp',
        description: 'Jubah putih keemasan pengokoh pertahanan barisan.',
        buff: { type: 'shield_regen', value: 12, label: '+12 Shield Tiap Streak Benar' },
    },
    {
        id: 'arm_chainmail_hauberk',
        name: 'Reinforced Chainmail Hauberk',
        slot: 'armor',
        class_req: 'all',
        rarity: 'rare',
        cost_xp: 250,
        icon: '🛡️',
        image_url: '/images/items/arm_chainmail_hauberk.webp',
        description: 'Baju zirah rajut kawat baja ringan dan fleksibel.',
        buff: { type: 'def_bonus', value: 16, label: '+16% Pengurangan Kerusakan' },
    },

    // ==========================================
    // 3. ARMOR — EPIC (4 Items)
    // ==========================================
    {
        id: 'arm_guardian_coat',
        name: 'Aegis Guardian Mantle',
        slot: 'armor',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 550,
        icon: '🛡️',
        image_url: '/images/items/arm_guardian_coat.webp',
        description: 'Mantel pelindung legendaris peredam kegagalan.',
        buff: { type: 'def_bonus', value: 22, label: '+22% Pengurangan Kerusakan' },
    },
    {
        id: 'arm_shadow_trench',
        name: 'Nightfall Shadow Trenchcoat',
        slot: 'armor',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 580,
        icon: '🧥',
        image_url: '/images/items/arm_shadow_trench.webp',
        description: 'Mantel panjang berserat bayangan peningkat peluang kritis.',
        buff: { type: 'crit_rate', value: 16, label: '+16% Peluang Serangan Kritis' },
    },
    {
        id: 'arm_phoenix_robes',
        name: 'Robes of Rebirth Phoenix',
        slot: 'armor',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 620,
        icon: '🔥',
        image_url: '/images/items/arm_phoenix_robes.webp',
        description: 'Jubah sutra berbulu burung api pembakar semangat pantang mundur.',
        buff: { type: 'atk_bonus', value: 18, label: '+18 Poin Jawaban Benar' },
    },
    {
        id: 'arm_quantum_suit',
        name: 'Quantum Nano-Weave Suit',
        slot: 'armor',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 600,
        icon: '🥋',
        image_url: '/images/items/arm_quantum_suit.webp',
        description: 'Baju berteknologi nano penstabil ritme pengambilan keputusan.',
        buff: { type: 'time_bonus', value: 3, label: '+3 Detik Waktu Ronde' },
    },

    // ==========================================
    // 3. ARMOR — LEGENDARY (4 Items)
    // ==========================================
    {
        id: 'arm_draconic_regalia',
        name: 'Draconic Emperor Armor',
        slot: 'armor',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1400,
        icon: '🐉',
        image_url: '/images/items/arm_draconic_regalia.webp',
        description: 'Sisik naga purba tak tertembus kegugupan saat bertanding.',
        buff: { type: 'atk_bonus', value: 25, label: '+25 Poin Jawaban Benar' },
    },
    {
        id: 'arm_valkyrie_cuirass',
        name: 'Valkyrie Platinum Aegisplate',
        slot: 'armor',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1500,
        icon: '🛡️',
        image_url: '/images/items/arm_valkyrie_cuirass.webp',
        description: 'Zirah platina prajurit langit penahan gempuran skor lawan.',
        buff: { type: 'def_bonus', value: 32, label: '+32% Pengurangan Kerusakan' },
    },
    {
        id: 'arm_cosmic_robes',
        name: 'Vestments of Void Sovereignty',
        slot: 'armor',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1550,
        icon: '🌌',
        image_url: '/images/items/arm_cosmic_robes.webp',
        description: 'Jubah tenunan debu galaksi pelipatganda perolehan ilmu dan poin XP.',
        buff: { type: 'xp_bonus', value: 28, label: '+28% Bonus XP' },
    },
    {
        id: 'arm_solar_chitin',
        name: 'Solar Flare Paladin Carapace',
        slot: 'armor',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1600,
        icon: '☀️',
        image_url: '/images/items/arm_solar_chitin.webp',
        description: 'Cangkang kristal matahari pemantul serangan lawan menjadi daya serang balik.',
        buff: { type: 'atk_bonus', value: 30, label: '+30 Poin Jawaban Benar' },
    },

    // ==========================================
    // 4. ACCESSORY — COMMON (4 Items)
    // ==========================================
    {
        id: 'acc_luck_ring',
        name: 'Cincin Tembaga Keberuntungan',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 0,
        icon: '💍',
        image_url: '/images/items/acc_luck_ring.webp',
        description: 'Aksesoris permulaan pembawa keberuntungan duel.',
        buff: { type: 'crit_rate', value: 5, label: '+5% Peluang Serangan Kritis' },
        is_starter: true,
    },
    {
        id: 'acc_leather_bracelet',
        name: 'Gelang Kulit Ketekunan',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 50,
        icon: '📿',
        image_url: '/images/items/acc_leather_bracelet.webp',
        description: 'Gelang anyam sederhana pengingat komitmen berlatih setiap hari.',
        buff: { type: 'xp_bonus', value: 5, label: '+5% Bonus XP' },
    },
    {
        id: 'acc_wooden_talisman',
        name: 'Jimat Kayu Pengingat',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 60,
        icon: '🪵',
        image_url: '/images/items/acc_wooden_talisman.webp',
        description: 'Ukiran kayu pohon oak penenang detak jantung saat duel tegang.',
        buff: { type: 'def_bonus', value: 5, label: '+5% Pengurangan Kerusakan' },
    },
    {
        id: 'acc_bronze_compass',
        name: 'Kompas Perunggu Petunjuk',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'common',
        cost_xp: 70,
        icon: '🧭',
        image_url: '/images/items/acc_bronze_compass.webp',
        description: 'Kompas saku pengarah logika menuju pilihan jawaban akurat.',
        buff: { type: 'time_bonus', value: 1, label: '+1 Detik Waktu Ronde' },
    },

    // ==========================================
    // 4. ACCESSORY — RARE (4 Items)
    // ==========================================
    {
        id: 'acc_flame_aura',
        name: 'Blazing Spirit Aura',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'rare',
        cost_xp: 250,
        icon: '🔥',
        image_url: '/images/items/acc_flame_aura.webp',
        description: 'Kobaran api tekad memacu serangan bertubi-tubi.',
        buff: { type: 'atk_bonus', value: 10, label: '+10 Poin Jawaban Benar' },
    },
    {
        id: 'acc_ice_pendant',
        name: 'Glacial Frost Locket',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'rare',
        cost_xp: 240,
        icon: '❄️',
        image_url: '/images/items/acc_ice_pendant.webp',
        description: 'Liontin kristal salju penyejuk pikiran di saat genting.',
        buff: { type: 'time_bonus', value: 2, label: '+2 Detik Waktu Ronde' },
    },
    {
        id: 'acc_thunder_bangle',
        name: 'Stormcaller Lightning Bangle',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'rare',
        cost_xp: 260,
        icon: '⚡',
        image_url: '/images/items/acc_thunder_bangle.webp',
        description: 'Gelang logam beraliran listrik statis pelecut intuisi instan.',
        buff: { type: 'crit_rate', value: 12, label: '+12% Peluang Serangan Kritis' },
    },
    {
        id: 'acc_emerald_brooch',
        name: 'Emerald Verdant Brooch',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'rare',
        cost_xp: 250,
        icon: '🟢',
        image_url: '/images/items/acc_emerald_brooch.webp',
        description: 'Bros zamrud pembawa aliran energi pemulih tameng diri.',
        buff: { type: 'shield_regen', value: 12, label: '+12 Shield Tiap Streak Benar' },
    },

    // ==========================================
    // 4. ACCESSORY — EPIC (4 Items)
    // ==========================================
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
        id: 'acc_phoenix_feather',
        name: 'Sacred Phoenix Feather Quill',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 620,
        icon: '🪶',
        image_url: '/images/items/acc_phoenix_feather.webp',
        description: 'Bulu burung phoenix pemantik lonjakan skor serangan beruntun.',
        buff: { type: 'atk_bonus', value: 16, label: '+16 Poin Jawaban Benar' },
    },
    {
        id: 'acc_void_amulet',
        name: 'Abyssal Void Eye Amulet',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 640,
        icon: '🧿',
        image_url: '/images/items/acc_void_amulet.webp',
        description: 'Mata pusaka jurang hampa penembus pertahanan lawan.',
        buff: { type: 'crit_rate', value: 18, label: '+18% Peluang Serangan Kritis' },
    },
    {
        id: 'acc_celestial_hourglass',
        name: 'Hourglass of Starlit Sand',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'epic',
        cost_xp: 660,
        icon: '⌛',
        image_url: '/images/items/acc_celestial_hourglass.webp',
        description: 'Pasir bintang berkilau yang memberi berkah XP melimpah.',
        buff: { type: 'xp_bonus', value: 18, label: '+18% Bonus XP' },
    },

    // ==========================================
    // 4. ACCESSORY — LEGENDARY (4 Items)
    // ==========================================
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
    {
        id: 'acc_archangel_halo',
        name: 'Radiant Archangel Aurora Halo',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1600,
        icon: '👼',
        image_url: '/images/items/acc_archangel_halo.webp',
        description: 'Aura lingkaran bidadari penjaga tak tertembus kekalahan.',
        buff: { type: 'shield_regen', value: 25, label: '+25 Shield Tiap Streak Benar' },
    },
    {
        id: 'acc_infinity_prism',
        name: 'Prism of Infinite Timelines',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1700,
        icon: '🔮',
        image_url: '/images/items/acc_infinity_prism.webp',
        description: 'Prisma realitas pembuka peluang critical tertinggi dalam game.',
        buff: { type: 'crit_rate', value: 30, label: '+30% Peluang Serangan Kritis' },
    },
    {
        id: 'acc_draconic_heart',
        name: 'Heart Core of the Ancient Dragon',
        slot: 'accessory',
        class_req: 'all',
        rarity: 'legendary',
        cost_xp: 1750,
        icon: '❤️‍🔥',
        image_url: '/images/items/acc_draconic_heart.webp',
        description: 'Jantung magma naga purba pendongkrak poin jawaban benar ke tingkat puncak.',
        buff: { type: 'atk_bonus', value: 36, label: '+36 Poin Jawaban Benar' },
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
