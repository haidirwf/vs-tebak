'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface FaviconMeta {
    svg: string
    png: string
    titleSuffix: string
}

const ROUTE_FAVICONS: Record<string, FaviconMeta> = {
    '/dashboard': {
        svg: '/favicons/dashboard.svg',
        png: '/favicons/dashboard-32.png',
        titleSuffix: 'Beranda',
    },
    '/modules': {
        svg: '/favicons/modules.svg',
        png: '/favicons/modules-32.png',
        titleSuffix: 'Modul Belajar',
    },
    '/battle': {
        svg: '/favicons/battle.svg',
        png: '/favicons/battle-32.png',
        titleSuffix: 'Battle Arena',
    },
    '/character': {
        svg: '/favicons/character.svg',
        png: '/favicons/character-32.png',
        titleSuffix: 'Karakter & Kostum',
    },
    '/shop': {
        svg: '/favicons/shop.svg',
        png: '/favicons/shop-32.png',
        titleSuffix: 'Toko Petualang',
    },
    '/leaderboard': {
        svg: '/favicons/leaderboard.svg',
        png: '/favicons/leaderboard-32.png',
        titleSuffix: 'Papan Peringkat',
    },
    '/profile': {
        svg: '/favicons/profile.svg',
        png: '/favicons/profile-32.png',
        titleSuffix: 'Profil Petualang',
    },
}

export default function DynamicFavicon() {
    const pathname = usePathname()

    useEffect(() => {
        if (!pathname) return

        // Resolve favicon based on exact path or route prefix
        let meta: FaviconMeta | undefined = ROUTE_FAVICONS[pathname]
        if (!meta) {
            const matchedKey = Object.keys(ROUTE_FAVICONS).find((route) =>
                pathname.startsWith(route)
            )
            if (matchedKey) {
                meta = ROUTE_FAVICONS[matchedKey]
            }
        }

        const svgUrl = meta?.svg || '/favicon.svg'
        const pngUrl = meta?.png || '/favicon-32x32.png'

        // Update SVG icon link tag
        let svgLink = document.querySelector<HTMLLinkElement>(
            'link[rel="icon"][type="image/svg+xml"]'
        )
        if (!svgLink) {
            svgLink = document.createElement('link')
            svgLink.rel = 'icon'
            svgLink.type = 'image/svg+xml'
            document.head.appendChild(svgLink)
        }
        svgLink.href = svgUrl

        // Update 32x32 PNG icon link tag
        let pngLink = document.querySelector<HTMLLinkElement>(
            'link[rel="icon"][sizes="32x32"]'
        )
        if (!pngLink) {
            pngLink = document.createElement('link')
            pngLink.rel = 'icon'
            pngLink.type = 'image/png'
            pngLink.sizes = '32x32'
            document.head.appendChild(pngLink)
        }
        pngLink.href = pngUrl

        // Update Apple touch icon link tag
        let appleLink = document.querySelector<HTMLLinkElement>(
            'link[rel="apple-touch-icon"]'
        )
        if (!appleLink) {
            appleLink = document.createElement('link')
            appleLink.rel = 'apple-touch-icon'
            document.head.appendChild(appleLink)
        }
        appleLink.href = meta?.png ? meta.png.replace('-32.png', '-192.png') : '/apple-touch-icon.png'
    }, [pathname])

    return null
}
