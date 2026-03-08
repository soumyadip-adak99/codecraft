/**
 * /api/github/callback — Handles GitHub OAuth callback.
 * Exchanges the code for an access token, fetches GitHub user info,
 * encrypts the token, and upserts GitHub data into MongoDB.
 */
import { encryptToken } from "@/lib/github/crypto";
import { getGitHubUser } from "@/lib/github/client";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code  = searchParams.get("code");
    const state = searchParams.get("state"); // user email passed as state

    const baseUrl =
        process.env.NEXTAUTH_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    if (!code || !state) {
        return NextResponse.redirect(`${baseUrl}/settings?github=error&reason=missing_params`);
    }

    const clientId     = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${baseUrl}/settings?github=error&reason=not_configured`);
    }

    try {
        // ── Exchange code for access token ────────────────────────────────────
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id:     clientId,
                client_secret: clientSecret,
                code,
            }),
            cache: "no-store",
        });

        const tokenData = await tokenRes.json();

        if (tokenData.error || !tokenData.access_token) {
            console.error("[GitHub Callback] Token exchange failed:", tokenData);
            return NextResponse.redirect(
                `${baseUrl}/settings?github=error&reason=token_exchange`
            );
        }

        const accessToken: string = tokenData.access_token;

        // ── Fetch GitHub user info ─────────────────────────────────────────────
        const githubUser = await getGitHubUser(accessToken);

        // ── Encrypt token and store in MongoDB ───────────────────────────────
        const encryptedToken = encryptToken(accessToken);

        await connectDB();
        await User.findOneAndUpdate(
            { email: state }, // state = user's email
            {
                $set: {
                    github_id:           String(githubUser.id),
                    github_username:     githubUser.login,
                    github_access_token: encryptedToken,
                    github_connected:    true,
                },
            },
            { new: true }
        );

        return NextResponse.redirect(`${baseUrl}/settings?github=connected`);
    } catch (err) {
        console.error("[GitHub Callback] Error:", err);
        return NextResponse.redirect(
            `${baseUrl}/settings?github=error&reason=server_error`
        );
    }
}
