import { requireAuth } from "@/lib/auth/withAuth";
import { LLMGateway } from "@/lib/llm/gateway";
import { SqlQuestion, SqlExecutionResult } from "@/@types";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { session } = await requireAuth(req);

        const {
            questionId,
            sql,
            dialect = "mysql",
            testCases,
            question,
            apiKey: clientApiKey,
            provider: clientProvider = "groq",
            type = "run",
        } = await req.json();

        if (!questionId || !sql || !testCases || !question) {
            return NextResponse.json(
                { error: "questionId, sql, testCases, and question are required" },
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
                    { error: "LLM not loaded. Please try again." },
                    { status: 503 }
                );
            }
            apiKey = groqKey;
            provider = "groq";
        }

        const llm = new LLMGateway({ provider, apiKey });

        // On "run", only evaluate visible test cases
        const casesToEvaluate: SqlQuestion["testCases"] =
            type === "run"
                ? (testCases as SqlQuestion["testCases"]).filter((tc) => !tc.isHidden)
                : (testCases as SqlQuestion["testCases"]);

        const { testCaseResults, aiAnalysis } = await llm.evaluateSQL(
            sql,
            dialect,
            question as SqlQuestion,
            casesToEvaluate
        );

        const total = testCaseResults.length;
        const passed = testCaseResults.filter((r) => r.status === "PASS").length;
        const failed = total - passed;
        const totalExecutionTime = testCaseResults.reduce((s, r) => s + (r.executionTime || 0), 0);

        const overallStatus: SqlExecutionResult["status"] =
            failed === 0 ? "ACCEPTED" :
            passed === 0 ? "WRONG_ANSWER" :
            "PARTIAL";

        const result: SqlExecutionResult = {
            status: overallStatus,
            testCases: testCaseResults,
            summary: { total, passed, failed, totalExecutionTime },
            aiAnalysis,
        };

        const isAccepted = overallStatus === "ACCEPTED";
        
        // ── Update Convex stats on submit ──
        if (type === "submit") {
            try {
                const userEmail = session.user?.email;
                if (userEmail) {
                    const { getConvexClient } = await import("@/lib/db/convex");
                    const { api } = await import("../../../../convex/_generated/api");
                    const convex = getConvexClient();

                    // Track attempt (accepted or not) — scoped by email, safe
                    await convex.mutation(api.userStatus.recordAttempt, {
                        email: userEmail,
                        accepted: isAccepted,
                        difficulty: question.difficulty as "Easy" | "Medium" | "Hard",
                    });

                    // Update global platform statistics incrementally
                    if (isAccepted) {
                        await convex.mutation(api.platformStats.increment, {
                            totalProblemsSolved: 1,
                        });
                    }
                }
            } catch (err) {
                console.error("Convex stats update error:", err);
            }
        }

        return NextResponse.json(result);
    } catch (error: unknown) {
        if (error instanceof NextResponse) return error;
        console.error("SQL execute error:", error);
        return NextResponse.json(
            { error: "Something went wrong evaluating your SQL. Please try again." },
            { status: 500 }
        );
    }
}
