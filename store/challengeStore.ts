import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ExecutionResult } from "@/@types";
import { v4 as uuidv4 } from "uuid";

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

export interface SolvedQuestion {
    questionId: string;
    title: string;
    difficulty: Difficulty;
    code: string;
    language: Language;
    executionTime: number;
}

interface ChallengeState {
    // ── Session ──
    sessionId: string | null;
    sessionActive: boolean;
    usedQuestionIds: string[];
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
    // True only after the user has successfully run code (i.e. all tests passed).
    // Resets when a new question is loaded, session changes, code changes, or language changes.
    isRunPass: boolean;

    // ── Credentials ──
    apiKey: string;
    provider: string;

    // ── Session Exit Protection ──
    isEndingSession: boolean;
    hasUnsavedChanges: boolean; // Acts mostly as 'session is active and requires protection'
    
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
                startSession: () =>
                    set({
                        sessionId: uuidv4(),
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
                    }),

                endSession: async () => {
                    set({ isEndingSession: true });
                    const { solvedQuestions, sessionId } = get();
                    
                    if (sessionId && solvedQuestions.length > 0) {
                        let attempts = 0;
                        const maxAttempts = 3;
                        let delay = 1000;
                        
                        while (attempts < maxAttempts) {
                            try {
                                const response = await fetch("/api/session/end", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ solvedQuestions, sessionId }),
                                });
                                
                                if (response.ok) {
                                    // Make sure toast is available (need to import it)
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
                                    delay *= 2; // Exponential backoff
                                }
                            }
                        }
                    } else {
                        // Just fake delay if no session questions to submit
                        await new Promise((resolve) => setTimeout(resolve, 800));
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

                openExitModal: (targetUrl = "/dashboard") => set({ isExitModalOpen: true, exitTargetUrl: targetUrl }),
                closeExitModal: () => set({ isExitModalOpen: false, exitTargetUrl: null }),
                setExitTargetUrl: (url) => set({ exitTargetUrl: url }),

                openSessionProgressModal: () => set({ showSessionProgressModal: true }),
                closeSessionProgressModal: () => set({ showSessionProgressModal: false }),

                setQuestion: (q) => set({ currentQuestion: q, isRunPass: false, testResults: null, hasUnsavedChanges: true }),
                setCode: (code) => set({ code, isRunPass: false, hasUnsavedChanges: true }),
                setHasUnsavedChanges: (val) => set({ hasUnsavedChanges: val }),
                setLanguage: (language) => {
                    const q = get().currentQuestion;
                    const starter = q?.starterCode?.[language] || "";
                    // Language change resets the run gate — new language = new run required
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
                    const { currentQuestion, code, language, apiKey, provider, solvedQuestions } =
                        get();
                    if (!currentQuestion) return;

                    if (type === "run") {
                        set({ isRunning: true, testResults: null, isRunPass: false });
                    } else {
                        set({ isSubmitting: true, testResults: null });
                    }
                    try {
                        // Pass test cases from localStorage so server doesn't need DB lookup
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
                            // Avoid duplicate if re-submitted
                            if (
                                !solvedQuestions.some(
                                    (q) => q.questionId === currentQuestion.questionId
                                )
                            ) {
                                updatedSolved = [
                                    ...solvedQuestions,
                                    {
                                        questionId: currentQuestion.questionId,
                                        title: currentQuestion.title,
                                        difficulty: currentQuestion.difficulty,
                                        code,
                                        language,
                                        executionTime: results.summary?.totalExecutionTime ?? 0,
                                    },
                                ];
                            }
                            newCanGoNext = true;
                        }

                        set({
                            testResults: results,
                            isRunning: false,
                            isSubmitting: false,
                            solvedQuestions: updatedSolved,
                            canGoNext: newCanGoNext,
                            hasUnsavedChanges: type === "submit" && results.status === "ACCEPTED" ? false : get().hasUnsavedChanges,
                            // Mark that a run has completed AND passed — enables the Submit button
                            isRunPass: type === "run" && results.status === "ACCEPTED" ? true : get().isRunPass,
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
                    sessionId: state.sessionId,
                    sessionActive: state.sessionActive,
                    usedQuestionIds: state.usedQuestionIds,
                    solvedQuestions: state.solvedQuestions,
                    apiKey: state.apiKey,
                    language: state.language,
                }),
            }
        )
    )
);
