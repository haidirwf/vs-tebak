'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Flame,
    Zap,
} from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { getEffectiveStreak, isStreakPendingToday } from '@/lib/game/streak'
import ThemeToggle from '@/components/layout/ThemeToggle'

const CLASS_COLORS: Record<string, string> = {
    warrior: 'var(--accent-red)',
    mage: 'var(--accent-cyan)',
    archer: 'var(--accent-green)',
    healer: 'var(--accent-gold)',
}

const CLASS_EMOJI: Record<string, string> = {
    warrior: '⚔️',
    mage: '🔮',
    archer: '🏹',
    healer: '✨',
}

export default function Topbar() {
    const { profile } = useUserStore()

    const effectiveStreak = profile ? getEffectiveStreak(profile.last_active, profile.streak_count) : 0
    const isPendingStreak = profile ? isStreakPendingToday(profile.last_active, profile.streak_count) : false

    return (
        <header
            className="dashboard-navbar-header"
            style={{
                height: '56px',
                backgroundColor: 'var(--bg-navbar)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--surface-border)',
                position: 'sticky',
                top: 0,
                zIndex: 40,
                width: '100%',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
            }}
        >
            <div
                className="topbar-inner-content"
                style={{
                    maxWidth: '1240px',
                    margin: '0 auto',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                }}
            >
                {/* Ujung Kiri: Indikator Streak dan XP */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Streak Badge */}
                    {profile && (
                        <div
                            title={
                                effectiveStreak === 0
                                    ? 'Streak 0 hari (selesaikan modul hari ini untuk mulai streak)'
                                    : isPendingStreak
                                    ? `Streak ${effectiveStreak} hari (belum aktif hari ini)`
                                    : `Streak ${effectiveStreak} hari (aktif hari ini)`
                            }
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                backgroundColor: effectiveStreak > 0 ? 'var(--accent-red-bg)' : 'var(--surface-elevated)',
                                border: effectiveStreak > 0
                                    ? (isPendingStreak ? '1px dashed var(--accent-red-border)' : '1px solid var(--accent-red-border)')
                                    : '1px solid var(--surface-border)',
                                color: effectiveStreak > 0 ? 'var(--accent-red)' : 'var(--text-muted)',
                                fontFamily: 'var(--font-inter)',
                                fontSize: '12px',
                                fontWeight: 600,
                                lineHeight: 1,
                                cursor: 'default',
                            }}
                        >
                            <motion.div
                                animate={effectiveStreak > 0 ? {
                                    scale: [1, 1.15, 1],
                                } : undefined}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Flame size={14} style={{ color: effectiveStreak > 0 ? 'var(--accent-red)' : 'var(--text-muted)' }} />
                            </motion.div>
                            <span>{effectiveStreak}</span>
                        </div>
                    )}

                    {/* XP Badge */}
                    {profile && (
                        <div
                            title={`${profile.xp.toLocaleString()} Total XP`}
                            style={{
                                backgroundColor: 'var(--accent-gold-bg)',
                                border: '1px solid var(--accent-gold-border)',
                                borderRadius: '8px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                fontFamily: 'var(--font-inter)',
                                fontWeight: 600,
                                color: 'var(--accent-gold-text)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                lineHeight: 1,
                                cursor: 'default',
                            }}
                        >
                            <Zap size={14} style={{ color: 'var(--accent-gold-text)' }} />
                            <span>{profile.xp.toLocaleString()} XP</span>
                        </div>
                    )}
                </div>

                {/* Ujung Kanan: Nama User, Level, dan ThemeToggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ThemeToggle />
                    {profile ? (
                        <Link
                            href="/profile"
                            title="Buka Profil Pengguna"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                textDecoration: 'none',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--surface-canvas)',
                                border: '1px solid var(--surface-border)',
                                transition: 'background-color 0.15s ease, border-color 0.15s ease',
                            }}
                            className="topbar-user-link"
                        >
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--surface-card)',
                                    border: `1.5px solid ${CLASS_COLORS[profile.avatar_class] || 'var(--surface-border)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                                    flexShrink: 0,
                                }}
                            >
                                {CLASS_EMOJI[profile.avatar_class] || '🎮'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-inter)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        lineHeight: 1.2,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '120px',
                                    }}
                                >
                                    {profile.username}
                                </span>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-inter)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: 'var(--accent-gold-text)',
                                        backgroundColor: 'var(--accent-gold-bg)',
                                        border: '1px solid var(--accent-gold-border)',
                                        borderRadius: '6px',
                                        padding: '2px 6px',
                                        lineHeight: 1,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                    }}
                                >
                                    Lv.{profile.level}
                                </span>
                            </div>
                        </Link>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--surface-elevated)',
                                    border: '1px solid var(--surface-border)',
                                }}
                            />
                            <div
                                style={{
                                    width: '80px',
                                    height: '16px',
                                    borderRadius: '4px',
                                    backgroundColor: 'var(--surface-elevated)',
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
