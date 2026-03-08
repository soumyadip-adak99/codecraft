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
 * GET /api/auth/callback/google
 * Handles the OAuth authorization code exchange with Google.
 */
export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");
    const error = req.nextUrl.searchParams.get("error");

    if (error || !code) {
        return NextResponse.redirect(`${APP_URL}/login?error=OAuthError`);
    }

    try {
        // 1. Exchange code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${APP_URL}/api/auth/callback/google`,
                grant_type: "authorization_code",
            }).toString(),
        });

        if (!tokenRes.ok) {
            console.error("[Google OAuth] Token exchange failed:", await tokenRes.text());
            return NextResponse.redirect(`${APP_URL}/login?error=TokenExchangeFailed`);
        }

        const { access_token } = await tokenRes.json();

        // 2. Fetch user profile
        const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!profileRes.ok) {
            return NextResponse.redirect(`${APP_URL}/login?error=ProfileFetchFailed`);
        }

        const profile = await profileRes.json();
        const { email, name, picture: image, id: googleId } = profile;

        if (!email) {
            return NextResponse.redirect(`${APP_URL}/login?error=NoEmail`);
        }

        // 3. Upsert user in MongoDB
        await connectDB();
        const result = await User.findOneAndUpdate(
            { email },
            {
                $set: { image, auth_provider: "google" },
                $setOnInsert: { email },
            },
            { upsert: true, new: true, includeResultMetadata: true }
        );

        const isNewUser = result?.lastErrorObject?.updatedExisting === false;
        const dbUser = result.value;

        if (isNewUser) {
            // Increment platform stats
            const convex = getConvexClient();
            await convex.mutation(api.platformStats.increment, { totalDevelopers: 1 });

            // Fire welcome email asynchronously
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
            image: image ?? null,
        });

        const cookieOptions = buildCookieOptions();
        const response = NextResponse.redirect(`${APP_URL}/dashboard`);
        response.cookies.set(cookieOptions.name, token, cookieOptions);

        return response;
    } catch (err) {
        console.error("[Google OAuth Callback] Error:", err);
        return NextResponse.redirect(`${APP_URL}/login?error=InternalError`);
    }
}
