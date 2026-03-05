/**
 * /api/github/repos — Fetch the verified user's linked GitHub repositories.
 *
 * GET: Returns a list of the user's GitHub repositories.
 */
import { auth } from "@/lib/auth/config";
import { decryptToken } from "@/lib/github/crypto";
import { getUserRepos } from "@/lib/github/client";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        
        const dbUser = await User.findOne({ email: session.user.email })
            .select("github_access_token github_connected")
            .lean();

        if (!(dbUser as any)?.github_connected || !(dbUser as any)?.github_access_token) {
             return NextResponse.json(
                { error: "GitHub account is not connected." },
                { status: 400 }
            );
        }

        const token = decryptToken((dbUser as any).github_access_token);
        const repos = await getUserRepos(token);

        return NextResponse.json({ repositories: repos });
    } catch (err) {
        console.error("[GitHub Repos GET]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
