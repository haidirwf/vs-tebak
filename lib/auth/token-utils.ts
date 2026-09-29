// lib/auth/token-utils.ts — High-speed auth token & cookie session utilities
import { User } from '@supabase/supabase-js'

export interface ParsedAuthSession {
    access_token?: string
    refresh_token?: string
    expires_at?: number
    user?: User
}

/**
 * Extracts and combines Supabase auth session cookie chunks from cookies array.
 * Works seamlessly with both single (`sb-<ref>-auth-token`) and chunked
 * (`sb-<ref>-auth-token.0`, `.1`) cookies as well as base64url/URL-encoded payloads.
 */
export function extractAuthSessionFromCookies(
    cookiesList: { name: string; value: string }[],
    projectRef?: string
): ParsedAuthSession | null {
    try {
        let currentProjectRef = projectRef || ''
        if (!currentProjectRef && process.env.NEXT_PUBLIC_SUPABASE_URL) {
            try {
                currentProjectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]
            } catch {
                currentProjectRef = ''
            }
        }

        const authCookies = cookiesList.filter(c => {
            if (!c.name.includes('auth-token')) return false
            if (currentProjectRef) return c.name.startsWith(`sb-${currentProjectRef}`)
            return c.name.startsWith('sb-')
        })

        if (!authCookies.length) return null

        let rawCombined = ''
        const single = authCookies.find(c => !c.name.match(/\.\d+$/))
        if (single) {
            rawCombined = single.value
        } else {
            authCookies.sort((a, b) => {
                const numA = parseInt(a.name.split('.').pop() || '0', 10)
                const numB = parseInt(b.name.split('.').pop() || '0', 10)
                return numA - numB
            })
            rawCombined = authCookies.map(c => c.value).join('')
        }

        if (!rawCombined || rawCombined.length < 20) return null

        let jsonStr = rawCombined
        if (jsonStr.startsWith('base64-')) {
            jsonStr = Buffer.from(jsonStr.slice(7), 'base64url').toString('utf8')
        } else if (jsonStr.startsWith('%7B') || jsonStr.startsWith('{')) {
            jsonStr = decodeURIComponent(jsonStr)
        }

        const parsed = JSON.parse(jsonStr)
        return parsed as ParsedAuthSession
    } catch {
        return null
    }
}

/**
 * Reads JWT expiry timestamp (in seconds) without full signature validation.
 */
export function getJwtExpiry(token: string): number | null {
    try {
        const parts = token.split('.')
        if (parts.length < 2) return null
        const payloadStr = Buffer.from(parts[1], 'base64url').toString('utf8')
        const payload = JSON.parse(payloadStr)
        return typeof payload.exp === 'number' ? payload.exp : null
    } catch {
        return null
    }
}

/**
 * Returns true if the session is expired or will expire within thresholdSeconds.
 */
export function isSessionExpiringSoon(
    session: ParsedAuthSession | null,
    thresholdSeconds: number = 60
): boolean {
    if (!session?.access_token) return true
    const nowSec = Math.floor(Date.now() / 1000)
    const exp = session.expires_at || getJwtExpiry(session.access_token)
    if (!exp) return false
    return (exp - nowSec) < thresholdSeconds
}
