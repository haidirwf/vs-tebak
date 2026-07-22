'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem('sq:theme') as 'dark' | 'light' | null
        const initialTheme = savedTheme || 'dark'
        setTheme(initialTheme)
        document.documentElement.setAttribute('data-theme', initialTheme)
    }, [])

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(nextTheme)
        document.documentElement.setAttribute('data-theme', nextTheme)
        localStorage.setItem('sq:theme', nextTheme)
    }

    if (!mounted) return null

    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            title={theme === 'dark' ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Dark Mode)'}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: theme === 'dark' ? 'var(--accent-gold)' : 'var(--accent-cyan)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            }}
        >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </motion.button>
    )
}
