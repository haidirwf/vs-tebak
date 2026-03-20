import { NextRequest } from 'next/server'

type RateLimitEntry = {
    count: number
    resetAt: number
}

type RateLimitResult = {
    ok: boolean
    limit: number
    remaining: number
    retryAfterMs: number
}

type RateLimitConfig = {
    key: string
    limit: number
    windowMs: number
}

const STORE_KEY = '__skillungo_rate_limit_store__'

function getStore(): Map<string, RateLimitEntry> {
    const g = globalThis as typeof globalThis & {
        [STORE_KEY]?: Map<string, RateLimitEntry>
    }
    if (!g[STORE_KEY]) {
        g[STORE_KEY] = new Map<string, RateLimitEntry>()
    }
    return g[STORE_KEY]
}

export function getRateLimitIdentifier(request: NextRequest, userId?: string | null): string {
    if (userId) return `user:${userId}`
    const forwarded = request.headers.get('x-forwarded-for')
    const firstIp = forwarded?.split(',')[0]?.trim()
    const realIp = request.headers.get('x-real-ip')?.trim()
    return `ip:${firstIp || realIp || 'unknown'}`
}

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const store = getStore()

    for (const [k, entry] of store.entries()) {
        if (entry.resetAt <= now) store.delete(k)
    }

    const existing = store.get(config.key)
    if (!existing || existing.resetAt <= now) {
        store.set(config.key, { count: 1, resetAt: now + config.windowMs })
        return { ok: true, limit: config.limit, remaining: Math.max(config.limit - 1, 0), retryAfterMs: config.windowMs }
    }

    if (existing.count >= config.limit) {
        return { ok: false, limit: config.limit, remaining: 0, retryAfterMs: Math.max(existing.resetAt - now, 0) }
    }

    existing.count += 1
    store.set(config.key, existing)
    return {
        ok: true,
        limit: config.limit,
        remaining: Math.max(config.limit - existing.count, 0),
        retryAfterMs: Math.max(existing.resetAt - now, 0),
    }
}

