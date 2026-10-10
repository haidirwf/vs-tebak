'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
import BadgeIcon from '@/components/character/BadgeIcon'
import ItemIcon from '@/components/character/ItemIcon'
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
    Target,
    Copy,
    Check,
    LogOut,
    Sparkles,
    Medal,
    Layers
} from 'lucide-react'

export interface ProfileHeroStageProps {
    profile: Profile
    completedModulesCount: number
    battlesTotal: number
    battlesWon: number
    isOwnProfile?: boolean
    badges?: Array<{ id: string; badge?: { name: string; icon_url: string; description?: string } }>
    completedModules?: Array<{ id: string; module?: { title: string } }>
    onSignOut?: () => void
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
    badges = [],
    completedModules = [],
    onSignOut,
}: ProfileHeroStageProps) {
    const { characterEquipped } = useContentStore()
    const [activeTab, setActiveTab] = useState<'attributes' | 'medals' | 'modules'>('attributes')
    const [copiedId, setCopiedId] = useState(false)

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

    const handleCopyId = () => {
        if (!profile.id) return
        navigator.clipboard.writeText(profile.id)
        setCopiedId(true)
        setTimeout(() => setCopiedId(false), 2000)
    }

    const shortId = profile.id ? profile.id.slice(0, 8) : '00000000'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {/* =========================================================================
                1. PLAYER IDENTITY HEADER (Sesuai Referensi Info & MLBB Header)
               ========================================================================= */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="profile-header-card"
                style={{
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--surface-border)',
                    boxShadow: 'var(--shadow-card)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                }}
            >
                {/* Left: Avatar Frame & Identity Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                    {/* Avatar Portrait with Golden RPG Frame */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div
                            style={{
                                width: '76px',
                                height: '76px',
                                borderRadius: '12px',
                                border: '2px solid var(--accent-gold-border)',
                                background: `radial-gradient(circle, ${roleInfo.themeColor}24 0%, var(--surface-elevated) 80%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                            }}
                        >
                            <span style={{ fontSize: '38px', lineHeight: 1 }}>
                                {roleInfo.avatarEmoji}
                            </span>
                        </div>
                        {/* Level Tag Overlay */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '-6px',
                                right: '-6px',
                                backgroundColor: 'var(--brand-primary)',
                                color: 'var(--brand-primary-text)',
                                border: '1px solid var(--brand-primary-border)',
                                borderRadius: '6px',
                                padding: '1px 6px',
                                fontSize: '10.5px',
                                fontWeight: 800,
                                fontFamily: 'var(--font-heading)',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Lv.{profile.level}
                        </div>
                    </div>

                    {/* Identity Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {/* Name & Account ID */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h2
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '22px',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    margin: 0,
                                    lineHeight: 1.2,
                                }}
                            >
                                {profile.username}
                            </h2>

                            {/* ID Badge with Copy Button */}
                            <button
                                type="button"
                                onClick={handleCopyId}
                                title="Klik untuk menyalin User ID"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--surface-elevated)',
                                    border: '1px solid var(--surface-border)',
                                    color: 'var(--text-secondary)',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-mono)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <span>ID: {shortId}</span>
                                {copiedId ? (
                                    <Check size={11} style={{ color: 'var(--accent-green)' }} />
                                ) : (
                                    <Copy size={11} />
                                )}
                            </button>
                        </div>

                        {/* Role Title & Subtitle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            <span style={{ fontWeight: 600, color: roleInfo.themeColor }}>
                                {roleInfo.title}
                            </span>
                            <span style={{ opacity: 0.4 }}>—</span>
                            <span>{roleInfo.subtitle}</span>
                        </div>

                        {/* School & City & Streak Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '2px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <School size={12} />
                                <span>{profile.school_name || 'Pelajar Indonesia'}</span>
                            </div>
                            {profile.city && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    <MapPin size={12} />
                                    <span>{profile.city}</span>
                                </div>
                            )}
                            {effectiveStreak > 0 && (
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: 'var(--accent-red)',
                                        fontWeight: 600,
                                    }}
                                >
                                    <Flame size={12} />
                                    <span>{effectiveStreak} Hari Beruntun</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {isOwnProfile ? (
                        <>
                            <Link
                                href="/character"
                                className="btn-signal-orange"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '12.5px',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                }}
                            >
                                <Sparkles size={14} />
                                <span>Kustomisasi Hero</span>
                            </Link>

                            {onSignOut && (
                                <button
                                    type="button"
                                    onClick={onSignOut}
                                    className="btn-dark-outline"
                                    title="Keluar dari akun"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: 'var(--accent-red)',
                                        borderColor: 'rgba(239, 68, 68, 0.25)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <LogOut size={14} />
                                    <span>Keluar</span>
                                </button>
                            )}
                        </>
                    ) : (
                        <Link
                            href="/battle"
                            className="btn-signal-orange"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                textDecoration: 'none',
                            }}
                        >
                            <Swords size={14} />
                            <span>Tantang Duel</span>
                        </Link>
                    )}
                </div>
            </motion.div>

            {/* =========================================================================
                2. MAIN 2-COLUMN ARENA LAYOUT (Records/Tabs di Kiri, Hero Stage di Kanan)
               ========================================================================= */}
            <div className="profile-layout-grid">
                {/* ---------------------------------------------------------------------
                    LEFT COLUMN: Tabs & Player Dossier Records (~60%)
                   --------------------------------------------------------------------- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
                    {/* Navigation Tabs (Sesuai gaya tab di MLA/MLBB: Info/Attributes, Medal Wall, Modul) */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '12px',
                            padding: '6px',
                        }}
                    >
                        {/* Tab 1: Atribut Tempur */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="button"
                            onClick={() => setActiveTab('attributes')}
                            style={{
                                flex: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: activeTab === 'attributes' ? '1px solid var(--accent-gold-border)' : '1px solid transparent',
                                backgroundColor: activeTab === 'attributes' ? 'var(--accent-gold-bg)' : 'transparent',
                                color: activeTab === 'attributes' ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '12.5px',
                                fontWeight: activeTab === 'attributes' ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Swords size={14} />
                            <span>Atribut Tempur</span>
                        </motion.button>

                        {/* Tab 2: Medal Wall */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="button"
                            onClick={() => setActiveTab('medals')}
                            style={{
                                flex: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: activeTab === 'medals' ? '1px solid var(--accent-gold-border)' : '1px solid transparent',
                                backgroundColor: activeTab === 'medals' ? 'var(--accent-gold-bg)' : 'transparent',
                                color: activeTab === 'medals' ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '12.5px',
                                fontWeight: activeTab === 'medals' ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Medal size={14} />
                            <span>Medal Wall</span>
                            {badges.length > 0 && (
                                <span
                                    style={{
                                        fontSize: '10.5px',
                                        padding: '1px 6px',
                                        borderRadius: '6px',
                                        backgroundColor: activeTab === 'medals' ? 'rgba(217, 119, 6, 0.2)' : 'var(--surface-elevated)',
                                        fontWeight: 700,
                                    }}
                                >
                                    {badges.length}
                                </span>
                            )}
                        </motion.button>

                        {/* Tab 3: Modul Belajar */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="button"
                            onClick={() => setActiveTab('modules')}
                            style={{
                                flex: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: activeTab === 'modules' ? '1px solid var(--accent-gold-border)' : '1px solid transparent',
                                backgroundColor: activeTab === 'modules' ? 'var(--accent-gold-bg)' : 'transparent',
                                color: activeTab === 'modules' ? 'var(--accent-gold-text)' : 'var(--text-secondary)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '12.5px',
                                fontWeight: activeTab === 'modules' ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <BookOpen size={14} />
                            <span>Modul Belajar</span>
                            {completedModulesCount > 0 && (
                                <span
                                    style={{
                                        fontSize: '10.5px',
                                        padding: '1px 6px',
                                        borderRadius: '6px',
                                        backgroundColor: activeTab === 'modules' ? 'rgba(217, 119, 6, 0.2)' : 'var(--surface-elevated)',
                                        fontWeight: 700,
                                    }}
                                >
                                    {completedModulesCount}
                                </span>
                            )}
                        </motion.button>
                    </div>

                    {/* Content Area Based on Active Tab */}
                    <AnimatePresence mode="wait">
                        {/* TAB 1: ATRIBUT TEMPUR */}
                        {activeTab === 'attributes' && (
                            <motion.div
                                key="attributes-tab"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                            >
                                {/* Level Progress & XP */}
                                <div
                                    style={{
                                        backgroundColor: 'var(--surface-card)',
                                        border: '1px solid var(--surface-border)',
                                        boxShadow: 'var(--shadow-card)',
                                        borderRadius: '16px',
                                        padding: '18px 20px',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div>
                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                Perkembangan Level
                                            </span>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                Level {profile.level}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '11.5px', color: 'var(--color-gold-text)', fontWeight: 700 }}>
                                                {Math.max(0, xpInLevel)} / {profile.xp_to_next_level} XP
                                            </span>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                Total {profile.xp.toLocaleString('id-ID')} XP
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ height: '8px', backgroundColor: 'var(--surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${xpProgress}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                                            style={{
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #FDE047 0%, #F5C542 50%, #EAB308 100%)',
                                                borderRadius: '4px',
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                        <span>Progress Level Saat Ini</span>
                                        <span>{xpProgress}% Menuju Level {profile.level + 1}</span>
                                    </div>
                                </div>

                                {/* RPG Combat Attributes Card (6 Stats Grid) */}
                                <div
                                    style={{
                                        backgroundColor: 'var(--surface-card)',
                                        border: '1px solid var(--surface-border)',
                                        boxShadow: 'var(--shadow-card)',
                                        borderRadius: '16px',
                                        padding: '20px',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                        <div>
                                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                                Atribut Tempur RPG
                                            </h3>
                                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                                                Statistik dasar kelas & bonus dari perlengkapan
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                color: roleInfo.themeColor,
                                                backgroundColor: 'var(--surface-elevated)',
                                                border: '1px solid var(--surface-border)',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Tier Lv.{profile.level}
                                        </div>
                                    </div>

                                    {/* 6 Stats Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                                        {/* HP */}
                                        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '10px', padding: '9px 10px', minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                                                <Heart size={13} style={{ flexShrink: 0 }} />
                                                <span>Health</span>
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {stats.hp}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                Daya tahan duel
                                            </div>
                                        </div>

                                        {/* MP */}
                                        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '10px', padding: '9px 10px', minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38bdf8', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                                                <Droplets size={13} style={{ flexShrink: 0 }} />
                                                <span>Mana</span>
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {stats.mp}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                Kapasitas skill
                                            </div>
                                        </div>

                                        {/* ATK */}
                                        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '10px', padding: '9px 10px', minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                                                <Swords size={13} style={{ flexShrink: 0 }} />
                                                <span>Attack</span>
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {stats.atk}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {stats.battleBuffs.extraAtkPoints > 0 ? `+${stats.battleBuffs.extraAtkPoints} Poin Jwb` : 'Serangan dasar'}
                                            </div>
                                        </div>

                                        {/* DEF */}
                                        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '10px', padding: '9px 10px', minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                                                <Shield size={13} style={{ flexShrink: 0 }} />
                                                <span>Defense</span>
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {stats.def}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {stats.battleBuffs.damageReductionPct > 0 ? `Reduksi -${stats.battleBuffs.damageReductionPct}%` : 'Pertahanan'}
                                            </div>
                                        </div>

                                        {/* CRIT */}
                                        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '10px', padding: '9px 10px', minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#a855f7', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                                                <Crosshair size={13} style={{ flexShrink: 0 }} />
                                                <span>Critical</span>
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {stats.crit}%
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                Peluang 1.5x
                                            </div>
                                        </div>

                                        {/* SPEED */}
                                        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '10px', padding: '9px 10px', minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#06b6d4', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                                                <Clock size={13} style={{ flexShrink: 0 }} />
                                                <span>Speed</span>
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {stats.speed}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {stats.battleBuffs.extraTimerSec > 0 ? `+${stats.battleBuffs.extraTimerSec}s Ronde` : 'Waktu standar'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Passive Perk Banner */}
                                    <div
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: '10px',
                                            backgroundColor: 'var(--surface-elevated)',
                                            border: '1px solid var(--surface-border)',
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
                                                backgroundColor: 'var(--surface-card)',
                                                border: '1px solid var(--surface-border)',
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
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                Perk Pasif: <span style={{ color: roleInfo.themeColor }}>{roleInfo.perk.name}</span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                                                {roleInfo.perk.effect}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Duel & Learning Performance Grid */}
                                <div
                                    style={{
                                        backgroundColor: 'var(--surface-card)',
                                        border: '1px solid var(--surface-border)',
                                        boxShadow: 'var(--shadow-card)',
                                        borderRadius: '16px',
                                        padding: '16px 20px',
                                    }}
                                >
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>
                                        Statistik Performa Duel & Belajar
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                        {/* Modules Completed */}
                                        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                                            <div style={{ color: 'var(--accent-cyan)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                                <BookOpen size={15} />
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {completedModulesCount}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                Modul
                                            </div>
                                        </div>

                                        {/* Battles Total */}
                                        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                                            <div style={{ color: 'var(--accent-red)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                                <Zap size={15} />
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {battlesTotal}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                Total Duel
                                            </div>
                                        </div>

                                        {/* Battles Won */}
                                        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                                            <div style={{ color: 'var(--accent-gold)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                                <Trophy size={15} />
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {battlesWon}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                Menang
                                            </div>
                                        </div>

                                        {/* Winrate */}
                                        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                                            <div style={{ color: 'var(--accent-green)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                                <Target size={15} />
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {winrate}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                Winrate
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 2: MEDAL WALL (Sesuai Referensi 1 Mobile Legends Adventure) */}
                        {activeTab === 'medals' && (
                            <motion.div
                                key="medals-tab"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid var(--surface-border)',
                                    boxShadow: 'var(--shadow-card)',
                                    borderRadius: '16px',
                                    padding: '22px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Medal size={18} style={{ color: 'var(--accent-gold)' }} />
                                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                                Medal Wall
                                            </h3>
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                                            Pencapaian lencana kehormatan dari modul, streak harian, dan duel arena
                                        </p>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: 'var(--accent-gold)',
                                            backgroundColor: 'var(--accent-gold-bg)',
                                            border: '1px solid var(--accent-gold-border)',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                        }}
                                    >
                                        {badges.length} Terbuka
                                    </div>
                                </div>

                                {badges.length === 0 ? (
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            padding: '36px 20px',
                                            backgroundColor: 'var(--surface-elevated)',
                                            borderRadius: '12px',
                                            border: '1px dashed var(--surface-border)',
                                        }}
                                    >
                                        <Medal size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                                            Belum ada lencana yang terbuka. Selesaikan modul dan duel untuk memajang medali pertamamu di Medal Wall!
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                                        {badges.map((ub: any, idx: number) => (
                                            <motion.div
                                                key={ub.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.03 }}
                                                whileHover={{ scale: 1.04, y: -2 }}
                                                style={{
                                                    backgroundColor: 'var(--surface-elevated)',
                                                    border: '1px solid var(--accent-gold-border)',
                                                    borderRadius: '12px',
                                                    padding: '16px 12px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                <div style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                                    <BadgeIcon icon={ub.badge?.icon_url} size={30} />
                                                </div>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                                                    {ub.badge?.name}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* TAB 3: MODUL BELAJAR */}
                        {activeTab === 'modules' && (
                            <motion.div
                                key="modules-tab"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    backgroundColor: 'var(--surface-card)',
                                    border: '1px solid var(--surface-border)',
                                    boxShadow: 'var(--shadow-card)',
                                    borderRadius: '16px',
                                    padding: '22px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <BookOpen size={18} style={{ color: 'var(--accent-green)' }} />
                                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                                Modul Pembelajaran Selesai
                                            </h3>
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                                            Daftar materi pembelajaran yang telah berhasil dituntaskan
                                        </p>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: 'var(--accent-green)',
                                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                            border: '1px solid rgba(34, 197, 94, 0.25)',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                        }}
                                    >
                                        {completedModules.length} Modul
                                    </div>
                                </div>

                                {completedModules.length === 0 ? (
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            padding: '36px 20px',
                                            backgroundColor: 'var(--surface-elevated)',
                                            borderRadius: '12px',
                                            border: '1px dashed var(--surface-border)',
                                        }}
                                    >
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 12px 0' }}>
                                            Belum ada modul yang diselesaikan. Asah kemampuanmu dan raih XP belajar sekarang!
                                        </p>
                                        <Link
                                            href="/modules"
                                            className="btn-signal-orange"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                padding: '7px 16px',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            <span>Jelajahi Modul Belajar</span>
                                            <ArrowRight size={13} />
                                        </Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                        {completedModules.map((um: any, mIdx: number) => (
                                            <motion.div
                                                key={um.id}
                                                initial={{ opacity: 0, scale: 0.97 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: mIdx * 0.02 }}
                                                whileHover={{ x: 2 }}
                                                style={{
                                                    padding: '12px 14px',
                                                    borderRadius: '10px',
                                                    backgroundColor: 'var(--surface-elevated)',
                                                    border: '1px solid var(--surface-border)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                }}
                                            >
                                                <span style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '14px' }}>✓</span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.35 }}>
                                                    {um.module?.title || 'Modul Pembelajaran'}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ---------------------------------------------------------------------
                    RIGHT COLUMN: Full Hero Stage & Equipped Gear (~40%)
                   --------------------------------------------------------------------- */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                    style={{
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--surface-border)',
                        boxShadow: 'var(--shadow-card)',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 0,
                    }}
                >
                    {/* Header Tag Bar */}
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--surface-elevated)',
                                border: '1px solid var(--surface-border)',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: roleInfo.themeColor,
                            }}
                        >
                            <span>{roleInfo.avatarEmoji}</span>
                            <span>{roleInfo.name}</span>
                        </div>

                        <div
                            style={{
                                fontSize: '11.5px',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
                            <Sparkles size={12} style={{ color: 'var(--accent-gold)' }} />
                            <span>Hero Stage</span>
                        </div>
                    </div>

                    {/* Character Visual Stage (With glowing pedestal effect) */}
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px 0 10px',
                            background: `radial-gradient(circle, ${roleInfo.themeColor}18 0%, rgba(20, 20, 20, 0) 72%)`,
                            borderRadius: '16px',
                        }}
                    >
                        <CharacterVisual
                            role={avatarClass}
                            equipped={equipped}
                            size={240}
                            showAura={true}
                            interactive={true}
                            showRoleBadge={false}
                        />

                        {/* Pedestal Base Ring Under Hero Feet */}
                        <div
                            style={{
                                width: '180px',
                                height: '14px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                border: `1px solid ${roleInfo.themeColor}33`,
                                marginTop: '-6px',
                                boxShadow: `0 0 18px ${roleInfo.themeColor}22`,
                            }}
                        />
                    </div>

                    {/* Hero Title & Subtitle */}
                    <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '18px' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {roleInfo.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {roleInfo.subtitle}
                        </div>
                    </div>

                    {/* Active Equipment Slots Grid */}
                    <div style={{ width: '100%', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
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
                                        color: 'var(--brand-primary)',
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
                                            gap: '9px',
                                            padding: '8px 10px',
                                            borderRadius: '10px',
                                            backgroundColor: item ? 'var(--surface-elevated)' : 'transparent',
                                            border: `1px solid ${item ? RARITY_CONFIG[item.rarity].border : 'var(--surface-border)'}`,
                                            minWidth: 0,
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <ItemIcon item={item} slot={slotKey} size={28} />
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                                {slotMeta.name}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: item ? 'var(--text-primary)' : 'var(--text-secondary)',
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

                    {/* Customize Action Button */}
                    {isOwnProfile && (
                        <div style={{ width: '100%', marginTop: '16px' }}>
                            <Link
                                href="/character"
                                className="btn-dark-outline"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '9px 16px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                }}
                            >
                                <Sparkles size={13} />
                                <span>Kustomisasi Karakter & Gear</span>
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
