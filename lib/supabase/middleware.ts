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
    const protectedPaths = ['/dashboard', '/modules', '/battle', '/leaderboard', '/profile']
    const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))
    const authPaths = ['/login', '/register']
    const isAuthPage = authPaths.some(p => request.nextUrl.pathname.startsWith(p))

    // Only check auth where it matters to avoid noisy refresh errors on public pages.
    if (!isProtected && !isAuthPage) {
        return supabaseResponse
    }

    let user = null
    let staleAuthCookieNames: string[] = []
    const { data, error } = await supabase.auth.getUser()
    if (error?.code === 'refresh_token_not_found') {
        // Remove stale auth cookies so next request starts with a clean session.
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

    if (isProtected && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectResponse = NextResponse.redirect(url)
        staleAuthCookieNames.forEach(cookieName => {
            redirectResponse.cookies.set(cookieName, '', { path: '/', maxAge: 0 })
        })
        return redirectResponse
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
