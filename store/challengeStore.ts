import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ExecutionResult } from "@/@types";
import { v4 as uuidv4 } from "uuid";
import {
    saveSubmission,
    clearSessionSubmissions,
    getSessionSolvedList,
} from "@/lib/localStorage/sessionStorage";

export type Language = "javascript" | "typescript" | "python" | "java" | "cpp";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Question {
    _id?: string;
    questionId: string;
    title: string;
    difficulty: Difficulty;
    description: string;
    constraints: string[];
    examples: { input: string; output: string; explanation?: string }[];
    starterCode: Record<string, string>;
    testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
    tags: string[];
}

/**
 * In-memory representation of a solved question (held in Zustand for UI).
 * Source code is persisted to localStorage; this shape is for runtime use only.
 * NOTE: `code` is intentionally kept here for the email payload — it is read
 *       from localStorage on endSession and is NOT written to Convex.
 */
export interface SolvedQuestion {
    questionId: string;
    title: string;
    difficulty: Difficulty;
    code: string;
    language: Language;
    executionTime: number;
    description: string;
}

interface ChallengeState {
    // ── Session ──
    sessionId: string | null;
    sessionActive: boolean;
    usedQuestionIds: string[];
    /**
     * In-memory list of solved questions for UI (progress modal, stats).
     * Full submission data (incl. code) lives in localStorage.
     * This array is NOT persisted to Zustand storage.
     */
    solvedQuestions: SolvedQuestion[];
    canGoNext: boolean;

    // ── Current question ──
    currentQuestion: Question | null;
    code: string;
    language: Language;

    // ── Async states ──
    isGenerating: boolean;
    generationError: string | null;
    testResults: ExecutionResult | null;
    isRunning: boolean;
    isSubmitting: boolean;

    // ── Run→Submit gate ──
    isRunPass: boolean;

    // ── Credentials ──
    apiKey: string;
    provider: string;

    // ── Session Exit Protection ──
    isEndingSession: boolean;
    hasUnsavedChanges: boolean;

    // ── Exit Modal UI State ──
    isExitModalOpen: boolean;
    exitTargetUrl: string | null;

    // ── Session Progress Modal (shown on dashboard after back-button exit) ──
    showSessionProgressModal: boolean;

    // ── Actions ──
    startSession: () => void;
    endSession: () => Promise<void>;
    setQuestion: (q: Question | null) => void;
    setCode: (code: string) => void;
    setLanguage: (lang: Language) => void;
    setApiKey: (key: string) => void;
    setProvider: (p: string) => void;
    clearResults: () => void;
    setHasUnsavedChanges: (val: boolean) => void;

    // ── Exit Modal Actions ──
    openExitModal: (targetUrl?: string) => void;
    closeExitModal: () => void;
    setExitTargetUrl: (url: string | null) => void;

    // ── Session Progress Modal Actions ──
    openSessionProgressModal: () => void;
    closeSessionProgressModal: () => void;

    generateQuestion: (
        difficulty: string,
        apiKey: string,
        provider: string,
        topic?: string
    ) => Promise<void>;
    executeCode: (type: "run" | "submit") => Promise<void>;
}

export const useChallengeStore = create<ChallengeState>()(
    devtools(
        persist(
            (set, get) => ({
                // ── Session defaults ──
                sessionId: null,
                sessionActive: false,
                usedQuestionIds: [],
                solvedQuestions: [],
                canGoNext: false,

                // ── Question defaults ──
                currentQuestion: null,
                code: "",
                language: "typescript",

                // ── Async defaults ──
                isGenerating: false,
                generationError: null,
                testResults: null,
                isRunning: false,
                isSubmitting: false,

                // ── Run→Submit gate ──
                isRunPass: false,

                // ── Session Exit Protection Defaults ──
                isEndingSession: false,
                hasUnsavedChanges: false,
                isExitModalOpen: false,
                exitTargetUrl: null,
                showSessionProgressModal: false,

                // ── Credentials ──
                apiKey: "",
                provider: "groq",

                // ── Session actions ──
                startSession: () => {
                    const newSessionId = uuidv4();
                    // Clear any stale localStorage data for this new session id (belt-and-suspenders)
                    clearSessionSubmissions(newSessionId);
                    set({
                        sessionId: newSessionId,
                        sessionActive: true,
                        usedQuestionIds: [],
                        solvedQuestions: [],
                        canGoNext: false,
                        currentQuestion: null,
                        code: "",
                        testResults: null,
                        generationError: null,
                        isRunPass: false,
                        isEndingSession: false,
                        hasUnsavedChanges: true, // Always protect new sessions
                        isExitModalOpen: false,
                        exitTargetUrl: null,
                    });
                },

                endSession: async () => {
                    set({ isEndingSession: true });
                    const { sessionId } = get();

                    // ── Read full submission data from localStorage ──
                    // solvedQuestions from localStorage includes the actual code
                    // for the email report. Convex never sees this.
                    const localSubmissions = sessionId ? getSessionSolvedList(sessionId) : [];

                    // Fall back to in-memory Zustand list if localStorage was cleared
                    // (e.g. private browsing mode) — code fields may be present there too
                    const solvedForEmail =
                        localSubmissions.length > 0 ? localSubmissions : get().solvedQuestions;

                    if (sessionId && solvedForEmail.length > 0) {
                        let attempts = 0;
                        const maxAttempts = 3;
                        let delay = 1000;

                        while (attempts < maxAttempts) {
                            try {
                                const response = await fetch("/api/session/end", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        solvedQuestions: solvedForEmail,
                                        sessionId,
                                    }),
                                });

                                if (response.ok) {
                                    // ── Email confirmed → clear localStorage NOW ──
                                    clearSessionSubmissions(sessionId);

                                    if (typeof window !== "undefined") {
                                        import("sonner").then((mod) => {
                                            mod.toast.success("✅ Email sent successfully", {
                                                description:
                                                    "Your performance report is on the way!",
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
                                    // Do NOT clear localStorage on failure — user can retry
                                } else {
                                    await new Promise((res) => setTimeout(res, delay));
                                    delay *= 2; // Exponential backoff
                                }
                            }
                        }
                    } else {
                        // No questions solved — short delay, then clear any empty session data
                        await new Promise((resolve) => setTimeout(resolve, 800));
                        if (sessionId) clearSessionSubmissions(sessionId);
                    }

                    set({
                        sessionId: null,
                        sessionActive: false,
                        usedQuestionIds: [],
                        solvedQuestions: [],
                        canGoNext: false,
                        currentQuestion: null,
                        code: "",
                        testResults: null,
                        generationError: null,
                        isRunPass: false,
                        isEndingSession: false,
                        hasUnsavedChanges: false,
                        isExitModalOpen: false,
                        exitTargetUrl: null,
                    });
                },

                openExitModal: (targetUrl = "/dashboard") =>
                    set({ isExitModalOpen: true, exitTargetUrl: targetUrl }),
                closeExitModal: () => set({ isExitModalOpen: false, exitTargetUrl: null }),
                setExitTargetUrl: (url) => set({ exitTargetUrl: url }),

                openSessionProgressModal: () => set({ showSessionProgressModal: true }),
                closeSessionProgressModal: () => set({ showSessionProgressModal: false }),

                setQuestion: (q) =>
                    set({
                        currentQuestion: q,
                        isRunPass: false,
                        testResults: null,
                        hasUnsavedChanges: true,
                    }),
                setCode: (code) => set({ code, isRunPass: false, hasUnsavedChanges: true }),
                setHasUnsavedChanges: (val) => set({ hasUnsavedChanges: val }),
                setLanguage: (language) => {
                    const q = get().currentQuestion;
                    const starter = q?.starterCode?.[language] || "";
                    set({ language, code: starter, isRunPass: false, testResults: null });
                },
                setApiKey: (apiKey) => set({ apiKey }),
                setProvider: (provider) => set({ provider }),
                clearResults: () => set({ testResults: null }),

                // ── Generate question ──
                generateQuestion: async (difficulty, apiKey, provider, topic) => {
                    const { usedQuestionIds } = get();
                    set({
                        isGenerating: true,
                        generationError: null,
                        testResults: null,
                        canGoNext: false,
                    });
                    try {
                        const res = await fetch("/api/llm/generate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                difficulty,
                                apiKey,
                                provider,
                                topic,
                                usedQuestionIds,
                            }),
                        });

                        if (!res.ok) {
                            const err = await res.json();
                            throw new Error(
                                err.error ||
                                    "LLM not loaded. Session could not be started. Please try again."
                            );
                        }

                        const question: Question = await res.json();
                        const lang = get().language;
                        set({
                            currentQuestion: question,
                            code: question.starterCode?.[lang] || "",
                            isGenerating: false,
                            apiKey,
                            provider,
                            usedQuestionIds: [...usedQuestionIds, question.questionId],
                            hasUnsavedChanges: false,
                        });
                    } catch (error: unknown) {
                        const msg =
                            error instanceof Error
                                ? error.message
                                : "LLM not loaded. Session could not be started. Please try again.";
                        set({ generationError: msg, isGenerating: false });
                    }
                },

                // ── Execute / Submit ──
                executeCode: async (type: "run" | "submit") => {
                    const {
                        currentQuestion,
                        code,
                        language,
                        apiKey,
                        provider,
                        solvedQuestions,
                        sessionId,
                    } = get();
                    if (!currentQuestion) return;

                    if (type === "run") {
                        set({ isRunning: true, testResults: null, isRunPass: false });
                    } else {
                        set({ isSubmitting: true, testResults: null });
                    }
                    try {
                        const casesToSend =
                            type === "run"
                                ? currentQuestion.testCases.filter((tc) => !tc.isHidden)
                                : currentQuestion.testCases;

                        const res = await fetch("/api/code/execute", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                questionId: currentQuestion.questionId,
                                title: currentQuestion.title,
                                difficulty: currentQuestion.difficulty,
                                code,
                                language,
                                testCases: casesToSend,
                                description: currentQuestion.description,
                                apiKey,
                                provider,
                                type,
                            }),
                        });

                        const results: ExecutionResult = await res.json();

                        let updatedSolved = solvedQuestions;
                        let newCanGoNext = get().canGoNext;

                        if (type === "submit" && results.status === "ACCEPTED") {
                            const alreadySolved = solvedQuestions.some(
                                (q) => q.questionId === currentQuestion.questionId
                            );

                            if (!alreadySolved) {
                                const solvedEntry: SolvedQuestion = {
                                    questionId: currentQuestion.questionId,
                                    title: currentQuestion.title,
                                    difficulty: currentQuestion.difficulty,
                                    code,
                                    language,
                                    executionTime: results.summary?.totalExecutionTime ?? 0,
                                    description: currentQuestion.description,
                                };

                                // ── Save to localStorage (source code stays in browser) ──
                                if (sessionId) {
                                    saveSubmission({
                                        sessionId,
                                        problemId: currentQuestion.questionId,
                                        title: currentQuestion.title,
                                        difficulty: currentQuestion.difficulty,
                                        submittedCode: code,
                                        language,
                                        executionTime: results.summary?.totalExecutionTime ?? 0,
                                        description: currentQuestion.description,
                                    });
                                }

                                // Keep in-memory list for UI (SessionProgressModal stats etc.)
                                updatedSolved = [...solvedQuestions, solvedEntry];
                            }
                            newCanGoNext = true;
                        }

                        set({
                            testResults: results,
                            isRunning: false,
                            isSubmitting: false,
                            solvedQuestions: updatedSolved,
                            canGoNext: newCanGoNext,
                            hasUnsavedChanges:
                                type === "submit" && results.status === "ACCEPTED"
                                    ? false
                                    : get().hasUnsavedChanges,
                            isRunPass:
                                type === "run" && results.status === "ACCEPTED"
                                    ? true
                                    : get().isRunPass,
                        });
                    } catch (error) {
                        console.error("Execution error:", error);
                        set({
                            isRunning: false,
                            isSubmitting: false,
                            isRunPass: false,
                            testResults: {
                                status: "RUNTIME_ERROR",
                                summary: {
                                    total: 0,
                                    passed: 0,
                                    failed: 0,
                                    totalExecutionTime: 0,
                                    averageMemoryUsed: 0,
                                },
                                testCases: [],
                                aiAnalysis: {
                                    codeQuality: 0,
                                    suggestions: [],
                                    complexity: "Unknown",
                                    feedback: "Execution error. Please try again.",
                                    securityIssues: [],
                                },
                            } as ExecutionResult,
                        });
                    }
                },
            }),
            {
                name: "cc-session",
                partialize: (state) => ({
                    // ✅ Persisted: session metadata and credentials only
                    sessionId: state.sessionId,
                    sessionActive: state.sessionActive,
                    usedQuestionIds: state.usedQuestionIds,
                    apiKey: state.apiKey,
                    language: state.language,
                    // ❌ NOT persisted: solvedQuestions (code lives in localStorage)
                    // ❌ NOT persisted: currentQuestion, code, testResults (transient)
                }),
            }
        )
    )
);
