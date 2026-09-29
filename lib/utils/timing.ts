// lib/utils/timing.ts — High precision server & client execution profiler
export async function measureAsync<T>(
    label: string,
    fn: () => Promise<T>,
    thresholdMs: number = 100
): Promise<T> {
    const start = performance.now()
    try {
        const result = await fn()
        const duration = Math.round(performance.now() - start)
        if (process.env.NODE_ENV !== 'production') {
            if (duration >= thresholdMs) {
                console.warn(`⏱️ [PERF SLOW] ${label}: ${duration}ms (exceeds ${thresholdMs}ms threshold)`)
            } else {
                console.log(`⏱️ [PERF FAST] ${label}: ${duration}ms`)
            }
        }
        return result
    } catch (error) {
        const duration = Math.round(performance.now() - start)
        console.error(`⏱️ [PERF ERROR] ${label}: ${duration}ms —`, error)
        throw error
    }
}
