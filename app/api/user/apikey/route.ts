import { auth } from "@/lib/auth/config";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { encryptApiKey } from "@/lib/crypto/apiKeyCrypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/apikey
 * Returns whether the user has a saved API key and which provider it's for.
 * Never returns the key value itself.
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email })
            .select("llmApiKey preferredModel")
            .lean();

        const hasKey = !!(dbUser as any)?.llmApiKey;
        const provider = hasKey ? ((dbUser as any)?.preferredModel ?? "groq") : null;

        return NextResponse.json({ hasKey, provider });
    } catch (error) {
        console.error("API key fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch API key status" }, { status: 500 });
    }
}

/**
 * POST /api/user/apikey
 * Encrypts the API key with AES-256-GCM before storing in MongoDB.
 * Plaintext keys are NEVER written to the database.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { apiKey, provider } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ error: "API key is required" }, { status: 400 });
        }

        // Encrypt the key before storing — never store plaintext LLM keys
        const encryptedKey = encryptApiKey(apiKey.trim());

        await connectDB();
        await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: { llmApiKey: encryptedKey, preferredModel: provider || "groq" } }
        );

        return NextResponse.json({ success: true, message: "API key saved successfully" });
    } catch (error) {
        console.error("API key save error:", error);
        return NextResponse.json({ error: "Failed to save API key" }, { status: 500 });
    }
}

/**
 * DELETE /api/user/apikey
 * Removes the stored API key from MongoDB.
 */
export async function DELETE() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        await User.findOneAndUpdate(
            { email: session.user.email },
            { $unset: { llmApiKey: "", preferredModel: "" } }
        );

        return NextResponse.json({ success: true, message: "API key removed" });
    } catch (error) {
        console.error("API key delete error:", error);
        return NextResponse.json({ error: "Failed to remove API key" }, { status: 500 });
    }
}
