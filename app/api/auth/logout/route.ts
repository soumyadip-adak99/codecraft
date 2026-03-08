import { NextResponse } from "next/server";
import { JWT_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/logout
 * Clears the JWT cookie and redirects the user to the home page.
 */
export async function GET() {
    const APP_URL =
        process.env.APP_URL ||
        process.env.NEXTAUTH_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const response = NextResponse.redirect(`${APP_URL}/`);

    // Clear the JWT cookie by setting maxAge to 0
    response.cookies.set(JWT_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });

    return response;
}
