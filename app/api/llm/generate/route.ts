import { auth } from "@/lib/auth/config";
import { getConvexClient } from "@/lib/db/convex";
import { LLMGateway } from "@/lib/llm/gateway";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { api } from "../../../../convex/_generated/api";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {
            difficulty = "Medium",
            topic,
            apiKey: clientApiKey,
            provider: clientProvider = "groq",
            usedQuestionIds = [],
        } = await req.json();

        // ── Groq default key fallback ──
        let apiKey = clientApiKey?.trim() || "";
        let provider = clientProvider;

        if (!apiKey) {
            const groqKey = process.env.GROQ_API_KEY?.trim();
            if (!groqKey) {
                return NextResponse.json(
                    {
                        error: "LLM not loaded. Session could not be started. Please try again.",
                    },
                    { status: 503 }
                );
            }
            apiKey = groqKey;
            provider = "groq";
        }

        const llm = new LLMGateway({ provider, apiKey });
        // Pass usedQuestionIds so LLM avoids repeats
        const generated = await llm.generateQuestion(difficulty, topic, usedQuestionIds);

        // Assign a unique ID (questions are NOT saved to DB)
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
        const message = error instanceof Error ? error.message : "Generation failed";
        console.error("LLM generate error:", error);
        // Detect LLM-specific errors
        const isLLMError =
            message.toLowerCase().includes("api key") ||
            message.toLowerCase().includes("model") ||
            message.toLowerCase().includes("llm") ||
            message.toLowerCase().includes("openai") ||
            message.toLowerCase().includes("groq");
        return NextResponse.json(
            {
                error: isLLMError
                    ? "LLM not loaded. Session could not be started. Please try again."
                    : "Something went wrong on the server. Please try again later.",
            },
            { status: 500 }
        );
    }
}
