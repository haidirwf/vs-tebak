// components/dashboard/MotivationQuote.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote } from 'lucide-react'

const QUOTES = [
    "Satu-satunya cara untuk melakukan pekerjaan hebat adalah dengan mencintai apa yang kamu lakukan.",
    "Jangan menunggu kesempatan, ciptakanlah!",
    "Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia.",
    "Masa depanmu ditentukan oleh apa yang kamu lakukan hari ini, bukan besok.",
    "Belajar tidak pernah membuat pikiran lelah.",
    "Kesuksesan adalah kumpulan dari upaya kecil yang diulangi hari demi hari.",
    "Skill digital bukan lagi pilihan, tapi masa depan.",
    "Jadilah versi terbaik dari dirimu sendiri.",
]

export default function MotivationQuote() {
    const [quote, setQuote] = useState("")

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * QUOTES.length)
        setQuote(QUOTES[randomIndex])
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{
                padding: '16px 20px',
                backgroundColor: 'rgba(245, 197, 66, 0.03)',
                border: '1px solid rgba(245, 197, 66, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{
                backgroundColor: 'rgba(245, 197, 66, 0.1)',
                borderRadius: '50%',
                padding: '8px',
                color: 'var(--accent-gold)'
            }}>
                <Quote size={18} fill="currentColor" fillOpacity={0.2} />
            </div>

            <div style={{ flex: 1 }}>
                <p style={{
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    fontStyle: 'bold',
                    fontWeight: 500,
                    lineHeight: 1.5
                }}>
                    &quot;{quote}&quot;
                </p>
                <p style={{
                    fontSize: '10px',
                    color: 'var(--accent-gold)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Daily Motivation
                </p>
            </div>

            {/* Subtle glow effect */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--accent-gold)',
                filter: 'blur(40px)',
                opacity: 0.1,
                pointerEvents: 'none'
            }} />
        </motion.div>
    )
}
