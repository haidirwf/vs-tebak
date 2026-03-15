import {
    BookOpen,
    Flame,
    Gem,
    GraduationCap,
    Medal,
    Sparkles,
    Star,
    Swords,
    Trophy,
    type LucideIcon,
} from 'lucide-react'

interface BadgeIconProps {
    icon: string | null | undefined
    size?: number
    color?: string
    fallback?: string
}

const BADGE_ICON_MAP: Record<string, LucideIcon> = {
    book: BookOpen,
    mortarboard: GraduationCap,
    trophy: Trophy,
    star: Star,
    sparkle: Sparkles,
    flame: Flame,
    gem: Gem,
    sword: Swords,
    medal: Medal,
}

function isLikelyImageUrl(value: string): boolean {
    return /^https?:\/\//i.test(value) || value.startsWith('/')
}

function isLikelyEmoji(value: string): boolean {
    return /\p{Extended_Pictographic}/u.test(value)
}

export default function BadgeIcon({
    icon,
    size = 24,
    color = 'var(--accent-gold)',
    fallback = '🏅',
}: BadgeIconProps) {
    const raw = (icon || '').trim()
    const normalized = raw.toLowerCase().replace(/^:+|:+$/g, '')
    const Icon = BADGE_ICON_MAP[normalized]

    if (Icon) return <Icon size={size} style={{ color, display: 'inline-block' }} />

    if (raw && isLikelyImageUrl(raw)) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={raw}
                alt="Badge icon"
                width={size}
                height={size}
                style={{ width: size, height: size, objectFit: 'contain', display: 'inline-block' }}
            />
        )
    }

    const display = raw && isLikelyEmoji(raw) ? raw : fallback
    return <span>{display}</span>
}
