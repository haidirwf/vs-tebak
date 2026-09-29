import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            isSingleton: true,
            auth: {
                lock: async (_name, _acquireTimeout, fn) => {
                    return await fn()
                },
            },
        }
    )
}
