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

// Navigasi bawah selayaknya Duolingo - hanya icon recognizable tanpa teks judul
const NAV_ITEMS = [
    { href: '/dashboard', icon: Home, label: 'Beranda' },
    { href: '/modules', icon: BookOpen, label: 'Modul Belajar' },
    { href: '/battle', icon: Swords, label: 'Battle Arena' },
    { href: '/character', icon: Shield, label: 'Karakter & Kostum' },
    { href: '/shop', icon: ShoppingBag, label: 'Toko Petualang' },
    { href: '/leaderboard', icon: Trophy, label: 'Papan Peringkat' },
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
                backgroundColor: 'rgba(10, 10, 10, 0.92)',
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
                    const Icon = item.icon

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
                                    backgroundColor: isActive ? 'rgba(245, 197, 66, 0.12)' : 'transparent',
                                    border: `1px solid ${isActive ? 'rgba(245, 197, 66, 0.35)' : 'transparent'}`,
                                    color: isActive ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.48)',
                                    transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
                                }}
                            >
                                <Icon size={21} strokeWidth={isActive ? 2.3 : 1.8} />

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
                                            backgroundColor: 'var(--color-gold)',
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
