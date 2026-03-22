/**
 * mongoose.ts — MongoDB connection via Mongoose (with DNS patch)
 *
 * Root cause of `querySrv ECONNREFUSED`:
 *  - `mongodb+srv://` uses DNS SRV records for host discovery.
 *  - Windows ISP/local DNS resolvers often block SRV record queries.
 *  - Solution: force Node.js to use Google's DNS (8.8.8.8) which
 *    supports SRV before any connection attempt.
 */

// ── MUST be the very first thing — patch DNS before Mongoose loads ──
import { setServers } from "dns";
setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: {
        conn: typeof import("mongoose") | null;
        promise: Promise<typeof import("mongoose")> | null;
    };
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 15000,
            maxPoolSize: 10,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;