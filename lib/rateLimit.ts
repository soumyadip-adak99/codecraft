/**
 * In-memory sliding window rate limiter.
 * Works per-IP (or any string key). Suitable for single-instance deployments.
 * For multi-instance deployments behind a load balancer, swap the Map for a
 * Redis-backed store (e.g. Upstash ratelimit).
 */

interface RateLimitEntry {
    timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
    /** Maximum number of requests allowed within the window */
    maxRequests: number;
    /** Window duration in milliseconds */
    windowMs: number;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number; // ms until the oldest request falls outside the window
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    const { maxRequests, windowMs } = opts;

    if (!store.has(key)) {
        store.set(key, { timestamps: [] });
    }

    const entry = store.get(key)!;

    // Drop timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= maxRequests) {
        const oldest = entry.timestamps[0];
        const resetIn = windowMs - (now - oldest);
        return { success: false, remaining: 0, resetIn };
    }

    entry.timestamps.push(now);
    return {
        success: true,
        remaining: maxRequests - entry.timestamps.length,
        resetIn: 0,
    };
}

/**
 * Extract the client IP from a Next.js request.
 * Works with Vercel, Nginx (x-real-ip), and local dev.
 */
export function getClientIp(req: Request): string {
    const headers = (req as any).headers;
    return (
        headers.get?.("x-real-ip") ||
        headers.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
        "127.0.0.1"
    );
}
