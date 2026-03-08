import { requireAuth } from "@/lib/auth/withAuth";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Returns the user's API key status and preferred model.
 * Stats are no longer returned here — they come from Convex subscriptions.
 */
export async function GET(req: NextRequest) {
    try {
        const { session } = await requireAuth(req);

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
        if (error instanceof NextResponse) return error;
        console.error("Progress error:", error);
        return NextResponse.json(
            { error: "Something went wrong on the server. Please try again later." },
            { status: 500 }
        );
    }
}
