import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ExecutionResult } from "@/types";
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
  isExecuting: boolean;

  // ── Credentials ──
  apiKey: string;
  provider: string;

  // ── Actions ──
  startSession: () => void;
  endSession: () => void;
  setQuestion: (q: Question | null) => void;
  setCode: (code: string) => void;
  setLanguage: (lang: Language) => void;
  setApiKey: (key: string) => void;
  setProvider: (p: string) => void;
  clearResults: () => void;

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
        isExecuting: false,

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
          }),

        endSession: () =>
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
          }),

        setQuestion: (q) => set({ currentQuestion: q }),
        setCode: (code) => set({ code }),
        setLanguage: (language) => {
          const q = get().currentQuestion;
          const starter = q?.starterCode?.[language] || "";
          set({ language, code: starter });
        },
        setApiKey: (apiKey) => set({ apiKey }),
        setProvider: (provider) => set({ provider }),
        clearResults: () => set({ testResults: null }),

        // ── Generate question ──
        generateQuestion: async (difficulty, apiKey, provider, topic) => {
          const { usedQuestionIds } = get();
          set({ isGenerating: true, generationError: null, testResults: null, canGoNext: false });
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
              throw new Error(err.error || "LLM not loaded. Session could not be started. Please try again.");
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
          const { currentQuestion, code, language, apiKey, provider, solvedQuestions } = get();
          if (!currentQuestion) return;

          set({ isExecuting: true, testResults: null });
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
              if (!solvedQuestions.some((q) => q.questionId === currentQuestion.questionId)) {
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
              isExecuting: false,
              solvedQuestions: updatedSolved,
              canGoNext: newCanGoNext,
            });
          } catch (error) {
            console.error("Execution error:", error);
            set({
              isExecuting: false,
              testResults: {
                status: "RUNTIME_ERROR",
                summary: { total: 0, passed: 0, failed: 0, totalExecutionTime: 0, averageMemoryUsed: 0 },
                testCases: [],
                aiAnalysis: { codeQuality: 0, suggestions: [], complexity: "Unknown", feedback: "Execution error. Please try again.", securityIssues: [] },
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
