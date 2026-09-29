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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). Calling getUser() refreshes the auth token
    // if expired and writes the new cookies to supabaseResponse via setAll.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    const protectedPaths = [
        '/dashboard',
        '/modules',
        '/battle',
        '/leaderboard',
        '/profile',
        '/voucher',
        '/character',
    ]
    const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
    const authPaths = ['/login', '/register']
    const isAuthPage = authPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))

    // 1. Jika rute terlindungi dan user tidak login -> redirect ke /login
    if (isProtected && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectRes = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((c) => {
            redirectRes.cookies.set(c.name, c.value, c)
        })
        return redirectRes
    }

    // 2. Jika user sudah login dan mengakses /login atau /register -> redirect ke /dashboard
    if (isAuthPage && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        const redirectRes = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((c) => {
            redirectRes.cookies.set(c.name, c.value, c)
        })
        return redirectRes
    }

    // 3. Selalu kembalikan supabaseResponse yang memuat header cookie tersinkronisasi
    return supabaseResponse
}
