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
    description: string
    buff: ItemBuff
    is_starter?: boolean
}

export const RARITY_CONFIG: Record<ItemRarity, { label: string; color: string; border: string; bg: string }> = {
    common: {
        label: 'Common',
        color: 'var(--text-secondary)',
        border: 'var(--surface-border)',
        bg: 'var(--surface-elevated)',
    },
    rare: {
        label: 'Rare',
        color: 'var(--accent-cyan)',
        border: 'var(--accent-cyan-border)',
        bg: 'var(--accent-cyan-bg)',
    },
    epic: {
        label: 'Epic',
        color: 'var(--accent-purple)',
        border: 'var(--accent-purple-border)',
        bg: 'var(--accent-purple-bg)',
    },
    legendary: {
        label: 'Legendary',
        color: 'var(--color-gold-text)',
        border: 'var(--accent-gold-border)',
        bg: 'var(--accent-gold-bg)',
    },
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
