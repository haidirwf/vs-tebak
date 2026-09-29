import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
    const hasCurrentAuthCookie = allCookies.some(cookie =>
        currentProjectRef
            ? cookie.name.startsWith(`sb-${currentProjectRef}`) && cookie.name.includes('auth-token') && cookie.value.length > 20
            : cookie.name.startsWith('sb-') && cookie.name.includes('auth-token') && cookie.value.length > 20
    )

    // Deteksi cookie usang dari Supabase project sebelumnya untuk dibersihkan
    const staleCookies = allCookies.filter(cookie =>
        currentProjectRef &&
        cookie.name.startsWith('sb-') &&
        cookie.name.includes('auth-token') &&
        !cookie.name.startsWith(`sb-${currentProjectRef}`)
    )

    staleCookies.forEach(c => {
        request.cookies.delete(c.name)
        supabaseResponse.cookies.set(c.name, '', { path: '/', maxAge: 0 })
    })

    if (isProtected && !hasCurrentAuthCookie) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(c => {
            redirectResponse.cookies.set(c.name, c.value, c)
        })
        return redirectResponse
    }

    let user = null

    try {
        // Beri timeout 2s agar tidak membeku jika cloud Supabase lambat
        const getUserPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise<{ data: { user: null }; error: { message: string; code: string } }>((resolve) =>
            setTimeout(() => resolve({ data: { user: null }, error: { message: 'timeout', code: 'TIMEOUT' } }), 2000)
        )

        const { data, error } = await Promise.race([getUserPromise, timeoutPromise])

        if (error?.code === 'refresh_token_not_found') {
            allCookies
                .filter(c => c.name.startsWith('sb-') && c.name.includes('auth-token'))
                .forEach(c => {
                    request.cookies.delete(c.name)
                    supabaseResponse.cookies.set(c.name, '', { path: '/', maxAge: 0 })
                })
        } else if (data?.user) {
            user = data.user
        }
    } catch {
        // Fallback: jika terjadi error jaringan, biarkan request berlanjut
    }

    // Jika halaman protected dan dipastikan tidak ada user
    if (isProtected && !user && !hasCurrentAuthCookie) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(c => {
            redirectResponse.cookies.set(c.name, c.value, c)
        })
        return redirectResponse
    }

    // PENTING: Jangan me-redirect /login atau /register ke /dashboard di middleware!
    // Memaksa redirect dari /login ke /dashboard di middleware adalah penyebab utama redirect loop.
    // Biarkan user membuka /login dan /register dengan normal.

    return supabaseResponse
}
