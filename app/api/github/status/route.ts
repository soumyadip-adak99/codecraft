/**
 * /api/github/status — Returns GitHub connection status for the current user.
 * NEVER returns the access token to the client.
 */
import { auth } from "@/lib/auth/config";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Repository from "@/models/Repository";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const [dbUser, dbRepo] = await Promise.all([
            User.findOne({ email: session.user.email })
                .select("github_connected github_username")
                .lean(),
            Repository.findOne({ user_email: session.user.email })
                .select("repo_name repo_url repo_owner full_name is_private")
                .lean(),
        ]);

        const connected = !!(dbUser as any)?.github_connected;

        return NextResponse.json({
            connected,
            username:  connected ? (dbUser as any)?.github_username ?? null : null,
            repository: dbRepo
                ? {
                      name:      (dbRepo as any).repo_name,
                      url:       (dbRepo as any).repo_url,
                      owner:     (dbRepo as any).repo_owner,
                      full_name: (dbRepo as any).full_name,
                      is_private:(dbRepo as any).is_private,
                  }
                : null,
        });
    } catch (err) {
        console.error("[GitHub Status]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
