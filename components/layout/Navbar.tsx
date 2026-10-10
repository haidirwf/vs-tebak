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
    { href: '/dashboard', iconUrl: '/favicons/dashboard.svg', icon: Home, label: 'Beranda' },
    { href: '/modules', iconUrl: '/favicons/modules.svg', icon: BookOpen, label: 'Modul Belajar' },
    { href: '/battle', iconUrl: '/favicons/battle.svg', icon: Swords, label: 'Battle Arena' },
    { href: '/character', iconUrl: '/favicons/character.svg', icon: Shield, label: 'Karakter & Kostum' },
    { href: '/shop', iconUrl: '/favicons/shop.svg', icon: ShoppingBag, label: 'Toko Petualang' },
    { href: '/leaderboard', iconUrl: '/favicons/leaderboard.svg', icon: Trophy, label: 'Papan Peringkat' },
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
                                whileHover={{ scale: 1.12 }}
                                whileTap={{ scale: 0.94 }}
                                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                                style={{
                                    width: '46px',
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                }}
                            >
                                <img
                                    src={item.iconUrl}
                                    alt={item.label}
                                    width={34}
                                    height={34}
                                    style={{
                                        width: '34px',
                                        height: '34px',
                                        objectFit: 'contain',
                                        opacity: isActive ? 1 : 0.65,
                                        filter: isActive
                                            ? 'drop-shadow(0 2px 8px rgba(245, 197, 66, 0.45))'
                                            : 'none',
                                        transition: 'all 0.2s ease',
                                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                    }}
                                />

                                {/* Subtle top line active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        style={{
                                            position: 'absolute',
                                            top: '0px',
                                            left: '10px',
                                            right: '10px',
                                            height: '2.5px',
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
