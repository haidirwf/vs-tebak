'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { GameItem, ItemSlot, RARITY_CONFIG } from '@/lib/game/items'
import { Swords, Shield, Crown, Sparkles } from 'lucide-react'

interface ItemIconProps {
    item?: GameItem | null
    slot?: ItemSlot
    size?: number
    className?: string
    showBorder?: boolean
    emptyLabel?: string
}

const SLOT_ICONS: Record<ItemSlot, React.ComponentType<{ size: number; className?: string; style?: React.CSSProperties }>> = {
    weapon: Swords,
    head: Crown,
    armor: Shield,
    accessory: Sparkles,
}

export default function ItemIcon({
    item,
    slot,
    size = 40,
    className = '',
    showBorder = true,
}: ItemIconProps) {
    const [imgError, setImgError] = useState(false)

    const rarity = item ? RARITY_CONFIG[item.rarity] : null
    const effectiveSlot = slot || item?.slot || 'weapon'
    const FallbackIcon = SLOT_ICONS[effectiveSlot] || Swords

    // Determine border and background based on rarity
    const borderColor = showBorder && rarity ? rarity.border : 'var(--surface-border)'
    const backgroundColor = rarity ? rarity.bg : 'var(--surface-elevated)'

    if (item && item.image_url && !imgError) {
        return (
            <div
                className={`relative flex items-center justify-center overflow-hidden shrink-0 select-none ${className}`}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: size >= 48 ? '10px' : '8px',
                    backgroundColor,
                    border: `1px solid ${borderColor}`,
                }}
            >
                <img
                    src={item.image_url}
                    alt={item.name}
                    width={size}
                    height={size}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    loading="lazy"
                />
            </div>
        )
    }

    // Fallback if no item equipped (empty slot) or image failed to load
    return (
        <div
            className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: size >= 48 ? '10px' : '8px',
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-muted)',
            }}
            title={item ? item.name : `Slot ${effectiveSlot}`}
        >
            <FallbackIcon size={Math.round(size * 0.48)} style={{ opacity: 0.6 }} />
        </div>
    )
}
