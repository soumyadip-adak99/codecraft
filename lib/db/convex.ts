import { ConvexHttpClient } from "convex/browser";

/**
 * Server-side Convex HTTP client.
 * Used in API routes to call Convex mutations (e.g. increment counters, record attempts).
 */
let _client: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
    if (!_client) {
        const url = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!url) {
            throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
        }
        _client = new ConvexHttpClient(url);
    }
    return _client;
}
