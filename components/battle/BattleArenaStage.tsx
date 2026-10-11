'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AvatarClass } from '@/types'
import { EquippedItemsMap } from '@/lib/game/character'
import { Flame, Swords, Zap, Sparkles } from 'lucide-react'
import CharacterVisual from '@/components/character/CharacterVisual'

export type AttackType = 'warrior' | 'mage' | 'archer' | 'healer' | 'bot'

export interface AttackEvent {
    id: string
    direction: 'left-to-right' | 'right-to-left'
    type: AttackType
    isCrit?: boolean
    isUltimate?: boolean
    damage: number
    weaponId?: string
    comboCount?: number
}

export interface FighterInfo {
    name: string
    avatarClass: AvatarClass
    equipped?: EquippedItemsMap
    level?: number
    hp: number
    maxHp?: number
    mp: number
    score: number
    schoolName?: string
    animationState: 'idle' | 'attack' | 'hurt'
    isBot?: boolean
}

interface BattleArenaStageProps {
    player: FighterInfo
    opponent: FighterInfo
    activeAttack: AttackEvent | null
    combatText: {
        target: 'player' | 'opponent'
        text: string
        type: 'damage' | 'crit' | 'miss' | 'heal'
    } | null
    comboCount?: number
    battleLog?: string
    className?: string
}

export type WeaponProjectileKind =
    | 'wood_slash'
    | 'steel_slash'
    | 'flame_wave'
    | 'dragon_fang'
    | 'arcane_orb'
    | 'crystal_shard'
    | 'astral_comet'
    | 'cosmic_singularity'
    | 'hunter_arrow'
    | 'gale_arrow'
    | 'shadow_bolt'
    | 'celestial_lance'
    | 'prayer_spark'
    | 'dawn_beam'
    | 'holy_chime'
    | 'seraph_beam'
    | 'cyber_pulse'

export type WeaponImpactStyle =
    | 'wood'
    | 'steel'
    | 'flame'
    | 'dragon'
    | 'arcane'
    | 'crystal'
    | 'astral'
    | 'cosmic'
    | 'forest'
    | 'gale'
    | 'shadow'
    | 'celestial'
    | 'prayer'
    | 'dawn'
    | 'chime'
    | 'seraphic'
    | 'cyber'

export interface WeaponAttackConfig {
    weaponId: string
    name: string
    attackName: string
    projectileKind: WeaponProjectileKind
    impactStyle: WeaponImpactStyle
    color: string
    accentColor: string
    trailGradient: string
    impactGlow: string
    icon: string
}

// Complete tailored weapon attack database (16 character catalog items + AI bot sentinel)
const WEAPON_ATTACK_CONFIGS: Record<string, WeaponAttackConfig> = {
    // --- WARRIOR WEAPONS ---
    wpn_warrior_starter: {
        weaponId: 'wpn_warrior_starter',
        name: 'Pedang Latih Kayu',
        attackName: 'Tebasan Latih Kayu',
        projectileKind: 'wood_slash',
        impactStyle: 'wood',
        color: '#d97706',
        accentColor: '#10b981',
        trailGradient: 'linear-gradient(90deg, transparent, #b45309, #d97706, #10b981, #ffffff)',
        impactGlow: 'rgba(217, 119, 6, 0.85)',
        icon: '🗡️',
    },
    wpn_iron_broadsword: {
        weaponId: 'wpn_iron_broadsword',
        name: 'Iron Broadsword',
        attackName: 'Tebasan Baja Kinetik',
        projectileKind: 'steel_slash',
        impactStyle: 'steel',
        color: '#94a3b8',
        accentColor: '#38bdf8',
        trailGradient: 'linear-gradient(90deg, transparent, #475569, #94a3b8, #38bdf8, #ffffff)',
        impactGlow: 'rgba(148, 163, 184, 0.95)',
        icon: '⚔️',
    },
    wpn_flame_claymore: {
        weaponId: 'wpn_flame_claymore',
        name: 'Crimson Claymore',
        attackName: 'Gelombang Api Membara',
        projectileKind: 'flame_wave',
        impactStyle: 'flame',
        color: '#f97316',
        accentColor: '#ef4444',
        trailGradient: 'linear-gradient(90deg, transparent, #c2410c, #ea580c, #f97316, #fef08a)',
        impactGlow: 'rgba(249, 115, 22, 0.95)',
        icon: '🔥',
    },
    wpn_dragon_slayer: {
        weaponId: 'wpn_dragon_slayer',
        name: 'Excalibur Dragon Blade',
        attackName: 'Tebasan Naga Mitologi',
        projectileKind: 'dragon_fang',
        impactStyle: 'dragon',
        color: '#ef4444',
        accentColor: '#f59e0b',
        trailGradient: 'linear-gradient(90deg, transparent, #991b1b, #ef4444, #f59e0b, #fef08a)',
        impactGlow: 'rgba(239, 68, 68, 0.98)',
        icon: '⚡',
    },

    // --- MAGE WEAPONS ---
    wpn_mage_starter: {
        weaponId: 'wpn_mage_starter',
        name: 'Tongkat Sihir Murid',
        attackName: 'Denyut Sihir Arkana',
        projectileKind: 'arcane_orb',
        impactStyle: 'arcane',
        color: '#8b5cf6',
        accentColor: '#60a5fa',
        trailGradient: 'linear-gradient(90deg, transparent, #6d28d9, #8b5cf6, #93c5fd, #ffffff)',
        impactGlow: 'rgba(139, 92, 246, 0.9)',
        icon: '🪄',
    },
    wpn_crystal_staff: {
        weaponId: 'wpn_crystal_staff',
        name: 'Arcane Crystal Staff',
        attackName: 'Pecahan Kristal Mana',
        projectileKind: 'crystal_shard',
        impactStyle: 'crystal',
        color: '#a855f7',
        accentColor: '#38bdf8',
        trailGradient: 'linear-gradient(90deg, transparent, #7c3aed, #a855f7, #38bdf8, #ffffff)',
        impactGlow: 'rgba(168, 85, 247, 0.92)',
        icon: '🔮',
    },
    wpn_astral_wand: {
        weaponId: 'wpn_astral_wand',
        name: 'Astral Nebula Wand',
        attackName: 'Komet Nebula Astral',
        projectileKind: 'astral_comet',
        impactStyle: 'astral',
        color: '#e879f9',
        accentColor: '#c084fc',
        trailGradient: 'linear-gradient(90deg, transparent, #9333ea, #c084fc, #f472b6, #ffffff)',
        impactGlow: 'rgba(232, 121, 249, 0.95)',
        icon: '✨',
    },
    wpn_archmage_orb: {
        weaponId: 'wpn_archmage_orb',
        name: 'Archmage Genesis Core',
        attackName: 'Ledakan Singularitas Kosmik',
        projectileKind: 'cosmic_singularity',
        impactStyle: 'cosmic',
        color: '#c084fc',
        accentColor: '#38bdf8',
        trailGradient: 'linear-gradient(90deg, transparent, #8b5cf6, #ec4899, #38bdf8, #ffffff)',
        impactGlow: 'rgba(192, 132, 252, 0.98)',
        icon: '🌌',
    },

    // --- ARCHER WEAPONS ---
    wpn_archer_starter: {
        weaponId: 'wpn_archer_starter',
        name: 'Busur Pemburu Hutan',
        attackName: 'Panah Cepat Pemburu',
        projectileKind: 'hunter_arrow',
        impactStyle: 'forest',
        color: '#10b981',
        accentColor: '#86efac',
        trailGradient: 'linear-gradient(90deg, transparent, #047857, #10b981, #6ee7b7, #ffffff)',
        impactGlow: 'rgba(16, 185, 129, 0.88)',
        icon: '🏹',
    },
    wpn_recurve_bow: {
        weaponId: 'wpn_recurve_bow',
        name: 'Composite Wind Bow',
        attackName: 'Panah Badai Tornado',
        projectileKind: 'gale_arrow',
        impactStyle: 'gale',
        color: '#22c55e',
        accentColor: '#34d399',
        trailGradient: 'linear-gradient(90deg, transparent, #059669, #10b981, #34d399, #a7f3d0)',
        impactGlow: 'rgba(34, 197, 94, 0.92)',
        icon: '🎯',
    },
    wpn_shadow_cross: {
        weaponId: 'wpn_shadow_cross',
        name: 'Phantom Crossbow',
        attackName: 'Anak Panah Bayangan Hampa',
        projectileKind: 'shadow_bolt',
        impactStyle: 'shadow',
        color: '#a855f7',
        accentColor: '#6366f1',
        trailGradient: 'linear-gradient(90deg, transparent, #4c1d95, #7c3aed, #a855f7, #e0e7ff)',
        impactGlow: 'rgba(168, 85, 247, 0.92)',
        icon: '⚡',
    },
    wpn_celestial_bow: {
        weaponId: 'wpn_celestial_bow',
        name: 'Celestial Artemis Bow',
        attackName: 'Tombak Cahaya Artemis',
        projectileKind: 'celestial_lance',
        impactStyle: 'celestial',
        color: '#facc15',
        accentColor: '#ffffff',
        trailGradient: 'linear-gradient(90deg, transparent, #ca8a04, #eab308, #facc15, #ffffff)',
        impactGlow: 'rgba(250, 204, 21, 0.96)',
        icon: '💫',
    },

    // --- HEALER WEAPONS ---
    wpn_healer_starter: {
        weaponId: 'wpn_healer_starter',
        name: 'Tongkat Doa Kayu',
        attackName: 'Percikan Doa Suci',
        projectileKind: 'prayer_spark',
        impactStyle: 'prayer',
        color: '#fbbf24',
        accentColor: '#fef08a',
        trailGradient: 'linear-gradient(90deg, transparent, #b45309, #f59e0b, #fde047, #ffffff)',
        impactGlow: 'rgba(251, 191, 36, 0.88)',
        icon: '📿',
    },
    wpn_radiant_scepter: {
        weaponId: 'wpn_radiant_scepter',
        name: 'Radiant Dawn Scepter',
        attackName: 'Sinar Fajar Kejayaan',
        projectileKind: 'dawn_beam',
        impactStyle: 'dawn',
        color: '#f59e0b',
        accentColor: '#fde047',
        trailGradient: 'linear-gradient(90deg, transparent, #d97706, #f59e0b, #fbbf24, #ffffff)',
        impactGlow: 'rgba(245, 158, 11, 0.92)',
        icon: '🔱',
    },
    wpn_divine_censer: {
        weaponId: 'wpn_divine_censer',
        name: 'Divine Sanctuary Bell',
        attackName: 'Genta Suci Tempat Kudus',
        projectileKind: 'holy_chime',
        impactStyle: 'chime',
        color: '#eab308',
        accentColor: '#f59e0b',
        trailGradient: 'linear-gradient(90deg, transparent, #b45309, #d97706, #f59e0b, #fef08a)',
        impactGlow: 'rgba(234, 179, 8, 0.92)',
        icon: '🔔',
    },
    wpn_seraph_staff: {
        weaponId: 'wpn_seraph_staff',
        name: 'Seraphim Crown Staff',
        attackName: 'Pengadilan Suci Serafim',
        projectileKind: 'seraph_beam',
        impactStyle: 'seraphic',
        color: '#fde047',
        accentColor: '#eab308',
        trailGradient: 'linear-gradient(90deg, transparent, #ca8a04, #eab308, #fde047, #ffffff)',
        impactGlow: 'rgba(253, 224, 71, 0.98)',
        icon: '🕊️',
    },

    // --- AI BOT SENTINEL ---
    bot: {
        weaponId: 'bot',
        name: 'AI Sentinel',
        attackName: 'Pulsa Siber Neural',
        projectileKind: 'cyber_pulse',
        impactStyle: 'cyber',
        color: '#00d4ff',
        accentColor: '#38bdf8',
        trailGradient: 'linear-gradient(90deg, transparent, #0284c7, #00d4ff, #38bdf8, #ffffff)',
        impactGlow: 'rgba(0, 212, 255, 0.98)',
        icon: '⚡',
    },
}

// Fallback resolver by attack class type
const FALLBACK_CLASS_CONFIGS: Record<AttackType, WeaponAttackConfig> = {
    warrior: WEAPON_ATTACK_CONFIGS.wpn_iron_broadsword,
    mage: WEAPON_ATTACK_CONFIGS.wpn_crystal_staff,
    archer: WEAPON_ATTACK_CONFIGS.wpn_recurve_bow,
    healer: WEAPON_ATTACK_CONFIGS.wpn_radiant_scepter,
    bot: WEAPON_ATTACK_CONFIGS.bot,
}

function resolveWeaponConfig(weaponId?: string, attackType: AttackType = 'warrior'): WeaponAttackConfig {
    if (weaponId && WEAPON_ATTACK_CONFIGS[weaponId]) {
        return WEAPON_ATTACK_CONFIGS[weaponId]
    }
    return FALLBACK_CLASS_CONFIGS[attackType] || FALLBACK_CLASS_CONFIGS.warrior
}

// Streak tier levels with rich arcade aesthetics, natural Sentence case, and dynamic buffs
export interface ComboTier {
    tier: number
    title: string
    indonesianTitle: string
    subtitle: string
    icon: string
    color: string
    accent: string
    bgGradient: string
    borderColor: string
    shadowColor: string
    multiplierText: string
    damageMultiplier: number
    gaugeSegments: number
}

export function getComboTier(combo: number): ComboTier | null {
    if (combo >= 8) {
        return {
            tier: 4,
            title: 'GODLIKE DOMINATION',
            indonesianTitle: 'Dewa Pertarungan',
            subtitle: 'Kekuatan mutlak mendominasi duel',
            icon: '👑',
            color: '#fef08a',
            accent: '#eab308',
            bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.28) 0%, rgba(245, 158, 11, 0.44) 100%)',
            borderColor: 'rgba(250, 204, 21, 0.85)',
            shadowColor: 'rgba(234, 179, 8, 0.65)',
            multiplierText: '+100% Dominasi Skor & DMG',
            damageMultiplier: 2.0,
            gaugeSegments: 4,
        }
    }
    if (combo >= 6) {
        return {
            tier: 3,
            title: 'UNSTOPPABLE FURY',
            indonesianTitle: 'Murka Tak Terhentikan',
            subtitle: 'Tekanan dahsyat melumpuhkan lawan',
            icon: '💥',
            color: '#f87171',
            accent: '#ef4444',
            bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.42) 100%)',
            borderColor: 'rgba(248, 113, 113, 0.8)',
            shadowColor: 'rgba(239, 68, 68, 0.55)',
            multiplierText: '+50% Kritis & Skor',
            damageMultiplier: 1.5,
            gaugeSegments: 3,
        }
    }
    if (combo >= 4) {
        return {
            tier: 2,
            title: 'RAMPAGE SURGE',
            indonesianTitle: 'Serbuan Berapi',
            subtitle: 'Rentetan jawaban tepat beruntun',
            icon: '⚡',
            color: '#fb923c',
            accent: '#f97316',
            bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(234, 88, 12, 0.38) 100%)',
            borderColor: 'rgba(251, 146, 60, 0.72)',
            shadowColor: 'rgba(249, 115, 22, 0.45)',
            multiplierText: '+30% Skor & DMG',
            damageMultiplier: 1.3,
            gaugeSegments: 2,
        }
    }
    if (combo >= 2) {
        return {
            tier: 1,
            title: 'RISING STRIKE',
            indonesianTitle: 'Momentum Beruntun',
            subtitle: 'Serangan stabil memanaskan duel',
            icon: '🔥',
            color: '#facc15',
            accent: '#eab308',
            bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.18) 0%, rgba(202, 138, 4, 0.32) 100%)',
            borderColor: 'rgba(250, 204, 21, 0.6)',
            shadowColor: 'rgba(234, 179, 8, 0.35)',
            multiplierText: '+15% Bonus Skor',
            damageMultiplier: 1.15,
            gaugeSegments: 1,
        }
    }
    return null
}

// Custom vector graphics for flying projectiles (17 distinct bespoke designs)
function WeaponProjectileGraphic({ kind, color, accentColor }: { kind: WeaponProjectileKind; color: string; accentColor: string }) {
    switch (kind) {
        // --- 1. WARRIOR: WOOD SLASH ---
        case 'wood_slash':
            return (
                <svg width="42" height="28" viewBox="0 0 42 28" fill="none">
                    <path
                        d="M 3 22 Q 22 24 39 5 Q 26 12 8 10 Z"
                        fill="#b45309"
                        stroke="#f59e0b"
                        strokeWidth="1.8"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.75))' }}
                    />
                    <path d="M 10 14 Q 24 16 33 8" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" />
                    {/* Whirling green leaf splinters */}
                    <circle cx="16" cy="7" r="2.2" fill="#10b981" />
                    <circle cx="28" cy="18" r="1.8" fill="#f59e0b" />
                </svg>
            )

        // --- 2. WARRIOR: STEEL SLASH ---
        case 'steel_slash':
            return (
                <svg width="44" height="26" viewBox="0 0 44 26" fill="none">
                    <path
                        d="M 3 22 Q 22 24 41 4 Q 26 10 8 7 Z"
                        fill="url(#steelGrad)"
                        stroke="#38bdf8"
                        strokeWidth="1.8"
                        style={{ filter: 'drop-shadow(0 0 10px #38bdf8)' }}
                    />
                    <line x1="8" y1="14" x2="35" y2="7" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
                    <defs>
                        <linearGradient id="steelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#475569" />
                            <stop offset="50%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                    </defs>
                </svg>
            )

        // --- 3. WARRIOR: FLAME WAVE ---
        case 'flame_wave':
            return (
                <svg width="42" height="30" viewBox="0 0 42 30" fill="none">
                    <path
                        d="M 4 27 Q 30 22 38 3 Q 25 18 10 15 Q 18 11 20 4 Q 6 16 4 27 Z"
                        fill="url(#flameWaveGrad)"
                        stroke="#fef08a"
                        strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 10px #f97316)' }}
                    />
                    <defs>
                        <linearGradient id="flameWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c2410c" />
                            <stop offset="50%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#fef08a" />
                        </linearGradient>
                    </defs>
                </svg>
            )

        // --- 4. WARRIOR: DRAGON FANG ---
        case 'dragon_fang':
            return (
                <svg width="48" height="30" viewBox="0 0 48 30" fill="none">
                    <path
                        d="M 4 25 Q 26 28 44 4 Q 30 13 14 8 Q 8 16 4 25 Z"
                        fill="url(#dragonFangGrad)"
                        stroke="#fef08a"
                        strokeWidth="1.8"
                        style={{ filter: 'drop-shadow(0 0 12px #ef4444)' }}
                    />
                    {/* Glowing golden dragon eye gem */}
                    <circle cx="16" cy="15" r="3" fill="#facc15" stroke="#ffffff" strokeWidth="1" />
                    <path d="M 20 16 Q 34 20 40 7" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
                    <defs>
                        <linearGradient id="dragonFangGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7f1d1d" />
                            <stop offset="45%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                    </defs>
                </svg>
            )

        // --- 5. MAGE: ARCANE ORB ---
        case 'arcane_orb':
            return (
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <circle cx="19" cy="19" r="8" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.8" style={{ filter: 'drop-shadow(0 0 8px #8b5cf6)' }} />
                    <circle cx="19" cy="19" r="3.5" fill="#ffffff" />
                    <ellipse cx="19" cy="19" rx="14" ry="5.5" stroke="#60a5fa" strokeWidth="1.4" fill="none" opacity="0.85" transform="rotate(-30 19 19)" />
                </svg>
            )

        // --- 6. MAGE: CRYSTAL SHARD ---
        case 'crystal_shard':
            return (
                <svg width="40" height="38" viewBox="0 0 40 38" fill="none">
                    {/* 3 Prismatic Geometric Crystals Orbiting */}
                    <polygon points="20,2 29,11 29,26 20,35 11,26 11,11" fill="url(#crystalGrad)" stroke="#ffffff" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 10px #a855f7)' }} />
                    <polygon points="20,8 26,13 26,23 20,28 14,23 14,13" fill="#0f172a" opacity="0.35" />
                    <circle cx="20" cy="18" r="3" fill="#38bdf8" />
                    <defs>
                        <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7c3aed" />
                            <stop offset="60%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                    </defs>
                </svg>
            )

        // --- 7. MAGE: ASTRAL COMET ---
        case 'astral_comet':
            return (
                <svg width="42" height="38" viewBox="0 0 42 38" fill="none">
                    <circle cx="21" cy="19" r="8.5" fill="url(#astralGrad)" stroke="#fef08a" strokeWidth="1.8" style={{ filter: 'drop-shadow(0 0 10px #e879f9)' }} />
                    <circle cx="21" cy="19" r="3.5" fill="#ffffff" />
                    <ellipse cx="21" cy="19" rx="16" ry="6" stroke="#c084fc" strokeWidth="1.4" fill="none" transform="rotate(-20 21 19)" opacity="0.9" />
                    <ellipse cx="21" cy="19" rx="16" ry="6" stroke="#38bdf8" strokeWidth="1.2" fill="none" transform="rotate(40 21 19)" opacity="0.8" />
                    <defs>
                        <linearGradient id="astralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#9333ea" />
                            <stop offset="50%" stopColor="#e879f9" />
                            <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                    </defs>
                </svg>
            )

        // --- 8. MAGE: COSMIC SINGULARITY ---
        case 'cosmic_singularity':
            return (
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                    <circle cx="21" cy="21" r="7.5" fill="#030712" stroke="#c084fc" strokeWidth="2.2" style={{ filter: 'drop-shadow(0 0 12px #c084fc)' }} />
                    <circle cx="21" cy="21" r="3" fill="#ffffff" />
                    <ellipse cx="21" cy="21" rx="16" ry="5.5" stroke="#38bdf8" strokeWidth="1.6" fill="none" transform="rotate(-25 21 21)" opacity="0.9" />
                    <ellipse cx="21" cy="21" rx="16" ry="5.5" stroke="#f472b6" strokeWidth="1.6" fill="none" transform="rotate(50 21 21)" opacity="0.9" />
                    <line x1="21" y1="2" x2="21" y2="40" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                    <line x1="2" y1="21" x2="40" y2="21" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                </svg>
            )

        // --- 9. ARCHER: HUNTER ARROW ---
        case 'hunter_arrow':
            return (
                <svg width="44" height="20" viewBox="0 0 44 20" fill="none">
                    <line x1="2" y1="10" x2="38" y2="10" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #10b981)' }} />
                    <polygon points="32,4 42,10 32,16 35,10" fill="#ffffff" stroke="#059669" strokeWidth="1.2" />
                    {/* Feathered fletching & leaf wake */}
                    <path d="M 6 5 L 11 10 L 6 15" stroke="#86efac" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M 2 5 L 7 10 L 2 15" stroke="#86efac" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
                </svg>
            )

        // --- 10. ARCHER: GALE ARROW ---
        case 'gale_arrow':
            return (
                <svg width="46" height="24" viewBox="0 0 46 24" fill="none">
                    <line x1="2" y1="12" x2="40" y2="12" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px #22c55e)' }} />
                    <polygon points="34,6 44,12 34,18 38,12" fill="#ffffff" stroke="#16a34a" strokeWidth="1.4" />
                    {/* Air vortex spiral rings */}
                    <ellipse cx="22" cy="12" rx="10" ry="7" stroke="#86efac" strokeWidth="1.4" fill="none" opacity="0.85" />
                    <ellipse cx="12" cy="12" rx="6" ry="5" stroke="#34d399" strokeWidth="1.2" fill="none" opacity="0.65" />
                </svg>
            )

        // --- 11. ARCHER: SHADOW BOLT ---
        case 'shadow_bolt':
            return (
                <svg width="44" height="22" viewBox="0 0 44 22" fill="none">
                    <line x1="2" y1="11" x2="38" y2="11" stroke="#a855f7" strokeWidth="2.4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px #a855f7)' }} />
                    <polygon points="30,4 42,11 30,18 34,11" fill="#4c1d95" stroke="#c084fc" strokeWidth="1.5" />
                    {/* Void phantom mist nodes */}
                    <circle cx="18" cy="11" r="3.5" fill="#6366f1" opacity="0.9" />
                    <circle cx="8" cy="11" r="2.5" fill="#a855f7" opacity="0.75" />
                </svg>
            )

        // --- 12. ARCHER: CELESTIAL LANCE ---
        case 'celestial_lance':
            return (
                <svg width="48" height="22" viewBox="0 0 48 22" fill="none">
                    <line x1="2" y1="11" x2="40" y2="11" stroke="#facc15" strokeWidth="2.8" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px #facc15)' }} />
                    <path d="M 32,4 L 46,11 L 32,18 L 36,11 Z" fill="#ffffff" stroke="#ca8a04" strokeWidth="1.4" />
                    {/* Supersonic starlight cones */}
                    <path d="M 18 5 L 25 11 L 18 17" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
                    <path d="M 8 6 L 14 11 L 8 16" stroke="#fef08a" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
                </svg>
            )

        // --- 13. HEALER: PRAYER SPARK ---
        case 'prayer_spark':
            return (
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <circle cx="19" cy="19" r="8" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.8" style={{ filter: 'drop-shadow(0 0 10px #fbbf24)' }} />
                    <circle cx="19" cy="19" r="3" fill="#ffffff" />
                    {/* Rotating prayer beads */}
                    <circle cx="19" cy="6" r="2" fill="#fef08a" />
                    <circle cx="32" cy="19" r="2" fill="#fef08a" />
                    <circle cx="19" cy="32" r="2" fill="#fef08a" />
                    <circle cx="6" cy="19" r="2" fill="#fef08a" />
                </svg>
            )

        // --- 14. HEALER: DAWN BEAM ---
        case 'dawn_beam':
            return (
                <svg width="46" height="24" viewBox="0 0 46 24" fill="none">
                    <line x1="2" y1="12" x2="40" y2="12" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }} />
                    <polygon points="34,5 44,12 34,19 37,12" fill="#ffffff" stroke="#d97706" strokeWidth="1.4" />
                    {/* Solar flare ribbons */}
                    <circle cx="20" cy="12" r="5" stroke="#fde047" strokeWidth="1.5" fill="none" opacity="0.8" />
                </svg>
            )

        // --- 15. HEALER: HOLY CHIME ---
        case 'holy_chime':
            return (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    {/* Floating Sanctuary Bell */}
                    <path d="M 15 10 Q 20 6 25 10 L 28 22 Q 30 26 20 26 Q 10 26 12 22 Z" fill="#eab308" stroke="#ffffff" strokeWidth="1.6" style={{ filter: 'drop-shadow(0 0 10px #eab308)' }} />
                    <circle cx="20" cy="27" r="2.5" fill="#fef08a" />
                    {/* Acoustic chime harmonic rings */}
                    <path d="M 32 12 Q 36 20 32 28" stroke="#fef08a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M 36 8 Q 41 20 36 32" stroke="#fef08a" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
                </svg>
            )

        // --- 16. HEALER: SERAPH BEAM ---
        case 'seraph_beam':
            return (
                <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
                    {/* Divine Judgement Core */}
                    <circle cx="24" cy="18" r="8" fill="#ffffff" stroke="#fde047" strokeWidth="2.2" style={{ filter: 'drop-shadow(0 0 12px #fde047)' }} />
                    {/* Seraphic Angelic Wings Silhouette */}
                    <path d="M 22 18 Q 12 8 4 14 Q 10 20 20 20" fill="none" stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 26 18 Q 36 8 44 14 Q 38 20 28 20" fill="none" stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="24" y1="2" x2="24" y2="34" stroke="#ca8a04" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            )

        // --- 17. BOT SENTINEL: CYBER PULSE ---
        case 'cyber_pulse':
        default:
            return (
                <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
                    {/* AI Sentinel EMP Shock Core */}
                    <circle cx="20" cy="18" r="7" fill="#00d4ff" stroke="#ffffff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 10px #00d4ff)' }} />
                    <polygon points="20,4 32,10 32,26 20,32 8,26 8,10" fill="none" stroke="#0284c7" strokeWidth="1.6" opacity="0.85" />
                    <line x1="8" y1="18" x2="32" y2="18" stroke="#ffffff" strokeWidth="1.4" />
                    <line x1="20" y1="7" x2="20" y2="29" stroke="#ffffff" strokeWidth="1.4" />
                </svg>
            )
    }
}

// Custom vector explosion burst at target impact (17 bespoke impact styles)
function WeaponImpactBurstGraphic({ style, color, impactGlow }: { style: WeaponImpactStyle; color: string; impactGlow: string }) {
    switch (style) {
        // --- 1. WOOD: SPLINTER SHOCKWAVE ---
        case 'wood':
            return (
                <div style={{ position: 'relative', width: '88px', height: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.2, 2.8], opacity: [1, 0.85, 0] }}
                        transition={{ duration: 0.42, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #d97706',
                            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.45) 0%, transparent 70%)',
                            boxShadow: '0 0 14px #d97706',
                        }}
                    />
                    {/* Flying Wood Splinters & Leaves */}
                    {[0, 60, 120, 180, 240, 300].map((deg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.2, opacity: 1, x: 0, y: 0 }}
                            animate={{
                                scale: [0.2, 1, 0],
                                opacity: [1, 1, 0],
                                x: Math.cos((deg * Math.PI) / 180) * 32,
                                y: Math.sin((deg * Math.PI) / 180) * 32,
                            }}
                            transition={{ duration: 0.38, ease: 'easeOut' }}
                            style={{
                                position: 'absolute',
                                width: idx % 2 === 0 ? '6px' : '4px',
                                height: idx % 2 === 0 ? '6px' : '4px',
                                borderRadius: idx % 2 === 0 ? '2px' : '50%',
                                background: idx % 2 === 0 ? '#b45309' : '#10b981',
                            }}
                        />
                    ))}
                </div>
            )

        // --- 2. STEEL: DUAL CROSS-SLASH & METALLIC SPARKS ---
        case 'steel':
            return (
                <div style={{ position: 'relative', width: '92px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.3, 2.9], opacity: [1, 0.85, 0] }}
                        transition={{ duration: 0.42 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #38bdf8',
                            boxShadow: '0 0 16px #38bdf8',
                        }}
                    />
                    <svg width="74" height="74" viewBox="0 0 74 74" style={{ position: 'absolute' }}>
                        <motion.line
                            x1="12" y1="12" x2="62" y2="62"
                            stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 1 }}
                            animate={{ pathLength: [0, 1, 0], opacity: [1, 1, 0] }}
                            transition={{ duration: 0.36 }}
                            style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }}
                        />
                        <motion.line
                            x1="62" y1="12" x2="12" y2="62"
                            stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 1 }}
                            animate={{ pathLength: [0, 1, 0], opacity: [1, 1, 0] }}
                            transition={{ duration: 0.36, delay: 0.04 }}
                            style={{ filter: 'drop-shadow(0 0 8px #ffffff)' }}
                        />
                    </svg>
                </div>
            )

        // --- 3. FLAME: COMBUSTION BLAST & MAGMA EMBERS ---
        case 'flame':
            return (
                <div style={{ position: 'relative', width: '92px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.4, 3.1], opacity: [1, 0.9, 0] }}
                        transition={{ duration: 0.44 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '3px solid #f97316',
                            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.5) 0%, transparent 70%)',
                            boxShadow: '0 0 18px #f97316',
                        }}
                    />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.3, opacity: 1, x: 0, y: 0 }}
                            animate={{
                                scale: [0.3, 1.2, 0],
                                opacity: [1, 1, 0],
                                x: Math.cos((deg * Math.PI) / 180) * 36,
                                y: Math.sin((deg * Math.PI) / 180) * 36,
                            }}
                            transition={{ duration: 0.4 }}
                            style={{
                                position: 'absolute',
                                width: '2px',
                                height: '9px',
                                borderRadius: '1px',
                                background: idx % 2 === 0 ? '#fef08a' : '#ef4444',
                                transform: `rotate(${deg}deg)`,
                            }}
                        />
                    ))}
                </div>
            )

        // --- 4. DRAGON: 3-CLAW SLASH & DRACONIC LIGHTNING ---
        case 'dragon':
            return (
                <div style={{ position: 'relative', width: '96px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.6, 3.3], opacity: [1, 0.95, 0] }}
                        transition={{ duration: 0.46, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '3.5px solid #ef4444',
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.55) 0%, transparent 70%)',
                            boxShadow: '0 0 20px #ef4444',
                        }}
                    />
                    <svg width="78" height="78" viewBox="0 0 78 78" style={{ position: 'absolute' }}>
                        <motion.line
                            x1="12" y1="12" x2="66" y2="66"
                            stroke="#fef08a" strokeWidth="4.8" strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 1 }}
                            animate={{ pathLength: [0, 1, 0], opacity: [1, 1, 0] }}
                            transition={{ duration: 0.38 }}
                            style={{ filter: 'drop-shadow(0 0 10px #ef4444)' }}
                        />
                        <motion.line
                            x1="66" y1="12" x2="12" y2="66"
                            stroke="#f59e0b" strokeWidth="3.8" strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 1 }}
                            animate={{ pathLength: [0, 1, 0], opacity: [1, 1, 0] }}
                            transition={{ duration: 0.38, delay: 0.04 }}
                            style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }}
                        />
                    </svg>
                </div>
            )

        // --- 5. ARCANE: RUNIC CIRCLE & MAGIC MANA SPARKLES ---
        case 'arcane':
            return (
                <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.3, 2.9], opacity: [1, 0.9, 0], rotate: 90 }}
                        transition={{ duration: 0.42 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #8b5cf6',
                            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, transparent 70%)',
                            boxShadow: '0 0 16px #8b5cf6',
                        }}
                    />
                    <svg width="68" height="68" viewBox="0 0 68 68" style={{ position: 'absolute' }}>
                        <motion.polygon
                            points="34,8 42,26 60,26 46,38 52,56 34,44 16,56 22,38 8,26 26,26"
                            stroke="#38bdf8" strokeWidth="1.8" fill="none"
                            initial={{ scale: 0.3, opacity: 1 }}
                            animate={{ scale: [0.3, 1.6, 0], opacity: [1, 1, 0], rotate: 45 }}
                            transition={{ duration: 0.4 }}
                            style={{ transformOrigin: 'center', filter: 'drop-shadow(0 0 8px #c084fc)' }}
                        />
                    </svg>
                </div>
            )

        // --- 6. CRYSTAL: SHATTERING PRISMATIC SHARDS ---
        case 'crystal':
            return (
                <div style={{ position: 'relative', width: '92px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.3, 2.9], opacity: [1, 0.85, 0] }}
                        transition={{ duration: 0.42 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #a855f7',
                            boxShadow: '0 0 16px #a855f7',
                        }}
                    />
                    {/* 6 Shattering Faceted Crystal Shards */}
                    {[0, 60, 120, 180, 240, 300].map((deg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.3, opacity: 1, x: 0, y: 0, rotate: 0 }}
                            animate={{
                                scale: [0.3, 1.2, 0],
                                opacity: [1, 1, 0],
                                x: Math.cos((deg * Math.PI) / 180) * 36,
                                y: Math.sin((deg * Math.PI) / 180) * 36,
                                rotate: deg * 2,
                            }}
                            transition={{ duration: 0.4 }}
                            style={{
                                position: 'absolute',
                                width: '7px',
                                height: '12px',
                                background: idx % 2 === 0 ? '#38bdf8' : '#e879f9',
                                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                                boxShadow: '0 0 8px #a855f7',
                            }}
                        />
                    ))}
                </div>
            )

        // --- 7. ASTRAL: STARFALL SUPERNOVA ---
        case 'astral':
            return (
                <div style={{ position: 'relative', width: '92px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.4, 3.0], opacity: [1, 0.9, 0], rotate: 180 }}
                        transition={{ duration: 0.44 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #e879f9',
                            background: 'radial-gradient(circle, rgba(232, 121, 249, 0.45) 0%, transparent 70%)',
                            boxShadow: '0 0 18px #e879f9',
                        }}
                    />
                    {/* Spiral Star Dust */}
                    {[0, 90, 180, 270].map((deg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.4, opacity: 1, rotate: deg }}
                            animate={{ scale: [0.4, 1.8, 0], opacity: [1, 1, 0], rotate: deg + 90 }}
                            transition={{ duration: 0.4 }}
                            style={{
                                position: 'absolute',
                                width: '16px',
                                height: '4px',
                                borderRadius: '2px',
                                background: '#ffffff',
                                boxShadow: '0 0 10px #f472b6',
                            }}
                        />
                    ))}
                </div>
            )

        // --- 8. COSMIC: GRAVITATIONAL SUPERNOVA BURST ---
        case 'cosmic':
            return (
                <div style={{ position: 'relative', width: '94px', height: '94px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.5, 3.2], opacity: [1, 0.8, 0] }}
                        transition={{ duration: 0.44, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #c084fc',
                            background: 'radial-gradient(circle, rgba(192, 132, 252, 0.45) 0%, transparent 70%)',
                            boxShadow: '0 0 18px #c084fc',
                        }}
                    />
                    <motion.div
                        initial={{ scale: 0.2, opacity: 1 }}
                        animate={{ scale: [0.2, 1.8, 2.4], opacity: [1, 0.9, 0] }}
                        transition={{ duration: 0.4, delay: 0.03, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            inset: '12px',
                            borderRadius: '50%',
                            border: '2px solid #38bdf8',
                            boxShadow: '0 0 12px #38bdf8',
                        }}
                    />
                    <motion.div
                        initial={{ scale: 0.4, opacity: 1, rotate: 0 }}
                        animate={{ scale: [0.4, 2.0, 0], opacity: [1, 1, 0], rotate: 45 }}
                        transition={{ duration: 0.38 }}
                        style={{
                            width: '24px',
                            height: '24px',
                            background: '#ffffff',
                            borderRadius: '2px',
                            boxShadow: '0 0 16px #ffffff',
                        }}
                    />
                </div>
            )

        // --- 9. FOREST: GALE LEAF SPIRAL ---
        case 'forest':
            return (
                <div style={{ position: 'relative', width: '86px', height: '86px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.2, 2.8], opacity: [1, 0.85, 0], rotate: 180 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #10b981',
                            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                            boxShadow: '0 0 14px #10b981',
                        }}
                    />
                    {[0, 72, 144, 216, 288].map((deg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.3, opacity: 1, x: 0, y: 0 }}
                            animate={{
                                scale: [0.3, 1.2, 0],
                                opacity: [1, 1, 0],
                                x: Math.cos((deg * Math.PI) / 180) * 32,
                                y: Math.sin((deg * Math.PI) / 180) * 32,
                            }}
                            transition={{ duration: 0.4 }}
                            style={{
                                position: 'absolute',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#86efac',
                            }}
                        />
                    ))}
                </div>
            )

        // --- 10. GALE: ROTATING TORNADO VORTEX ---
        case 'gale':
            return (
                <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.3, 2.9], opacity: [1, 0.85, 0], rotate: 240 }}
                        transition={{ duration: 0.42 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #22c55e',
                            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%)',
                            boxShadow: '0 0 16px #22c55e',
                        }}
                    />
                </div>
            )

        // --- 11. SHADOW: VOID VORTEX IMPLOSION ---
        case 'shadow':
            return (
                <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.3, 2.9], opacity: [1, 0.9, 0] }}
                        transition={{ duration: 0.42 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '3px solid #a855f7',
                            background: 'radial-gradient(circle, rgba(76, 29, 149, 0.6) 0%, transparent 70%)',
                            boxShadow: '0 0 16px #a855f7',
                        }}
                    />
                    <motion.div
                        initial={{ scale: 1.6, opacity: 0 }}
                        animate={{ scale: [1.6, 0.3], opacity: [0, 1, 0] }}
                        transition={{ duration: 0.36 }}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#0f172a',
                            border: '2px solid #c084fc',
                        }}
                    />
                </div>
            )

        // --- 12. CELESTIAL: 8-POINT STARBURST & SOLAR FLARE ---
        case 'celestial':
            return (
                <div style={{ position: 'relative', width: '92px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.4, 3.0], opacity: [1, 0.9, 0] }}
                        transition={{ duration: 0.42 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #facc15',
                            background: 'radial-gradient(circle, rgba(250, 204, 21, 0.45) 0%, transparent 70%)',
                            boxShadow: '0 0 16px #facc15',
                        }}
                    />
                    <svg width="74" height="74" viewBox="0 0 74 74" style={{ position: 'absolute' }}>
                        <motion.path
                            d="M 37 4 L 37 70 M 4 37 L 70 37 M 14 14 L 60 60 M 60 14 L 14 60"
                            stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"
                            initial={{ scale: 0.4, opacity: 1 }}
                            animate={{ scale: [0.4, 1.8, 0], opacity: [1, 1, 0] }}
                            transition={{ duration: 0.4 }}
                            style={{ transformOrigin: 'center', filter: 'drop-shadow(0 0 10px #fef08a)' }}
                        />
                    </svg>
                </div>
            )

        // --- 13. PRAYER: RADIANT HOLY HALO ---
        case 'prayer':
            return (
                <div style={{ position: 'relative', width: '88px', height: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.2, 2.8], opacity: [1, 0.85, 0] }}
                        transition={{ duration: 0.42 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #fbbf24',
                            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)',
                            boxShadow: '0 0 14px #fbbf24',
                        }}
                    />
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 1.8, 0], opacity: [1, 1, 0] }}
                        transition={{ duration: 0.38 }}
                        style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            boxShadow: '0 0 12px #fef08a',
                        }}
                    />
                </div>
            )

        // --- 14. DAWN: PIERCING SOLAR CORONA BURST ---
        case 'dawn':
            return (
                <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.3, 2.9], opacity: [1, 0.9, 0] }}
                        transition={{ duration: 0.42 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #f59e0b',
                            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, transparent 70%)',
                            boxShadow: '0 0 16px #f59e0b',
                        }}
                    />
                    <motion.div
                        initial={{ scaleY: 0.2, opacity: 1 }}
                        animate={{ scaleY: [0.2, 2.4, 0], opacity: [1, 1, 0] }}
                        transition={{ duration: 0.38 }}
                        style={{
                            width: '8px',
                            height: '52px',
                            background: 'linear-gradient(180deg, #ffffff, #fde047, #d97706)',
                            borderRadius: '4px',
                            boxShadow: '0 0 12px #fde047',
                        }}
                    />
                </div>
            )

        // --- 15. CHIME: SACRED BELL HARMONIC RESONANCE RINGS ---
        case 'chime':
            return (
                <div style={{ position: 'relative', width: '92px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.4, 3.0], opacity: [1, 0.85, 0] }}
                        transition={{ duration: 0.44 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #eab308',
                            boxShadow: '0 0 16px #eab308',
                        }}
                    />
                    <motion.div
                        initial={{ scale: 0.2, opacity: 1 }}
                        animate={{ scale: [0.2, 1.8, 2.4], opacity: [1, 0.9, 0] }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        style={{
                            position: 'absolute',
                            inset: '10px',
                            borderRadius: '50%',
                            border: '1.8px solid #fef08a',
                        }}
                    />
                </div>
            )

        // --- 16. SERAPHIC: PILLAR OF HEAVEN & ANGELIC FEATHERS ---
        case 'seraphic':
            return (
                <div style={{ position: 'relative', width: '94px', height: '94px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.5, 3.2], opacity: [1, 0.9, 0] }}
                        transition={{ duration: 0.44 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '3px solid #fde047',
                            background: 'radial-gradient(circle, rgba(253, 224, 71, 0.5) 0%, transparent 70%)',
                            boxShadow: '0 0 18px #eab308',
                        }}
                    />
                    {/* Vertical Celestial Column */}
                    <motion.div
                        initial={{ scaleY: 0.2, opacity: 1 }}
                        animate={{ scaleY: [0.2, 2.8, 0], opacity: [1, 1, 0] }}
                        transition={{ duration: 0.4 }}
                        style={{
                            width: '10px',
                            height: '62px',
                            background: 'linear-gradient(180deg, #ffffff, #fde047, #ca8a04)',
                            borderRadius: '5px',
                            boxShadow: '0 0 14px #fde047',
                        }}
                    />
                </div>
            )

        // --- 17. CYBER: EMP HEX MATRIX GRID ---
        case 'cyber':
        default:
            return (
                <div style={{ position: 'relative', width: '92px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.4, 3.0], opacity: [1, 0.9, 0] }}
                        transition={{ duration: 0.42 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #00d4ff',
                            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.45) 0%, transparent 70%)',
                            boxShadow: '0 0 18px #00d4ff',
                        }}
                    />
                    <svg width="68" height="68" viewBox="0 0 68 68" style={{ position: 'absolute' }}>
                        <motion.polygon
                            points="34,6 58,18 58,50 34,62 10,50 10,18"
                            stroke="#ffffff" strokeWidth="2" fill="none"
                            initial={{ scale: 0.3, opacity: 1 }}
                            animate={{ scale: [0.3, 1.6, 0], opacity: [1, 1, 0] }}
                            transition={{ duration: 0.38 }}
                            style={{ transformOrigin: 'center', filter: 'drop-shadow(0 0 10px #00d4ff)' }}
                        />
                    </svg>
                </div>
            )
    }
}

function BattleArenaStage({
    player,
    opponent,
    activeAttack,
    combatText,
    comboCount = 0,
    battleLog,
    className = '',
}: BattleArenaStageProps) {
    const playerHpPercent = Math.max(0, Math.min(100, (player.hp / (player.maxHp || 100)) * 100))
    const opponentHpPercent = Math.max(0, Math.min(100, (opponent.hp / (opponent.maxHp || 100)) * 100))
    const [isMobile, setIsMobile] = React.useState(false)
    const [isSmallMobile, setIsSmallMobile] = React.useState(false)

    // Tactile screen micro-tremor when an attack lands with combo or crit
    const [isShaking, setIsShaking] = React.useState(false)

    React.useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 640)
            setIsSmallMobile(window.innerWidth < 400)
        }
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    // Trigger visceral tactile tremor upon impact (scaled with streak level)
    React.useEffect(() => {
        if (activeAttack) {
            const timer = setTimeout(() => {
                if (comboCount >= 2 || activeAttack.isCrit || activeAttack.isUltimate) {
                    setIsShaking(true)
                    const durationMs = comboCount >= 6 ? 260 : comboCount >= 4 ? 220 : 180
                    setTimeout(() => setIsShaking(false), durationMs)
                }
            }, 240)
            return () => clearTimeout(timer)
        }
    }, [activeAttack?.id, comboCount])

    const charSize = isSmallMobile ? 66 : isMobile ? 74 : 108
    const pedestalWidth = isSmallMobile ? 66 : isMobile ? 74 : 84

    // Resolve tailored weapon attack visual
    const attackerWeaponId = activeAttack?.direction === 'left-to-right'
        ? (activeAttack.weaponId || player.equipped?.weapon)
        : (activeAttack?.weaponId || opponent.equipped?.weapon || (opponent.isBot ? 'bot' : undefined))

    const attackConfig = activeAttack
        ? resolveWeaponConfig(attackerWeaponId, activeAttack.type)
        : null

    const comboTier = getComboTier(comboCount)

    return (
        <motion.div
            className={`battle-stage-container ${className}`}
            animate={
                isShaking
                    ? comboCount >= 6
                        ? { x: [-6, 6, -4, 4, -2, 2, 0], y: [-3, 3, -2, 2, 0] }
                        : comboCount >= 4
                        ? { x: [-4, 4, -3, 3, 0], y: [-2, 2, 0] }
                        : { x: [-3, 3, -2, 2, 0], y: [-1, 1, 0] }
                    : { x: 0, y: 0 }
            }
            transition={{ duration: comboCount >= 6 ? 0.26 : 0.2, ease: 'linear' }}
            style={{
                position: 'relative',
                width: '100%',
                borderRadius: '16px',
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.88) 0%, rgba(10, 15, 30, 0.96) 100%)',
                border: comboTier ? `1px solid ${comboTier.borderColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '16px 14px 12px',
                overflow: 'hidden',
                boxShadow: comboTier
                    ? `0 12px 32px -8px rgba(0, 0, 0, 0.6), 0 0 20px -6px ${comboTier.shadowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                    : '0 12px 32px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                boxSizing: 'border-box',
                marginBottom: '16px',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
        >
            {/* Arena Floor Ambient Grid & Perspective Lighting */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: comboTier
                        ? `radial-gradient(ellipse at 50% 120%, ${comboTier.shadowColor} 0%, transparent 70%)`
                        : 'radial-gradient(ellipse at 50% 120%, rgba(245, 197, 66, 0.08) 0%, transparent 70%)',
                    zIndex: 0,
                    transition: 'background 0.3s ease',
                }}
            />

            {/* Arena Top Status Bar */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                }}
            >
                {/* Player HUD (Left) */}
                <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {player.name}
                        </span>
                        <span
                            style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(245, 197, 66, 0.15)',
                                color: 'var(--color-signal-orange)',
                                border: '1px solid rgba(245, 197, 66, 0.35)',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)',
                            }}
                        >
                            Lv.{player.level || 1}
                        </span>
                    </div>

                    {/* HP Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                            style={{
                                flex: 1,
                                height: '7px',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            <motion.div
                                animate={{ width: `${playerHpPercent}%` }}
                                transition={{ duration: 0.35 }}
                                style={{
                                    height: '100%',
                                    background:
                                        playerHpPercent > 50
                                            ? 'linear-gradient(90deg, #10b981, #22c55e)'
                                            : playerHpPercent > 25
                                            ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                                            : 'linear-gradient(90deg, #ef4444, #dc2626)',
                                }}
                            />
                        </div>
                        <span
                            style={{
                                fontSize: '11px',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                color: playerHpPercent > 25 ? '#e2e8f0' : 'var(--accent-red)',
                                minWidth: '38px',
                            }}
                        >
                            {Math.round(player.hp)} HP
                        </span>
                    </div>

                    {/* MP Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <div
                            style={{
                                flex: 1,
                                height: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                borderRadius: '3px',
                                overflow: 'hidden',
                            }}
                        >
                            <motion.div
                                animate={{ width: `${Math.min(100, player.mp)}%` }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    height: '100%',
                                    background:
                                        player.mp >= 100
                                            ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                            : 'linear-gradient(90deg, #3b82f6, #a855f7)',
                                }}
                            />
                        </div>
                        <span
                            style={{
                                fontSize: '9px',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 600,
                                color: player.mp >= 100 ? '#f59e0b' : '#94a3b8',
                            }}
                        >
                            {player.mp >= 100 ? 'BURST 🔥' : `MP ${player.mp}%`}
                        </span>
                    </div>
                </div>

                {/* Center Clash VS Indicator */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '0 4px' }}>
                    <div
                        style={{
                            padding: '3px 10px',
                            borderRadius: '8px',
                            backgroundColor: comboTier ? comboTier.bgGradient : 'rgba(245, 197, 66, 0.1)',
                            border: comboTier ? `1px solid ${comboTier.borderColor}` : '1px solid rgba(245, 197, 66, 0.3)',
                            color: comboTier ? comboTier.color : 'var(--color-signal-orange)',
                            fontSize: '11px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <Swords size={12} />
                        <span>VS</span>
                    </div>
                </div>

                {/* Opponent HUD (Right) */}
                <div style={{ minWidth: 0, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                        <span
                            style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(0, 212, 255, 0.15)',
                                color: '#00d4ff',
                                border: '1px solid rgba(0, 212, 255, 0.35)',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)',
                            }}
                        >
                            Lv.{opponent.level || 1}
                        </span>
                        <span
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {opponent.name}
                        </span>
                    </div>

                    {/* Opponent HP Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <span
                            style={{
                                fontSize: '11px',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                color: opponentHpPercent > 25 ? '#e2e8f0' : 'var(--accent-red)',
                                minWidth: '38px',
                            }}
                        >
                            {Math.round(opponent.hp)} HP
                        </span>
                        <div
                            style={{
                                flex: 1,
                                height: '7px',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            <motion.div
                                animate={{ width: `${opponentHpPercent}%` }}
                                transition={{ duration: 0.35 }}
                                style={{
                                    height: '100%',
                                    marginLeft: 'auto',
                                    background:
                                        opponentHpPercent > 50
                                            ? 'linear-gradient(90deg, #06b6d4, #00d4ff)'
                                            : opponentHpPercent > 25
                                            ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                                            : 'linear-gradient(90deg, #ef4444, #dc2626)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Opponent MP Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '3px' }}>
                        <span
                            style={{
                                fontSize: '9px',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 600,
                                color: opponent.mp >= 100 ? '#00d4ff' : '#94a3b8',
                            }}
                        >
                            {opponent.mp >= 100 ? 'BURST 🔥' : `MP ${opponent.mp}%`}
                        </span>
                        <div
                            style={{
                                flex: 1,
                                height: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                borderRadius: '3px',
                                overflow: 'hidden',
                            }}
                        >
                            <motion.div
                                animate={{ width: `${Math.min(100, opponent.mp)}%` }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    height: '100%',
                                    marginLeft: 'auto',
                                    background:
                                        opponent.mp >= 100
                                            ? 'linear-gradient(90deg, #00d4ff, #8b5cf6)'
                                            : 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Duel Battle Arena Stage (Characters, Attacks, & Combo Showcase) */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    height: '144px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                }}
            >
                {/* --- CENTER STAGE: FLOATING ARCADE COMBO SURGE --- */}
                <AnimatePresence>
                    {comboTier && (
                        <motion.div
                            key={comboCount}
                            initial={{ scale: 0.5, y: -14, opacity: 0, rotate: -4 }}
                            animate={{ scale: [1.25, 1], y: 0, opacity: 1, rotate: [2, 0] }}
                            exit={{ scale: 0.7, opacity: 0, y: -10 }}
                            transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '6px',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                pointerEvents: 'none',
                                zIndex: 14,
                                padding: '6px 14px 7px',
                                borderRadius: '12px',
                                background: 'rgba(10, 15, 30, 0.92)',
                                border: `1.5px solid ${comboTier.borderColor}`,
                                boxShadow: `0 8px 24px -4px rgba(0, 0, 0, 0.7), 0 0 16px -2px ${comboTier.shadowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`,
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            {/* Tier Indonesian Title Tag */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    marginBottom: '3px',
                                }}
                            >
                                <span style={{ fontSize: '13px', filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))' }}>
                                    {comboTier.icon}
                                </span>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        color: comboTier.color,
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    {comboTier.indonesianTitle}
                                </span>
                            </div>

                            {/* Arcade Streak Counter */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontWeight: 900,
                                        fontSize: comboCount >= 6 ? '26px' : '22px',
                                        lineHeight: 1,
                                        background:
                                            comboCount >= 8
                                                ? 'linear-gradient(180deg, #ffffff 0%, #fef08a 40%, #eab308 100%)'
                                                : comboCount >= 6
                                                ? 'linear-gradient(180deg, #ffffff 0%, #fca5a5 40%, #ef4444 100%)'
                                                : comboCount >= 4
                                                ? 'linear-gradient(180deg, #ffffff 0%, #fed7aa 40%, #f97316 100%)'
                                                : 'linear-gradient(180deg, #ffffff 0%, #fef08a 40%, #facc15 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        filter: `drop-shadow(0 2px 10px ${comboTier.shadowColor})`,
                                        letterSpacing: '-0.03em',
                                    }}
                                >
                                    {comboCount}x
                                </span>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        color: '#e2e8f0',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    STREAK
                                </span>
                            </div>

                            {/* 4-Segment Streak Momentum Gauge & Bonus Multiplier Tag */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ display: 'flex', gap: '3px' }}>
                                    {[1, 2, 3, 4].map((seg) => (
                                        <div
                                            key={seg}
                                            style={{
                                                width: '13px',
                                                height: '3.5px',
                                                borderRadius: '2px',
                                                background: seg <= comboTier.gaugeSegments
                                                    ? comboTier.accent
                                                    : 'rgba(255, 255, 255, 0.12)',
                                                boxShadow: seg <= comboTier.gaugeSegments
                                                    ? `0 0 6px ${comboTier.accent}`
                                                    : 'none',
                                                transition: 'all 0.3s ease',
                                            }}
                                        />
                                    ))}
                                </div>
                                <span
                                    style={{
                                        fontSize: '9px',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-mono)',
                                        color: comboTier.color,
                                        opacity: 0.95,
                                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                                    }}
                                >
                                    {comboTier.multiplierText}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- ACTIVE ATTACK WEAPON BANNER --- */}
                <AnimatePresence>
                    {activeAttack && attackConfig && (
                        <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                bottom: '8px',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '5px 12px',
                                borderRadius: '10px',
                                background: 'rgba(10, 15, 30, 0.94)',
                                border: `1px solid ${attackConfig.color}`,
                                boxShadow: `0 4px 16px -2px ${attackConfig.impactGlow}`,
                                pointerEvents: 'none',
                                zIndex: 13,
                                whiteSpace: 'nowrap',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <span style={{ fontSize: '15px' }}>{attackConfig.icon}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        color: attackConfig.color,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {attackConfig.attackName}
                                </span>
                                <span
                                    style={{
                                        fontSize: '9px',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 600,
                                        color: '#cbd5e1',
                                        lineHeight: 1.1,
                                    }}
                                >
                                    {activeAttack.isUltimate
                                        ? '🔥 Serangan Pamungkas Ultimate'
                                        : activeAttack.isCrit
                                        ? `💥 Serangan Kritis${comboTier ? ` • ${comboTier.indonesianTitle}` : ''}`
                                        : comboTier
                                        ? `${attackConfig.name} • ${comboTier.indonesianTitle} (${comboTier.multiplierText})`
                                        : attackConfig.name}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- LEFT FIGHTER (Player / You) --- */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Floating Damage / Combat Text on Player */}
                    <AnimatePresence>
                        {combatText?.target === 'player' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.7 }}
                                animate={{ opacity: 1, y: -24, scale: 1.15 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.55, ease: 'easeOut' }}
                                style={{
                                    position: 'absolute',
                                    top: '-16px',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 900,
                                    fontSize: '15px',
                                    color: combatText.type === 'miss' ? '#94a3b8' : 'var(--accent-red)',
                                    textShadow: '0 0 10px rgba(0, 0, 0, 0.9), 0 2px 4px #000000',
                                    pointerEvents: 'none',
                                    zIndex: 20,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {combatText.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Godlike Transcendent Crown floating above character on Tier 4 */}
                    {comboCount >= 8 && (
                        <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.8 }}
                            animate={{ opacity: [0.8, 1, 0.8], y: [-2, -6, -2], scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                            style={{
                                position: 'absolute',
                                top: '-22px',
                                fontSize: '18px',
                                filter: 'drop-shadow(0 0 8px #fef08a)',
                                zIndex: 10,
                                pointerEvents: 'none',
                            }}
                        >
                            👑
                        </motion.div>
                    )}

                    {/* Character Body with Lunge & Stagger */}
                    <motion.div
                        animate={
                            player.animationState === 'attack'
                                ? { x: [0, 42, 0], scale: [1, 1.1, 1] }
                                : player.animationState === 'hurt'
                                ? { x: [0, -14, 8, -4, 0], scale: [1, 0.94, 1], filter: ['brightness(1)', 'brightness(1.8) saturate(1.8)', 'brightness(1)'] }
                                : { y: [0, -4, 0] }
                        }
                        transition={
                            player.animationState === 'idle'
                                ? { repeat: Infinity, duration: 2.8, ease: 'easeInOut' }
                                : { duration: 0.42 }
                        }
                        style={{ position: 'relative' }}
                    >
                        <CharacterVisual
                            role={player.avatarClass || 'warrior'}
                            equipped={player.equipped || {}}
                            size={charSize}
                            animationState={player.animationState}
                            showAura={true}
                            facing="right"
                            showRoleBadge={false}
                        />
                    </motion.div>

                    {/* Pedestal Base Ring with Dynamic Combo Flame Surge */}
                    <div style={{ position: 'relative', marginTop: '-12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Base Ring */}
                        <div
                            style={{
                                width: '84px',
                                height: '14px',
                                borderRadius: '50%',
                                background: comboTier
                                    ? `radial-gradient(circle, ${comboTier.shadowColor} 0%, transparent 75%)`
                                    : 'radial-gradient(circle, rgba(245, 197, 66, 0.35) 0%, transparent 75%)',
                                border: comboTier ? `1.5px solid ${comboTier.borderColor}` : '1px solid rgba(245, 197, 66, 0.3)',
                                transition: 'all 0.3s ease',
                            }}
                        />

                        {/* Animated Flame Pulse Ring when Streak is Active */}
                        {comboTier && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.55, 0.95, 0.55] }}
                                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                                style={{
                                    position: 'absolute',
                                    width: '94px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: `radial-gradient(circle, ${comboTier.shadowColor} 0%, transparent 75%)`,
                                    border: `1.5px solid ${comboTier.borderColor}`,
                                    pointerEvents: 'none',
                                }}
                            />
                        )}

                        {/* Swirling Elemental Flame Aura on High Streak (Tier >= 3) */}
                        {comboCount >= 6 && (
                            <motion.div
                                animate={{ rotate: 360, scale: [0.95, 1.08, 0.95] }}
                                transition={{ rotate: { repeat: Infinity, duration: 3, ease: 'linear' }, scale: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } }}
                                style={{
                                    position: 'absolute',
                                    width: '102px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    border: `1.5px dashed ${comboTier?.color || '#ef4444'}`,
                                    boxShadow: `0 0 12px ${comboTier?.shadowColor || 'rgba(239, 68, 68, 0.5)'}`,
                                    pointerEvents: 'none',
                                }}
                            />
                        )}

                        {/* Rising Ember Sparks when Streak >= 2 (Quantity scales with streak tier) */}
                        {comboCount >= 2 && (
                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
                                {Array.from({ length: comboCount >= 8 ? 8 : comboCount >= 6 ? 6 : comboCount >= 4 ? 5 : 4 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 0, x: (i - 2.5) * 11 }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            y: [0, -36 - i * 7],
                                            x: [(i - 2.5) * 11, (i - 2.5) * 15 + (i % 2 === 0 ? 7 : -7)],
                                            scale: [0.8, 1.35, 0.4],
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.2 + i * 0.2,
                                            delay: i * 0.25,
                                            ease: 'easeOut',
                                        }}
                                        style={{
                                            position: 'absolute',
                                            bottom: '6px',
                                            left: '50%',
                                            width: '2px',
                                            height: i % 2 === 0 ? '9px' : '6px',
                                            borderRadius: '1px',
                                            background: `linear-gradient(to top, transparent, ${comboTier?.accent || '#f59e0b'}, #ffffff)`,
                                            opacity: 0.85,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ATTACK PROJECTILE & IMPACT BURST OVERLAY --- */}
                <AnimatePresence>
                    {activeAttack && attackConfig && (() => {
                        const streakScale = 1 + Math.min(0.4, (activeAttack.comboCount || comboCount) * 0.05)
                        const trailTailWidth = Math.round(74 + Math.min(44, (activeAttack.comboCount || comboCount) * 6))

                        return (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    pointerEvents: 'none',
                                    zIndex: 15,
                                    overflow: 'visible',
                                }}
                            >
                                {/* Moving Energy Projectile with Tailored Trail & Streak Surge */}
                                <motion.div
                                    key={activeAttack.id}
                                    initial={{
                                        left: activeAttack.direction === 'left-to-right' ? '24%' : '76%',
                                        top: '42%',
                                        scale: 0.5 * streakScale,
                                        opacity: 0,
                                    }}
                                    animate={{
                                        left: activeAttack.direction === 'left-to-right' ? '76%' : '24%',
                                        top: '42%',
                                        scale: [0.7 * streakScale, 1.35 * streakScale, 1.1 * streakScale],
                                        opacity: [0, 1, 1],
                                    }}
                                    exit={{ opacity: 0, scale: 1.8 * streakScale }}
                                    transition={{ duration: 0.36, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute',
                                        transform: 'translate(-50%, -50%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {/* Light Streak Trail Tail */}
                                    <div
                                        style={{
                                            width: `${trailTailWidth}px`,
                                            height: `${Math.round(7 * streakScale)}px`,
                                            background: attackConfig.trailGradient,
                                            borderRadius: '4px',
                                            filter: `drop-shadow(0 0 14px ${attackConfig.impactGlow})`,
                                            transform: activeAttack.direction === 'right-to-left' ? 'scaleX(-1)' : undefined,
                                        }}
                                    />

                                    {/* Trailing streak sparks flying behind projectile */}
                                    {(activeAttack.comboCount || comboCount) >= 2 && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                left: activeAttack.direction === 'left-to-right' ? '-14px' : 'auto',
                                                right: activeAttack.direction === 'right-to-left' ? '-14px' : 'auto',
                                                display: 'flex',
                                                gap: '4px',
                                            }}
                                        >
                                            {[0, 1].map((s) => (
                                                <motion.div
                                                    key={s}
                                                    animate={{ opacity: [0.4, 1, 0], scale: [1, 0.4] }}
                                                    transition={{ repeat: Infinity, duration: 0.24, delay: s * 0.1 }}
                                                    style={{
                                                        width: '14px',
                                                        height: '2px',
                                                        borderRadius: '1px',
                                                        background: `linear-gradient(90deg, transparent, ${attackConfig.accentColor})`,
                                                        opacity: 0.8,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Projectile Vector Graphic Core */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            filter: `drop-shadow(0 0 16px ${attackConfig.impactGlow})`,
                                            transform: activeAttack.direction === 'right-to-left' ? 'scaleX(-1)' : undefined,
                                        }}
                                    >
                                        <WeaponProjectileGraphic
                                            kind={attackConfig.projectileKind}
                                            color={attackConfig.color}
                                            accentColor={attackConfig.accentColor}
                                        />
                                    </div>
                                </motion.div>

                                {/* Impact Explosion Burst at Target */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: 1, scale: streakScale }}
                                    transition={{ duration: 0.45, delay: 0.26 }}
                                    style={{
                                        position: 'absolute',
                                        left: activeAttack.direction === 'left-to-right' ? '76%' : '24%',
                                        top: '42%',
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    <WeaponImpactBurstGraphic
                                        style={attackConfig.impactStyle}
                                        color={attackConfig.color}
                                        impactGlow={attackConfig.impactGlow}
                                    />
                                </motion.div>
                            </div>
                        )
                    })()}
                </AnimatePresence>

                {/* --- RIGHT FIGHTER (Opponent / Bot) --- */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Floating Damage / Combat Text on Opponent */}
                    <AnimatePresence>
                        {combatText?.target === 'opponent' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.7 }}
                                animate={{ opacity: 1, y: -24, scale: 1.25 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.55, ease: 'easeOut' }}
                                style={{
                                    position: 'absolute',
                                    top: '-16px',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 900,
                                    fontSize: '15px',
                                    color: combatText.type === 'crit' ? '#ef4444' : 'var(--color-signal-orange)',
                                    textShadow: '0 0 12px rgba(0, 0, 0, 0.9), 0 2px 4px #000000',
                                    pointerEvents: 'none',
                                    zIndex: 20,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {combatText.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Opponent Character Model with Stagger & Hurt */}
                    <motion.div
                        animate={
                            opponent.animationState === 'attack'
                                ? { x: [0, -42, 0], scale: [1, 1.1, 1] }
                                : opponent.animationState === 'hurt'
                                ? { x: [0, 14, -8, 4, 0], scale: [1, 0.94, 1], filter: ['brightness(1)', 'brightness(1.8) saturate(1.8)', 'brightness(1)'] }
                                : { y: [0, -4, 0] }
                        }
                        transition={
                            opponent.animationState === 'idle'
                                ? { repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.4 }
                                : { duration: 0.42 }
                        }
                        style={{ position: 'relative' }}
                    >
                        <CharacterVisual
                            role={opponent.avatarClass || 'mage'}
                            equipped={opponent.equipped || {}}
                            size={charSize}
                            animationState={opponent.animationState}
                            showAura={true}
                            facing="left"
                            showRoleBadge={false}
                        />
                    </motion.div>

                    {/* Pedestal Base Ring */}
                    <div
                        style={{
                            width: '84px',
                            height: '14px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.35) 0%, transparent 75%)',
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                            marginTop: '-12px',
                        }}
                    />
                </div>
            </div>
        </motion.div>
    )
}

function arePropsEqual(prev: BattleArenaStageProps, next: BattleArenaStageProps) {
    if (prev.activeAttack !== next.activeAttack) return false
    if (prev.combatText !== next.combatText) return false
    if (prev.comboCount !== next.comboCount) return false
    if (prev.battleLog !== next.battleLog) return false
    if (prev.className !== next.className) return false

    const p1 = prev.player
    const p2 = next.player
    if (
        p1.name !== p2.name ||
        p1.avatarClass !== p2.avatarClass ||
        p1.hp !== p2.hp ||
        p1.maxHp !== p2.maxHp ||
        p1.mp !== p2.mp ||
        p1.score !== p2.score ||
        p1.animationState !== p2.animationState ||
        p1.level !== p2.level ||
        p1.schoolName !== p2.schoolName ||
        p1.equipped !== p2.equipped
    ) {
        return false
    }

    const o1 = prev.opponent
    const o2 = next.opponent
    if (
        o1.name !== o2.name ||
        o1.avatarClass !== o2.avatarClass ||
        o1.hp !== o2.hp ||
        o1.maxHp !== o2.maxHp ||
        o1.mp !== o2.mp ||
        o1.score !== o2.score ||
        o1.animationState !== o2.animationState ||
        o1.level !== o2.level ||
        o1.isBot !== o2.isBot ||
        o1.schoolName !== o2.schoolName ||
        o1.equipped !== o2.equipped
    ) {
        return false
    }

    return true
}

export default React.memo(BattleArenaStage, arePropsEqual)
