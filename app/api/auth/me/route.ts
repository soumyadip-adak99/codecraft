import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 * Returns the current user's session data, read from the JWT cookie.
 * Used by the client-side AuthProvider to hydrate the auth context.
 */
export async function GET(req: NextRequest) {
    const session = await getSession(req);

    if (!session?.user?.email) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    // Check hasApiKey from MongoDB (same as the old NextAuth session callback)
    try {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email })
            .select("llmApiKey")
            .lean();

        return NextResponse.json({
            user: {
                ...session.user,
                hasApiKey: !!(dbUser as any)?.llmApiKey,
            },
        });
    } catch {
        // Even if MongoDB check fails, return user without hasApiKey
        return NextResponse.json({ user: session.user });
    }
}
