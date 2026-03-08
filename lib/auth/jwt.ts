import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface JWTUserPayload extends JWTPayload {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * Signs a JWT token with the user payload.
 * Default expiry: 30 days.
 */
export async function signJwt(
    payload: JWTUserPayload,
    expiresIn: string = "30d"
): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secret);
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * Returns null if the token is invalid or expired.
 */
export async function verifyJwt(token: string): Promise<JWTUserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as JWTUserPayload;
    } catch {
        return null;
    }
}
