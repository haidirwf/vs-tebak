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

    // Protected routes — redirect to login if not authenticated
    const protectedPaths = ['/dashboard', '/modules', '/battle', '/leaderboard', '/profile', '/voucher']
    const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))
    const authPaths = ['/login', '/register']
    const isAuthPage = authPaths.some(p => request.nextUrl.pathname.startsWith(p))

    // Only check auth where it matters to avoid noisy refresh errors on public pages.
    if (!isProtected && !isAuthPage) {
        return supabaseResponse
    }

    // Ekstrak project ref Supabase saat ini agar tidak terkecoh cookie lama dari database/project lain
    let currentProjectRef = ''
    try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            currentProjectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]
        }
    } catch {
        currentProjectRef = ''
    }

    const allCookies = request.cookies.getAll()
    const session = extractAuthSessionFromCookies(allCookies, currentProjectRef)

    // Deteksi cookie usang dari Supabase project sebelumnya untuk dibersihkan
    const staleCookies = allCookies.filter(cookie =>
        currentProjectRef &&
        cookie.name.startsWith('sb-') &&
        cookie.name.includes('auth-token') &&
        !cookie.name.startsWith(`sb-${currentProjectRef}`)
    )

    const response = NextResponse.next({ request })
    staleCookies.forEach(c => {
        request.cookies.delete(c.name)
        response.cookies.set(c.name, '', { path: '/', maxAge: 0 })
    })

    // Jika halaman protected dan tidak ada cookie auth sama sekali -> redirect ke login (0ms, tanpa network call)
    if (isProtected && !session?.access_token) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectResponse = NextResponse.redirect(url)
        staleCookies.forEach(c => {
            redirectResponse.cookies.set(c.name, '', { path: '/', maxAge: 0 })
        })
        return redirectResponse
    }

    // Fast-path: Jika token JWT masih valid (> 2 menit tersisa), langsung lewatkan ke Server Component (0ms)!
    // Tidak perlu memblokir request dengan HTTPS roundtrip ke Supabase Auth di setiap navigasi.
    if (session && !isSessionExpiringSoon(session, 120)) {
        return response
    }

    // Jika token sudah mendekati kedaluwarsa (< 2 menit) atau sudah expired, lakukan refresh di middleware.
    // Middleware adalah satu-satunya fase di SSR Next.js yang berhak menulis cookie baru ke browser.
    // Dilengkapi timeout ketat 2.5s agar tidak membeku jika cloud lambat.
    try {
        const getUserPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise<{ data: { user: null }; error: { message: string; code: string } }>((resolve) =>
            setTimeout(() => resolve({ data: { user: null }, error: { message: 'timeout', code: 'TIMEOUT' } }), 2500)
        )

        const { data, error } = await Promise.race([getUserPromise, timeoutPromise])

        if (error || !data?.user) {
            // Jika token refresh gagal atau session tidak valid di server:
            // Bersihkan cookie auth yang rusak agar tidak menyebabkan loop slow-retry di Server Component
            if (isProtected) {
                allCookies
                    .filter(c => c.name.includes('auth-token'))
                    .forEach(c => {
                        request.cookies.delete(c.name)
                        response.cookies.set(c.name, '', { path: '/', maxAge: 0 })
                    })
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                const redirectRes = NextResponse.redirect(url)
                response.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c))
                return redirectRes
            }
        } else {
            // Berhasil di-refresh: kembalikan supabaseResponse yang memuat header cookie baru
            return supabaseResponse
        }
    } catch {
        // Fallback jika terjadi error jaringan tak terduga
    }

    return response
}
