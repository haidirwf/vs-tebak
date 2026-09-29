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

    // Fast-path cookie presence check
    const hasAuthCookie = request.cookies
        .getAll()
        .some(cookie => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token') && cookie.value.length > 20)

    if (isProtected && !hasAuthCookie) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    let user = null
    let staleAuthCookieNames: string[] = []

    try {
        // Beri timeout 2.5s agar tidak membeku 10 detik jika cloud Supabase lambat
        const getUserPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise<{ data: { user: null }; error: { message: string; code: string } }>((resolve) =>
            setTimeout(() => resolve({ data: { user: null }, error: { message: 'timeout', code: 'TIMEOUT' } }), 2500)
        )

        const { data, error } = await Promise.race([getUserPromise, timeoutPromise])

        if (error?.code === 'refresh_token_not_found') {
            staleAuthCookieNames = request.cookies
                .getAll()
                .filter(cookie => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token'))
                .map(cookie => cookie.name)
            staleAuthCookieNames.forEach(cookieName => {
                request.cookies.delete(cookieName)
                supabaseResponse.cookies.set(cookieName, '', { path: '/', maxAge: 0 })
            })
        } else if (data?.user) {
            user = data.user
        }
    } catch {
        // Fallback: jika timeout/error tapi auth cookie ada, biarkan lewat agar client-side yang handle
    }

    // Jika pasti tidak ada user dan tidak ada cookie auth
    if (isProtected && !user && !hasAuthCookie) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectResponse = NextResponse.redirect(url)
        staleAuthCookieNames.forEach(cookieName => {
            redirectResponse.cookies.set(cookieName, '', { path: '/', maxAge: 0 })
        })
        return redirectResponse
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && (user || hasAuthCookie)) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
