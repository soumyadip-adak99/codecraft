import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyJwt, type JWTUserPayload } from "./jwt";

export const JWT_COOKIE_NAME = "cc_token";

export interface SessionUser {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    hasApiKey?: boolean;
}

export interface Session {
    user: SessionUser;
}

/**
 * Reads the JWT cookie and returns the decoded session.
 * Returns null if the cookie is absent or the token is invalid.
 *
 * Works in both Server Components (no arg) and API Route Handlers (pass the Request).
 */
export async function getSession(req?: NextRequest): Promise<Session | null> {
    let token: string | undefined;

    if (req) {
        // API Route Handler: read from the incoming request
        token = req.cookies.get(JWT_COOKIE_NAME)?.value;
    } else {
        // Server Component: use next/headers
        const cookieStore = await cookies();
        token = cookieStore.get(JWT_COOKIE_NAME)?.value;
    }

    if (!token) return null;

    const payload = await verifyJwt(token);
    if (!payload) return null;

    return {
        user: {
            id: payload.id,
            email: payload.email,
            name: payload.name ?? null,
            image: payload.image ?? null,
        },
    };
}

/**
 * Build the cookie options for setting the JWT token.
 */
export function buildCookieOptions(maxAge: number = 30 * 24 * 60 * 60) {
    return {
        name: JWT_COOKIE_NAME,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge,
        path: "/",
    };
}
