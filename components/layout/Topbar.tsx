'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Flame,
    Sparkles,
    LogOut,
} from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { getEffectiveStreak, isStreakPendingToday } from '@/lib/game/streak'
import { createClient } from '@/lib/supabase/client'

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
    const router = useRouter()
    const { profile } = useUserStore()
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const effectiveStreak = profile ? getEffectiveStreak(profile.last_active, profile.streak_count) : 0
    const isPendingStreak = profile ? isStreakPendingToday(profile.last_active, profile.streak_count) : false

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <header
            className="dashboard-navbar-header"
            style={{
                height: '56px',
                backgroundColor: 'rgba(10, 10, 10, 0.9)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--surface-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                position: 'sticky',
                top: 0,
                zIndex: 40,
                width: '100%',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
            }}
        >
            {/* Ujung Kiri: Nama User dan Level (Logo & teks Skillungo telah dihapus) */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
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
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            transition: 'background-color 0.15s ease, border-color 0.15s ease',
                        }}
                        className="topbar-user-link"
                    >
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                border: `1px solid ${CLASS_COLORS[profile.avatar_class] || 'rgba(255, 255, 255, 0.2)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
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
                                    color: '#ffffff',
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
                                    color: 'var(--color-gold)',
                                    backgroundColor: 'rgba(245, 197, 66, 0.12)',
                                    border: '1px solid rgba(245, 197, 66, 0.3)',
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
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        />
                        <div
                            style={{
                                width: '80px',
                                height: '16px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Ujung Kanan: Streak dan XP, Audio Toggle, serta Tombol Keluar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Streak Badge */}
                {profile && effectiveStreak > 0 && (
                    <div
                        title={
                            isPendingStreak
                                ? `Streak ${effectiveStreak} hari (belum aktif hari ini)`
                                : `Streak ${effectiveStreak} hari (aktif hari ini)`
                        }
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--accent-red-bg)',
                            border: isPendingStreak
                                ? '1px dashed var(--accent-red-border)'
                                : '1px solid var(--accent-red-border)',
                            color: 'var(--accent-red)',
                            fontFamily: 'var(--font-inter)',
                            fontSize: '12px',
                            fontWeight: 600,
                            lineHeight: 1,
                            cursor: 'default',
                        }}
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Flame size={14} style={{ color: 'var(--accent-red)' }} />
                        </motion.div>
                        <span>{effectiveStreak}</span>
                    </div>
                )}

                {/* XP Badge */}
                {profile && (
                    <div
                        title={`${profile.xp.toLocaleString()} Total XP`}
                        style={{
                            backgroundColor: 'rgba(245, 197, 66, 0.1)',
                            border: '1px solid rgba(245, 197, 66, 0.3)',
                            borderRadius: '8px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontFamily: 'var(--font-inter)',
                            fontWeight: 600,
                            color: 'var(--color-gold)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            lineHeight: 1,
                            cursor: 'default',
                        }}
                    >
                        <Sparkles size={13} style={{ color: 'var(--color-gold)' }} />
                        <span>{profile.xp.toLocaleString()} XP</span>
                    </div>
                )}

                {/* Logout Button */}
                <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    title="Keluar Akun"
                    aria-label="Logout"
                    style={{
                        background: 'rgba(255, 51, 68, 0.06)',
                        border: '1px solid rgba(255, 51, 68, 0.2)',
                        borderRadius: '8px',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-red)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                    }}
                >
                    <LogOut size={15} />
                </button>
            </div>

            {/* Modal Konfirmasi Logout */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div
                        className="modal-overlay"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '16px',
                        }}
                        onClick={() => setShowLogoutConfirm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="card"
                            style={{
                                width: '100%',
                                maxWidth: '360px',
                                padding: '24px',
                                backgroundColor: '#101010',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '12px',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '18px',
                                    fontWeight: 500,
                                    marginBottom: '8px',
                                    color: '#ffffff',
                                }}
                            >
                                Konfirmasi Keluar
                            </h3>
                            <p style={{ color: 'var(--color-fog)', fontSize: '13px', marginBottom: '20px' }}>
                                Yakin ingin keluar dari akun studio ini?
                            </p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="btn-dark-outline"
                                    style={{
                                        flex: 1,
                                        padding: '8px 14px',
                                        fontSize: '12px',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        flex: 1,
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 51, 68, 0.4)',
                                        backgroundColor: 'rgba(255, 51, 68, 0.15)',
                                        color: 'var(--accent-red)',
                                        fontFamily: 'var(--font-inter)',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Ya, Keluar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    )
}
