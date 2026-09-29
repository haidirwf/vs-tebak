'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AvatarClass } from '@/types'
import { CHARACTER_ROLES, EquippedItemsMap } from '@/lib/game/character'
import { getItemById } from '@/lib/game/items'

interface CharacterVisualProps {
    role: AvatarClass
    equipped?: EquippedItemsMap
    size?: number | string
    animationState?: 'idle' | 'attack' | 'hurt'
    showAura?: boolean
    interactive?: boolean
    className?: string
}

export default function CharacterVisual({
    role,
    equipped = {},
    size = 220,
    animationState = 'idle',
    showAura = true,
    interactive = false,
    className = '',
}: CharacterVisualProps) {
    const roleInfo = CHARACTER_ROLES[role] || CHARACTER_ROLES.warrior
    const weaponItem = equipped.weapon ? getItemById(equipped.weapon) : null
    const headItem = equipped.head ? getItemById(equipped.head) : null
    const armorItem = equipped.armor ? getItemById(equipped.armor) : null
    const accessoryItem = equipped.accessory ? getItemById(equipped.accessory) : null

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

            {/* Wing / Accessory Back Layer */}
            {accessoryItem && (
                <motion.div
                    animate={
                        animationState === 'idle'
                            ? { y: [0, -4, 0], scale: [1, 1.05, 1] }
                            : animationState === 'attack'
                                ? { scale: [1, 1.3, 1] }
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
                    {headItem ? (
                        <g transform="translate(100, 36)">
                            {/* Visual Headgear Badge / Crown / Visor */}
                            <circle cx="0" cy="-6" r="16" fill="rgba(15, 23, 42, 0.85)" stroke={primary} strokeWidth="2" />
                            <text
                                x="0"
                                y="0"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="18"
                            >
                                {headItem.icon}
                            </text>
                        </g>
                    ) : null}

                    {/* --- WEAPON SLOT OVERLAY (RIGHT HAND) --- */}
                    <g transform="translate(148, 102)">
                        {/* Hand grip */}
                        <circle cx="0" cy="0" r="8" fill="#fbcfe8" stroke="#0f172a" strokeWidth="1.5" />
                        {/* Weapon graphic / icon */}
                        <text
                            x="4"
                            y="-6"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="32"
                            style={{ filter: `drop-shadow(0 0 8px ${primary})` }}
                        >
                            {weaponItem ? weaponItem.icon : roleInfo.avatarEmoji}
                        </text>
                    </g>

                    {/* Left Hand Guard */}
                    <g transform="translate(52, 102)">
                        <circle cx="0" cy="0" r="8" fill="#fbcfe8" stroke="#0f172a" strokeWidth="1.5" />
                        {armorItem && (
                            <circle cx="-2" cy="0" r="11" fill="none" stroke={secondary} strokeWidth="2.5" opacity="0.85" />
                        )}
                    </g>
                </svg>
            </motion.div>

            {/* Role Watermark Badge on Corner */}
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
        </div>
    )
}
