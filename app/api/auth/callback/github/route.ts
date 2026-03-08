import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { getConvexClient } from "@/lib/db/convex";
import { api } from "../../../../../convex/_generated/api";
import { EmailService } from "@/lib/email/service";
import { signJwt } from "@/lib/auth/jwt";
import { buildCookieOptions } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const APP_URL =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/**
 * GET /api/auth/callback/github
 * Handles the OAuth authorization code exchange with GitHub.
 */
export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");
    const error = req.nextUrl.searchParams.get("error");

    if (error || !code) {
        return NextResponse.redirect(`${APP_URL}/login?error=OAuthError`);
    }

    try {
        // 1. Exchange code for access token
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_LOGIN_CLIENT_ID,
                client_secret: process.env.GITHUB_LOGIN_CLIENT_SECRET,
                code,
                redirect_uri: `${APP_URL}/api/auth/callback/github`,
            }),
        });

        if (!tokenRes.ok) {
            console.error("[GitHub OAuth] Token exchange failed:", await tokenRes.text());
            return NextResponse.redirect(`${APP_URL}/login?error=TokenExchangeFailed`);
        }

        const tokenData = await tokenRes.json();
        const { access_token } = tokenData;

        if (!access_token) {
            return NextResponse.redirect(`${APP_URL}/login?error=TokenExchangeFailed`);
        }

        // 2. Fetch user profile
        const profileRes = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: "application/vnd.github+json",
            },
        });

        if (!profileRes.ok) {
            return NextResponse.redirect(`${APP_URL}/login?error=ProfileFetchFailed`);
        }

        const profile = await profileRes.json();
        let email: string | null = profile.email;

        // GitHub may not expose the email in the main profile — fetch it separately
        if (!email) {
            const emailRes = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    Accept: "application/vnd.github+json",
                },
            });
            if (emailRes.ok) {
                const emails: { email: string; primary: boolean; verified: boolean }[] =
                    await emailRes.json();
                const primary = emails.find((e) => e.primary && e.verified);
                email = primary?.email ?? emails[0]?.email ?? null;
            }
        }

        if (!email) {
            return NextResponse.redirect(`${APP_URL}/login?error=NoEmail`);
        }

        const name: string = profile.name || profile.login;
        const image: string | null = profile.avatar_url ?? null;

        // 3. Upsert user in MongoDB
        await connectDB();
        const result = await User.findOneAndUpdate(
            { email },
            {
                $set: { image, auth_provider: "github" },
                $setOnInsert: { email },
            },
            { upsert: true, new: true, includeResultMetadata: true }
        );

        const isNewUser = result?.lastErrorObject?.updatedExisting === false;
        const dbUser = result.value;

        if (isNewUser) {
            const convex = getConvexClient();
            await convex.mutation(api.platformStats.increment, { totalDevelopers: 1 });

            const firstName = name?.split(" ")[0] ?? email.split("@")[0] ?? "Coder";
            new EmailService()
                .sendWelcomeEmail(email, firstName)
                .catch((err) => console.error("[Welcome Email] Failed to send:", err));
        }

        // 4. Sign JWT and set HTTP-only cookie
        const token = await signJwt({
            id: dbUser._id.toString(),
            email,
            name: name ?? null,
            image,
        });

        const cookieOptions = buildCookieOptions();
        const response = NextResponse.redirect(`${APP_URL}/dashboard`);
        response.cookies.set(cookieOptions.name, token, cookieOptions);

        return response;
    } catch (err) {
        console.error("[GitHub OAuth Callback] Error:", err);
        return NextResponse.redirect(`${APP_URL}/login?error=InternalError`);
    }
}
