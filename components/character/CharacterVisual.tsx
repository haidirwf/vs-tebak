'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AvatarClass } from '@/types'
import { CHARACTER_ROLES, EquippedItemsMap, getStarterEquippedMap } from '@/lib/game/character'
import { getItemById } from '@/lib/game/items'

interface CharacterVisualProps {
    role: AvatarClass
    equipped?: EquippedItemsMap
    size?: number | string
    animationState?: 'idle' | 'attack' | 'hurt'
    showAura?: boolean
    interactive?: boolean
    className?: string
    facing?: 'left' | 'right'
    showRoleBadge?: boolean
}

function CharacterVisual({
    role,
    equipped = {},
    size = 220,
    animationState = 'idle',
    showAura = true,
    interactive = false,
    className = '',
    facing = 'right',
    showRoleBadge = true,
}: CharacterVisualProps) {
    const roleInfo = CHARACTER_ROLES[role] || CHARACTER_ROLES.warrior
    const resolvedEquipped = React.useMemo(() => {
        if (equipped && Object.keys(equipped).length > 0) return equipped
        return getStarterEquippedMap(role)
    }, [equipped, role])

    const weaponItem = resolvedEquipped.weapon ? getItemById(resolvedEquipped.weapon) : null
    const headItem = resolvedEquipped.head ? getItemById(resolvedEquipped.head) : null
    const armorItem = resolvedEquipped.armor ? getItemById(resolvedEquipped.armor) : null
    const accessoryItem = resolvedEquipped.accessory ? getItemById(resolvedEquipped.accessory) : null

    // Determine colors
    const primary = roleInfo.themeColor
    const secondary = roleInfo.secondaryColor

    const isValkyrieWings = accessoryItem?.id === 'acc_valkyrie_wings' || accessoryItem?.icon === '🪽'
    const isFlameAura = accessoryItem?.id === 'acc_flame_aura' || accessoryItem?.icon === '🔥'
    const isArchangelHalo = accessoryItem?.id === 'acc_archangel_halo'
    const isInfinityPrism = accessoryItem?.id === 'acc_infinity_prism'
    const isPhoenixFeather = accessoryItem?.id === 'acc_phoenix_feather'
    const isDraconicHeart = accessoryItem?.id === 'acc_draconic_heart'
    const isChronoPendant = accessoryItem?.id === 'acc_chrono_pendant' || accessoryItem?.icon === '⏳'
    const isCelestialHourglass = accessoryItem?.id === 'acc_celestial_hourglass'
    const isVoidAmulet = accessoryItem?.id === 'acc_void_amulet'
    const isIcePendant = accessoryItem?.id === 'acc_ice_pendant'
    const isEmeraldBrooch = accessoryItem?.id === 'acc_emerald_brooch'
    const isWoodenTalisman = accessoryItem?.id === 'acc_wooden_talisman'
    const isLuckRing = accessoryItem?.id === 'acc_luck_ring' || accessoryItem?.icon === '💍'
    const isThunderBangle = accessoryItem?.id === 'acc_thunder_bangle'
    const isLeatherBracelet = accessoryItem?.id === 'acc_leather_bracelet'
    const isBronzeCompass = accessoryItem?.id === 'acc_bronze_compass'

    const hasShield = armorItem && (
        armorItem.id === 'arm_plate_cuirass' ||
        armorItem.id === 'arm_guardian_coat' ||
        armorItem.id === 'arm_chainmail_hauberk' ||
        armorItem.id === 'arm_valkyrie_cuirass' ||
        armorItem.id === 'arm_solar_chitin' ||
        armorItem.icon === '🛡️'
    )

    return (
        <div
            className={`character-visual-container ${className}`}
            style={{
                width: size,
                height: size,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                transform: facing === 'left' ? 'scaleX(-1)' : undefined,
            }}
        >
            {/* Background Aura Radial Glow */}
            {showAura && (
                <motion.div
                    animate={
                        animationState === 'attack'
                            ? { scale: [1, 1.35, 1], opacity: [0.4, 0.9, 0.4] }
                            : { scale: [1, 1.12, 1], opacity: [0.25, 0.45, 0.25] }
                    }
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute',
                        width: '80%',
                        height: '80%',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${primary}55 0%, ${secondary}22 50%, transparent 70%)`,
                        filter: 'blur(22px)',
                        zIndex: 0,
                        pointerEvents: 'none',
                    }}
                />
            )}

            {/* Character Body & Comprehensive Equipment SVG Graphic */}
            <motion.div
                animate={
                    animationState === 'attack'
                        ? { x: [0, 24, 0], scale: [1, 1.14, 1] }
                        : animationState === 'hurt'
                            ? { x: [-8, 8, -6, 6, 0], scale: [1, 0.94, 1] }
                            : { y: [0, -6, 0] }
                }
                whileHover={interactive ? { scale: 1.05, y: -4 } : undefined}
                transition={
                    animationState === 'idle'
                        ? { repeat: Infinity, duration: 3, ease: 'easeInOut' }
                        : { duration: 0.4 }
                }
                style={{
                    position: 'relative',
                    width: '90%',
                    height: '90%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                }}
            >
                <svg
                    viewBox="0 0 200 200"
                    style={{ width: '100%', height: '100%', overflow: 'visible' }}
                >
                    <defs>
                        {/* Shading Gradients */}
                        <linearGradient id={`bodyGrad-${role}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1e293b" />
                            <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>

                        <linearGradient id={`roleGrad-${role}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={primary} />
                            <stop offset="100%" stopColor={secondary} />
                        </linearGradient>

                        {/* Metallic Steel Armor Gradients */}
                        <linearGradient id="steelPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f8fafc" />
                            <stop offset="35%" stopColor="#cbd5e1" />
                            <stop offset="70%" stopColor="#64748b" />
                            <stop offset="100%" stopColor="#334155" />
                        </linearGradient>

                        <linearGradient id="goldTrimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>

                        <linearGradient id="dragonArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7f1d1d" />
                            <stop offset="40%" stopColor="#991b1b" />
                            <stop offset="80%" stopColor="#1e1b4b" />
                            <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>

                        <linearGradient id="woodBladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#d97706" />
                            <stop offset="50%" stopColor="#92400e" />
                            <stop offset="100%" stopColor="#78350f" />
                        </linearGradient>

                        <linearGradient id="flameBladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="30%" stopColor="#f97316" />
                            <stop offset="70%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#991b1b" />
                        </linearGradient>

                        <linearGradient id="valkyrieWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="30%" stopColor="#fef08a" />
                            <stop offset="70%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>

                        {/* Archmage Genesis Core Celestial Gradients */}
                        <radialGradient id="archmageCoreRadial" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="25%" stopColor="#f0abfc" />
                            <stop offset="55%" stopColor="#c084fc" />
                            <stop offset="85%" stopColor="#581c87" />
                            <stop offset="100%" stopColor="#1e1b4b" />
                        </radialGradient>

                        <linearGradient id="archmageRingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fde047" />
                            <stop offset="35%" stopColor="#c084fc" />
                            <stop offset="70%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#facc15" />
                        </linearGradient>

                        {/* Rich RPG Equipment Gradients */}
                        <linearGradient id="phoenixPlumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="30%" stopColor="#f97316" />
                            <stop offset="70%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#7f1d1d" />
                        </linearGradient>

                        <linearGradient id="quantumSuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0891b2" />
                            <stop offset="45%" stopColor="#06b6d4" />
                            <stop offset="80%" stopColor="#0f172a" />
                            <stop offset="100%" stopColor="#020617" />
                        </linearGradient>

                        <linearGradient id="cosmicVoidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="35%" stopColor="#7e22ce" />
                            <stop offset="70%" stopColor="#3b0764" />
                            <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>

                        <linearGradient id="solarChitinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="35%" stopColor="#f59e0b" />
                            <stop offset="75%" stopColor="#d97706" />
                            <stop offset="100%" stopColor="#78350f" />
                        </linearGradient>

                        <linearGradient id="valkyrieAegisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="40%" stopColor="#e0f2fe" />
                            <stop offset="75%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#334155" />
                        </linearGradient>

                        <linearGradient id="chainmailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f1f5f9" />
                            <stop offset="40%" stopColor="#94a3b8" />
                            <stop offset="80%" stopColor="#475569" />
                            <stop offset="100%" stopColor="#1e293b" />
                        </linearGradient>

                        <linearGradient id="shadowTrenchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#312e81" />
                            <stop offset="50%" stopColor="#0f172a" />
                            <stop offset="100%" stopColor="#020617" />
                        </linearGradient>

                        <linearGradient id="silkRobeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#d8b4fe" />
                            <stop offset="40%" stopColor="#a855f7" />
                            <stop offset="80%" stopColor="#6b21a8" />
                            <stop offset="100%" stopColor="#3b0764" />
                        </linearGradient>

                        <linearGradient id="clericRobeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="40%" stopColor="#f8fafc" />
                            <stop offset="75%" stopColor="#fde047" />
                            <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>

                        <linearGradient id="rangerLeatherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="40%" stopColor="#166534" />
                            <stop offset="80%" stopColor="#14532d" />
                            <stop offset="100%" stopColor="#052e16" />
                        </linearGradient>

                        <linearGradient id="paddedGambesonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fef3c7" />
                            <stop offset="40%" stopColor="#fde68a" />
                            <stop offset="80%" stopColor="#d97706" />
                            <stop offset="100%" stopColor="#78350f" />
                        </linearGradient>

                        <linearGradient id="explorerLinenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f5f5f4" />
                            <stop offset="50%" stopColor="#d6d3d1" />
                            <stop offset="100%" stopColor="#78716c" />
                        </linearGradient>

                        <linearGradient id="voidBladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#e879f9" />
                            <stop offset="40%" stopColor="#9333ea" />
                            <stop offset="80%" stopColor="#3b0764" />
                            <stop offset="100%" stopColor="#09090b" />
                        </linearGradient>

                        <linearGradient id="plasmaEnergyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="30%" stopColor="#67e8f9" />
                            <stop offset="70%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#0369a1" />
                        </linearGradient>

                        <linearGradient id="chronoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="40%" stopColor="#f59e0b" />
                            <stop offset="75%" stopColor="#0284c7" />
                            <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>

                        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Platform Base Shadow */}
                    <ellipse
                        cx="100"
                        cy="185"
                        rx="56"
                        ry="10"
                        fill="rgba(0, 0, 0, 0.45)"
                        filter="blur(4px)"
                    />

                    {/* Pedestal Ring */}
                    <ellipse
                        cx="100"
                        cy="185"
                        rx="48"
                        ry="8"
                        fill="none"
                        stroke={primary}
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        opacity="0.6"
                    />

                    {/* ========================================================
                        1. BACK ACCESSORY LAYERS (WINGS / FLAME AURA)
                        Spreading prominently out to BOTH SIDES of the character
                        ======================================================== */}

                    {/* VALKYRIE ASCENDANT WINGS — Spreading Wide On Both Flanks */}
                    {isValkyrieWings && (
                        <motion.g
                            animate={{
                                y: [0, -3, 0],
                                scale: [1, 1.03, 1],
                            }}
                            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                            style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.75))' }}
                        >
                            {/* LEFT VALKYRIE WING */}
                            <g transform="translate(68, 86)">
                                {/* Top Primary Feathers */}
                                <path
                                    d="M 0 0 C -25 -25 -52 -32 -62 -12 C -58 4 -40 16 -24 22 C -38 28 -48 38 -34 46 C -20 50 -8 38 0 20 Z"
                                    fill="url(#valkyrieWingGrad)"
                                    stroke="#ca8a04"
                                    strokeWidth="1.2"
                                />
                                {/* Middle Layer Feathers */}
                                <path
                                    d="M -6 -4 C -28 -20 -48 -18 -52 0 C -46 12 -30 18 -12 12 Z"
                                    fill="#fef08a"
                                    opacity="0.85"
                                />
                                {/* Bottom Primary Plume */}
                                <path
                                    d="M -10 12 C -30 20 -44 32 -32 40 C -18 42 -6 28 0 16 Z"
                                    fill="#f59e0b"
                                    opacity="0.9"
                                />
                                {/* Feather Ridge Highlights */}
                                <path d="M 0 0 C -24 -16 -44 -12 -54 -4" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.9" />
                                <path d="M -8 10 C -24 16 -34 26 -28 32" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.8" />
                            </g>

                            {/* RIGHT VALKYRIE WING */}
                            <g transform="translate(132, 86) scale(-1, 1)">
                                {/* Top Primary Feathers */}
                                <path
                                    d="M 0 0 C -25 -25 -52 -32 -62 -12 C -58 4 -40 16 -24 22 C -38 28 -48 38 -34 46 C -20 50 -8 38 0 20 Z"
                                    fill="url(#valkyrieWingGrad)"
                                    stroke="#ca8a04"
                                    strokeWidth="1.2"
                                />
                                {/* Middle Layer Feathers */}
                                <path
                                    d="M -6 -4 C -28 -20 -48 -18 -52 0 C -46 12 -30 18 -12 12 Z"
                                    fill="#fef08a"
                                    opacity="0.85"
                                />
                                {/* Bottom Primary Plume */}
                                <path
                                    d="M -10 12 C -30 20 -44 32 -32 40 C -18 42 -6 28 0 16 Z"
                                    fill="#f59e0b"
                                    opacity="0.9"
                                />
                                {/* Feather Ridge Highlights */}
                                <path d="M 0 0 C -24 -16 -44 -12 -54 -4" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.9" />
                                <path d="M -8 10 C -24 16 -34 26 -28 32" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.8" />
                            </g>
                        </motion.g>
                    )}

                    {/* BLAZING SPIRIT AURA — Fiery Flame Tongues Swirling Around Hero */}
                    {isFlameAura && (
                        <motion.g
                            animate={{
                                scale: [0.98, 1.04, 0.98],
                                opacity: [0.85, 1, 0.85],
                            }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                            style={{ filter: 'drop-shadow(0 0 12px #f97316)' }}
                        >
                            {/* Left Side Blazing Flame Pillars */}
                            <path
                                d="M 52 145 Q 36 125 40 100 Q 32 110 36 90 Q 44 75 56 68 Q 48 85 54 110 Z"
                                fill="url(#flameBladeGrad)"
                                opacity="0.88"
                            />
                            <path
                                d="M 44 135 Q 26 115 32 95 Q 24 105 28 85 Q 36 72 46 64 Q 40 85 46 105 Z"
                                fill="#fef08a"
                                opacity="0.65"
                            />

                            {/* Right Side Blazing Flame Pillars */}
                            <path
                                d="M 148 145 Q 164 125 160 100 Q 168 110 164 90 Q 156 75 144 68 Q 152 85 146 110 Z"
                                fill="url(#flameBladeGrad)"
                                opacity="0.88"
                            />
                            <path
                                d="M 156 135 Q 174 115 168 95 Q 176 105 172 85 Q 164 72 154 64 Q 160 85 154 105 Z"
                                fill="#fef08a"
                                opacity="0.65"
                            />

                            {/* Floating Fiery Spark Particles */}
                            <circle cx="34" cy="72" r="3" fill="#fef08a" />
                            <circle cx="48" cy="52" r="2" fill="#f97316" />
                            <circle cx="166" cy="72" r="3" fill="#fef08a" />
                            <circle cx="152" cy="52" r="2" fill="#f97316" />
                        </motion.g>
                    )}

                    {/* RADIANT ARCHANGEL AURORA HALO — Floating Radiant Ring of Light */}
                    {isArchangelHalo && (
                        <g transform="translate(100, 16)">
                            <motion.g
                                animate={{ scale: [0.98, 1.05, 0.98], opacity: [0.85, 1, 0.85] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                style={{ filter: 'drop-shadow(0 0 14px #facc15) drop-shadow(0 0 24px #38bdf8)' }}
                            >
                                <ellipse cx="0" cy="0" rx="30" ry="8" fill="none" stroke="#fef08a" strokeWidth="3.2" />
                                <ellipse cx="0" cy="0" rx="38" ry="10" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />
                                <line x1="0" y1="-12" x2="0" y2="12" stroke="#ffffff" strokeWidth="2.5" />
                                <line x1="-18" y1="-6" x2="-18" y2="6" stroke="#fef08a" strokeWidth="1.5" opacity="0.75" />
                                <line x1="18" y1="-6" x2="18" y2="6" stroke="#fef08a" strokeWidth="1.5" opacity="0.75" />
                            </motion.g>
                        </g>
                    )}

                    {/* PRISM OF INFINITE TIMELINES — Orbiting Spacetime Crystal */}
                    {isInfinityPrism && (
                        <g transform="translate(158, 68)">
                            <motion.g
                                animate={{ y: [-4, 4, -4], rotate: [0, 8, 0] }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                style={{ filter: 'drop-shadow(0 0 12px #c084fc)' }}
                            >
                                <polygon points="0,-16 12,0 0,16 -12,0" fill="url(#archmageRingsGrad)" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
                                <polygon points="0,-16 0,16 6,0" fill="#ffffff" opacity="0.5" />
                                <circle cx="0" cy="0" r="3" fill="#ffffff" />
                            </motion.g>
                        </g>
                    )}

                    {/* SACRED PHOENIX FEATHER — Fiery Trailing Feather Plume on Flank */}
                    {isPhoenixFeather && (
                        <g transform="translate(42, 88)">
                            <motion.g
                                animate={{ rotate: [-4, 6, -4], scale: [0.98, 1.04, 0.98] }}
                                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                                style={{ filter: 'drop-shadow(0 0 10px #f97316)' }}
                            >
                                <path d="M 0 0 C -12 -18 -18 -32 0 -44 C 6 -30 12 -18 0 0 Z" fill="url(#phoenixPlumeGrad)" stroke="#fef08a" strokeWidth="1.2" />
                                <path d="M 0 0 C -4 -16 -6 -28 0 -38" stroke="#ffffff" strokeWidth="1.5" />
                                <circle cx="-6" cy="-24" r="2.2" fill="#fef08a" />
                            </motion.g>
                        </g>
                    )}

                    {/* ========================================================
                        2. ROLE BASE BODY & CAPE
                        ======================================================== */}

                    {/* Cape / Cloak / Mantle */}
                    <path
                        d="M 68 85 Q 52 145 60 170 Q 100 178 140 170 Q 148 145 132 85 Z"
                        fill={armorItem?.id === 'arm_guardian_coat' ? '#6b21a8' : primary}
                        opacity={armorItem?.id === 'arm_guardian_coat' ? 0.75 : 0.38}
                    />
                    {armorItem?.id === 'arm_guardian_coat' && (
                        /* Golden cape hem */
                        <path
                            d="M 60 170 Q 100 178 140 170"
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                            fill="none"
                        />
                    )}

                    {/* Legs / Boots / Greaves */}
                    {armorItem?.id === 'arm_plate_cuirass' ? (
                        /* Steel Knight Greaves */
                        <g>
                            <rect x="76" y="145" width="18" height="32" rx="6" fill="url(#steelPlateGrad)" stroke="#64748b" strokeWidth="1.5" />
                            <rect x="106" y="145" width="18" height="32" rx="6" fill="url(#steelPlateGrad)" stroke="#64748b" strokeWidth="1.5" />
                            {/* Steel knee cop & gold rivet */}
                            <circle cx="85" cy="150" r="4.5" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
                            <circle cx="115" cy="150" r="4.5" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
                            <circle cx="85" cy="150" r="1.5" fill="#f59e0b" />
                            <circle cx="115" cy="150" r="1.5" fill="#f59e0b" />
                        </g>
                    ) : armorItem?.id === 'arm_draconic_regalia' ? (
                        /* Draconic Scaled Greaves */
                        <g>
                            <rect x="76" y="145" width="18" height="32" rx="6" fill="url(#dragonArmorGrad)" stroke="#f59e0b" strokeWidth="1.5" />
                            <rect x="106" y="145" width="18" height="32" rx="6" fill="url(#dragonArmorGrad)" stroke="#f59e0b" strokeWidth="1.5" />
                            <path d="M 76 160 L 94 160" stroke="#f59e0b" strokeWidth="2" />
                            <path d="M 106 160 L 124 160" stroke="#f59e0b" strokeWidth="2" />
                        </g>
                    ) : (
                        /* Standard Class Boots */
                        <g>
                            <rect x="76" y="145" width="18" height="32" rx="6" fill="#0f172a" stroke={primary} strokeWidth="1.5" />
                            <rect x="106" y="145" width="18" height="32" rx="6" fill="#0f172a" stroke={primary} strokeWidth="1.5" />
                            <path d="M 76 160 L 94 160" stroke={primary} strokeWidth="2" opacity="0.8" />
                            <path d="M 106 160 L 124 160" stroke={primary} strokeWidth="2" opacity="0.8" />
                        </g>
                    )}

                    {/* ========================================================
                        3. TORSO / BODY ARMOR (MATCHING SHOP CUIRASS / OUTFIT)
                        ======================================================== */}
                    {armorItem?.id === 'arm_plate_cuirass' ? (
                        /* Heavy Plate Cuirass — Polished Steel Breastplate matching arm_plate_cuirass.jpg */
                        <g>
                            {/* Steel breastplate contour */}
                            <path
                                d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z"
                                fill="url(#steelPlateGrad)"
                                stroke="#475569"
                                strokeWidth="2"
                            />
                            {/* Metallic highlight center ridge */}
                            <path d="M 100 82 L 100 144" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
                            {/* Golden chest trim & Gorget neckline */}
                            <path d="M 76 82 Q 100 94 124 82" fill="none" stroke="url(#goldTrimGrad)" strokeWidth="3" />
                            {/* Steel ab-plates segmentation */}
                            <path d="M 82 112 Q 100 120 118 112" fill="none" stroke="#334155" strokeWidth="1.5" />
                            <path d="M 80 128 Q 100 136 120 128" fill="none" stroke="#334155" strokeWidth="1.5" />
                            {/* Gold center crest medallion */}
                            <polygon points="100,94 108,102 100,110 92,102" fill="url(#goldTrimGrad)" stroke="#78350f" strokeWidth="1" />
                        </g>
                    ) : armorItem?.id === 'arm_draconic_regalia' ? (
                        /* Draconic Emperor Armor — Dragon scales and gold crest */
                        <g>
                            <path
                                d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z"
                                fill="url(#dragonArmorGrad)"
                                stroke="#f59e0b"
                                strokeWidth="2.5"
                            />
                            {/* Dragon Scale Patterns */}
                            <path d="M 88 98 Q 100 106 112 98" fill="none" stroke="#f59e0b" strokeWidth="1.8" opacity="0.85" />
                            <path d="M 84 114 Q 100 124 116 114" fill="none" stroke="#f59e0b" strokeWidth="1.8" opacity="0.85" />
                            <path d="M 82 130 Q 100 140 118 130" fill="none" stroke="#f59e0b" strokeWidth="1.8" opacity="0.85" />
                            {/* Dragon Crest */}
                            <path d="M 100 92 L 107 104 L 100 112 L 93 104 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                        </g>
                    ) : armorItem?.id === 'arm_guardian_coat' ? (
                        /* Aegis Guardian Mantle — Polished plate with heraldic royal blue surcoat */
                        <g>
                            <path
                                d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z"
                                fill="url(#steelPlateGrad)"
                                stroke="#475569"
                                strokeWidth="2"
                            />
                            {/* Royal blue heraldic surcoat inlay */}
                            <path d="M 80 80 L 100 146 L 120 80 Z" fill="#1e3a8a" opacity="0.85" />
                            {/* Gold Aegis Guardian Cross */}
                            <path d="M 100 90 L 100 132" stroke="url(#goldTrimGrad)" strokeWidth="2.5" />
                            <path d="M 88 104 L 112 104" stroke="url(#goldTrimGrad)" strokeWidth="2.5" />
                            <circle cx="100" cy="104" r="2.8" fill="#fef08a" />
                        </g>
                    ) : armorItem?.id === 'arm_phoenix_robes' ? (
                        /* Phoenix Robes — Radiant Fire Plumage */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#phoenixPlumeGrad)" stroke="#b91c1c" strokeWidth="2" />
                            {/* Phoenix golden wing lapels */}
                            <path d="M 82 82 L 100 98 L 118 82 L 114 116 L 100 128 L 86 116 Z" fill="#fef08a" opacity="0.85" />
                            <path d="M 100 92 L 100 126" stroke="#ea580c" strokeWidth="2" />
                            {/* Phoenix Heart Emblem */}
                            <circle cx="100" cy="104" r="4" fill="#ef4444" stroke="#fef08a" strokeWidth="1" />
                        </g>
                    ) : armorItem?.id === 'arm_quantum_suit' ? (
                        /* Quantum Nano-Weave Suit — Cyberpunk Nano-circuits */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#quantumSuitGrad)" stroke="#06b6d4" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 6px #06b6d4)' }} />
                            {/* Hexagonal power core & circuits */}
                            <polygon points="100,92 108,97 108,107 100,112 92,107 92,97" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.8" />
                            <circle cx="100" cy="102" r="3" fill="#67e8f9" />
                            <line x1="100" y1="112" x2="100" y2="140" stroke="#06b6d4" strokeWidth="1.5" />
                            <line x1="84" y1="118" x2="116" y2="118" stroke="#06b6d4" strokeWidth="1.2" />
                        </g>
                    ) : armorItem?.id === 'arm_cosmic_robes' ? (
                        /* Cosmic Robes — Void Sovereignty Nebula */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#cosmicVoidGrad)" stroke="#c084fc" strokeWidth="2" />
                            {/* Starfield speckles */}
                            <circle cx="88" cy="98" r="1.5" fill="#ffffff" />
                            <circle cx="112" cy="104" r="1.5" fill="#ffffff" />
                            <circle cx="94" cy="128" r="1.2" fill="#ffffff" />
                            <circle cx="106" cy="132" r="1.2" fill="#ffffff" />
                            {/* Starlight belt & crescent */}
                            <path d="M 78 126 Q 100 134 122 126" stroke="#fef08a" strokeWidth="2.5" fill="none" />
                            <circle cx="100" cy="130" r="3" fill="#fef08a" />
                        </g>
                    ) : armorItem?.id === 'arm_solar_chitin' ? (
                        /* Solar Flare Carapace — Blazing Paladin Armor */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#solarChitinGrad)" stroke="#f59e0b" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 8px #f59e0b)' }} />
                            {/* Radiant Sunburst Crest */}
                            <circle cx="100" cy="106" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                            <line x1="100" y1="92" x2="100" y2="120" stroke="#f59e0b" strokeWidth="2" />
                            <line x1="86" y1="106" x2="114" y2="106" stroke="#f59e0b" strokeWidth="2" />
                        </g>
                    ) : armorItem?.id === 'arm_valkyrie_cuirass' ? (
                        /* Valkyrie Platinum Aegisplate */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#valkyrieAegisGrad)" stroke="#ca8a04" strokeWidth="2" />
                            {/* Platinum Winged Ribs */}
                            <path d="M 80 88 Q 100 100 120 88" stroke="#f59e0b" strokeWidth="2" fill="none" />
                            <polygon points="100,94 107,104 100,114 93,104" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                        </g>
                    ) : armorItem?.id === 'arm_shadow_trench' ? (
                        /* Shadow Trenchcoat — Gothic Assassin */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#shadowTrenchGrad)" stroke="#4338ca" strokeWidth="2" />
                            {/* High Lapels & Buckles */}
                            <path d="M 80 80 L 100 110 L 120 80" stroke="#a855f7" strokeWidth="2" fill="none" />
                            <line x1="84" y1="120" x2="116" y2="120" stroke="#94a3b8" strokeWidth="2" />
                            <line x1="84" y1="134" x2="116" y2="134" stroke="#94a3b8" strokeWidth="2" />
                        </g>
                    ) : armorItem?.id === 'arm_chainmail_hauberk' ? (
                        /* Chainmail Hauberk */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#chainmailGrad)" stroke="#475569" strokeWidth="2" />
                            {/* Chainmail Grid Mesh Texture */}
                            <path d="M 78 96 Q 100 102 122 96 M 76 112 Q 100 118 124 112 M 76 128 Q 100 134 124 128" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
                            <path d="M 84 82 Q 100 90 116 82" stroke="#451a03" strokeWidth="3" fill="none" />
                        </g>
                    ) : armorItem?.id === 'arm_silk_robe' ? (
                        /* Mystic Silk Robe */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#silkRobeGrad)" stroke="#7c3aed" strokeWidth="2" />
                            {/* Arcane Cyan Stole / Runes */}
                            <path d="M 82 82 L 96 144 M 118 82 L 104 144" stroke="#38bdf8" strokeWidth="2.5" />
                            <circle cx="100" cy="100" r="3" fill="#fef08a" />
                        </g>
                    ) : armorItem?.id === 'arm_cleric_vestment' ? (
                        /* Cleric Holy Vestment */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#clericRobeGrad)" stroke="#ca8a04" strokeWidth="2" />
                            {/* Radiant Cross Stole */}
                            <path d="M 84 82 L 100 112 L 116 82" stroke="#f59e0b" strokeWidth="3" fill="none" />
                            <line x1="100" y1="112" x2="100" y2="142" stroke="#f59e0b" strokeWidth="3" />
                            <line x1="92" y1="124" x2="108" y2="124" stroke="#f59e0b" strokeWidth="2.5" />
                        </g>
                    ) : armorItem?.id === 'arm_leather_tunic' ? (
                        /* Ranger Leather Tunic */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#rangerLeatherGrad)" stroke="#14532d" strokeWidth="2" />
                            {/* Quiver Baldric Bandolier Strap */}
                            <line x1="78" y1="84" x2="122" y2="142" stroke="#78350f" strokeWidth="4" />
                            <circle cx="100" cy="113" r="3.5" fill="#facc15" stroke="#451a03" strokeWidth="1" />
                        </g>
                    ) : armorItem?.id === 'arm_padded_jacket' ? (
                        /* Padded Gambeson Jacket */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#paddedGambesonGrad)" stroke="#b45309" strokeWidth="1.8" />
                            {/* Diamond Quilt Stitching */}
                            <path d="M 76 92 L 124 136 M 76 112 L 114 146 M 124 92 L 76 136 M 124 112 L 86 146" stroke="#92400e" strokeWidth="1" opacity="0.6" fill="none" />
                            <line x1="100" y1="82" x2="100" y2="146" stroke="#78350f" strokeWidth="2" />
                        </g>
                    ) : armorItem?.id === 'arm_linen_vest' ? (
                        /* Explorer Linen Vest */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="url(#explorerLinenGrad)" stroke="#78716c" strokeWidth="1.8" />
                            {/* Vest Open Lapels & Pockets */}
                            <path d="M 86 82 L 86 146 M 114 82 L 114 146" stroke="#57534e" strokeWidth="2" />
                            <rect x="74" y="112" width="10" height="8" rx="1.5" fill="#a8a29e" stroke="#57534e" strokeWidth="1" />
                            <rect x="116" y="112" width="10" height="8" rx="1.5" fill="#a8a29e" stroke="#57534e" strokeWidth="1" />
                        </g>
                    ) : armorItem?.id === 'arm_apprentice_robe' ? (
                        /* Apprentice Black Robe */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                            {/* Silver Embroidered Collar */}
                            <path d="M 84 82 Q 100 94 116 82" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                            <line x1="100" y1="92" x2="100" y2="144" stroke="#94a3b8" strokeWidth="1.8" />
                        </g>
                    ) : armorItem?.id === 'arm_novice_tunic' ? (
                        /* Novice Tunic */
                        <g>
                            <path d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z" fill="#fef3c7" stroke="#b45309" strokeWidth="1.8" />
                            <path d="M 94 82 L 100 92 L 106 82" stroke="#78350f" strokeWidth="1.5" fill="none" />
                            <line x1="74" y1="130" x2="126" y2="130" stroke="#78350f" strokeWidth="3" />
                            <rect x="96" y="127" width="8" height="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                        </g>
                    ) : (
                        /* Default / Novice Tunic Body */
                        <g>
                            <path
                                d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z"
                                fill={`url(#bodyGrad-${role})`}
                                stroke={primary}
                                strokeWidth="2.5"
                            />
                            {/* Chest Emblem */}
                            <path
                                d="M 85 92 L 100 84 L 115 92 L 100 128 Z"
                                fill={`url(#roleGrad-${role})`}
                                opacity="0.8"
                            />
                        </g>
                    )}

                    {/* Shoulders / Pauldrons */}
                    {armorItem?.id === 'arm_plate_cuirass' || armorItem?.id === 'arm_chainmail_hauberk' ? (
                        <g>
                            {/* Left steel pauldron */}
                            <circle cx="64" cy="86" r="15" fill="url(#steelPlateGrad)" stroke="#475569" strokeWidth="1.5" />
                            <circle cx="64" cy="86" r="11" fill="none" stroke="url(#goldTrimGrad)" strokeWidth="1.5" />
                            {/* Right steel pauldron */}
                            <circle cx="136" cy="86" r="15" fill="url(#steelPlateGrad)" stroke="#475569" strokeWidth="1.5" />
                            <circle cx="136" cy="86" r="11" fill="none" stroke="url(#goldTrimGrad)" strokeWidth="1.5" />
                        </g>
                    ) : armorItem?.id === 'arm_draconic_regalia' ? (
                        <g>
                            {/* Left spiked dragon pauldron */}
                            <circle cx="64" cy="86" r="15" fill="url(#dragonArmorGrad)" stroke="#f59e0b" strokeWidth="1.8" />
                            <path d="M 52 82 L 46 72 L 58 78 Z" fill="#f59e0b" />
                            {/* Right spiked dragon pauldron */}
                            <circle cx="136" cy="86" r="15" fill="url(#dragonArmorGrad)" stroke="#f59e0b" strokeWidth="1.8" />
                            <path d="M 148 82 L 154 72 L 142 78 Z" fill="#f59e0b" />
                        </g>
                    ) : armorItem?.id === 'arm_solar_chitin' ? (
                        <g>
                            <circle cx="64" cy="86" r="15" fill="url(#solarChitinGrad)" stroke="#f59e0b" strokeWidth="1.8" />
                            <circle cx="136" cy="86" r="15" fill="url(#solarChitinGrad)" stroke="#f59e0b" strokeWidth="1.8" />
                        </g>
                    ) : armorItem?.id === 'arm_quantum_suit' ? (
                        <g>
                            <rect x="52" y="76" width="22" height="18" rx="4" fill="#0891b2" stroke="#67e8f9" strokeWidth="1.5" />
                            <rect x="126" y="76" width="22" height="18" rx="4" fill="#0891b2" stroke="#67e8f9" strokeWidth="1.5" />
                        </g>
                    ) : (
                        <g>
                            <circle cx="64" cy="86" r="14" fill={`url(#roleGrad-${role})`} stroke="#ffffff" strokeWidth="1" opacity="0.9" />
                            <circle cx="136" cy="86" r="14" fill={`url(#roleGrad-${role})`} stroke="#ffffff" strokeWidth="1" opacity="0.9" />
                        </g>
                    )}

                    {/* ========================================================
                        4. HEAD, FACE, EYES & HAIR
                        ======================================================== */}
                    {/* Head / Face */}
                    <circle cx="100" cy="52" r="26" fill="#fbcfe8" stroke="#1e293b" strokeWidth="2" />
                    
                    {/* Eyes */}
                    <ellipse cx="91" cy="51" rx="3.5" ry="5" fill="#0f172a" />
                    <ellipse cx="109" cy="51" rx="3.5" ry="5" fill="#0f172a" />
                    <circle cx="92" cy="49" r="1.5" fill="#ffffff" />
                    <circle cx="110" cy="49" r="1.5" fill="#ffffff" />

                    {/* Expression / Smile */}
                    <path d="M 94 62 Q 100 66 106 62" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />

                    {/* Hair / Crest Base */}
                    {role === 'warrior' && (
                        <path d="M 75 42 Q 100 18 125 42 Q 110 32 100 32 Q 90 32 75 42 Z" fill="#b91c1c" />
                    )}
                    {role === 'mage' && (
                        <path d="M 72 46 Q 100 24 128 46 Q 134 68 126 78 Q 100 58 74 78 Z" fill="#6366f1" />
                    )}
                    {role === 'archer' && (
                        <path d="M 74 48 Q 100 22 126 48 Q 116 38 100 38 Q 84 38 74 48 Z" fill="#15803d" />
                    )}
                    {role === 'healer' && (
                        <path d="M 73 50 Q 100 20 127 50 Q 135 62 130 76 Q 100 50 70 76 Z" fill="#eab308" />
                    )}

                    {/* ========================================================
                        5. HEADGEAR SLOT OVERLAY (MATCHING SHOP ILLUSTRATION)
                        ======================================================== */}
                    {headItem && (
                        headItem.id === 'hd_knight_helm' || headItem.icon === '🪖' ? (
                            /* Steel Knight Visor — Full Medieval Steel Helmet matching hd_knight_helm.jpg */
                            <g transform="translate(100, 48)">
                                {/* Helmet Dome Top */}
                                <path
                                    d="M -26 -16 C -26 -44 26 -44 26 -16 L 26 2 C 26 14 18 22 0 22 C -18 22 -26 14 -26 2 Z"
                                    fill="url(#steelPlateGrad)"
                                    stroke="#334155"
                                    strokeWidth="2"
                                />
                                {/* Visor Plate Face Shield */}
                                <path
                                    d="M -22 -6 L 22 -6 L 18 12 L 0 16 L -18 12 Z"
                                    fill="#1e293b"
                                    stroke="#64748b"
                                    strokeWidth="1.5"
                                />
                                {/* Visor Eye Slit */}
                                <path d="M -15 2 L 15 2" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                                {/* Helmet Crest Crown / Fin */}
                                <path d="M -2 -38 L 2 -38 L 4 -20 L -4 -20 Z" fill="url(#goldTrimGrad)" />
                                {/* Gold Rivets on Visor */}
                                <circle cx="-18" cy="-3" r="1.5" fill="#f59e0b" />
                                <circle cx="18" cy="-3" r="1.5" fill="#f59e0b" />
                            </g>
                        ) : headItem.id === 'hd_novice_band' || headItem.icon === '🎗️' ? (
                            /* Stylish headband tied cleanly around the hero's forehead */
                            <g transform="translate(100, 41)">
                                <path
                                    d="M -24 -2 Q 0 4 24 -2 L 24 -8 Q 0 -2 -24 -8 Z"
                                    fill="#f59e0b"
                                    stroke="#b45309"
                                    strokeWidth="1.2"
                                />
                                <path
                                    d="M -23 -4 Q -32 -1 -30 11 L -26 10 Q -28 3 -23 -1 Z"
                                    fill="#f59e0b"
                                    stroke="#b45309"
                                    strokeWidth="0.8"
                                />
                                <circle cx="0" cy="-2" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                            </g>
                        ) : headItem.id === 'hd_crown_sovereign' || headItem.icon === '👑' ? (
                            /* Sovereign Crown atop the head */
                            <g transform="translate(100, 26)">
                                <path
                                    d="M -20 6 L -16 -12 L -6 -4 L 0 -16 L 6 -4 L 16 -12 L 20 6 Z"
                                    fill="url(#goldTrimGrad)"
                                    stroke="#78350f"
                                    strokeWidth="1.2"
                                    style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }}
                                />
                                {/* Crown Jewels */}
                                <circle cx="0" cy="-2" r="2.5" fill="#ef4444" />
                                <circle cx="-10" cy="0" r="1.8" fill="#38bdf8" />
                                <circle cx="10" cy="0" r="1.8" fill="#38bdf8" />
                            </g>
                        ) : headItem.id === 'hd_cleric_circlet' ? (
                            /* Angelic Halo Circlet */
                            <g transform="translate(100, 22)">
                                <ellipse cx="0" cy="0" rx="22" ry="7" fill="none" stroke="#fef08a" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }} />
                            </g>
                        ) : headItem.id === 'hd_cyber_goggles' || headItem.icon === '🥽' ? (
                            /* Cyber HUD Visor */
                            <g transform="translate(100, 50)">
                                <rect x="-20" y="-7" width="40" height="14" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.8" opacity="0.85" style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }} />
                                <line x1="-16" y1="0" x2="16" y2="0" stroke="#ffffff" strokeWidth="1.5" />
                            </g>
                        ) : headItem.id === 'hd_dragon_crest' ? (
                            /* Dragon Crest — Horned Dragon King Helmet */
                            <g transform="translate(100, 36)" style={{ filter: 'drop-shadow(0 0 8px #ef4444)' }}>
                                <path d="M -22 6 C -22 -16 22 -16 22 6 Z" fill="url(#dragonArmorGrad)" stroke="#f59e0b" strokeWidth="1.8" />
                                {/* Sweeping Dragon Horns */}
                                <path d="M -18 -4 C -28 -18 -32 -32 -26 -38 C -22 -30 -14 -18 -10 -8 Z" fill="#991b1b" stroke="#f59e0b" strokeWidth="1.2" />
                                <path d="M 18 -4 C 28 -18 32 -32 26 -38 C 22 -30 14 -18 10 -8 Z" fill="#991b1b" stroke="#f59e0b" strokeWidth="1.2" />
                                <polygon points="0,-12 4,-4 0,0 -4,-4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                            </g>
                        ) : headItem.id === 'hd_emperor_crown' ? (
                            /* Imperial Emperor Crown */
                            <g transform="translate(100, 24)" style={{ filter: 'drop-shadow(0 0 8px #f59e0b)' }}>
                                <path d="M -18 10 C -18 -2 18 -2 18 10 Z" fill="#7f1d1d" />
                                <path d="M -22 10 L -18 -8 L -6 0 L 0 -14 L 6 0 L 18 -8 L 22 10 Z" fill="url(#goldTrimGrad)" stroke="#78350f" strokeWidth="1.5" />
                                <circle cx="0" cy="-14" r="2.5" fill="#ffffff" />
                                <circle cx="0" cy="0" r="2.5" fill="#ef4444" />
                                <circle cx="-12" cy="2" r="1.8" fill="#38bdf8" />
                                <circle cx="12" cy="2" r="1.8" fill="#38bdf8" />
                            </g>
                        ) : headItem.id === 'hd_celestial_halo' ? (
                            /* Ascended Seraph Halo */
                            <g transform="translate(100, 20)" style={{ filter: 'drop-shadow(0 0 10px #fde047)' }}>
                                <ellipse cx="0" cy="0" rx="26" ry="7.5" fill="none" stroke="#fef08a" strokeWidth="3" />
                                <ellipse cx="0" cy="0" rx="20" ry="5.5" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                            </g>
                        ) : headItem.id === 'hd_valkyrie_helm' ? (
                            /* Valkyrie Winged Diadem */
                            <g transform="translate(100, 42)" style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }}>
                                <path d="M -22 -2 Q 0 4 22 -2 L 18 -8 Q 0 -2 -18 -8 Z" fill="url(#steelPlateGrad)" stroke="#64748b" strokeWidth="1.2" />
                                {/* Winged plumes curving back */}
                                <path d="M -18 -4 C -28 -14 -32 -26 -24 -28 C -22 -20 -16 -12 -12 -6 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                                <path d="M 18 -4 C 28 -14 32 -26 24 -28 C 22 -20 16 -12 12 -6 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                                <polygon points="0,-1 4,4 0,9 -4,4" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
                            </g>
                        ) : headItem.id === 'hd_shadow_mask' ? (
                            /* Phantom Veil of Anubis Jackal Mask */
                            <g transform="translate(100, 50)" style={{ filter: 'drop-shadow(0 0 8px #a855f7)' }}>
                                <path d="M -20 -16 L -16 -32 L -10 -16 L 10 -16 L 16 -32 L 20 -16 L 16 12 L 0 18 L -16 12 Z" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.5" />
                                {/* Glowing yellow eyes */}
                                <ellipse cx="-8" cy="-2" rx="4" ry="2" fill="#facc15" />
                                <ellipse cx="8" cy="-2" rx="4" ry="2" fill="#facc15" />
                            </g>
                        ) : headItem.id === 'hd_chrono_monocle' ? (
                            /* Steampunk Chrono Monocle */
                            <g transform="translate(91, 51)" style={{ filter: 'drop-shadow(0 0 5px #f59e0b)' }}>
                                <circle cx="0" cy="0" r="7.5" fill="rgba(56, 189, 248, 0.35)" stroke="#f59e0b" strokeWidth="2" />
                                <circle cx="0" cy="0" r="2" fill="#38bdf8" />
                                <path d="M 6 5 Q 12 14 16 26" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
                            </g>
                        ) : headItem.id === 'hd_silver_laurel' ? (
                            /* Silver Laurel Leaf Crown */
                            <g transform="translate(100, 36)">
                                <path d="M -22 4 C -18 -8 -8 -14 0 -14 C 8 -14 18 -8 22 4" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                                <ellipse cx="-16" cy="-4" rx="4" ry="2.2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" transform="rotate(-25, -16, -4)" />
                                <ellipse cx="-8" cy="-12" rx="4" ry="2.2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" transform="rotate(-10, -8, -12)" />
                                <ellipse cx="8" cy="-12" rx="4" ry="2.2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" transform="rotate(10, 8, -12)" />
                                <ellipse cx="16" cy="-4" rx="4" ry="2.2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" transform="rotate(25, 16, -4)" />
                            </g>
                        ) : headItem.id === 'hd_tactical_beret' ? (
                            /* Tactical Military Beret */
                            <g transform="translate(100, 32)">
                                <path d="M -24 4 C -28 -12 4 -22 24 -10 C 26 2 8 8 -24 4 Z" fill="#166534" stroke="#052e16" strokeWidth="1.5" />
                                <line x1="-24" y1="4" x2="16" y2="6" stroke="#0f172a" strokeWidth="2" />
                                <polygon points="-12,-2 -9,-6 -6,-2 -7,1 -11,1" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
                            </g>
                        ) : headItem.id === 'hd_scout_hood' ? (
                            /* Ranger Scout Hood */
                            <g transform="translate(100, 48)">
                                <path d="M -28 -12 C -28 -38 28 -38 28 -12 L 24 16 L 0 20 L -24 16 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2" opacity="0.9" />
                                <path d="M -20 -10 C -20 -28 20 -28 20 -10 L 16 12 L 0 14 L -16 12 Z" fill="#0f172a" />
                            </g>
                        ) : headItem.id === 'hd_wizard_hat' ? (
                            /* Starfall Wizard Hat */
                            <g transform="translate(100, 30)">
                                <ellipse cx="0" cy="8" rx="26" ry="6" fill="#1e1b4b" stroke="#4338ca" strokeWidth="1.5" />
                                <path d="M -16 6 L -6 -24 Q -2 -34 10 -38 Q 6 -28 6 -16 L 16 6 Z" fill="#312e81" stroke="#4338ca" strokeWidth="1.5" />
                                <line x1="-16" y1="6" x2="16" y2="6" stroke="#f59e0b" strokeWidth="2.5" />
                                <polygon points="0,-10 2,-6 6,-6 3,-3 4,1 0,-2 -4,1 -3,-3 -6,-6 -2,-6" fill="#fef08a" />
                            </g>
                        ) : headItem.id === 'hd_leather_eyepatch' ? (
                            /* Combat Leather Eyepatch */
                            <g transform="translate(91, 51)">
                                <line x1="-24" y1="-8" x2="28" y2="6" stroke="#451a03" strokeWidth="1.8" />
                                <polygon points="-6,-6 6,-6 4,6 -4,6" fill="#1c1917" stroke="#44403c" strokeWidth="1.2" />
                                <circle cx="0" cy="0" r="1.5" fill="#a8a29e" />
                            </g>
                        ) : headItem.id === 'hd_scholar_cap' ? (
                            /* Scholar Mortarboard Cap */
                            <g transform="translate(100, 26)">
                                <polygon points="0,-14 26,-4 0,6 -26,-4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                                <rect x="-10" y="2" width="20" height="10" rx="3" fill="#1e293b" />
                                <circle cx="0" cy="-4" r="2" fill="#f59e0b" />
                                <path d="M 0 -4 Q 14 -4 18 8" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                                <circle cx="18" cy="10" r="2" fill="#fef08a" />
                            </g>
                        ) : headItem.id === 'hd_straw_hat' ? (
                            /* Explorer Straw Hat */
                            <g transform="translate(100, 34)">
                                <ellipse cx="0" cy="6" rx="28" ry="7" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
                                <path d="M -16 4 C -16 -12 16 -12 16 4 Z" fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />
                                <path d="M -16 4 Q 0 8 16 4" stroke="#78350f" strokeWidth="3" fill="none" />
                            </g>
                        ) : headItem.image_url ? (
                            /* Custom Illustration Badge Overlay */
                            <g transform="translate(100, 22)">
                                <image href={headItem.image_url} x="-18" y="-18" width="36" height="36" preserveAspectRatio="xMidYMid meet" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))' }} />
                            </g>
                        ) : (
                            /* Default Emoji / Icon Fallback naturally atop head */
                            <g transform="translate(100, 24)">
                                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontSize="26">
                                    {headItem.icon}
                                </text>
                            </g>
                        )
                    )}

                    {/* ========================================================
                        6. PENDANT ACCESSORY (CHEST NECKLACE)
                        ======================================================== */}
                    {isChronoPendant && (
                        <g transform="translate(100, 78)">
                            {/* Gold necklace chain */}
                            <path d="M -16 -6 Q 0 8 16 -6" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
                            {/* Chrono Hourglass Gem Medallion */}
                            <g transform="translate(0, 10)">
                                <circle cx="0" cy="0" r="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                                <path d="M -4 -4 L 4 -4 L -4 4 L 4 4 Z" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }} />
                                <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                            </g>
                        </g>
                    )}

                    {isDraconicHeart && (
                        <g transform="translate(100, 78)">
                            <path d="M -16 -6 Q 0 9 16 -6" fill="none" stroke="#7f1d1d" strokeWidth="2" />
                            <g transform="translate(0, 11)">
                                <motion.g
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                                    style={{ filter: 'drop-shadow(0 0 8px #ef4444)' }}
                                >
                                    <polygon points="0,9 -9,-2 -5,-8 0,-4 5,-8 9,-2" fill="#ef4444" stroke="#fde047" strokeWidth="1.2" />
                                    <polygon points="0,6 -6,-1 -3,-5 0,-2 3,-5 6,-1" fill="#fef08a" opacity="0.6" />
                                    <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                                </motion.g>
                            </g>
                        </g>
                    )}

                    {isCelestialHourglass && (
                        <g transform="translate(100, 78)">
                            <path d="M -16 -6 Q 0 8 16 -6" fill="none" stroke="#facc15" strokeWidth="1.6" />
                            <g transform="translate(0, 10)">
                                <path d="M -6 -6 L 6 -6 L 1 1 L 6 8 L -6 8 L -1 1 Z" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.4" />
                                <path d="M -4 -5 L 4 -5 L 0 0 Z" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 4px #38bdf8)' }} />
                                <path d="M -4 7 L 4 7 L 0 3 Z" fill="#38bdf8" />
                                <line x1="0" y1="0" x2="0" y2="4" stroke="#ffffff" strokeWidth="1" />
                            </g>
                        </g>
                    )}

                    {isVoidAmulet && (
                        <g transform="translate(100, 78)">
                            <path d="M -16 -6 Q 0 8 16 -6" fill="none" stroke="#475569" strokeWidth="1.5" />
                            <g transform="translate(0, 10)" style={{ filter: 'drop-shadow(0 0 6px #a855f7)' }}>
                                <circle cx="0" cy="0" r="7.5" fill="#09090b" stroke="#8b5cf6" strokeWidth="1.5" />
                                <ellipse cx="0" cy="0" rx="4.5" ry="2.2" fill="#c084fc" />
                                <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                            </g>
                        </g>
                    )}

                    {isIcePendant && (
                        <g transform="translate(100, 78)">
                            <path d="M -16 -6 Q 0 8 16 -6" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                            <g transform="translate(0, 10)" style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }}>
                                <polygon points="0,-7 6,0 0,7 -6,0" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.2" />
                                <line x1="0" y1="-5" x2="0" y2="5" stroke="#ffffff" strokeWidth="1.2" />
                                <line x1="-5" y1="0" x2="5" y2="0" stroke="#ffffff" strokeWidth="1.2" />
                            </g>
                        </g>
                    )}

                    {isEmeraldBrooch && (
                        <g transform="translate(100, 84)">
                            <rect x="-8" y="-5" width="16" height="10" rx="4" fill="#78350f" stroke="#ca8a04" strokeWidth="1.2" />
                            <polygon points="-5,-3 5,-3 6,0 5,3 -5,3 -6,0" fill="#10b981" stroke="#059669" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 5px #10b981)' }} />
                            <circle cx="0" cy="0" r="1.5" fill="#a7f3d0" />
                        </g>
                    )}

                    {isWoodenTalisman && (
                        <g transform="translate(100, 78)">
                            <path d="M -16 -6 Q 0 8 16 -6" fill="none" stroke="#78350f" strokeWidth="1.6" />
                            <g transform="translate(0, 10)">
                                <rect x="-5" y="-5" width="10" height="13" rx="2.5" fill="#854d0e" stroke="#451a03" strokeWidth="1.2" />
                                <path d="M 0 -2 L 0 6 M -2 0 L 0 3 M 2 0 L 0 3" stroke="#84cc16" strokeWidth="1.4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px #84cc16)' }} />
                            </g>
                        </g>
                    )}

                    {/* ========================================================
                        7. LEFT HAND / OFF-HAND ARMOR & SHIELD
                        ======================================================== */}
                    <g transform="translate(52, 102)">
                        {/* Armored gauntlet cuff */}
                        {armorItem && (
                            <rect x="-8" y="-7" width="16" height="14" rx="4" fill="#0f172a" stroke={primary} strokeWidth="1.5" />
                        )}

                        {/* Hand fist */}
                        <circle cx="0" cy="0" r="7.5" fill="#fbcfe8" stroke="#0f172a" strokeWidth="1.5" />

                        {/* OFF-HAND SHIELD (Matching arm_plate_cuirass.jpg / Heavy Plate Cuirass) */}
                        {hasShield && (
                            <g transform="translate(-10, -4)">
                                <motion.g
                                    animate={{ rotate: [0, -2, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                                    style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.45))' }}
                                >
                                    {/* Shield Body (Heater Shield) */}
                                    <path
                                        d="M -12 -18 L 12 -18 L 14 0 Q 12 18 0 26 Q -12 18 -14 0 Z"
                                        fill="url(#steelPlateGrad)"
                                        stroke="#475569"
                                        strokeWidth="1.8"
                                    />
                                    {/* Shield Gold Rim */}
                                    <path
                                        d="M -10 -16 L 10 -16 L 11 0 Q 10 16 0 22 Q -10 16 -11 0 Z"
                                        fill="none"
                                        stroke="url(#goldTrimGrad)"
                                        strokeWidth="1.5"
                                    />
                                    {/* Center Emblem Cross / Heraldry */}
                                    <path d="M 0 -12 L 0 16" stroke="#ca8a04" strokeWidth="2.5" />
                                    <path d="M -7 -4 L 7 -4" stroke="#ca8a04" strokeWidth="2.5" />
                                    <circle cx="0" cy="-4" r="2.5" fill="#fef08a" />
                                </motion.g>
                            </g>
                        )}

                        {/* Ring Accessory (acc_luck_ring) */}
                        {isLuckRing && (
                            <g transform="translate(0, 0)">
                                <circle cx="0" cy="0" r="4.5" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
                                <circle cx="0" cy="-3.5" r="2" fill="#38bdf8" />
                                <motion.g
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                >
                                    <polygon points="0,-6 1,-4 3,-3.5 1,-3 0,-1 -1,-3 -3,-3.5 -1,-4" fill="#ffffff" />
                                </motion.g>
                            </g>
                        )}

                        {/* Thunder Bangle Accessory (acc_thunder_bangle) */}
                        {isThunderBangle && (
                            <g transform="translate(0, -3)">
                                <ellipse cx="0" cy="0" rx="7.5" ry="4" fill="none" stroke="#eab308" strokeWidth="2.2" style={{ filter: 'drop-shadow(0 0 5px #facc15)' }} />
                                <path d="M -4 -2 L -1 1 L -3 2 L 1 4" fill="none" stroke="#67e8f9" strokeWidth="1.4" />
                                <circle cx="3" cy="-1" r="1" fill="#ffffff" />
                            </g>
                        )}

                        {/* Leather Combat Bracelet (acc_leather_bracelet) */}
                        {isLeatherBracelet && (
                            <g transform="translate(0, -3)">
                                <rect x="-6.5" y="-3.5" width="13" height="7" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
                                <circle cx="-3" cy="0" r="1.1" fill="#cbd5e1" />
                                <circle cx="0" cy="0" r="1.1" fill="#cbd5e1" />
                                <circle cx="3" cy="0" r="1.1" fill="#cbd5e1" />
                            </g>
                        )}

                        {/* Bronze Pocket Compass (acc_bronze_compass) */}
                        {isBronzeCompass && (
                            <g transform="translate(-10, 6)">
                                <path d="M 10 -6 Q 6 -1 0 0" fill="none" stroke="#b45309" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
                                <circle cx="0" cy="4" r="6.5" fill="#92400e" stroke="#f59e0b" strokeWidth="1.4" />
                                <circle cx="0" cy="4" r="4.5" fill="#fef3c7" />
                                <polygon points="0,1 1.5,4 0,3 -1.5,4" fill="#dc2626" />
                                <polygon points="0,7 1.5,4 0,5 -1.5,4" fill="#2563eb" />
                            </g>
                        )}
                    </g>

                    {/* ========================================================
                        8. RIGHT ATTACKING HAND & EQUIPPED WEAPON
                        Matching the shop weapon illustrations
                        ======================================================== */}
                    <motion.g
                        animate={
                            animationState === 'attack'
                                ? {
                                    x: [0, -10, 24, 12, 0],
                                    y: [0, -8, 12, 4, 0],
                                    rotate: [0, -35, 45, -10, 0],
                                }
                                : animationState === 'hurt'
                                ? {
                                    x: [0, -8, 0],
                                    rotate: [0, -18, 0],
                                }
                                : {
                                    y: [0, 2, 0],
                                    rotate: [0, 2, 0],
                                }
                        }
                        transition={
                            animationState === 'attack'
                                ? { duration: 0.45, ease: 'easeOut' }
                                : animationState === 'hurt'
                                ? { duration: 0.3 }
                                : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
                        }
                        style={{
                            transformOrigin: '148px 102px',
                        }}
                    >
                        <g transform="translate(148, 102)">
                            {/* --- THE ILLUSTRATED WEAPON HELD IN HAND --- */}
                            <g transform="translate(0, 0) rotate(-15)">
                                {weaponItem?.id === 'wpn_dragon_slayer' ? (
                                    /* EXCALIBUR DRAGON BLADE — Radiant Golden Greatsword matching wpn_dragon_slayer.jpg */
                                    <g transform="translate(0, -22)" style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }}>
                                        {/* Golden Dragon Blade */}
                                        <path
                                            d="M -5 14 L -5 -36 L 0 -48 L 5 -36 L 5 14 Z"
                                            fill="url(#goldTrimGrad)"
                                            stroke="#ca8a04"
                                            strokeWidth="1.2"
                                        />
                                        {/* Blade fuller center ridge */}
                                        <line x1="0" y1="12" x2="0" y2="-44" stroke="#ffffff" strokeWidth="1.5" />
                                        {/* Golden Dragon Wings Crossguard */}
                                        <path
                                            d="M -16 14 Q 0 8 16 14 Q 10 18 0 16 Q -10 18 -16 14 Z"
                                            fill="#f59e0b"
                                            stroke="#b45309"
                                            strokeWidth="1.2"
                                        />
                                        {/* Dragon Eye Gem in Center Guard */}
                                        <circle cx="0" cy="14" r="2.8" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
                                        {/* Hilt & Dragon Pommel */}
                                        <rect x="-2.5" y="14" width="5" height="14" rx="1.5" fill="#451a03" />
                                        <circle cx="0" cy="30" r="3.5" fill="url(#goldTrimGrad)" stroke="#b45309" strokeWidth="1" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_flame_claymore' ? (
                                    /* CRIMSON CLAYMORE — Blazing Flame Greatsword matching wpn_flame_claymore.jpg */
                                    <g transform="translate(0, -22)" style={{ filter: 'drop-shadow(0 0 12px #f97316)' }}>
                                        {/* Blazing Flaming Blade */}
                                        <path
                                            d="M -6 14 L -6 -32 L -2 -42 L 0 -46 L 2 -42 L 6 -32 L 6 14 Z"
                                            fill="url(#flameBladeGrad)"
                                            stroke="#7f1d1d"
                                            strokeWidth="1.2"
                                        />
                                        {/* Inner Hot Core */}
                                        <path d="M -2 12 L -2 -34 L 0 -40 L 2 -34 L 2 12 Z" fill="#fef08a" />
                                        {/* Flame Crossguard */}
                                        <path d="M -15 14 Q -8 10 0 14 Q 8 10 15 14 L 12 18 Q 0 16 -12 18 Z" fill="#991b1b" stroke="#f97316" strokeWidth="1" />
                                        {/* Dark Hilt & Pommel */}
                                        <rect x="-2.5" y="14" width="5" height="14" rx="1" fill="#18181b" />
                                        <circle cx="0" cy="30" r="3" fill="#ef4444" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_iron_broadsword' ? (
                                    /* IRON BROADSWORD — Steel Broadsword matching wpn_iron_broadsword.jpg */
                                    <g transform="translate(0, -20)" style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }}>
                                        {/* Steel Blade */}
                                        <path
                                            d="M -4.5 14 L -4.5 -30 L 0 -40 L 4.5 -30 L 4.5 14 Z"
                                            fill="url(#steelPlateGrad)"
                                            stroke="#475569"
                                            strokeWidth="1.2"
                                        />
                                        {/* Glowing Cyan Runic Fuller */}
                                        <line x1="0" y1="12" x2="0" y2="-28" stroke="#38bdf8" strokeWidth="1.8" />
                                        {/* Steel Crossguard */}
                                        <rect x="-14" y="12" width="28" height="4.5" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1" />
                                        {/* Hilt & Pommel */}
                                        <rect x="-2" y="16.5" width="4" height="12" rx="1" fill="#1e293b" />
                                        <circle cx="0" cy="30" r="3.2" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_warrior_starter' ? (
                                    /* PEDANG LATIH KAYU — Wooden Training Sword matching wpn_warrior_starter.jpg */
                                    <g transform="translate(0, -18)" style={{ filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))' }}>
                                        <path
                                            d="M -4 14 L -4 -26 L 0 -34 L 4 -26 L 4 14 Z"
                                            fill="url(#woodBladeGrad)"
                                            stroke="#451a03"
                                            strokeWidth="1.2"
                                        />
                                        <line x1="0" y1="12" x2="0" y2="-24" stroke="#fde68a" strokeWidth="1" opacity="0.6" />
                                        {/* Wooden Crossguard */}
                                        <rect x="-11" y="12" width="22" height="4.5" rx="1.5" fill="#78350f" stroke="#451a03" strokeWidth="1" />
                                        {/* Grip & Pommel */}
                                        <rect x="-2" y="16.5" width="4" height="10" rx="1" fill="#451a03" />
                                        <circle cx="0" cy="28" r="2.8" fill="#92400e" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_archmage_orb' ? (
                                    /* ARCHMAGE GENESIS CORE - PRIMORDIAL CELESTIAL ORB MATCHING wpn_archmage_orb.webp */
                                    <g transform="translate(0, -22)" style={{ filter: 'drop-shadow(0 0 14px #c084fc) drop-shadow(0 0 22px #38bdf8)' }}>
                                        {/* Arcane Energy Tether Spire connecting from hand grip */}
                                        <path d="M 0 0 Q 3 11 0 22" fill="none" stroke="#c084fc" strokeWidth="2" strokeDasharray="3 2" opacity="0.85" />
                                        <path d="M -1 0 Q -4 10 0 22" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.75" />

                                        {/* Outer Cosmic Halo Ring */}
                                        <circle cx="0" cy="0" r="22" fill="none" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" />

                                        {/* Gyroscopic Orbital Celestial Rings (Rotated with runes) */}
                                        <ellipse cx="0" cy="0" rx="20" ry="7.5" fill="none" stroke="url(#archmageRingsGrad)" strokeWidth="2.2" transform="rotate(-25)" opacity="0.95" />
                                        <ellipse cx="0" cy="0" rx="19" ry="6.5" fill="none" stroke="url(#archmageRingsGrad)" strokeWidth="1.6" transform="rotate(40)" opacity="0.9" />
                                        <ellipse cx="0" cy="0" rx="16" ry="16" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="5 3" opacity="0.8" />

                                        {/* Orbiting Celestial Glyphs & Star Runes */}
                                        <circle cx="-16" cy="-7" r="2.2" fill="#facc15" style={{ filter: 'drop-shadow(0 0 4px #facc15)' }} />
                                        <circle cx="16" cy="7" r="2.2" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 4px #38bdf8)' }} />
                                        <circle cx="7" cy="-15" r="1.8" fill="#e879f9" />
                                        <circle cx="-7" cy="15" r="1.8" fill="#ffffff" />
                                        <polygon points="0,-18 2,-15 -2,-15" fill="#fde047" />
                                        <polygon points="0,18 2,15 -2,15" fill="#fde047" />

                                        {/* Primordial Cosmic Swirling Nexus Core */}
                                        <circle cx="0" cy="0" r="12" fill="url(#archmageCoreRadial)" stroke="#e879f9" strokeWidth="1" />
                                        {/* Inner Galaxy Swirl Arc */}
                                        <path d="M -6 -4 A 8 8 0 0 1 6 4" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
                                        <path d="M 4 -6 A 8 8 0 0 1 -4 6" fill="none" stroke="#f0abfc" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />

                                        {/* Central Blinding Singularity Core */}
                                        <circle cx="0" cy="0" r="4.5" fill="#ffffff" style={{ filter: 'drop-shadow(0 0 6px #ffffff)' }} />
                                        <circle cx="-1" cy="-1" r="2" fill="#fef08a" />

                                        {/* Stellar Cross Starlight Flares */}
                                        <line x1="-16" y1="0" x2="16" y2="0" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                                        <line x1="0" y1="-16" x2="0" y2="16" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                                        <line x1="-8" y1="-8" x2="8" y2="8" stroke="#facc15" strokeWidth="0.9" opacity="0.75" />
                                        <line x1="8" y1="-8" x2="-8" y2="8" stroke="#38bdf8" strokeWidth="0.9" opacity="0.75" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_crystal_staff' || weaponItem?.id === 'wpn_astral_wand' || weaponItem?.id === 'wpn_mage_starter' ? (
                                    /* ARCANE CRYSTAL STAFF / MAGE WEAPON matching wpn_crystal_staff.jpg */
                                    <g transform="translate(0, -18)" style={{ filter: 'drop-shadow(0 0 10px #c084fc)' }}>
                                        {/* Staff Shaft */}
                                        <rect x="-2" y="-18" width="4" height="46" rx="2" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
                                        {/* Staff Headpiece Prongs */}
                                        <path d="M -8 -20 Q 0 -16 8 -20 Q 6 -28 0 -30 Q -6 -28 -8 -20 Z" fill="url(#goldTrimGrad)" />
                                        {/* Floating Crystal Orb */}
                                        <circle cx="0" cy="-30" r="7.5" fill="#a855f7" stroke="#ffffff" strokeWidth="1" />
                                        <circle cx="-2" cy="-32" r="2" fill="#ffffff" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_archer_starter' || weaponItem?.id === 'wpn_celestial_bow' || weaponItem?.id === 'wpn_recurve_bow' ? (
                                    /* ARCHER BOW matching wpn_archer_starter.jpg / wpn_celestial_bow.jpg */
                                    <g transform="translate(0, -10)" style={{ filter: 'drop-shadow(0 0 8px #22c55e)' }}>
                                        {/* Bow Limbs Curve */}
                                        <path
                                            d="M 6 -34 Q -16 0 6 34"
                                            fill="none"
                                            stroke={weaponItem?.id === 'wpn_celestial_bow' ? '#fef08a' : '#78350f'}
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                        />
                                        {/* Bowstring */}
                                        <line x1="6" y1="-33" x2="6" y2="33" stroke="#ffffff" strokeWidth="1" opacity="0.85" />
                                        {/* Nocked Arrow */}
                                        <line x1="-12" y1="0" x2="16" y2="0" stroke="#f59e0b" strokeWidth="1.8" />
                                        <polygon points="16,0 12,-3 12,3" fill="#22c55e" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_radiant_scepter' || weaponItem?.id === 'wpn_healer_starter' || weaponItem?.id === 'wpn_seraph_staff' ? (
                                    /* RADIANT DAWN SCEPTER matching wpn_radiant_scepter.jpg */
                                    <g transform="translate(0, -18)" style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }}>
                                        {/* Golden Scepter Shaft */}
                                        <rect x="-2" y="-16" width="4" height="44" rx="2" fill="url(#goldTrimGrad)" stroke="#ca8a04" strokeWidth="1" />
                                        {/* Sunburst Winged Halo Crown */}
                                        <circle cx="0" cy="-24" r="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                                        <polygon points="0,-36 3,-28 10,-24 3,-20 0,-12 -3,-20 -10,-24 -3,-28" fill="#f59e0b" />
                                        <circle cx="0" cy="-24" r="3.5" fill="#ffffff" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_novice_dagger' ? (
                                    /* NOVICE DAGGER — Sleek Iron Dirk */
                                    <g transform="translate(0, -14)" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.4))' }}>
                                        <path d="M -3 12 L -3 -12 L 0 -24 L 3 -12 L 3 12 Z" fill="url(#steelPlateGrad)" stroke="#475569" strokeWidth="1" />
                                        <line x1="0" y1="10" x2="0" y2="-18" stroke="#94a3b8" strokeWidth="1" />
                                        <rect x="-8" y="10" width="16" height="3" rx="1.5" fill="#334155" />
                                        <rect x="-1.8" y="13" width="3.6" height="8" rx="1" fill="#78350f" />
                                        <circle cx="0" cy="22" r="2.2" fill="#64748b" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_scholars_quill' ? (
                                    /* SCHOLAR'S ENCHANTED QUILL — Giant Sapphire Feather Pen */
                                    <g transform="translate(0, -16)" style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }}>
                                        <path d="M 0 16 Q 8 -10 -3 -36" fill="none" stroke="#38bdf8" strokeWidth="2" />
                                        <path d="M 0 14 Q 14 -12 -2 -34 Q -10 -14 0 14 Z" fill="url(#silkRobeGrad)" opacity="0.9" />
                                        <polygon points="0,16 -2.5,22 0,26 2.5,22" fill="#facc15" stroke="#b45309" strokeWidth="0.8" />
                                        <circle cx="0" cy="28" r="1.8" fill="#38bdf8" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_apprentice_wand' ? (
                                    /* APPRENTICE WAND — Carved Birch Wand with Sparking Topaz Core */
                                    <g transform="translate(0, -16)" style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }}>
                                        <polygon points="-1.8,18 1.8,18 1.2,-22 -1.2,-22" fill="url(#woodBladeGrad)" stroke="#451a03" strokeWidth="0.8" />
                                        <path d="M -1.5 10 Q 1.5 6 -1.5 2 Q 1.5 -2 -1.5 -6 Q 1.5 -10 -1.5 -14" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
                                        <polygon points="0,-30 3.5,-26 0,-22 -3.5,-26" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
                                        <circle cx="0" cy="-26" r="1.5" fill="#ffffff" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_runic_blade' ? (
                                    /* RUNIC SHORT BLADE — Mystic Inscribed Broad Blade */
                                    <g transform="translate(0, -20)" style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }}>
                                        <path d="M -5 14 L -5 -28 L 0 -38 L 5 -28 L 5 14 Z" fill="url(#steelPlateGrad)" stroke="#334155" strokeWidth="1.2" />
                                        <line x1="0" y1="10" x2="0" y2="-28" stroke="#38bdf8" strokeWidth="1.8" />
                                        <circle cx="0" cy="-6" r="1.5" fill="#ffffff" />
                                        <circle cx="0" cy="-18" r="1.5" fill="#ffffff" />
                                        <path d="M -14 12 Q 0 8 14 12 L 10 16 Q 0 14 -10 16 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                                        <rect x="-2" y="15" width="4" height="12" rx="1" fill="#0f172a" />
                                        <circle cx="0" cy="28" r="2.8" fill="#38bdf8" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_storm_bow' ? (
                                    /* STORM TEMPEST BOW — Crackling Lightning Arc Bow */
                                    <g transform="translate(0, -10)" style={{ filter: 'drop-shadow(0 0 8px #0284c7)' }}>
                                        <path d="M 6 -34 Q -18 0 6 34" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
                                        <path d="M 4 -30 L -3 -20 L 1 -12 L -5 0 L 1 12 L -3 20 L 4 30" fill="none" stroke="#67e8f9" strokeWidth="1.6" />
                                        <line x1="6" y1="-33" x2="6" y2="33" stroke="#67e8f9" strokeWidth="1.2" />
                                        <line x1="-12" y1="0" x2="16" y2="0" stroke="#ffffff" strokeWidth="2" />
                                        <polygon points="16,0 12,-3.5 12,3.5" fill="#38bdf8" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_frost_codex' ? (
                                    /* FROST CODEX — Floating Arctic Grimoire */
                                    <g transform="translate(0, -14)" style={{ filter: 'drop-shadow(0 0 10px #38bdf8)' }}>
                                        <path d="M 0 6 L -16 -4 L -16 -24 L 0 -14 Z" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
                                        <path d="M 0 6 L 16 -4 L 16 -24 L 0 -14 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                                        <path d="M -1 -13 L -14 -22 L -14 -6 L -1 3 Z" fill="#e0f2fe" />
                                        <path d="M 1 -13 L 14 -22 L 14 -6 L 1 3 Z" fill="#f0f9ff" />
                                        <polygon points="0,-28 3,-25 0,-22 -3,-25" fill="#ffffff" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_blessed_mace' ? (
                                    /* BLESSED CRUSADER MACE — Holy Flanged Morningstar */
                                    <g transform="translate(0, -16)" style={{ filter: 'drop-shadow(0 0 8px #f59e0b)' }}>
                                        <rect x="-2" y="-10" width="4" height="38" rx="1.5" fill="#475569" stroke="#1e293b" strokeWidth="1" />
                                        <line x1="-2" y1="8" x2="2" y2="10" stroke="#f59e0b" strokeWidth="1.2" />
                                        <line x1="-2" y1="14" x2="2" y2="16" stroke="#f59e0b" strokeWidth="1.2" />
                                        <circle cx="0" cy="-20" r="8" fill="url(#goldTrimGrad)" stroke="#ca8a04" strokeWidth="1.2" />
                                        <polygon points="0,-29 3,-24 -3,-24" fill="#fde047" />
                                        <polygon points="0,-11 3,-16 -3,-16" fill="#fde047" />
                                        <polygon points="-9,-20 -5,-17 -5,-23" fill="#fde047" />
                                        <polygon points="9,-20 5,-17 5,-23" fill="#fde047" />
                                        <line x1="-3" y1="-20" x2="3" y2="-20" stroke="#ffffff" strokeWidth="1.5" />
                                        <line x1="0" y1="-23" x2="0" y2="-17" stroke="#ffffff" strokeWidth="1.5" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_shadow_cross' ? (
                                    /* SHADOW CROSS — Obsidian Void Dagger */
                                    <g transform="translate(0, -18)" style={{ filter: 'drop-shadow(0 0 8px #7c3aed)' }}>
                                        <path d="M -3.5 14 L -3.5 -24 L 0 -34 L 3.5 -24 L 3.5 14 Z" fill="url(#voidBladeGrad)" stroke="#a855f7" strokeWidth="1.2" />
                                        <path d="M -14 0 L -4 -2 L -4 2 Z" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" />
                                        <path d="M 14 0 L 4 -2 L 4 2 Z" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" />
                                        <rect x="-2" y="14" width="4" height="12" rx="1" fill="#09090b" />
                                        <circle cx="0" cy="27" r="2.5" fill="#7c3aed" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_divine_censer' ? (
                                    /* SACRED DIVINE CENSER — Golden Chained Thurible */
                                    <g transform="translate(0, -16)" style={{ filter: 'drop-shadow(0 0 8px #f59e0b)' }}>
                                        <path d="M 0 16 Q 10 -4 0 -20" fill="none" stroke="#f59e0b" strokeWidth="1.4" strokeDasharray="2 2" />
                                        <path d="M -7 -20 L 7 -20 L 5 -32 L 0 -36 L -5 -32 Z" fill="url(#goldTrimGrad)" stroke="#ca8a04" strokeWidth="1.2" />
                                        <circle cx="0" cy="-38" r="2" fill="#fef08a" />
                                        <circle cx="-4" cy="-42" r="1.5" fill="#fbbf24" opacity="0.8" />
                                        <circle cx="3" cy="-46" r="1.2" fill="#f59e0b" opacity="0.6" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_void_scythe' ? (
                                    /* REAPER VOID SCYTHE — Eldritch Crescent War Scythe */
                                    <g transform="translate(0, -18)" style={{ filter: 'drop-shadow(0 0 10px #a855f7)' }}>
                                        <rect x="-2" y="-34" width="4" height="64" rx="2" fill="#09090b" stroke="#6b21a8" strokeWidth="1" />
                                        <path d="M 0 -32 Q 26 -36 36 -18 Q 30 -28 14 -28 L 0 -26 Z" fill="url(#voidBladeGrad)" stroke="#c084fc" strokeWidth="1.2" />
                                        <circle cx="0" cy="-30" r="3" fill="#0f172a" stroke="#c084fc" strokeWidth="1" />
                                        <circle cx="0" cy="-30" r="1.2" fill="#ec4899" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_plasma_crossbow' ? (
                                    /* PLASMA CYBER CROSSBOW — Neon Energy Quarrel */
                                    <g transform="translate(0, -12)" style={{ filter: 'drop-shadow(0 0 8px #06b6d4)' }}>
                                        <rect x="-18" y="-4" width="28" height="8" rx="2" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.2" />
                                        <path d="M 6 -22 L 8 -4 L 6 14" fill="none" stroke="#0891b2" strokeWidth="2.5" />
                                        <line x1="6" y1="-20" x2="-8" y2="-1" stroke="#22d3ee" strokeWidth="1.2" />
                                        <line x1="6" y1="12" x2="-8" y2="-1" stroke="#22d3ee" strokeWidth="1.2" />
                                        <line x1="-12" y1="-1" x2="16" y2="-1" stroke="#67e8f9" strokeWidth="2.5" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_celestial_prism' ? (
                                    /* CELESTIAL PRISM — Orbiting Starlight Gem */
                                    <g transform="translate(0, -18)" style={{ filter: 'drop-shadow(0 0 8px #a855f7)' }}>
                                        <polygon points="0,-36 10,-24 0,-12 -10,-24" fill="#38bdf8" opacity="0.85" stroke="#f0abfc" strokeWidth="1" />
                                        <polygon points="0,-36 0,-12 10,-24" fill="#c084fc" opacity="0.7" />
                                        <circle cx="-12" cy="-28" r="2" fill="#fde047" />
                                        <circle cx="12" cy="-18" r="2" fill="#38bdf8" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_aegis_flail' ? (
                                    /* AEGIS SPIKED FLAIL — Heavy Armored Iron Morningstar */
                                    <g transform="translate(0, -14)" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}>
                                        <rect x="-2" y="4" width="4" height="24" rx="1.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                                        <path d="M 0 4 Q 8 -6 4 -16" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="2.5 1.5" />
                                        <circle cx="4" cy="-20" r="8" fill="url(#steelPlateGrad)" stroke="#334155" strokeWidth="1.2" />
                                        <polygon points="4,-31 6,-27 2,-27" fill="#94a3b8" />
                                        <polygon points="15,-20 11,-22 11,-18" fill="#94a3b8" />
                                        <polygon points="-7,-20 -3,-18 -3,-22" fill="#94a3b8" />
                                        <polygon points="4,-9 2,-13 6,-13" fill="#94a3b8" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_chronos_blade' ? (
                                    /* CHRONOS RAPIER — Time-Bending Temporal Blade */
                                    <g transform="translate(0, -20)" style={{ filter: 'drop-shadow(0 0 8px #f59e0b)' }}>
                                        <polygon points="-2,12 2,12 0.5,-44 -0.5,-44" fill="url(#chronoGoldGrad)" stroke="#ca8a04" strokeWidth="1" />
                                        <circle cx="0" cy="12" r="9" fill="none" stroke="#f59e0b" strokeWidth="2" />
                                        <circle cx="0" cy="12" r="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
                                        <polygon points="-2,24 2,24 -2,30 2,30" fill="#38bdf8" stroke="#f59e0b" strokeWidth="0.8" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_supernova_cannon' ? (
                                    /* SUPERNOVA ARM CANNON — Solar Fusion Plasma Blaster */
                                    <g transform="translate(0, -18)" style={{ filter: 'drop-shadow(0 0 10px #f97316)' }}>
                                        <path d="M -10 16 L 10 16 L 8 -26 L -8 -26 Z" fill="url(#quantumSuitGrad)" stroke="#f59e0b" strokeWidth="1.5" />
                                        <line x1="-5" y1="4" x2="-5" y2="-14" stroke="#f97316" strokeWidth="1.5" />
                                        <line x1="5" y1="4" x2="5" y2="-14" stroke="#f97316" strokeWidth="1.5" />
                                        <ellipse cx="0" cy="-26" rx="8" ry="4" fill="#fef08a" stroke="#ea580c" strokeWidth="1.2" />
                                    </g>
                                ) : weaponItem?.id === 'wpn_astral_staff_eternity' ? (
                                    /* ASTRAL STAFF OF ETERNITY — Twin Galaxy Cosmic Arch-Staff */
                                    <g transform="translate(0, -22)" style={{ filter: 'drop-shadow(0 0 12px #c084fc)' }}>
                                        <rect x="-2.5" y="-22" width="5" height="52" rx="2" fill="#09090b" stroke="#8b5cf6" strokeWidth="1.2" />
                                        <path d="M -2 -24 Q -16 -32 -14 -42 Q -6 -38 -2 -30 Z" fill="url(#archmageRingsGrad)" stroke="#c084fc" strokeWidth="1" />
                                        <path d="M 2 -24 Q 16 -32 14 -42 Q 6 -38 2 -30 Z" fill="url(#archmageRingsGrad)" stroke="#c084fc" strokeWidth="1" />
                                        <circle cx="0" cy="-35" r="7" fill="url(#archmageCoreRadial)" stroke="#ffffff" strokeWidth="1.5" />
                                    </g>
                                ) : weaponItem?.image_url ? (
                                    /* High-Definition Illustrated Weapon Asset Fallback */
                                    <g transform="translate(0, -20) rotate(-10)">
                                        <image
                                            href={weaponItem.image_url}
                                            x="-18"
                                            y="-18"
                                            width="36"
                                            height="36"
                                            preserveAspectRatio="xMidYMid meet"
                                            style={{ filter: `drop-shadow(0 2px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 6px ${primary}88)` }}
                                        />
                                    </g>
                                ) : (
                                    /* Standard Emoji Fallback (Held naturally in weapon hand) */
                                    <g transform="translate(4, -8) rotate(-10)">
                                        <text
                                            x="0"
                                            y="0"
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            fontSize="32"
                                            style={{ filter: `drop-shadow(0 0 8px ${primary})` }}
                                        >
                                            {weaponItem ? weaponItem.icon : roleInfo.avatarEmoji}
                                        </text>
                                    </g>
                                )}
                            </g>

                            {/* Armored gauntlet cuff on weapon hand */}
                            {armorItem && (
                                <rect x="-8" y="-7" width="16" height="14" rx="4" fill="#0f172a" stroke={primary} strokeWidth="1.5" />
                            )}

                            {/* Hand grip rendered on top so hand wraps firmly around the weapon */}
                            <circle cx="0" cy="0" r="7.5" fill="#fbcfe8" stroke="#0f172a" strokeWidth="1.5" />

                            {/* Distinctive Weapon-Tailored Attack Visual Effect (Tangan Nyerang) */}
                            {animationState === 'attack' && (
                                <g>
                                    {weaponItem?.id === 'wpn_archmage_orb' ? (
                                        /* ARCHMAGE GENESIS CORE - COSMIC SUPERNOVA SHOCKWAVE */
                                        <g transform="translate(0, -22)">
                                            <motion.circle
                                                cx="0"
                                                cy="0"
                                                r="8"
                                                fill="none"
                                                stroke="#c084fc"
                                                strokeWidth="2.5"
                                                initial={{ scale: 0.3, opacity: 1 }}
                                                animate={{ scale: [0.3, 2.8, 3.4], opacity: [1, 0.8, 0] }}
                                                transition={{ duration: 0.45, ease: 'easeOut' }}
                                                style={{ filter: 'drop-shadow(0 0 10px #c084fc)' }}
                                            />
                                            <motion.circle
                                                cx="0"
                                                cy="0"
                                                r="6"
                                                fill="none"
                                                stroke="#38bdf8"
                                                strokeWidth="1.8"
                                                initial={{ scale: 0.3, opacity: 1 }}
                                                animate={{ scale: [0.3, 2.2, 2.8], opacity: [1, 0.9, 0] }}
                                                transition={{ duration: 0.42, delay: 0.04, ease: 'easeOut' }}
                                            />
                                            <motion.line
                                                x1="-14" y1="0" x2="28" y2="0"
                                                stroke="#ffffff"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                initial={{ scaleX: 0, opacity: 1 }}
                                                animate={{ scaleX: [0, 1.8, 0.5], opacity: [1, 1, 0], x: [0, 16] }}
                                                transition={{ duration: 0.4 }}
                                                style={{ filter: 'drop-shadow(0 0 8px #ffffff)' }}
                                            />
                                            <motion.line
                                                x1="0" y1="-18" x2="0" y2="18"
                                                stroke="#fde047"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                initial={{ scaleY: 0, opacity: 1 }}
                                                animate={{ scaleY: [0, 1.6, 0.4], opacity: [1, 0.9, 0] }}
                                                transition={{ duration: 0.38 }}
                                            />
                                            <motion.circle
                                                cx="24" cy="-10" r="3" fill="#fde047"
                                                animate={{ x: [0, 18], y: [0, -12], scale: [1, 0], opacity: [1, 0] }}
                                                transition={{ duration: 0.4 }}
                                            />
                                            <motion.circle
                                                cx="28" cy="8" r="3" fill="#38bdf8"
                                                animate={{ x: [0, 22], y: [0, 10], scale: [1, 0], opacity: [1, 0] }}
                                                transition={{ duration: 0.4, delay: 0.03 }}
                                            />
                                            <motion.circle
                                                cx="20" cy="0" r="3.5" fill="#e879f9"
                                                animate={{ x: [0, 26], scale: [1.2, 0], opacity: [1, 0] }}
                                                transition={{ duration: 0.38 }}
                                            />
                                        </g>
                                    ) : weaponItem?.id === 'wpn_crystal_staff' || weaponItem?.id === 'wpn_astral_wand' || weaponItem?.id === 'wpn_mage_starter' || weaponItem?.id === 'wpn_frost_codex' || weaponItem?.id === 'wpn_scholars_quill' || weaponItem?.id === 'wpn_apprentice_wand' || weaponItem?.id === 'wpn_celestial_prism' || weaponItem?.id === 'wpn_astral_staff_eternity' ? (
                                        /* ARCANE CRYSTAL MAGIC SURGE */
                                        <g transform="translate(0, -22)">
                                            <motion.path
                                                d="M 6 -18 A 24 24 0 0 1 24 16"
                                                fill="none"
                                                stroke="#c084fc"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0], scale: [0.8, 1.4, 1.6] }}
                                                transition={{ duration: 0.42 }}
                                                style={{ filter: 'drop-shadow(0 0 10px #a855f7)' }}
                                            />
                                            <motion.circle
                                                cx="18" cy="0" r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="1"
                                                animate={{ scale: [0.5, 1.8, 0], opacity: [0, 1, 0], x: [0, 18] }}
                                                transition={{ duration: 0.38 }}
                                            />
                                            <motion.polygon
                                                points="26,-6 28,-2 32,-2 29,1 30,5 26,2 22,5 23,1 20,-2 24,-2"
                                                fill="#f0abfc"
                                                animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0], x: [0, 14], y: [0, -8] }}
                                                transition={{ duration: 0.4 }}
                                            />
                                        </g>
                                    ) : weaponItem?.id === 'wpn_void_scythe' || weaponItem?.id === 'wpn_shadow_cross' ? (
                                        /* ELDRITCH VOID CLEAVE */
                                        <g transform="translate(4, -16)">
                                            <motion.path
                                                d="M -4 -28 L 32 14"
                                                fill="none"
                                                stroke="#a855f7"
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                animate={{ pathLength: [0, 1, 0.2], opacity: [0, 1, 0], scale: [0.8, 1.3, 1.5] }}
                                                transition={{ duration: 0.42 }}
                                                style={{ filter: 'drop-shadow(0 0 12px #9333ea)' }}
                                            />
                                            <motion.circle
                                                cx="28" cy="4" r="4" fill="#c084fc"
                                                animate={{ x: [0, 16], y: [0, 6], scale: [1, 0], opacity: [1, 0] }}
                                                transition={{ duration: 0.36 }}
                                            />
                                        </g>
                                    ) : weaponItem?.id === 'wpn_plasma_crossbow' || weaponItem?.id === 'wpn_supernova_cannon' ? (
                                        /* HIGH-ENERGY PLASMA LASER BLAST */
                                        <g transform="translate(6, -10)">
                                            <motion.line
                                                x1="-8" y1="0" x2="36" y2="0"
                                                stroke="#67e8f9"
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                animate={{ scaleX: [0, 1.6, 0.4], opacity: [0, 1, 0], x: [0, 22] }}
                                                transition={{ duration: 0.38 }}
                                                style={{ filter: 'drop-shadow(0 0 10px #06b6d4)' }}
                                            />
                                            <motion.circle
                                                cx="26" cy="0" r="4.5" fill="#ffffff"
                                                animate={{ scale: [0.5, 2, 0], opacity: [1, 0], x: [0, 16] }}
                                                transition={{ duration: 0.35 }}
                                            />
                                        </g>
                                    ) : weaponItem?.id === 'wpn_dragon_slayer' ? (
                                        /* DRAGON HELLFIRE CLEAVE */
                                        <g transform="translate(4, -14)">
                                            <motion.path
                                                d="M -4 -28 L 32 12"
                                                fill="none"
                                                stroke="#ef4444"
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                animate={{ pathLength: [0, 1, 0.2], opacity: [0, 1, 0], scale: [0.8, 1.3, 1.5] }}
                                                transition={{ duration: 0.42 }}
                                                style={{ filter: 'drop-shadow(0 0 12px #ef4444) drop-shadow(0 0 4px #7f1d1d)' }}
                                            />
                                            <motion.path
                                                d="M 8 -32 L 40 4"
                                                fill="none"
                                                stroke="#f59e0b"
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                                animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0], scale: [0.8, 1.25, 1.4] }}
                                                transition={{ duration: 0.4, delay: 0.03 }}
                                            />
                                            <motion.circle
                                                cx="36" cy="6" r="3.5" fill="#f59e0b"
                                                animate={{ x: [0, 16], y: [0, 8], scale: [1, 0], opacity: [1, 0] }}
                                                transition={{ duration: 0.36 }}
                                            />
                                            <motion.circle
                                                cx="30" cy="-14" r="3" fill="#ef4444"
                                                animate={{ x: [0, 14], y: [0, -10], scale: [1, 0], opacity: [1, 0] }}
                                                transition={{ duration: 0.36 }}
                                            />
                                        </g>
                                    ) : weaponItem?.id === 'wpn_flame_claymore' ? (
                                        /* FLAMING CLAYMORE BLADE WAVE */
                                        <g transform="translate(4, -14)">
                                            <motion.path
                                                d="M 6 -26 A 34 34 0 0 1 30 18"
                                                fill="none"
                                                stroke="url(#flameBladeGrad)"
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                animate={{ pathLength: [0, 1, 0.2], opacity: [0, 1, 0], scale: [0.8, 1.3, 1.5] }}
                                                transition={{ duration: 0.42 }}
                                                style={{ filter: 'drop-shadow(0 0 12px #f97316)' }}
                                            />
                                            <motion.circle
                                                cx="32" cy="-4" r="3.5" fill="#fef08a"
                                                animate={{ x: [0, 16], y: [0, -6], scale: [1, 0], opacity: [1, 0] }}
                                                transition={{ duration: 0.38 }}
                                            />
                                        </g>
                                    ) : weaponItem?.id === 'wpn_celestial_bow' ? (
                                        /* CELESTIAL BOW PIERCING STARLIGHT BEAM */
                                        <g transform="translate(6, -10)">
                                            <motion.line
                                                x1="-10" y1="0" x2="38" y2="0"
                                                stroke="#ffffff"
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                                animate={{ scaleX: [0, 1.6, 0.5], opacity: [0, 1, 0], x: [0, 24] }}
                                                transition={{ duration: 0.38 }}
                                                style={{ filter: 'drop-shadow(0 0 10px #fde047)' }}
                                            />
                                            <motion.line
                                                x1="-6" y1="0" x2="30" y2="0"
                                                stroke="#facc15"
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                animate={{ scaleX: [0, 1.4, 0.3], opacity: [0, 0.8, 0], x: [0, 20] }}
                                                transition={{ duration: 0.38 }}
                                            />
                                            <motion.ellipse
                                                cx="12" cy="0" rx="4" ry="12" fill="none" stroke="#22c55e" strokeWidth="2"
                                                animate={{ scaleY: [0.4, 1.6], scaleX: [0.4, 1.2], opacity: [1, 0], x: [0, 18] }}
                                                transition={{ duration: 0.35 }}
                                            />
                                        </g>
                                    ) : weaponItem?.id === 'wpn_archer_starter' || weaponItem?.id === 'wpn_recurve_bow' || weaponItem?.id === 'wpn_storm_bow' ? (
                                        /* ARCHER GALE WIND ARROW */
                                        <g transform="translate(4, -10)">
                                            <motion.line
                                                x1="-10" y1="0" x2="34" y2="0"
                                                stroke="#22c55e"
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                                animate={{ scaleX: [0, 1.5, 0.4], opacity: [0, 1, 0], x: [0, 20] }}
                                                transition={{ duration: 0.36 }}
                                                style={{ filter: 'drop-shadow(0 0 8px #22c55e)' }}
                                            />
                                            <motion.path
                                                d="M 12 -10 Q 24 0 12 10"
                                                fill="none"
                                                stroke="#86efac"
                                                strokeWidth="2"
                                                animate={{ x: [0, 16], opacity: [1, 0], scale: [0.8, 1.3] }}
                                                transition={{ duration: 0.35 }}
                                            />
                                        </g>
                                    ) : weaponItem?.id === 'wpn_radiant_scepter' || weaponItem?.id === 'wpn_healer_starter' || weaponItem?.id === 'wpn_seraph_staff' || weaponItem?.id === 'wpn_blessed_mace' || weaponItem?.id === 'wpn_divine_censer' ? (
                                        /* SACRED RADIANT SUNBURST */
                                        <g transform="translate(0, -20)">
                                            <motion.circle
                                                cx="0" cy="0" r="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5"
                                                animate={{ scale: [0.4, 2.2, 0], opacity: [0, 1, 0] }}
                                                transition={{ duration: 0.42 }}
                                                style={{ filter: 'drop-shadow(0 0 12px #f59e0b)' }}
                                            />
                                            <motion.line
                                                x1="-14" y1="0" x2="24" y2="0" stroke="#ffffff" strokeWidth="2.5"
                                                animate={{ scaleX: [0, 1.5, 0], opacity: [1, 0], x: [0, 12] }}
                                                transition={{ duration: 0.38 }}
                                            />
                                        </g>
                                    ) : (
                                        /* DEFAULT METALLIC STEEL BLADE SLASH (Iron Broadsword, Warrior Starter) */
                                        <g>
                                            <motion.path
                                                d="M 12 -28 A 38 38 0 0 1 32 20"
                                                fill="none"
                                                stroke="#ffffff"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: [0, 1, 0.2], opacity: [0, 1, 0], scale: [0.8, 1.25, 1.45] }}
                                                transition={{ duration: 0.42, ease: 'easeOut' }}
                                                style={{ filter: `drop-shadow(0 0 8px ${primary})` }}
                                            />
                                            <motion.path
                                                d="M 6 -20 A 30 30 0 0 1 24 16"
                                                fill="none"
                                                stroke={primary}
                                                strokeWidth="2.2"
                                                strokeLinecap="round"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: [0, 1, 0], opacity: [0, 0.9, 0] }}
                                                transition={{ duration: 0.38, ease: 'easeOut' }}
                                            />
                                            <motion.circle
                                                cx="30" cy="0" r="3.5" fill="#ffffff"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0], x: [0, 14], y: [0, -6] }}
                                                transition={{ duration: 0.35 }}
                                            />
                                            <motion.circle
                                                cx="26" cy="14" r="2.8" fill={primary}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], x: [0, 12], y: [0, 8] }}
                                                transition={{ duration: 0.35, delay: 0.05 }}
                                            />
                                        </g>
                                    )}
                                </g>
                            )}
                        </g>
                    </motion.g>
                </svg>
            </motion.div>

            {/* Role Watermark Badge on Corner */}
            {showRoleBadge && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--surface-card)',
                        border: `1px solid ${primary}44`,
                        fontSize: '11px',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        color: primary,
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                        zIndex: 3,
                    }}
                >
                    <span>{roleInfo.avatarEmoji}</span>
                    <span>{roleInfo.name}</span>
                </div>
            )}
        </div>
    )
}

export default React.memo(CharacterVisual)
