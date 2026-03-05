/**
 * /api/github/disconnect — Removes the GitHub connection for the current user.
 * Clears all github_* fields and deletes the linked repository record.
 */
import { auth } from "@/lib/auth/config";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Repository from "@/models/Repository";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        await Promise.all([
            User.findOneAndUpdate(
                { email: session.user.email },
                {
                    $unset: { github_id: "", github_username: "", github_access_token: "" },
                    $set: { github_connected: false },
                }
            ),
            Repository.deleteOne({ user_email: session.user.email }),
        ]);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[GitHub Disconnect]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
