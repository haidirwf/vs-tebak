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

    // Determine border, background, and shadow based on rarity pedestal
    const pedestalBorder = showBorder && rarity ? rarity.pedestalBorder : '1px solid var(--surface-border)'
    const pedestalBg = rarity ? rarity.pedestalBg : 'var(--surface-elevated)'
    const pedestalShadow = rarity ? rarity.pedestalShadow : 'none'

    if (item) {
        if (item.image_url && !imgError) {
            return (
                <div
                    className={`relative flex items-center justify-center overflow-hidden shrink-0 select-none rarity-pedestal ${className}`}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: size >= 48 ? '12px' : '10px',
                        background: pedestalBg,
                        border: pedestalBorder,
                        boxShadow: pedestalShadow,
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

        // Render item emoji icon inside themed pedestal
        return (
            <div
                className={`relative flex items-center justify-center shrink-0 select-none rarity-pedestal ${className}`}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: size >= 48 ? '12px' : '10px',
                    background: pedestalBg,
                    border: pedestalBorder,
                    boxShadow: pedestalShadow,
                    fontSize: `${Math.round(size * 0.52)}px`,
                }}
                title={item.name}
            >
                {item.icon || '⚔️'}
            </div>
        )
    }

    // Fallback if no item equipped (empty slot)
    return (
        <div
            className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: size >= 48 ? '12px' : '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed var(--surface-border)',
                color: 'var(--text-muted)',
            }}
            title={`Slot ${effectiveSlot}`}
        >
            <FallbackIcon size={Math.round(size * 0.44)} style={{ opacity: 0.5 }} />
        </div>
    )
}
