import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";

export const dynamic = "force-dynamic";

/**
 * Returns the user's API key status and preferred model.
 * Stats are no longer returned here — they come from Convex subscriptions.
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email })
            .select("llmApiKey preferredModel")
            .lean();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            hasApiKey: !!(user as any).llmApiKey,
            preferredModel: (user as any).preferredModel || "groq",
        });
    } catch (error) {
        console.error("Progress error:", error);
        return NextResponse.json(
            { error: "Something went wrong on the server. Please try again later." },
            { status: 500 }
        );
    }
}
