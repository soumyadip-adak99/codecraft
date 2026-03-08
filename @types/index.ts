export type LLMProvider = "openai" | "anthropic" | "google" | "groq" | "custom";

export interface LLMConfig {
    provider: LLMProvider;
    apiKey: string;
    model?: string;
    baseURL?: string;
}

export interface Review {
    _id: string;
    userName: string;
    review: string;
    createdAt: string;
}

/** Real-time platform counters from Convex */
export interface ConvexCounter {
    totalDevelopers: number;
    totalQuestionsGenerated: number;
    totalProblemsSolved: number;
}

/** Minimal auth user fields available in session */
export interface AuthUser {
    id: string;
    email: string;
    image?: string | null;
}

/** Result returned from a RUN execution */
export interface RunResult {
    status: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "COMPILATION_ERROR";
    testCases: import("./submission").TestCaseDetail[];
    summary: {
        total: number;
        passed: number;
        failed: number;
        totalExecutionTime: number;
        averageMemoryUsed: number;
    };
    aiAnalysis: import("./submission").AIAnalysis;
}

/** Result returned from a SUBMIT execution — same shape, re-exported for clarity */
export type SubmitResult = RunResult;

// Re-export all sub-module types for convenience
export type { UserStats, IUser } from "./user";
export type { PlatformStats } from "./stats";
export type {
    IQuestion,
    GeneratedQuestion,
    QuestionExample,
    TestCase,
    StarterCode,
} from "./question";
export type {
    ISubmission,
    AttemptStatus,
    TestCaseDetail,
    TestCaseResults,
    AIAnalysis,
    ExecutionResult,
} from "./submission";
export type {
    ISession,
    SessionSolvedQuestion,
    SessionReportData,
} from "./session";

// NextAuth session extension
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            hasApiKey?: boolean;
        };
    }
}
