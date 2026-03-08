/**
 * DELETE /api/user/delete
 * Permanently deletes the authenticated user's account:
 *   1. Removes the User document from MongoDB
 *   2. Removes the linked Repository document from MongoDB
 *   3. Removes user stats from Convex userStatus table
 *   4. Decrements the platform totalDevelopers counter in Convex
 * The client then navigates to /api/auth/logout to clear the cookie.
 */
import { requireAuth } from "@/lib/auth/withAuth";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Repository from "@/models/Repository";
import { getConvexClient } from "@/lib/db/convex";
import { api } from "../../../../convex/_generated/api";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
    try {
        const { session } = await requireAuth(req);

        const email = session.user.email;

        await connectDB();

        // ── 1. Delete user + repo from MongoDB in parallel ─────────────────────
        await Promise.all([
            User.deleteOne({ email }),
            Repository.deleteOne({ user_email: email }),
        ]);

        // ── 2. Remove userStatus from Convex (solve stats) ─────────────────────
        // ── 3. Decrement platform developer count ──────────────────────────────
        const convex = getConvexClient();
        await Promise.all([
            convex.mutation(api.userStatus.deleteByEmail, { email }),
            convex.mutation(api.platformStats.decrement, { totalDevelopers: 1 }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof NextResponse) return error;
        console.error("[Delete Account]", error);
        return NextResponse.json(
            { error: "Failed to delete account. Please try again." },
            { status: 500 }
        );
    }
}
