import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { extractAuthSessionFromCookies, isSessionExpiringSoon } from '@/lib/auth/token-utils'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const pathname = request.nextUrl.pathname
    const protectedPaths = [
        '/dashboard',
        '/modules',
        '/battle',
        '/leaderboard',
        '/profile',
        '/voucher',
        '/shop',
        '/character',
    ]
    const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
    const authPaths = ['/login', '/register']
    const isAuthPage = authPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))

    if (!isProtected && !isAuthPage) {
        return supabaseResponse
    }

    const allCookies = request.cookies.getAll()
    const session = extractAuthSessionFromCookies(allCookies)

    // 1. Rute terlindungi dan tidak ada session -> redirect ke /login instan (0ms)
    if (isProtected && !session?.access_token) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectRes = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((c) => {
            redirectRes.cookies.set(c.name, c.value, c)
        })
        return redirectRes
    }

    // 2. FAST-PATH: Jika token JWT masih aktif (> 60 detik), bypass network call (0ms instan!)
    // Menghilangkan latency 5-6 detik per navigasi ke Supabase Cloud
    if (session?.access_token && !isSessionExpiringSoon(session, 60)) {
        if (isAuthPage) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            const redirectRes = NextResponse.redirect(url)
            supabaseResponse.cookies.getAll().forEach((c) => {
                redirectRes.cookies.set(c.name, c.value, c)
            })
            return redirectRes
        }
        return supabaseResponse
    }

    // 3. Token sudah expired atau mendekati kedaluwarsa (<60s):
    // Lakukan refresh via Supabase Auth tanpa membunuh session jika terjadi error jaringan
    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (isProtected && !user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            const redirectRes = NextResponse.redirect(url)
            supabaseResponse.cookies.getAll().forEach((c) => {
                redirectRes.cookies.set(c.name, c.value, c)
            })
            return redirectRes
        }

        if (isAuthPage && user) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            const redirectRes = NextResponse.redirect(url)
            supabaseResponse.cookies.getAll().forEach((c) => {
                redirectRes.cookies.set(c.name, c.value, c)
            })
            return redirectRes
        }
    } catch {
        // Pertahankan session, jangan hapus cookie pada transient network error
    }

    return supabaseResponse
}
