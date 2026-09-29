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

    let response = NextResponse.next({ request })
    staleCookies.forEach(c => {
        request.cookies.delete(c.name)
        response.cookies.set(c.name, '', { path: '/', maxAge: 0 })
    })

    // Jika halaman protected dan tidak ada cookie auth sama sekali -> redirect ke login (0ms, tanpa network call)
    if (isProtected && !hasCurrentAuthCookie) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectResponse = NextResponse.redirect(url)
        staleCookies.forEach(c => {
            redirectResponse.cookies.set(c.name, '', { path: '/', maxAge: 0 })
        })
        return redirectResponse
    }

    // Jika ada cookie auth aktif, langsung lewatkan ke Server Component tanpa menahan delay network 2 detik!
    // Server layout (app/(dashboard)/layout.tsx) memvalidasi keaslian session secara langsung.
    return response
}
