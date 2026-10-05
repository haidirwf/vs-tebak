'use client'

import React from 'react'
import { motion, useReducedMotion, Variants } from 'framer-motion'

interface PageTransitionProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

export default function PageTransition({ children, className, style }: PageTransitionProps) {
    const shouldReduceMotion = useReducedMotion()

    const variants: Variants = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 10,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0.01 : 0.3,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            className={className}
            style={{
                width: '100%',
                minHeight: '100%',
                ...style,
            }}
        >
            {children}
        </motion.div>
    )
}
