'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Home,
    BookOpen,
    Swords,
    Shield,
    ShoppingBag,
    Trophy,
} from 'lucide-react'

// Navigasi bawah selayaknya Duolingo - icon recognizable bertema game per-halaman
const NAV_ITEMS = [
    { href: '/dashboard', favicon: '/favicons/dashboard.svg', icon: Home, label: 'Beranda' },
    { href: '/modules', favicon: '/favicons/modules.svg', icon: BookOpen, label: 'Modul Belajar' },
    { href: '/battle', favicon: '/favicons/battle.svg', icon: Swords, label: 'Battle Arena' },
    { href: '/character', favicon: '/favicons/character.svg', icon: Shield, label: 'Karakter & Kostum' },
    { href: '/shop', favicon: '/favicons/shop.svg', icon: ShoppingBag, label: 'Toko Petualang' },
    { href: '/leaderboard', favicon: '/favicons/leaderboard.svg', icon: Trophy, label: 'Papan Peringkat' },
]

export default function Navbar() {
    const pathname = usePathname()

    return (
        <nav
            className="dashboard-bottom-navbar"
            aria-label="Main Navigation"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                backgroundColor: 'var(--bg-navbar)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderTop: '1px solid var(--surface-border)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.45)',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '560px',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '0 8px',
                }}
            >
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            title={item.label}
                            aria-label={item.label}
                            style={{
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1,
                                maxWidth: '56px',
                                height: '44px',
                            }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.92 }}
                                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    backgroundColor: isActive ? 'var(--accent-gold-bg)' : 'transparent',
                                    border: `1px solid ${isActive ? 'var(--accent-gold-border)' : 'transparent'}`,
                                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                                }}
                            >
                                <img
                                    src={item.favicon}
                                    alt={item.label}
                                    width={26}
                                    height={26}
                                    style={{
                                        width: '26px',
                                        height: '26px',
                                        objectFit: 'contain',
                                        filter: isActive
                                            ? 'brightness(1.15) drop-shadow(0 2px 6px rgba(245, 197, 66, 0.35))'
                                            : 'grayscale(0.35) opacity(0.72)',
                                        transition: 'filter 0.2s ease, transform 0.2s ease',
                                        transform: isActive ? 'scale(1.06)' : 'scale(1)',
                                    }}
                                />

                                {/* Subtle top line active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        style={{
                                            position: 'absolute',
                                            top: '-1px',
                                            left: '8px',
                                            right: '8px',
                                            height: '2px',
                                            borderRadius: '2px',
                                            backgroundColor: 'var(--brand-primary)',
                                        }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
