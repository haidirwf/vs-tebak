'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Profile, AvatarClass } from '@/types'
import { 
    CHARACTER_ROLES, 
    calculateCharacterStats, 
    resolveEquippedMap 
} from '@/lib/game/character'
import { 
    GAME_ITEMS, 
    ItemSlot, 
    RARITY_CONFIG 
} from '@/lib/game/items'
import { getXpProgress } from '@/lib/game/xp'
import { getEffectiveStreak } from '@/lib/game/streak'
import CharacterVisual from '@/components/character/CharacterVisual'
import { useContentStore } from '@/stores/contentStore'
import { 
    Swords, 
    Shield, 
    Zap, 
    Heart, 
    Droplets, 
    Crosshair, 
    Clock, 
    Flame, 
    School, 
    MapPin, 
    ArrowRight,
    Trophy,
    BookOpen,
    Target
} from 'lucide-react'

interface ProfileHeroStageProps {
    profile: Profile
    completedModulesCount: number
    battlesTotal: number
    battlesWon: number
    isOwnProfile?: boolean
}

const SLOT_META: Record<ItemSlot, { name: string; emoji: string }> = {
    weapon: { name: 'Senjata', emoji: '🗡️' },
    head: { name: 'Kepala', emoji: '🪖' },
    armor: { name: 'Zirah', emoji: '🛡️' },
    accessory: { name: 'Aksesoris', emoji: '💍' },
}

export default function ProfileHeroStage({
    profile,
    completedModulesCount,
    battlesTotal,
    battlesWon,
    isOwnProfile = true,
}: ProfileHeroStageProps) {
    const { characterEquipped } = useContentStore()

    const avatarClass = (profile.avatar_class || 'warrior') as AvatarClass
    const roleInfo = CHARACTER_ROLES[avatarClass] || CHARACTER_ROLES.warrior

    // Resolve equipped items from store cache (if own profile) or profile record
    const equipped = useMemo(() => {
        if (isOwnProfile && characterEquipped && Object.keys(characterEquipped).length > 0) {
            return characterEquipped
        }
        return resolveEquippedMap(avatarClass, profile.equipped_items, profile.character_created ?? true)
    }, [isOwnProfile, characterEquipped, avatarClass, profile.equipped_items, profile.character_created])

    // Calculate total character combat stats
    const stats = useMemo(() => {
        return calculateCharacterStats(avatarClass, profile.level || 1, equipped)
    }, [avatarClass, profile.level, equipped])

    // Calculate XP progress in current level
    let xpInLevel = profile.xp
    for (let l = 1; l < profile.level; l++) {
        xpInLevel -= Math.floor(100 * Math.pow(l, 1.5))
    }
    const xpProgress = getXpProgress(Math.max(0, xpInLevel), profile.xp_to_next_level)

    const winrate = battlesTotal > 0
        ? `${Math.round((battlesWon / battlesTotal) * 100)}%`
        : '0%'

    const effectiveStreak = getEffectiveStreak(profile.last_active, profile.streak_count)

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* LEFT COLUMN: Character Stage & Active Equipment */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{
                    backgroundColor: '#141414',
                    border: '1px solid #282828',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {/* Header Tag Bar */}
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: roleInfo.themeColor,
                        }}
                    >
                        <span>{roleInfo.avatarEmoji}</span>
                        <span>{roleInfo.name}</span>
                    </div>

                    {effectiveStreak > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: 'var(--accent-red)',
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            <Flame size={13} />
                            <span>{effectiveStreak} Hari Beruntun</span>
                        </div>
                    )}
                </div>

                {/* Character 2D Visual Stage */}
                <div style={{ position: 'relative', margin: '4px 0 12px' }}>
                    <CharacterVisual
                        role={avatarClass}
                        equipped={equipped}
                        size={180}
                        showAura={true}
                        interactive={true}
                    />
                </div>

                {/* Hero Identity */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
                        {profile.username}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-steel)', marginTop: '2px' }}>
                        {roleInfo.title} — {roleInfo.subtitle}
                    </div>
                    {(profile.school_name || profile.city) && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-fog)', marginTop: '6px' }}>
                            <School size={12} />
                            <span>{profile.school_name || 'Pelajar'}</span>
                            {profile.city && (
                                <>
                                    <span>·</span>
                                    <MapPin size={12} />
                                    <span>{profile.city}</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Active Equipment Slots */}
                <div style={{ width: '100%', marginTop: 'auto', borderTop: '1px solid #222222', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                            Perlengkapan Terpasang
                        </span>
                        {isOwnProfile && (
                            <Link
                                href="/character"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '11px',
                                    color: roleInfo.themeColor,
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                <span>Atur Gear</span>
                                <ArrowRight size={11} />
                            </Link>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {(['weapon', 'head', 'armor', 'accessory'] as ItemSlot[]).map((slotKey) => {
                            const itemId = equipped[slotKey]
                            const item = itemId ? GAME_ITEMS.find((it) => it.id === itemId) : null
                            const slotMeta = SLOT_META[slotKey]

                            return (
                                <div
                                    key={slotKey}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '7px 9px',
                                        borderRadius: '8px',
                                        backgroundColor: item ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.015)',
                                        border: `1px solid ${item ? RARITY_CONFIG[item.rarity].border : 'rgba(255, 255, 255, 0.06)'}`,
                                        minWidth: 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '26px',
                                            height: '26px',
                                            borderRadius: '6px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.35)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '13px',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {item ? item.icon : slotMeta.emoji}
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontSize: '9px', color: 'var(--color-steel)' }}>
                                            {slotMeta.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                color: item ? '#ffffff' : 'var(--color-fog)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {item ? item.name : 'Kosong'}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </motion.div>

            {/* RIGHT COLUMN: Level Progress, Combat Stats & Duel Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Level & XP Progress Card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.06 }}
                    style={{
                        backgroundColor: '#141414',
                        border: '1px solid #282828',
                        borderRadius: '16px',
                        padding: '18px 20px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                            <span style={{ fontSize: '11px', color: 'var(--color-steel)', fontWeight: 500 }}>
                                Perkembangan Karakter
                            </span>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                                Level {profile.level}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                                {Math.max(0, xpInLevel)} / {profile.xp_to_next_level} XP
                            </span>
                            <div style={{ fontSize: '11px', color: 'var(--color-steel)' }}>
                                Total {profile.xp.toLocaleString('id-ID')} XP
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                            style={{ height: '100%', backgroundColor: 'var(--accent-gold)', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--color-steel)' }}>
                        <span>Progress Level Saat Ini</span>
                        <span>{xpProgress}% Menuju Level {profile.level + 1}</span>
                    </div>
                </motion.div>

                {/* 2. RPG Combat Attributes Card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.12 }}
                    style={{
                        backgroundColor: '#141414',
                        border: '1px solid #282828',
                        borderRadius: '16px',
                        padding: '20px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                                Atribut Tempur RPG
                            </h3>
                            <p style={{ fontSize: '11px', color: 'var(--color-steel)', margin: '2px 0 0' }}>
                                Kalkulasi stat dari level dasar & perlengkapan terpasang
                            </p>
                        </div>
                        <div
                            style={{
                                fontSize: '11px',
                                color: roleInfo.themeColor,
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: 600,
                            }}
                        >
                            Tier Level {profile.level}
                        </div>
                    </div>

                    {/* 6 Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                        {/* HP */}
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.025)', border: '1px solid #242424', borderRadius: '10px', padding: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                                <Heart size={13} />
                                <span>Health (HP)</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                                {stats.hp}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                Daya tahan duel
                            </div>
                        </div>

                        {/* MP */}
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.025)', border: '1px solid #242424', borderRadius: '10px', padding: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                                <Droplets size={13} />
                                <span>Mana (MP)</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                                {stats.mp}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                Kapasitas skill
                            </div>
                        </div>

                        {/* ATK */}
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.025)', border: '1px solid #242424', borderRadius: '10px', padding: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                                <Swords size={13} />
                                <span>Attack (ATK)</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                                {stats.atk}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                {stats.battleBuffs.extraAtkPoints > 0 ? `+${stats.battleBuffs.extraAtkPoints} Poin Jawaban` : 'Serangan dasar'}
                            </div>
                        </div>

                        {/* DEF */}
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.025)', border: '1px solid #242424', borderRadius: '10px', padding: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                                <Shield size={13} />
                                <span>Defense (DEF)</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                                {stats.def}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                {stats.battleBuffs.damageReductionPct > 0 ? `Reduksi -${stats.battleBuffs.damageReductionPct}%` : 'Pertahanan dasar'}
                            </div>
                        </div>

                        {/* CRIT */}
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.025)', border: '1px solid #242424', borderRadius: '10px', padding: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                                <Crosshair size={13} />
                                <span>Critical Rate</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                                {stats.crit}%
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                Peluang 1.5x skor
                            </div>
                        </div>

                        {/* SPEED */}
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.025)', border: '1px solid #242424', borderRadius: '10px', padding: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#06b6d4', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                                <Clock size={13} />
                                <span>Speed</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                                {stats.speed}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                {stats.battleBuffs.extraTimerSec > 0 ? `+${stats.battleBuffs.extraTimerSec}s Ronde` : 'Waktu standar'}
                            </div>
                        </div>
                    </div>

                    {/* Passive Perk Banner */}
                    <div
                        style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <div
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: roleInfo.themeColor,
                                flexShrink: 0,
                            }}
                        >
                            <Zap size={15} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
                                Perk Pasif: <span style={{ color: roleInfo.themeColor }}>{roleInfo.perk.name}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-steel)', lineHeight: 1.35 }}>
                                {roleInfo.perk.effect}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 3. Learning & Duel Performance Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.18 }}
                    style={{
                        backgroundColor: '#141414',
                        border: '1px solid #282828',
                        borderRadius: '16px',
                        padding: '16px 20px',
                    }}
                >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>
                        Statistik Performa Duel & Modul
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {/* Modules Completed */}
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid #222222', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                            <div style={{ color: 'var(--accent-cyan)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                <BookOpen size={15} />
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                                {completedModulesCount}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                Modul Selesai
                            </div>
                        </div>

                        {/* Battles Total */}
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid #222222', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                            <div style={{ color: 'var(--accent-red)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                <Zap size={15} />
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                                {battlesTotal}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                Total Duel
                            </div>
                        </div>

                        {/* Battles Won */}
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid #222222', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                            <div style={{ color: 'var(--accent-gold)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                <Trophy size={15} />
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                                {battlesWon}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                Menang
                            </div>
                        </div>

                        {/* Winrate */}
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid #222222', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                            <div style={{ color: 'var(--accent-green)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                <Target size={15} />
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                                {winrate}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-steel)', marginTop: '2px' }}>
                                Winrate
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
