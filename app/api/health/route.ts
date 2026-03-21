import { NextResponse } from "next/server";

/**
 * Health-check endpoint.
 * Used by Nginx upstream health checks and container orchestration tools.
 * GET /api/health → { status: "ok", timestamp: "..." }
 */
export async function GET() {
    return NextResponse.json(
        { status: "ok", timestamp: new Date().toISOString() },
        { status: 200 }
    );
}
