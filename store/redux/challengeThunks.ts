import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSessionSolvedList, clearSessionSubmissions } from "@/lib/localStorage/sessionStorage";
import type { Question, SolvedQuestion, Language, Difficulty } from "./challengeSlice";
import type { ExecutionResult } from "@/@types";

// ── Re-export types for consumers ──────────────────────────────────────────────
export type { Question, SolvedQuestion, Language, Difficulty };

// ── generateQuestion ───────────────────────────────────────────────────────────
interface GenerateArgs {
    difficulty: string;
    apiKey: string;
    provider: string;
    topic?: string;
    useSavedKey?: boolean;
    usedQuestionIds: string[];
}

interface GenerateResult {
    question: Question;
    apiKey: string;
    provider: string;
}

export const generateQuestionThunk = createAsyncThunk<GenerateResult, GenerateArgs>(
    "challenge/generateQuestion",
    async (args, { rejectWithValue }) => {
        const { difficulty, apiKey, provider, topic, useSavedKey = false, usedQuestionIds } = args;
        try {
            const res = await fetch("/api/llm/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    difficulty,
                    apiKey: useSavedKey ? "" : apiKey,
                    provider,
                    topic,
                    usedQuestionIds,
                    useSavedKey,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                return rejectWithValue(
                    err.error || "LLM not loaded. Session could not be started. Please try again."
                );
            }

            const question: Question = await res.json();
            return { question, apiKey, provider };
        } catch (error: unknown) {
            const msg =
                error instanceof Error
                    ? error.message
                    : "LLM not loaded. Session could not be started. Please try again.";
            return rejectWithValue(msg);
        }
    }
);

// ── executeCode ────────────────────────────────────────────────────────────────
interface ExecuteArgs {
    questionId: string;
    title: string;
    difficulty: Difficulty;
    code: string;
    language: Language;
    testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
    description: string;
    apiKey: string;
    provider: string;
    type: "run" | "submit";
    solvedQuestions: SolvedQuestion[];
    sessionId: string | null;
}

interface ExecuteResult {
    results: ExecutionResult;
    type: "run" | "submit";
    solvedEntry: SolvedQuestion | null;
    sessionId: string | null;
}

export const executeCodeThunk = createAsyncThunk<ExecuteResult, ExecuteArgs>(
    "challenge/executeCode",
    async (args, { rejectWithValue }) => {
        const {
            questionId,
            title,
            difficulty,
            code,
            language,
            testCases,
            description,
            apiKey,
            provider,
            type,
            solvedQuestions,
            sessionId,
        } = args;

        try {
            const casesToSend =
                type === "run"
                    ? testCases.filter((tc) => !tc.isHidden)
                    : testCases;

            const res = await fetch("/api/code/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionId,
                    title,
                    difficulty,
                    code,
                    language,
                    testCases: casesToSend,
                    description,
                    apiKey,
                    provider,
                    type,
                }),
            });

            const results: ExecutionResult = await res.json();

            let solvedEntry: SolvedQuestion | null = null;

            if (type === "submit" && results.status === "ACCEPTED") {
                const alreadySolved = solvedQuestions.some((q) => q.questionId === questionId);
                if (!alreadySolved) {
                    solvedEntry = {
                        questionId,
                        title,
                        difficulty,
                        code,
                        language,
                        executionTime: results.summary?.totalExecutionTime ?? 0,
                        description,
                    };
                }
            }

            return { results, type, solvedEntry, sessionId };
        } catch (error) {
            console.error("Execution error:", error);
            return rejectWithValue("Execution failed");
        }
    }
);

// ── endSession ─────────────────────────────────────────────────────────────────
interface EndSessionArgs {
    sessionId: string | null;
    solvedQuestions: SolvedQuestion[];
}

export const endSessionThunk = createAsyncThunk<void, EndSessionArgs>(
    "challenge/endSession",
    async ({ sessionId, solvedQuestions }) => {
        const localSubmissions = sessionId ? getSessionSolvedList(sessionId) : [];
        const solvedForEmail =
            localSubmissions.length > 0 ? localSubmissions : solvedQuestions;

        if (sessionId && solvedForEmail.length > 0) {
            let attempts = 0;
            const maxAttempts = 3;
            let delay = 1000;

            while (attempts < maxAttempts) {
                try {
                    const response = await fetch("/api/session/end", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ solvedQuestions: solvedForEmail, sessionId }),
                    });

                    if (response.ok) {
                        clearSessionSubmissions(sessionId);
                        if (typeof window !== "undefined") {
                            import("sonner").then((mod) => {
                                mod.toast.success("✅ Email sent successfully", {
                                    description: "Your performance report is on the way!",
                                });
                            });
                        }
                        break;
                    }
                    throw new Error("API not ok");
                } catch (error) {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        console.error("Session end failed after retries:", error);
                    } else {
                        await new Promise((res) => setTimeout(res, delay));
                        delay *= 2;
                    }
                }
            }
        } else {
            await new Promise((resolve) => setTimeout(resolve, 800));
            if (sessionId) clearSessionSubmissions(sessionId);
        }
    }
);
