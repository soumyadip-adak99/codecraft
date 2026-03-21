import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { SqlQuestion, SqlExecutionResult } from "@/@types";
import { v4 as uuidv4 } from "uuid";
import {
    saveSubmission,
    clearSessionSubmissions,
    getSessionSolvedList,
} from "@/lib/localStorage/sessionStorage";

export type SqlDialect = "mysql" | "postgresql" | "oracle" | "sqlite";
export type SqlDifficulty = "Easy" | "Medium" | "Hard";

interface SqlState {
    // ── Session ──
    sqlSessionId: string | null;
    sqlSessionActive: boolean;
    usedSqlQuestionIds: string[];
    solvedSqlCount: number;
    canGoNextSql: boolean;

    // ── Current question ──
    currentSqlQuestion: SqlQuestion | null;
    sqlCode: string;
    sqlDialect: SqlDialect;

    // ── Async states ──
    isSqlGenerating: boolean;
    sqlGenerationError: string | null;
    sqlTestResults: SqlExecutionResult | null;
    isSqlRunning: boolean;
    isSqlSubmitting: boolean;
    isSqlRunPass: boolean;

    // ── Credentials ──
    sqlApiKey: string;
    sqlProvider: string;

    // ── Session Exit Protection ──
    isSqlEndingSession: boolean;
    isSqlExitModalOpen: boolean;
    sqlExitTargetUrl: string;
    sqlCodeModified: boolean;

    // ── Actions ──
    startSqlSession: () => void;
    endSqlSession: () => Promise<void>;
    openSqlExitModal: (url?: string) => void;
    closeSqlExitModal: () => void;
    setSqlCode: (code: string) => void;
    setSqlDialect: (dialect: SqlDialect) => void;
    clearSqlResults: () => void;

    generateSqlQuestion: (
        dialect: SqlDialect,
        difficulty: SqlDifficulty,
        apiKey: string,
        provider: string,
        topic?: string,
        useSavedKey?: boolean
    ) => Promise<void>;

    executeSql: (type: "run" | "submit") => Promise<void>;
}

export const useSqlStore = create<SqlState>()(
    devtools(
        persist(
            (set, get) => ({
                // ── Defaults ──
                sqlSessionId: null,
                sqlSessionActive: false,
                usedSqlQuestionIds: [],
                solvedSqlCount: 0,
                canGoNextSql: false,

                currentSqlQuestion: null,
                sqlCode: "-- Write your SQL query here\n",
                sqlDialect: "mysql",

                isSqlGenerating: false,
                sqlGenerationError: null,
                sqlTestResults: null,
                isSqlRunning: false,
                isSqlSubmitting: false,
                isSqlRunPass: false,

                sqlApiKey: "",
                sqlProvider: "groq",

                isSqlEndingSession: false,
                isSqlExitModalOpen: false,
                sqlExitTargetUrl: "/dashboard",
                sqlCodeModified: false,

                // ── Actions ──
                openSqlExitModal: (url) => set({ isSqlExitModalOpen: true, sqlExitTargetUrl: url || "/dashboard" }),
                closeSqlExitModal: () => set({ isSqlExitModalOpen: false }),

                // ── Session ──
                startSqlSession: () => {
                    const id = uuidv4();
                    clearSessionSubmissions(id); // Belt and suspenders
                    set({
                        sqlSessionId: id,
                        sqlSessionActive: true,
                        usedSqlQuestionIds: [],
                        solvedSqlCount: 0,
                        canGoNextSql: false,
                        currentSqlQuestion: null,
                        sqlCode: "-- Write your SQL query here\n",
                        sqlTestResults: null,
                        sqlGenerationError: null,
                        isSqlRunPass: false,
                        isSqlEndingSession: false,
                    });
                },

                endSqlSession: async () => {
                    set({ isSqlEndingSession: true });
                    const { sqlSessionId } = get();

                    const localSubmissions = sqlSessionId ? getSessionSolvedList(sqlSessionId) : [];

                    if (sqlSessionId && localSubmissions.length > 0) {
                        let attempts = 0;
                        const maxAttempts = 3;
                        let delay = 1000;

                        while (attempts < maxAttempts) {
                            try {
                                const response = await fetch("/api/session/end", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        solvedQuestions: localSubmissions,
                                        sessionId: sqlSessionId,
                                    }),
                                });

                                if (response.ok) {
                                    clearSessionSubmissions(sqlSessionId);
                                    if (typeof window !== "undefined") {
                                        import("sonner").then((mod) => {
                                            mod.toast.success("✅ Email sent successfully", {
                                                description: "Your SQL performance report is on the way!",
                                            });
                                        });
                                    }
                                    break;
                                }
                                throw new Error("API not ok");
                            } catch (error) {
                                attempts++;
                                if (attempts >= maxAttempts) {
                                    console.error("SQL session end failed after retries:", error);
                                } else {
                                    await new Promise((res) => setTimeout(res, delay));
                                    delay *= 2;
                                }
                            }
                        }
                    } else {
                        await new Promise((resolve) => setTimeout(resolve, 800));
                        if (sqlSessionId) clearSessionSubmissions(sqlSessionId);
                    }

                    set({
                        sqlSessionId: null,
                        sqlSessionActive: false,
                        usedSqlQuestionIds: [],
                        solvedSqlCount: 0,
                        canGoNextSql: false,
                        currentSqlQuestion: null,
                        sqlCode: "-- Write your SQL query here\n",
                        sqlTestResults: null,
                        sqlGenerationError: null,
                        isSqlRunPass: false,
                        isSqlEndingSession: false,
                        isSqlExitModalOpen: false,
                        sqlCodeModified: false,
                    });
                },

                setSqlCode: (code) => set({ sqlCode: code, isSqlRunPass: false, sqlCodeModified: true }),
                setSqlDialect: (dialect) => set({ sqlDialect: dialect }),
                clearSqlResults: () => set({ sqlTestResults: null }),

                // ── Generate SQL question ──
                generateSqlQuestion: async (dialect, difficulty, apiKey, provider, topic, useSavedKey = false) => {
                    const { usedSqlQuestionIds } = get();
                    set({
                        isSqlGenerating: true,
                        sqlGenerationError: null,
                        sqlTestResults: null,
                        canGoNextSql: false,
                        sqlDialect: dialect,
                    });

                    try {
                        const res = await fetch("/api/sql/generate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                dialect,
                                difficulty,
                                apiKey: useSavedKey ? "" : apiKey,
                                provider,
                                topic,
                                usedQuestionIds: usedSqlQuestionIds,
                                useSavedKey,
                            }),
                        });

                        if (!res.ok) {
                            const err = await res.json();
                            throw new Error(err.error || "LLM not loaded. SQL session could not be started.");
                        }

                        const question: SqlQuestion = await res.json();

                        set({
                            currentSqlQuestion: question,
                            sqlCode: `-- ${question.title}\n-- Dialect: ${dialect.toUpperCase()}\n\n`,
                            isSqlGenerating: false,
                            sqlApiKey: apiKey,
                            sqlProvider: provider,
                            usedSqlQuestionIds: [...usedSqlQuestionIds, question.questionId],
                        });
                    } catch (error: unknown) {
                        const msg = error instanceof Error ? error.message : "SQL generation failed.";
                        set({ sqlGenerationError: msg, isSqlGenerating: false });
                    }
                },

                // ── Execute SQL ──
                executeSql: async (type) => {
                    const { currentSqlQuestion, sqlCode, sqlDialect, sqlApiKey, sqlProvider, solvedSqlCount, sqlSessionId } = get();
                    if (!currentSqlQuestion) return;

                    if (type === "run") {
                        set({ isSqlRunning: true, sqlTestResults: null, isSqlRunPass: false });
                    } else {
                        set({ isSqlSubmitting: true, sqlTestResults: null });
                    }

                    try {
                        const res = await fetch("/api/sql/execute", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                questionId: currentSqlQuestion.questionId,
                                sql: sqlCode,
                                dialect: sqlDialect,
                                testCases: currentSqlQuestion.testCases,
                                question: currentSqlQuestion,
                                apiKey: sqlApiKey,
                                provider: sqlProvider,
                                type,
                            }),
                        });

                        const results: SqlExecutionResult = await res.json();
                        const isAccepted = results.status === "ACCEPTED";

                        if (type === "submit" && isAccepted && sqlSessionId) {
                            // Check if previously solved to prevent double-counting in localStorage
                            // (We just use solvedSqlCount for UI stat tracking)
                            // We don't have an in-memory array of solved questions for SQL, so we rely on count and canGoNext.
                            // Technically, if they resubmit the *same* accepted code, we shouldn't save it again.
                            // But keeping it simple:
                            if (!get().canGoNextSql) {
                                saveSubmission({
                                    sessionId: sqlSessionId,
                                    problemId: currentSqlQuestion.questionId,
                                    title: currentSqlQuestion.title,
                                    difficulty: currentSqlQuestion.difficulty,
                                    submittedCode: sqlCode,
                                    language: sqlDialect, // save dialect as language
                                    executionTime: results.summary?.totalExecutionTime ?? 0,
                                    description: currentSqlQuestion.description,
                                });
                            }
                        }

                        set({
                            sqlTestResults: results,
                            isSqlRunning: false,
                            isSqlSubmitting: false,
                            canGoNextSql: type === "submit" && isAccepted ? true : get().canGoNextSql,
                            sqlCodeModified: type === "submit" && isAccepted ? false : get().sqlCodeModified,
                            solvedSqlCount: type === "submit" && isAccepted ? solvedSqlCount + 1 : solvedSqlCount,
                            isSqlRunPass: type === "run" && isAccepted ? true : get().isSqlRunPass,
                        });
                    } catch (error) {
                        console.error("SQL execution error:", error);
                        set({
                            isSqlRunning: false,
                            isSqlSubmitting: false,
                            isSqlRunPass: false,
                            sqlTestResults: {
                                status: "WRONG_ANSWER",
                                summary: { total: 0, passed: 0, failed: 0, totalExecutionTime: 0 },
                                testCases: [],
                                aiAnalysis: {
                                    codeQuality: 0,
                                    complexity: "Unknown",
                                    feedback: "Execution error. Please try again.",
                                    suggestions: [],
                                    securityIssues: [],
                                },
                            } as SqlExecutionResult,
                        });
                    }
                },
            }),
            {
                name: "cc-sql-session",
                partialize: (state) => ({
                    sqlSessionId: state.sqlSessionId,
                    sqlSessionActive: state.sqlSessionActive,
                    usedSqlQuestionIds: state.usedSqlQuestionIds,
                    sqlDialect: state.sqlDialect,
                    sqlApiKey: state.sqlApiKey,
                    sqlProvider: state.sqlProvider,
                }),
            }
        )
    )
);
