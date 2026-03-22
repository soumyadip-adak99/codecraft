/**
 * dns-patch.ts
 * ─────────────────────────────────────────────────────────────
 * Forces Node.js to use Google's public DNS (8.8.8.8, 8.8.4.4)
 * for ALL DNS lookups — including the SRV records that
 * MongoDB Atlas needs for `mongodb+srv://` connection strings.
 *
 * Why this is needed:
 *  - `mongodb+srv://` URIs resolve via querySrv (SRV DNS records).
 *  - Windows ISP / corporate DNS servers often block or can't
 *    resolve SRV records, causing: `querySrv ECONNREFUSED`.
 *  - Switching to Google's DNS (which supports SRV) fixes this.
 *
 * Import this file ONCE at the very top of any file that calls
 * connectDB() or creates a MongoClient.
 */
import dns from "dns";

dns.setServers([
    "8.8.8.8",       // Google Primary
    "8.8.4.4",       // Google Secondary
    "1.1.1.1",       // Cloudflare fallback
]);
