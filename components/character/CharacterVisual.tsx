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
    const isChronoPendant = accessoryItem?.id === 'acc_chrono_pendant' || accessoryItem?.icon === '⏳'
    const isLuckRing = accessoryItem?.id === 'acc_luck_ring' || accessoryItem?.icon === '💍'

    const hasShield = armorItem && (
        armorItem.id === 'arm_plate_cuirass' ||
        armorItem.id === 'arm_guardian_coat' ||
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
                        /* Aegis Guardian Mantle — Gold plate with aegis cross */
                        <g>
                            <path
                                d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z"
                                fill="url(#bodyGrad-${role})"
                                stroke="#f59e0b"
                                strokeWidth="2.5"
                            />
                            {/* Golden Aegis Breastplate */}
                            <path d="M 78 86 L 100 80 L 122 86 L 118 132 L 100 142 L 82 132 Z" fill="url(#goldTrimGrad)" stroke="#78350f" strokeWidth="1.2" />
                            <path d="M 100 88 L 100 134" stroke="#fef08a" strokeWidth="2" />
                            <path d="M 88 104 L 112 104" stroke="#fef08a" strokeWidth="2" />
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
                    {armorItem?.id === 'arm_plate_cuirass' ? (
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
                            <motion.g
                                animate={{ rotate: [0, -2, 0] }}
                                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                                transform="translate(-10, -4)"
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

                            {/* Attack Slash Blade Arc & Spark Effect (Tangan Nyerang) */}
                            {animationState === 'attack' && (
                                <g>
                                    <motion.path
                                        d="M 12 -28 A 38 38 0 0 1 32 20"
                                        fill="none"
                                        stroke={primary}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: [0, 1, 0.2], opacity: [0, 1, 0], scale: [0.8, 1.2, 1.4] }}
                                        transition={{ duration: 0.45, ease: 'easeOut' }}
                                        style={{ filter: `drop-shadow(0 0 8px ${primary})` }}
                                    />
                                    <motion.path
                                        d="M 6 -20 A 30 30 0 0 1 24 16"
                                        fill="none"
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: [0, 1, 0], opacity: [0, 0.9, 0] }}
                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                    />
                                    <motion.circle
                                        cx="30"
                                        cy="0"
                                        r="3"
                                        fill="#ffffff"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0], x: [0, 12], y: [0, -6] }}
                                        transition={{ duration: 0.35 }}
                                    />
                                    <motion.circle
                                        cx="26"
                                        cy="14"
                                        r="2.5"
                                        fill={primary}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], x: [0, 10], y: [0, 8] }}
                                        transition={{ duration: 0.35, delay: 0.05 }}
                                    />
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
