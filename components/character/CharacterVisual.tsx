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
            {/* Background Aura Effect */}
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
                        width: '75%',
                        height: '75%',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${primary}55 0%, ${secondary}22 50%, transparent 70%)`,
                        filter: 'blur(20px)',
                        zIndex: 0,
                        pointerEvents: 'none',
                    }}
                />
            )}

            {/* Wing / Back Aura Layer (only for wings and flame auras, not wearable jewelry) */}
            {accessoryItem && (accessoryItem.id === 'acc_valkyrie_wings' || accessoryItem.id === 'acc_flame_aura' || accessoryItem.icon === '🪽' || accessoryItem.icon === '🔥') && (
                <motion.div
                    animate={
                        animationState === 'idle'
                            ? { y: [0, -4, 0], scale: [1, 1.05, 1] }
                            : animationState === 'attack'
                                ? { scale: [1, 1.25, 1] }
                                : { x: [-3, 3, -3, 0] }
                    }
                    transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute',
                        top: '12%',
                        fontSize: typeof size === 'number' ? `${size * 0.42}px` : '42px',
                        zIndex: 1,
                        filter: `drop-shadow(0 0 14px ${primary})`,
                        opacity: 0.9,
                        pointerEvents: 'none',
                    }}
                >
                    {accessoryItem.icon}
                </motion.div>
            )}

            {/* Character Body & Layered Graphic */}
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
                    width: '85%',
                    height: '85%',
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

                        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
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

                    {/* --- ROLE BASE BODY --- */}
                    {/* Cape / Back Cloak */}
                    <path
                        d="M 68 85 Q 52 145 60 170 Q 100 178 140 170 Q 148 145 132 85 Z"
                        fill={primary}
                        opacity="0.35"
                    />

                    {/* Legs / Boots */}
                    <rect x="76" y="145" width="18" height="32" rx="6" fill="#0f172a" stroke={primary} strokeWidth="1.5" />
                    <rect x="106" y="145" width="18" height="32" rx="6" fill="#0f172a" stroke={primary} strokeWidth="1.5" />
                    {/* Greaves accent */}
                    <path d="M 76 160 L 94 160" stroke={primary} strokeWidth="2" opacity="0.8" />
                    <path d="M 106 160 L 124 160" stroke={primary} strokeWidth="2" opacity="0.8" />

                    {/* Torso / Armor Body */}
                    <path
                        d="M 70 80 Q 64 125 74 146 L 126 146 Q 136 125 130 80 Z"
                        fill={`url(#bodyGrad-${role})`}
                        stroke={armorItem ? primary : 'rgba(255, 255, 255, 0.2)'}
                        strokeWidth="2.5"
                    />

                    {/* Chest Emblem / Pattern */}
                    <path
                        d="M 85 92 L 100 84 L 115 92 L 100 128 Z"
                        fill={`url(#roleGrad-${role})`}
                        opacity={armorItem ? 0.9 : 0.6}
                    />

                    {/* Shoulders / Pauldrons */}
                    <circle cx="64" cy="86" r="14" fill={`url(#roleGrad-${role})`} stroke="#ffffff" strokeWidth="1" opacity="0.9" />
                    <circle cx="136" cy="86" r="14" fill={`url(#roleGrad-${role})`} stroke="#ffffff" strokeWidth="1" opacity="0.9" />

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

                    {/* --- HEADGEAR SLOT OVERLAY --- */}
                    {headItem && (
                        headItem.id === 'hd_novice_band' || headItem.icon === '🎗️' ? (
                            /* Stylish headband tied cleanly around the hero's forehead */
                            <g transform="translate(100, 41)">
                                {/* Band wrap */}
                                <path
                                    d="M -24 -2 Q 0 4 24 -2 L 24 -8 Q 0 -2 -24 -8 Z"
                                    fill="#f59e0b"
                                    stroke="#b45309"
                                    strokeWidth="1.2"
                                />
                                {/* Band tails fluttering on left temple */}
                                <path
                                    d="M -23 -4 Q -32 -1 -30 11 L -26 10 Q -28 3 -23 -1 Z"
                                    fill="#f59e0b"
                                    stroke="#b45309"
                                    strokeWidth="0.8"
                                />
                                {/* Center gold crest emblem */}
                                <circle cx="0" cy="-2" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                            </g>
                        ) : headItem.id === 'hd_knight_helm' || headItem.icon === '🪖' ? (
                            /* Knight Helmet sitting on top of head */
                            <g transform="translate(100, 26)">
                                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontSize="28">
                                    🪖
                                </text>
                            </g>
                        ) : headItem.id === 'hd_crown_sovereign' || headItem.id === 'hd_cleric_circlet' || headItem.icon === '👑' ? (
                            /* Sovereign Crown atop the head */
                            <g transform="translate(100, 24)">
                                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontSize="28" style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }}>
                                    👑
                                </text>
                            </g>
                        ) : headItem.id === 'hd_cyber_goggles' || headItem.icon === '🥽' ? (
                            /* Cyber visor over the eyes */
                            <g transform="translate(100, 48)">
                                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontSize="26" style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }}>
                                    🥽
                                </text>
                            </g>
                        ) : headItem.id === 'hd_wizard_hat' || headItem.icon === '🧙' ? (
                            /* Wizard Hat on head */
                            <g transform="translate(100, 22)">
                                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontSize="30">
                                    🧙
                                </text>
                            </g>
                        ) : headItem.id === 'hd_scout_hood' || headItem.icon === '🥷' ? (
                            /* Scout Hood */
                            <g transform="translate(100, 26)">
                                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontSize="30">
                                    🥷
                                </text>
                            </g>
                        ) : (
                            /* Any other headgear naturally positioned atop head without dark circle */
                            <g transform="translate(100, 26)">
                                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontSize="26">
                                    {headItem.icon}
                                </text>
                            </g>
                        )
                    )}

                    {/* --- PENDANT ACCESSORY (CHEST) --- */}
                    {accessoryItem && (accessoryItem.id === 'acc_chrono_pendant' || accessoryItem.icon === '⏳') && (
                        <g transform="translate(100, 76)">
                            {/* Gold chain */}
                            <path d="M -12 -8 Q 0 4 12 -8" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                            <text
                                x="0"
                                y="8"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="16"
                                style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }}
                            >
                                ⏳
                            </text>
                        </g>
                    )}

                    {/* --- WEAPON SLOT OVERLAY (RIGHT ATTACKING HAND) --- */}
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
                            {/* Weapon graphic held in hand */}
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

                            {/* Armored gauntlet cuff on weapon hand */}
                            {armorItem && (
                                <rect x="-8" y="-7" width="16" height="14" rx="4" fill="#0f172a" stroke={primary} strokeWidth="1.5" />
                            )}

                            {/* Hand grip rendered on top so hand wraps the weapon hilt */}
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
                                    {/* Attack sparks from tip */}
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

                    {/* Left Hand & Offhand Accessory */}
                    <g transform="translate(52, 102)">
                        {/* Armored gauntlet cuff on shield/offhand */}
                        {armorItem && (
                            <rect x="-8" y="-7" width="16" height="14" rx="4" fill="#0f172a" stroke={primary} strokeWidth="1.5" />
                        )}
                        {/* Hand fist */}
                        <circle cx="0" cy="0" r="7.5" fill="#fbcfe8" stroke="#0f172a" strokeWidth="1.5" />

                        {/* Ring Accessory (acc_luck_ring) worn on the hand */}
                        {accessoryItem && (accessoryItem.id === 'acc_luck_ring' || accessoryItem.icon === '💍') && (
                            <g transform="translate(0, 0)">
                                {/* Golden band with sapphire gem on the hand */}
                                <circle cx="0" cy="0" r="4.5" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
                                <circle cx="0" cy="-3.5" r="2" fill="#38bdf8" />
                                {/* Subtle sparkling charm */}
                                <motion.g
                                    animate={{ scale: [1, 1.15, 1], y: [0, -2, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                >
                                    <text
                                        x="-10"
                                        y="-8"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="14"
                                        style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }}
                                    >
                                        💍
                                    </text>
                                </motion.g>
                            </g>
                        )}
                    </g>
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
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        border: `1px solid ${primary}44`,
                        fontSize: '11px',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        color: primary,
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
