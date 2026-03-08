/**
 * /api/github/connect — Initiates GitHub OAuth authorization flow.
 * Redirects the authenticated user to GitHub with required scopes.
 */
import { requireAuth } from "@/lib/auth/withAuth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const { session } = await requireAuth(req);

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json(
            { error: "GitHub OAuth is not configured on this server." },
            { status: 500 }
        );
    }

    const baseUrl =
        process.env.APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const params = new URLSearchParams({
        client_id:    clientId,
        redirect_uri: `${baseUrl}/api/github/callback`,
        scope:        "repo read:user user:email",
        state:        session.user.email, // used to associate callback with the user
    });

    return NextResponse.redirect(
        `https://github.com/login/oauth/authorize?${params.toString()}`
    );
}
