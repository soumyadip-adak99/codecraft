import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { CodeExecutionEngine } from "@/lib/code/execution-engine";
import { getConvexClient } from "@/lib/db/convex";
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
            questionId,
            title,
            difficulty,
            code,
            language,
            testCases, // passed from localStorage — no DB lookup needed
            description,
            apiKey: clientApiKey,
            provider: clientProvider = "groq",
            type = "run",
        } = await req.json();

        if (!questionId || !code || !language || !testCases) {
            return NextResponse.json(
                { error: "questionId, code, language, and testCases are required" },
                { status: 400 }
            );
        }

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

        const engine = new CodeExecutionEngine();
        const results = await engine.execute(
            code,
            language,
            testCases,
            description || "",
            apiKey,
            provider
        );

        const isAccepted = results.status === "ACCEPTED";

        // ── Update Convex stats on submit ──
        if (type === "submit") {
            try {
                const userEmail = session.user?.email;
                if (userEmail) {
                    const convex = getConvexClient();

                    // Record attempt in user status (scoped by email — safe)
                    await convex.mutation(api.userStatus.recordAttempt, {
                        email: userEmail,
                        accepted: isAccepted,
                        difficulty: difficulty as "Easy" | "Medium" | "Hard",
                    });

                    // Increment global solved counter
                    if (isAccepted) {
                        await convex.mutation(api.platformStats.increment, {
                            totalProblemsSolved: 1,
                        });

                        // Record in submissions history
                        await convex.mutation(api.submissions.recordSubmission, {
                            email: userEmail,
                            userId: session.user.id || undefined,
                            questionId,
                            title,
                            difficulty,
                            code,
                            language,
                            status: results.status,
                            executionTime: results.summary?.totalExecutionTime || 0,
                            userImageUrl: session.user.image || undefined,
                        });
                    }
                }
            } catch (err) {
                console.error("Convex stats update error:", err);
            }
        }

        return NextResponse.json(results);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Execution failed";
        console.error("Code execute error:", error);
        return NextResponse.json(
            { error: "Something went wrong on the server. Please try again later." },
            { status: 500 }
        );
    }
}
