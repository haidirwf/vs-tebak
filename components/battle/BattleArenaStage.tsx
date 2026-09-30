'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AvatarClass } from '@/types'
import { EquippedItemsMap } from '@/lib/game/character'
import { Flame, Sparkles, Swords, Zap } from 'lucide-react'
import CharacterVisual from '@/components/character/CharacterVisual'

export type AttackType = 'warrior' | 'mage' | 'archer' | 'healer' | 'bot'

export interface AttackEvent {
    id: string
    direction: 'left-to-right' | 'right-to-left'
    type: AttackType
    isCrit?: boolean
    isUltimate?: boolean
    damage: number
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

// Attack visual attributes by class
const ATTACK_VISUALS: Record<AttackType, {
    projectileIcon: string
    projectileColor: string
    impactColor: string
    trailColor: string
    name: string
}> = {
    warrior: {
        projectileIcon: '⚔️',
        projectileColor: '#f97316',
        impactColor: 'rgba(249, 115, 22, 0.9)',
        trailColor: 'linear-gradient(90deg, transparent, #f97316, #ef4444)',
        name: 'Tebasan Pedang',
    },
    mage: {
        projectileIcon: '🔮',
        projectileColor: '#8b5cf6',
        impactColor: 'rgba(139, 92, 246, 0.9)',
        trailColor: 'linear-gradient(90deg, transparent, #8b5cf6, #3b82f6)',
        name: 'Bola Sihir Arcane',
    },
    archer: {
        projectileIcon: '🏹',
        projectileColor: '#22c55e',
        impactColor: 'rgba(34, 197, 94, 0.9)',
        trailColor: 'linear-gradient(90deg, transparent, #22c55e, #10b981)',
        name: 'Panah Angin Cepat',
    },
    healer: {
        projectileIcon: '✨',
        projectileColor: '#eab308',
        impactColor: 'rgba(234, 179, 8, 0.9)',
        trailColor: 'linear-gradient(90deg, transparent, #eab308, #f59e0b)',
        name: 'Sinar Cahaya Suci',
    },
    bot: {
        projectileIcon: '⚡',
        projectileColor: '#00d4ff',
        impactColor: 'rgba(0, 212, 255, 0.9)',
        trailColor: 'linear-gradient(90deg, transparent, #00d4ff, #3b82f6)',
        name: 'Sengatan Pulsa AI',
    },
}

export default function BattleArenaStage({
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
    React.useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    const charSize = isMobile ? 84 : 112
    const attackVisual = activeAttack ? ATTACK_VISUALS[activeAttack.type] || ATTACK_VISUALS.warrior : null

    return (
        <div
            className={`battle-stage-container ${className}`}
            style={{
                position: 'relative',
                width: '100%',
                borderRadius: '16px',
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 15, 30, 0.95) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '16px 14px 12px',
                overflow: 'hidden',
                boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                boxSizing: 'border-box',
                marginBottom: '16px',
            }}
        >
            {/* Arena Floor Grid Perspective / Ambient Glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: 'radial-gradient(ellipse at 50% 120%, rgba(245, 197, 66, 0.08) 0%, transparent 70%)',
                    zIndex: 0,
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
                    marginBottom: '12px',
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
                                color: '#ffffff',
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
                                    boxShadow: player.mp >= 100 ? '0 0 8px #f59e0b' : undefined,
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

                {/* Center Clash / Score Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '0 4px' }}>
                    <div
                        style={{
                            padding: '3px 10px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(245, 197, 66, 0.1)',
                            border: '1px solid rgba(245, 197, 66, 0.3)',
                            color: 'var(--color-signal-orange)',
                            fontSize: '11px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        <Swords size={12} />
                        <span>VS</span>
                    </div>
                    {comboCount > 1 && (
                        <motion.span
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [1, 1.12, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: '#f59e0b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                            }}
                        >
                            <Flame size={10} /> {comboCount}x COMBO
                        </motion.span>
                    )}
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
                                color: '#ffffff',
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

            {/* Duel Battle Arena Stage (Characters & Attack Effects) */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    height: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                }}
            >
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

                    {/* Pedestal Base Ring */}
                    <div
                        style={{
                            width: '84px',
                            height: '14px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(245, 197, 66, 0.35) 0%, transparent 75%)',
                            border: '1px solid rgba(245, 197, 66, 0.3)',
                            marginTop: '-12px',
                        }}
                    />
                </div>

                {/* --- ATTACK PROJECTILE & IMPACT BURST OVERLAY --- */}
                <AnimatePresence>
                    {activeAttack && attackVisual && (
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                pointerEvents: 'none',
                                zIndex: 15,
                                overflow: 'visible',
                            }}
                        >
                            {/* Moving Energy Projectile / Slash Wave */}
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
                                    scale: [0.7, 1.4, 1.1],
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
                                {/* Light Streak Trail */}
                                <div
                                    style={{
                                        width: '64px',
                                        height: '6px',
                                        background: attackVisual.trailColor,
                                        borderRadius: '4px',
                                        filter: `drop-shadow(0 0 10px ${attackVisual.impactColor})`,
                                        transform: activeAttack.direction === 'right-to-left' ? 'scaleX(-1)' : undefined,
                                    }}
                                />
                                {/* Projectile Icon Core */}
                                <div
                                    style={{
                                        fontSize: '26px',
                                        filter: `drop-shadow(0 0 12px ${attackVisual.impactColor})`,
                                        transform: activeAttack.direction === 'right-to-left' ? 'scaleX(-1)' : undefined,
                                    }}
                                >
                                    {attackVisual.projectileIcon}
                                </div>
                            </motion.div>

                            {/* Impact Explosion Burst at Target */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.2 }}
                                animate={{ opacity: [0, 1, 0], scale: [0.4, 2.2, 2.6] }}
                                transition={{ duration: 0.45, delay: 0.28 }}
                                style={{
                                    position: 'absolute',
                                    left: activeAttack.direction === 'left-to-right' ? '76%' : '24%',
                                    top: '42%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '50%',
                                    background: `radial-gradient(circle, ${attackVisual.impactColor} 0%, transparent 70%)`,
                                    border: `2px solid ${attackVisual.projectileColor}`,
                                }}
                            />
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

            {/* Duel Battle Action Banner / Combat Log */}
            {battleLog && (
                <motion.div
                    key={battleLog}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        marginTop: '8px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '11.5px',
                        color: '#cbd5e1',
                        textAlign: 'center',
                        lineHeight: 1.4,
                    }}
                >
                    <Sparkles size={12} style={{ color: 'var(--color-signal-orange)', flexShrink: 0 }} />
                    <span>{battleLog}</span>
                </motion.div>
            )}
        </div>
    )
}
