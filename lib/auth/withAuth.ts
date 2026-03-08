import { NextRequest, NextResponse } from "next/server";
import { getSession, Session } from "./session";

interface AuthResult {
    session: Session;
}

/**
 * requireAuth — Drop-in replacement for the NextAuth `auth()` + null-check pattern.
 *
 * Usage in any API Route:
 *   const { session } = await requireAuth(req);
 *   // session.user.email is guaranteed to be a non-empty string here
 *
 * Throws a NextResponse with 401 if the request is unauthenticated.
 * `req` is optional: if omitted, falls back to `next/headers` cookies (works in Server Actions / GET handlers).
 */
export async function requireAuth(req?: NextRequest): Promise<AuthResult> {
    const session = await getSession(req);

    if (!session?.user?.email) {
        throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return { session };
}
