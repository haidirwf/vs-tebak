import { notFound, redirect } from 'next/navigation'

const RESERVED_SLUGS = new Set([
    'api',
    'auth',
    'login',
    'signup',
    'dashboard',
    'leaderboard',
    'battle',
    'modules',
    'voucher',
    'character',
    'profile',
    'pelajar',
    'favicon.ico',
    'robots.txt',
    'sitemap.xml',
    '_next',
])

interface VanityProfilePageProps {
    params: Promise<{ username: string }>
}

export default async function VanityProfilePage({ params }: VanityProfilePageProps) {
    const { username } = await params
    const cleanUsername = (username || '').toLowerCase()

    if (RESERVED_SLUGS.has(cleanUsername)) {
        notFound()
    }

    redirect(`/pelajar/${encodeURIComponent(username)}`)
}
