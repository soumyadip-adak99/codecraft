export type AttemptStatus =
    | "Accepted"
    | "Wrong Answer"
    | "Time Limit Exceeded"
    | "Runtime Error"
    | "Compilation Error"

export interface ISubmission {
    _id: string;
    userId: string;
    questionId: string;
    code: string;
    language: string;
    status: AttemptStatus;
    executionTime: number;
    submittedAt: number;
}

export interface TestCaseDetail {
    caseId: number;
    status: "PASS" | "FAIL" | "ERROR";
    executionTime: number;
    memoryUsed: number;
    actualOutput?: string;
    expectedOutput?: string;
    input?: string;
    errorMessage?: string;
}

export interface TestCaseResults {
    total: number;
    passed: number;
    failed: number;
    details: TestCaseDetail[];
}

export interface AIAnalysis {
    codeQuality: number;
    suggestions: string[];
    complexity: string;
    spaceComplexity?: string;
    feedback: string;
    securityIssues?: string[];
}

export interface ExecutionResult {
    status:
        | "ACCEPTED"
        | "WRONG_ANSWER"
        | "TIME_LIMIT_EXCEEDED"
        | "RUNTIME_ERROR"
        | "COMPILATION_ERROR";
    testCases: TestCaseDetail[];
    summary: {
        total: number;
        passed: number;
        failed: number;
        totalExecutionTime: number;
        averageMemoryUsed: number;
    };
    aiAnalysis: AIAnalysis;
}
