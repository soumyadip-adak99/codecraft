import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";

export const dynamic = "force-dynamic";

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

        await connectDB();
        await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: { llmApiKey: apiKey, preferredModel: provider || "openai" } }
        );

        return NextResponse.json({ success: true, message: "API key saved successfully" });
    } catch (error) {
        console.error("API key save error:", error);
        return NextResponse.json({ error: "Failed to save API key" }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        await User.findOneAndUpdate({ email: session.user.email }, { $unset: { llmApiKey: "" } });

        return NextResponse.json({ success: true, message: "API key removed" });
    } catch (error) {
        console.error("API key delete error:", error);
        return NextResponse.json({ error: "Failed to remove API key" }, { status: 500 });
    }
}
