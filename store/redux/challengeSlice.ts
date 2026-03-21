import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
    saveSubmission,
    clearSessionSubmissions,
    getSessionSolvedList,
} from "@/lib/localStorage/sessionStorage";
import { ExecutionResult } from "@/@types";
import { generateQuestionThunk, executeCodeThunk, endSessionThunk } from "./challengeThunks";

// ── Types ──────────────────────────────────────────────────────────────────────
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
    description: string;
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
    isRunPass: boolean;

    // ── Credentials ──
    apiKey: string;
    provider: string;

    // ── Session Exit Protection ──
    isEndingSession: boolean;
    hasUnsavedChanges: boolean;
    codeModified: boolean;

    // ── Exit Modal UI State ──
    isExitModalOpen: boolean;
    exitTargetUrl: string | null;

    // ── Session Progress Modal ──
    showSessionProgressModal: boolean;
}

// ── Initial State ──────────────────────────────────────────────────────────────
const initialState: ChallengeState = {
    sessionId: null,
    sessionActive: false,
    usedQuestionIds: [],
    solvedQuestions: [],
    canGoNext: false,

    currentQuestion: null,
    code: "",
    language: "typescript",

    isGenerating: false,
    generationError: null,
    testResults: null,
    isRunning: false,
    isSubmitting: false,

    isRunPass: false,

    apiKey: "",
    provider: "groq",

    isEndingSession: false,
    hasUnsavedChanges: false,
    codeModified: false,
    isExitModalOpen: false,
    exitTargetUrl: null,
    showSessionProgressModal: false,
};

// ── Slice ──────────────────────────────────────────────────────────────────────
const challengeSlice = createSlice({
    name: "challenge",
    initialState,
    reducers: {
        // ── Session ──
        startSession(state) {
            const newSessionId = uuidv4();
            clearSessionSubmissions(newSessionId);
            state.sessionId = newSessionId;
            state.sessionActive = true;
            state.usedQuestionIds = [];
            state.solvedQuestions = [];
            state.canGoNext = false;
            state.currentQuestion = null;
            state.code = "";
            state.testResults = null;
            state.generationError = null;
            state.isRunPass = false;
            state.isEndingSession = false;
            state.hasUnsavedChanges = true; // Always protect new sessions
            state.isExitModalOpen = false;
            state.exitTargetUrl = null;
        },

        // ── Question / editor ──
        setQuestion(state, action: PayloadAction<Question | null>) {
            state.currentQuestion = action.payload;
            state.isRunPass = false;
            state.testResults = null;
            state.hasUnsavedChanges = true;
            state.codeModified = false;
        },
        setCode(state, action: PayloadAction<string>) {
            state.code = action.payload;
            state.isRunPass = false;
            state.hasUnsavedChanges = true;
            state.codeModified = true;
        },
        setLanguage(state, action: PayloadAction<Language>) {
            const lang = action.payload;
            const starter = state.currentQuestion?.starterCode?.[lang] || "";
            state.language = lang;
            state.code = starter;
            state.isRunPass = false;
            state.testResults = null;
        },
        setApiKey(state, action: PayloadAction<string>) {
            state.apiKey = action.payload;
        },
        setProvider(state, action: PayloadAction<string>) {
            state.provider = action.payload;
        },
        clearResults(state) {
            state.testResults = null;
        },
        setHasUnsavedChanges(state, action: PayloadAction<boolean>) {
            state.hasUnsavedChanges = action.payload;
        },
        setCodeModified(state, action: PayloadAction<boolean>) {
            state.codeModified = action.payload;
        },

        // ── Exit Modal ──
        openExitModal(state, action: PayloadAction<string | undefined>) {
            state.isExitModalOpen = true;
            state.exitTargetUrl = action.payload ?? "/dashboard";
        },
        closeExitModal(state) {
            state.isExitModalOpen = false;
            state.exitTargetUrl = null;
        },
        setExitTargetUrl(state, action: PayloadAction<string | null>) {
            state.exitTargetUrl = action.payload;
        },

        // ── Session Progress Modal ──
        openSessionProgressModal(state) {
            state.showSessionProgressModal = true;
        },
        closeSessionProgressModal(state) {
            state.showSessionProgressModal = false;
        },
    },
    extraReducers: (builder) => {
        // ── generateQuestion thunk ──
        builder
            .addCase(generateQuestionThunk.pending, (state) => {
                state.isGenerating = true;
                state.generationError = null;
                state.testResults = null;
                state.canGoNext = false;
            })
            .addCase(generateQuestionThunk.fulfilled, (state, action) => {
                const { question, apiKey, provider } = action.payload;
                const lang = state.language;
                state.currentQuestion = question;
                state.code = question.starterCode?.[lang] || "";
                state.isGenerating = false;
                state.apiKey = apiKey;
                state.provider = provider;
                state.usedQuestionIds = [...state.usedQuestionIds, question.questionId];
                state.hasUnsavedChanges = false;
                state.codeModified = false;
            })
            .addCase(generateQuestionThunk.rejected, (state, action) => {
                state.generationError = action.payload as string;
                state.isGenerating = false;
            });

        // ── executeCode thunk ──
        builder
            .addCase(executeCodeThunk.pending, (state, action) => {
                if (action.meta.arg.type === "run") {
                    state.isRunning = true;
                    state.isRunPass = false;
                } else {
                    state.isSubmitting = true;
                }
                state.testResults = null;
            })
            .addCase(executeCodeThunk.fulfilled, (state, action) => {
                const { results, type, solvedEntry, sessionId: sid } = action.payload;

                state.isRunning = false;
                state.isSubmitting = false;
                state.testResults = results;

                if (type === "submit" && results.status === "ACCEPTED") {
                    if (solvedEntry) {
                        if (sid) {
                            saveSubmission({
                                sessionId: sid,
                                problemId: solvedEntry.questionId,
                                title: solvedEntry.title,
                                difficulty: solvedEntry.difficulty,
                                submittedCode: solvedEntry.code,
                                language: solvedEntry.language,
                                executionTime: solvedEntry.executionTime,
                                description: solvedEntry.description,
                            });
                        }
                        const alreadySolved = state.solvedQuestions.some(
                            (q) => q.questionId === solvedEntry.questionId
                        );
                        if (!alreadySolved) {
                            state.solvedQuestions.push(solvedEntry);
                        }
                    }
                    state.canGoNext = true;
                    state.hasUnsavedChanges = false;
                    state.codeModified = false;
                }

                if (type === "run" && results.status === "ACCEPTED") {
                    state.isRunPass = true;
                }
            })
            .addCase(executeCodeThunk.rejected, (state) => {
                state.isRunning = false;
                state.isSubmitting = false;
                state.isRunPass = false;
                state.testResults = {
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
                } as ExecutionResult;
            });

        // ── endSession thunk ──
        builder
            .addCase(endSessionThunk.pending, (state) => {
                state.isEndingSession = true;
            })
            .addCase(endSessionThunk.fulfilled, (state) => {
                state.sessionId = null;
                state.sessionActive = false;
                state.usedQuestionIds = [];
                state.solvedQuestions = [];
                state.canGoNext = false;
                state.currentQuestion = null;
                state.code = "";
                state.testResults = null;
                state.generationError = null;
                state.isRunPass = false;
                state.isEndingSession = false;
                state.hasUnsavedChanges = false;
                state.isExitModalOpen = false;
                state.exitTargetUrl = null;
            })
            .addCase(endSessionThunk.rejected, (state) => {
                // Even on failure, unblock the UI so user isn't stuck
                state.isEndingSession = false;
            });
    },
});

export const {
    startSession,
    setQuestion,
    setCode,
    setLanguage,
    setApiKey,
    setProvider,
    clearResults,
    setHasUnsavedChanges,
    setCodeModified,
    openExitModal,
    closeExitModal,
    setExitTargetUrl,
    openSessionProgressModal,
    closeSessionProgressModal,
} = challengeSlice.actions;

export default challengeSlice.reducer;
