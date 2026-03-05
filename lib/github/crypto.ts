/**
 * crypto.ts — AES-256-GCM encrypt/decrypt for GitHub access tokens.
 * Uses Node.js built-in `crypto` — no extra dependency required.
 *
 * GITHUB_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).
 * Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // bytes (96 bits — recommended for GCM)
const AUTH_TAG_LENGTH = 16; // bytes

function getKey(): Buffer {
    const hex = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
    if (!hex || hex.length !== 64) {
        throw new Error(
            "GITHUB_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
                "Generate one: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
        );
    }
    return Buffer.from(hex, "hex");
}

/**
 * Encrypt a plaintext token.
 * Returns a single base64 string: iv (12 B) + authTag (16 B) + ciphertext
 */
export function encryptToken(plaintext: string): string {
    const key = getKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Layout: [iv (12)] [authTag (16)] [ciphertext]
    const combined = Buffer.concat([iv, authTag, encrypted]);
    return combined.toString("base64");
}

/**
 * Decrypt a token that was encrypted with `encryptToken`.
 * Returns the original plaintext string.
 */
export function decryptToken(encryptedBase64: string): string {
    const key = getKey();
    const combined = Buffer.from(encryptedBase64, "base64");

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
}
