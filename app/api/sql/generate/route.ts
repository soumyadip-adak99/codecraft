import { requireAuth } from "@/lib/auth/withAuth";
import { getConvexClient } from "@/lib/db/convex";
import { LLMGateway } from "@/lib/llm/gateway";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { decryptApiKey } from "@/lib/crypto/apiKeyCrypto";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { api } from "../../../../convex/_generated/api";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { session } = await requireAuth(req);

        const {
            dialect = "mysql",
            difficulty = "Medium",
            topic,
            apiKey: clientApiKey,
            provider: clientProvider = "groq",
            usedQuestionIds = [],
            useSavedKey = false,
        } = await req.json();

        // ── API key resolution (priority: saved > client > server default) ──
        let apiKey = clientApiKey?.trim() || "";
        let provider = clientProvider;

        if (useSavedKey && session.user.email) {
            try {
                await connectDB();
                const dbUser = await User.findOne({ email: session.user.email })
                    .select("llmApiKey preferredModel")
                    .lean();
                if ((dbUser as any)?.llmApiKey) {
                    apiKey = decryptApiKey((dbUser as any).llmApiKey);
                    provider = (dbUser as any).preferredModel || "groq";
                }
            } catch (err) {
                console.error("[SQL Generate] Failed to load saved key:", err);
            }
        }

        // ── Groq default key fallback ──
        if (!apiKey) {
            const groqKey = process.env.GROQ_API_KEY?.trim();
            if (!groqKey) {
                return NextResponse.json(
                    { error: "LLM not loaded. SQL session could not be started. Please try again." },
                    { status: 503 }
                );
            }
            apiKey = groqKey;
            provider = "groq";
        }

        const llm = new LLMGateway({ provider, apiKey });
        const generated = await llm.generateSQLQuestion(dialect, difficulty, topic, usedQuestionIds);

        const question = {
            ...generated,
            questionId: uuidv4(),
        };

        // ── Increment Convex global AI generated counter (async, non-blocking) ──
        const convex = getConvexClient();
        convex
            .mutation(api.platformStats.increment, {
                totalQuestionsGenerated: 1,
            })
            .catch((err) => console.error("Convex platformStats update failed:", err));

        return NextResponse.json(question, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof NextResponse) return error;
        const message = error instanceof Error ? error.message : "SQL generation failed";
        console.error("SQL generate error:", error);
        const isLLMError =
            message.toLowerCase().includes("api key") ||
            message.toLowerCase().includes("model") ||
            message.toLowerCase().includes("llm") ||
            message.toLowerCase().includes("groq");
        return NextResponse.json(
            {
                error: isLLMError
                    ? "LLM not loaded. SQL session could not be started. Please try again."
                    : "Something went wrong on the server. Please try again later.",
            },
            { status: 500 }
        );
    }
}
