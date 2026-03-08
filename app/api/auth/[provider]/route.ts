import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";

const APP_URL =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/**
 * GET /api/auth/[provider]
 * Initiates OAuth login for "google" or "github".
 * Redirects the browser to the provider's consent screen.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params;

    if (provider === "google") {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 });
        }

        const url = new URL(GOOGLE_AUTH_URL);
        url.searchParams.set("client_id", clientId);
        url.searchParams.set("redirect_uri", `${APP_URL}/api/auth/callback/google`);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("scope", "openid email profile");
        url.searchParams.set("access_type", "offline");
        url.searchParams.set("prompt", "consent");

        return NextResponse.redirect(url.toString());
    }

    if (provider === "github") {
        const clientId = process.env.GITHUB_LOGIN_CLIENT_ID;
        if (!clientId) {
            return NextResponse.json({ error: "GitHub OAuth not configured" }, { status: 500 });
        }

        const url = new URL(GITHUB_AUTH_URL);
        url.searchParams.set("client_id", clientId);
        url.searchParams.set("redirect_uri", `${APP_URL}/api/auth/callback/github`);
        url.searchParams.set("scope", "user:email read:user");

        return NextResponse.redirect(url.toString());
    }

    return NextResponse.json({ error: "Unknown OAuth provider" }, { status: 400 });
}
