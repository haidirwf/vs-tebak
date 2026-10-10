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
    | 'cosmic_singularity'
    | 'dragon_fang'
    | 'flame_wave'
    | 'steel_slash'
    | 'wood_slash'
    | 'celestial_lance'
    | 'shadow_bolt'
    | 'gale_arrow'
    | 'hunter_arrow'
    | 'crystal_shard'
    | 'astral_comet'
    | 'arcane_orb'
    | 'seraph_beam'
    | 'holy_chime'
    | 'dawn_beam'
    | 'prayer_spark'
    | 'cyber_pulse'

export type WeaponImpactStyle =
    | 'cosmic'
    | 'dragon'
    | 'flame'
    | 'steel'
    | 'celestial'
    | 'shadow'
    | 'gale'
    | 'holy'
    | 'arcane'
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

// Complete weapon attack visuals database
const WEAPON_ATTACK_CONFIGS: Record<string, WeaponAttackConfig> = {
    // --- MAGE WEAPONS ---
    wpn_archmage_orb: {
        weaponId: 'wpn_archmage_orb',
        name: 'Archmage Genesis Core',
        attackName: 'Cosmic Singularity Burst',
        projectileKind: 'cosmic_singularity',
        impactStyle: 'cosmic',
        color: '#c084fc',
        accentColor: '#38bdf8',
        trailGradient: 'linear-gradient(90deg, transparent, #8b5cf6, #ec4899, #38bdf8, #ffffff)',
        impactGlow: 'rgba(192, 132, 252, 0.95)',
        icon: '🌌',
    },
    wpn_astral_wand: {
        weaponId: 'wpn_astral_wand',
        name: 'Astral Nebula Wand',
        attackName: 'Astral Star Comet',
        projectileKind: 'astral_comet',
        impactStyle: 'arcane',
        color: '#e879f9',
        accentColor: '#a855f7',
        trailGradient: 'linear-gradient(90deg, transparent, #9333ea, #c084fc, #f472b6, #ffffff)',
        impactGlow: 'rgba(232, 121, 249, 0.9)',
        icon: '✨',
    },
    wpn_crystal_staff: {
        weaponId: 'wpn_crystal_staff',
        name: 'Arcane Crystal Staff',
        attackName: 'Crystal Mana Shard',
        projectileKind: 'crystal_shard',
        impactStyle: 'arcane',
        color: '#a855f7',
        accentColor: '#38bdf8',
        trailGradient: 'linear-gradient(90deg, transparent, #7c3aed, #a855f7, #38bdf8, #ffffff)',
        impactGlow: 'rgba(168, 85, 247, 0.9)',
        icon: '🔮',
    },
    wpn_mage_starter: {
        weaponId: 'wpn_mage_starter',
        name: 'Tongkat Sihir Murid',
        attackName: 'Arcane Magic Pulse',
        projectileKind: 'arcane_orb',
        impactStyle: 'arcane',
        color: '#8b5cf6',
        accentColor: '#60a5fa',
        trailGradient: 'linear-gradient(90deg, transparent, #6d28d9, #8b5cf6, #93c5fd)',
        impactGlow: 'rgba(139, 92, 246, 0.85)',
        icon: '🪄',
    },

    // --- WARRIOR WEAPONS ---
    wpn_dragon_slayer: {
        weaponId: 'wpn_dragon_slayer',
        name: 'Excalibur Dragon Blade',
        attackName: 'Dragon Fang Crimson Cleave',
        projectileKind: 'dragon_fang',
        impactStyle: 'dragon',
        color: '#ef4444',
        accentColor: '#f59e0b',
        trailGradient: 'linear-gradient(90deg, transparent, #991b1b, #ef4444, #f59e0b, #fef08a)',
        impactGlow: 'rgba(239, 68, 68, 0.95)',
        icon: '⚡',
    },
    wpn_flame_claymore: {
        weaponId: 'wpn_flame_claymore',
        name: 'Crimson Claymore',
        attackName: 'Crimson Flame Wave',
        projectileKind: 'flame_wave',
        impactStyle: 'flame',
        color: '#f97316',
        accentColor: '#ef4444',
        trailGradient: 'linear-gradient(90deg, transparent, #c2410c, #ea580c, #f97316, #fef08a)',
        impactGlow: 'rgba(249, 115, 22, 0.92)',
        icon: '🔥',
    },
    wpn_iron_broadsword: {
        weaponId: 'wpn_iron_broadsword',
        name: 'Iron Broadsword',
        attackName: 'Steel Kinetic Cleave',
        projectileKind: 'steel_slash',
        impactStyle: 'steel',
        color: '#94a3b8',
        accentColor: '#38bdf8',
        trailGradient: 'linear-gradient(90deg, transparent, #475569, #94a3b8, #38bdf8, #ffffff)',
        impactGlow: 'rgba(148, 163, 184, 0.9)',
        icon: '⚔️',
    },
    wpn_warrior_starter: {
        weaponId: 'wpn_warrior_starter',
        name: 'Pedang Latih Kayu',
        attackName: 'Training Blade Strike',
        projectileKind: 'wood_slash',
        impactStyle: 'steel',
        color: '#f59e0b',
        accentColor: '#cbd5e1',
        trailGradient: 'linear-gradient(90deg, transparent, #b45309, #f59e0b, #e2e8f0)',
        impactGlow: 'rgba(245, 158, 11, 0.8)',
        icon: '🗡️',
    },

    // --- ARCHER WEAPONS ---
    wpn_celestial_bow: {
        weaponId: 'wpn_celestial_bow',
        name: 'Celestial Artemis Bow',
        attackName: 'Artemis Starlight Lance',
        projectileKind: 'celestial_lance',
        impactStyle: 'celestial',
        color: '#facc15',
        accentColor: '#ffffff',
        trailGradient: 'linear-gradient(90deg, transparent, #ca8a04, #eab308, #facc15, #ffffff)',
        impactGlow: 'rgba(250, 204, 21, 0.95)',
        icon: '💫',
    },
    wpn_shadow_cross: {
        weaponId: 'wpn_shadow_cross',
        name: 'Phantom Crossbow',
        attackName: 'Phantom Void Bolt',
        projectileKind: 'shadow_bolt',
        impactStyle: 'shadow',
        color: '#a855f7',
        accentColor: '#6366f1',
        trailGradient: 'linear-gradient(90deg, transparent, #4c1d95, #7c3aed, #a855f7, #e0e7ff)',
        impactGlow: 'rgba(168, 85, 247, 0.9)',
        icon: '⚡',
    },
    wpn_recurve_bow: {
        weaponId: 'wpn_recurve_bow',
        name: 'Composite Wind Bow',
        attackName: 'Gale Wind Arrow',
        projectileKind: 'gale_arrow',
        impactStyle: 'gale',
        color: '#22c55e',
        accentColor: '#34d399',
        trailGradient: 'linear-gradient(90deg, transparent, #059669, #10b981, #34d399, #a7f3d0)',
        impactGlow: 'rgba(34, 197, 94, 0.9)',
        icon: '🎯',
    },
    wpn_archer_starter: {
        weaponId: 'wpn_archer_starter',
        name: 'Busur Pemburu Hutan',
        attackName: 'Hunter Swift Arrow',
        projectileKind: 'hunter_arrow',
        impactStyle: 'gale',
        color: '#10b981',
        accentColor: '#86efac',
        trailGradient: 'linear-gradient(90deg, transparent, #047857, #10b981, #6ee7b7)',
        impactGlow: 'rgba(16, 185, 129, 0.85)',
        icon: '🏹',
    },

    // --- HEALER WEAPONS ---
    wpn_seraph_staff: {
        weaponId: 'wpn_seraph_staff',
        name: 'Seraphim Crown Staff',
        attackName: 'Seraphic Divine Judgement',
        projectileKind: 'seraph_beam',
        impactStyle: 'holy',
        color: '#fde047',
        accentColor: '#eab308',
        trailGradient: 'linear-gradient(90deg, transparent, #ca8a04, #eab308, #fde047, #ffffff)',
        impactGlow: 'rgba(253, 224, 71, 0.95)',
        icon: '🕊️',
    },
    wpn_divine_censer: {
        weaponId: 'wpn_divine_censer',
        name: 'Divine Sanctuary Bell',
        attackName: 'Sanctuary Holy Chime',
        projectileKind: 'holy_chime',
        impactStyle: 'holy',
        color: '#eab308',
        accentColor: '#f59e0b',
        trailGradient: 'linear-gradient(90deg, transparent, #b45309, #d97706, #f59e0b, #fef08a)',
        impactGlow: 'rgba(234, 179, 8, 0.9)',
        icon: '🔔',
    },
    wpn_radiant_scepter: {
        weaponId: 'wpn_radiant_scepter',
        name: 'Radiant Dawn Scepter',
        attackName: 'Radiant Dawn Beam',
        projectileKind: 'dawn_beam',
        impactStyle: 'holy',
        color: '#f59e0b',
        accentColor: '#fde047',
        trailGradient: 'linear-gradient(90deg, transparent, #d97706, #f59e0b, #fbbf24, #ffffff)',
        impactGlow: 'rgba(245, 158, 11, 0.9)',
        icon: '🔱',
    },
    wpn_healer_starter: {
        weaponId: 'wpn_healer_starter',
        name: 'Tongkat Doa Kayu',
        attackName: 'Prayer Light Spark',
        projectileKind: 'prayer_spark',
        impactStyle: 'holy',
        color: '#fbbf24',
        accentColor: '#fef08a',
        trailGradient: 'linear-gradient(90deg, transparent, #b45309, #f59e0b, #fde047)',
        impactGlow: 'rgba(251, 191, 36, 0.85)',
        icon: '📿',
    },

    // --- BOT SENTINEL ---
    bot: {
        weaponId: 'bot',
        name: 'AI Sentinel',
        attackName: 'Neural Cyber Pulse',
        projectileKind: 'cyber_pulse',
        impactStyle: 'cyber',
        color: '#00d4ff',
        accentColor: '#38bdf8',
        trailGradient: 'linear-gradient(90deg, transparent, #0284c7, #00d4ff, #38bdf8, #ffffff)',
        impactGlow: 'rgba(0, 212, 255, 0.95)',
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

// Streak tier levels with distinct visual themes and punchy labels
export interface ComboTier {
    tier: number
    title: string
    icon: string
    color: string
    accent: string
    bgGradient: string
    borderColor: string
    shadowColor: string
    multiplier: string
}

export function getComboTier(combo: number): ComboTier | null {
    if (combo >= 8) {
        return {
            tier: 4,
            title: 'GODLIKE DOMINATION',
            icon: '👑',
            color: '#fef08a',
            accent: '#eab308',
            bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.28) 0%, rgba(245, 158, 11, 0.42) 100%)',
            borderColor: 'rgba(250, 204, 21, 0.75)',
            shadowColor: 'rgba(234, 179, 8, 0.5)',
            multiplier: '2.0x DMG',
        }
    }
    if (combo >= 6) {
        return {
            tier: 3,
            title: 'UNSTOPPABLE FURY',
            icon: '💥',
            color: '#f87171',
            accent: '#ef4444',
            bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.4) 100%)',
            borderColor: 'rgba(248, 113, 113, 0.7)',
            shadowColor: 'rgba(239, 68, 68, 0.45)',
            multiplier: '1.75x DMG',
        }
    }
    if (combo >= 4) {
        return {
            tier: 2,
            title: 'RAMPAGE SURGE',
            icon: '⚡',
            color: '#fb923c',
            accent: '#f97316',
            bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(234, 88, 12, 0.35) 100%)',
            borderColor: 'rgba(251, 146, 60, 0.65)',
            shadowColor: 'rgba(249, 115, 22, 0.4)',
            multiplier: '1.5x DMG',
        }
    }
    if (combo >= 2) {
        return {
            tier: 1,
            title: 'RISING STRIKE',
            icon: '🔥',
            color: '#facc15',
            accent: '#eab308',
            bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.18) 0%, rgba(202, 138, 4, 0.3) 100%)',
            borderColor: 'rgba(250, 204, 21, 0.55)',
            shadowColor: 'rgba(234, 179, 8, 0.3)',
            multiplier: '1.25x DMG',
        }
    }
    return null
}

// Custom vector graphics for flying projectiles
function WeaponProjectileGraphic({ kind, color, accentColor }: { kind: WeaponProjectileKind; color: string; accentColor: string }) {
    switch (kind) {
        case 'cosmic_singularity':
            return (
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    {/* Pulsing cosmic void nucleus */}
                    <circle cx="19" cy="19" r="7" fill="#090d16" stroke="#c084fc" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 8px #c084fc)' }} />
                    <circle cx="19" cy="19" r="3" fill="#ffffff" />
                    {/* Orbiting elliptical rings */}
                    <ellipse cx="19" cy="19" rx="14" ry="5" fill="none" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(-25 19 19)" opacity="0.85" />
                    <ellipse cx="19" cy="19" rx="14" ry="5" fill="none" stroke="#e879f9" strokeWidth="1.5" transform="rotate(45 19 19)" opacity="0.85" />
                    {/* Starlight cross flares */}
                    <line x1="19" y1="2" x2="19" y2="36" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                    <line x1="2" y1="19" x2="36" y2="19" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                </svg>
            )
        case 'dragon_fang':
            return (
                <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
                    {/* Flaming Dragon Fang Blade */}
                    <path
                        d="M 4 22 Q 22 24 38 6 Q 26 12 14 8 Q 8 14 4 22 Z"
                        fill="url(#dragonGrad)"
                        stroke="#fef08a"
                        strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 0 10px #ef4444)' }}
                    />
                    <path d="M 12 12 Q 26 16 34 8" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                    <defs>
                        <linearGradient id="dragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#991b1b" />
                            <stop offset="50%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                    </defs>
                </svg>
            )
        case 'flame_wave':
            return (
                <svg width="36" height="30" viewBox="0 0 36 30" fill="none">
                    {/* Crescent Flame Wave */}
                    <path
                        d="M 6 26 Q 28 20 32 4 Q 22 18 10 16 Q 16 12 18 6 Q 6 16 6 26 Z"
                        fill="url(#flameGrad)"
                        stroke="#fef08a"
                        strokeWidth="1.2"
                        style={{ filter: 'drop-shadow(0 0 8px #f97316)' }}
                    />
                    <defs>
                        <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ea580c" />
                            <stop offset="60%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#fef08a" />
                        </linearGradient>
                    </defs>
                </svg>
            )
        case 'steel_slash':
        case 'wood_slash':
            return (
                <svg width="38" height="24" viewBox="0 0 38 24" fill="none">
                    {/* Razor Steel Cleave Arc */}
                    <path
                        d="M 2 20 Q 20 22 36 4 Q 22 10 6 8 Z"
                        fill={kind === 'wood_slash' ? '#b45309' : '#e2e8f0'}
                        stroke={kind === 'wood_slash' ? '#f59e0b' : '#38bdf8'}
                        strokeWidth="1.6"
                        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                    />
                    <line x1="8" y1="12" x2="30" y2="6" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
            )
        case 'celestial_lance':
            return (
                <svg width="42" height="22" viewBox="0 0 42 22" fill="none">
                    {/* Radiant Artemis Light Lance */}
                    <path d="M 2 11 L 34 11" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #facc15)' }} />
                    <path d="M 28 4 L 40 11 L 28 18 L 32 11 Z" fill="#ffffff" stroke="#eab308" strokeWidth="1.2" />
                    {/* Sonic boom chevrons */}
                    <path d="M 14 6 L 20 11 L 14 16" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                    <path d="M 6 7 L 11 11 L 6 15" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                </svg>
            )
        case 'shadow_bolt':
            return (
                <svg width="38" height="20" viewBox="0 0 38 20" fill="none">
                    {/* Phantom Void Arrow */}
                    <path d="M 2 10 L 32 10" stroke="#a855f7" strokeWidth="2.2" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #a855f7)' }} />
                    <polygon points="26,4 36,10 26,16 30,10" fill="#4c1d95" stroke="#c084fc" strokeWidth="1.2" />
                    <circle cx="16" cy="10" r="3" fill="#6366f1" opacity="0.8" />
                </svg>
            )
        case 'gale_arrow':
        case 'hunter_arrow':
            return (
                <svg width="38" height="20" viewBox="0 0 38 20" fill="none">
                    {/* Aerodynamic Wind Arrow with Gale Rings */}
                    <path d="M 2 10 L 32 10" stroke={color} strokeWidth="2.2" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
                    <polygon points="26,5 36,10 26,15 29,10" fill="#ffffff" stroke={color} strokeWidth="1.2" />
                    <path d="M 12 5 Q 16 10 12 15" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.85" />
                    <path d="M 6 6 Q 9 10 6 14" stroke={accentColor} strokeWidth="1.2" fill="none" opacity="0.6" />
                </svg>
            )
        case 'crystal_shard':
        case 'astral_comet':
        case 'arcane_orb':
            return (
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    {/* Prismatic Arcane Crystal Core */}
                    <polygon
                        points="17,3 27,10 27,24 17,31 7,24 7,10"
                        fill="url(#arcaneGrad)"
                        stroke="#ffffff"
                        strokeWidth="1.4"
                        style={{ filter: `drop-shadow(0 0 10px ${color})` }}
                    />
                    <polygon points="17,8 23,12 23,22 17,26 11,22 11,12" fill="#0f172a" opacity="0.4" />
                    <circle cx="17" cy="17" r="3.5" fill="#ffffff" />
                    <defs>
                        <linearGradient id="arcaneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7c3aed" />
                            <stop offset="50%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                    </defs>
                </svg>
            )
        case 'seraph_beam':
        case 'holy_chime':
        case 'dawn_beam':
        case 'prayer_spark':
            return (
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    {/* Divine Sunburst Orb with Angelic Halos */}
                    <circle cx="18" cy="18" r="7" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 10px #fde047)' }} />
                    <circle cx="18" cy="18" r="13" fill="none" stroke="#fde047" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
                    {/* Sun rays */}
                    <line x1="18" y1="2" x2="18" y2="8" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="18" y1="28" x2="18" y2="34" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="2" y1="18" x2="8" y2="18" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="28" y1="18" x2="34" y2="18" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
            )
        case 'cyber_pulse':
        default:
            return (
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    {/* AI Sentinel EMP Shock Core */}
                    <circle cx="18" cy="18" r="6" fill="#00d4ff" stroke="#ffffff" strokeWidth="1.8" style={{ filter: 'drop-shadow(0 0 10px #00d4ff)' }} />
                    <polygon points="18,4 28,10 28,26 18,32 8,26 8,10" fill="none" stroke="#0284c7" strokeWidth="1.5" opacity="0.8" />
                    <line x1="8" y1="18" x2="28" y2="18" stroke="#ffffff" strokeWidth="1.2" />
                    <line x1="18" y1="8" x2="18" y2="28" stroke="#ffffff" strokeWidth="1.2" />
                </svg>
            )
    }
}

// Custom vector explosion burst at target impact
function WeaponImpactBurstGraphic({ style, color, impactGlow }: { style: WeaponImpactStyle; color: string; impactGlow: string }) {
    switch (style) {
        case 'cosmic':
            return (
                <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Supernova Shockwave 1 */}
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.5, 3.2], opacity: [1, 0.8, 0] }}
                        transition={{ duration: 0.44, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #c084fc',
                            background: 'radial-gradient(circle, rgba(192, 132, 252, 0.4) 0%, transparent 70%)',
                            boxShadow: '0 0 16px #c084fc',
                        }}
                    />
                    {/* Inner Counter-Ring */}
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
                    {/* Central 4-Point Starburst */}
                    <motion.div
                        initial={{ scale: 0.4, opacity: 1, rotate: 0 }}
                        animate={{ scale: [0.4, 2.0, 0], opacity: [1, 1, 0], rotate: 45 }}
                        transition={{ duration: 0.38 }}
                        style={{
                            width: '24px',
                            height: '24px',
                            background: '#ffffff',
                            borderRadius: '2px',
                            boxShadow: '0 0 14px #ffffff',
                        }}
                    />
                </div>
            )
        case 'dragon':
            return (
                <div style={{ position: 'relative', width: '94px', height: '94px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Magma Blast Ring */}
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.6, 3.3], opacity: [1, 0.9, 0] }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '3px solid #ef4444',
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.5) 0%, transparent 70%)',
                            boxShadow: '0 0 18px #ef4444',
                        }}
                    />
                    {/* Crossing Dragon Claw Slashes */}
                    <svg width="74" height="74" viewBox="0 0 74 74" style={{ position: 'absolute' }}>
                        <motion.line
                            x1="12" y1="12" x2="62" y2="62"
                            stroke="#fef08a" strokeWidth="4.5" strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 1 }}
                            animate={{ pathLength: [0, 1, 0], opacity: [1, 1, 0] }}
                            transition={{ duration: 0.38 }}
                            style={{ filter: 'drop-shadow(0 0 8px #ef4444)' }}
                        />
                        <motion.line
                            x1="62" y1="12" x2="12" y2="62"
                            stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 1 }}
                            animate={{ pathLength: [0, 1, 0], opacity: [1, 1, 0] }}
                            transition={{ duration: 0.38, delay: 0.04 }}
                            style={{ filter: 'drop-shadow(0 0 8px #f59e0b)' }}
                        />
                    </svg>
                </div>
            )
        case 'celestial':
            return (
                <div style={{ position: 'relative', width: '88px', height: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Solar Flare Shockwave */}
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
                    {/* 8-Point Starlight Explosion Rays */}
                    <svg width="70" height="70" viewBox="0 0 70 70" style={{ position: 'absolute' }}>
                        <motion.path
                            d="M 35 4 L 35 66 M 4 35 L 66 35 M 13 13 L 57 57 M 57 13 L 13 57"
                            stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"
                            initial={{ scale: 0.4, opacity: 1 }}
                            animate={{ scale: [0.4, 1.8, 0], opacity: [1, 1, 0] }}
                            transition={{ duration: 0.4 }}
                            style={{ transformOrigin: 'center', filter: 'drop-shadow(0 0 10px #fef08a)' }}
                        />
                    </svg>
                </div>
            )
        case 'holy':
            return (
                <div style={{ position: 'relative', width: '88px', height: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.3, 2.9], opacity: [1, 0.85, 0] }}
                        transition={{ duration: 0.42 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #fde047',
                            background: 'radial-gradient(circle, rgba(253, 224, 71, 0.45) 0%, transparent 70%)',
                            boxShadow: '0 0 16px #eab308',
                        }}
                    />
                    {/* Vertical Divine Pillar */}
                    <motion.div
                        initial={{ scaleY: 0.2, opacity: 1 }}
                        animate={{ scaleY: [0.2, 2.5, 0], opacity: [1, 1, 0] }}
                        transition={{ duration: 0.38 }}
                        style={{
                            width: '8px',
                            height: '56px',
                            background: 'linear-gradient(180deg, #ffffff, #fde047, #ca8a04)',
                            borderRadius: '4px',
                            boxShadow: '0 0 12px #fde047',
                        }}
                    />
                </div>
            )
        case 'gale':
            return (
                <div style={{ position: 'relative', width: '84px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.2, 2.8], opacity: [1, 0.85, 0], rotate: 180 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2.5px solid #22c55e',
                            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%)',
                            boxShadow: '0 0 14px #22c55e',
                        }}
                    />
                </div>
            )
        case 'flame':
        case 'steel':
        case 'shadow':
        case 'arcane':
        case 'cyber':
        default:
            return (
                <div style={{ position: 'relative', width: '84px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: [0.3, 2.2, 2.8], opacity: [1, 0.85, 0] }}
                        transition={{ duration: 0.42 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: `2.5px solid ${color}`,
                            background: `radial-gradient(circle, ${impactGlow} 0%, transparent 70%)`,
                            boxShadow: `0 0 16px ${color}`,
                        }}
                    />
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

    // Tactile screen micro-tremor when an attack lands with combo or crit
    const [isShaking, setIsShaking] = React.useState(false)

    React.useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    // Trigger subtle tactile tremor upon impact
    React.useEffect(() => {
        if (activeAttack) {
            const timer = setTimeout(() => {
                if (comboCount >= 2 || activeAttack.isCrit || activeAttack.isUltimate) {
                    setIsShaking(true)
                    setTimeout(() => setIsShaking(false), 200)
                }
            }, 240)
            return () => clearTimeout(timer)
        }
    }, [activeAttack?.id, comboCount])

    const charSize = isMobile ? 84 : 112

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
            animate={isShaking ? { x: [-3, 3, -2, 2, 0], y: [-2, 2, -1, 1, 0] } : { x: 0, y: 0 }}
            transition={{ duration: 0.2, ease: 'linear' }}
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
                            initial={{ scale: 0.6, y: -8, opacity: 0 }}
                            animate={{ scale: [1.2, 1], y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '8px',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                pointerEvents: 'none',
                                zIndex: 12,
                            }}
                        >
                            {/* Tier Title Tag */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                    background: comboTier.bgGradient,
                                    border: `1px solid ${comboTier.borderColor}`,
                                    boxShadow: `0 2px 10px ${comboTier.shadowColor}`,
                                    marginBottom: '2px',
                                }}
                            >
                                <span style={{ fontSize: '11px' }}>{comboTier.icon}</span>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '9px',
                                        fontWeight: 800,
                                        color: comboTier.color,
                                        letterSpacing: '0.04em',
                                    }}
                                >
                                    {comboTier.title}
                                </span>
                            </div>

                            {/* Arcade Streak Counter */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontWeight: 900,
                                        fontSize: comboCount >= 6 ? '24px' : '20px',
                                        lineHeight: 1,
                                        background:
                                            comboCount >= 6
                                                ? 'linear-gradient(180deg, #ffffff 0%, #fef08a 40%, #f59e0b 100%)'
                                                : 'linear-gradient(180deg, #ffffff 0%, #fbbf24 50%, #f97316 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        filter: `drop-shadow(0 2px 8px ${comboTier.shadowColor})`,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {comboCount}x
                                </span>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        color: '#e2e8f0',
                                        letterSpacing: '0.06em',
                                    }}
                                >
                                    STREAK
                                </span>
                            </div>

                            {/* Bonus Multiplier Badge */}
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
                                {comboTier.multiplier}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- ACTIVE ATTACK WEAPON BANNER --- */}
                <AnimatePresence>
                    {activeAttack && attackConfig && (
                        <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                bottom: '8px',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                background: 'rgba(15, 23, 42, 0.9)',
                                border: `1px solid ${attackConfig.color}`,
                                boxShadow: `0 4px 14px -2px ${attackConfig.impactGlow}`,
                                pointerEvents: 'none',
                                zIndex: 12,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <span style={{ fontSize: '13px' }}>{attackConfig.icon}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '10px',
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
                                        ? '💥 Serangan Kritis'
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
                                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                                style={{
                                    position: 'absolute',
                                    width: '92px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: `radial-gradient(circle, ${comboTier.shadowColor} 0%, transparent 75%)`,
                                    border: `1px solid ${comboTier.borderColor}`,
                                    pointerEvents: 'none',
                                }}
                            />
                        )}

                        {/* Rising Ember Sparks when Streak >= 2 */}
                        {comboCount >= 2 && (
                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
                                {[0, 1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 0, x: (i - 1.5) * 14 }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            y: [0, -34 - i * 8],
                                            x: [(i - 1.5) * 14, (i - 1.5) * 18 + (i % 2 === 0 ? 6 : -6)],
                                            scale: [0.8, 1.3, 0.4],
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.3 + i * 0.25,
                                            delay: i * 0.3,
                                            ease: 'easeOut',
                                        }}
                                        style={{
                                            position: 'absolute',
                                            bottom: '6px',
                                            left: '50%',
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            backgroundColor: i % 2 === 0 ? comboTier?.accent || '#f59e0b' : '#ffffff',
                                            boxShadow: `0 0 6px ${comboTier?.accent || '#f59e0b'}`,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ATTACK PROJECTILE & IMPACT BURST OVERLAY --- */}
                <AnimatePresence>
                    {activeAttack && attackConfig && (
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                pointerEvents: 'none',
                                zIndex: 15,
                                overflow: 'visible',
                            }}
                        >
                            {/* Moving Energy Projectile with Bespoke Trail */}
                            <motion.div
                                key={activeAttack.id}
                                initial={{
                                    left: activeAttack.direction === 'left-to-right' ? '24%' : '76%',
                                    top: '42%',
                                    scale: 0.5,
                                    opacity: 0,
                                }}
                                animate={{
                                    left: activeAttack.direction === 'left-to-right' ? '76%' : '24%',
                                    top: '42%',
                                    scale: [0.7, 1.35, 1.1],
                                    opacity: [0, 1, 1],
                                }}
                                exit={{ opacity: 0, scale: 1.8 }}
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
                                        width: '74px',
                                        height: '7px',
                                        background: attackConfig.trailGradient,
                                        borderRadius: '4px',
                                        filter: `drop-shadow(0 0 12px ${attackConfig.impactGlow})`,
                                        transform: activeAttack.direction === 'right-to-left' ? 'scaleX(-1)' : undefined,
                                    }}
                                />

                                {/* Projectile Vector Graphic Core */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        filter: `drop-shadow(0 0 14px ${attackConfig.impactGlow})`,
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
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
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
                    )}
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
