/** A single column definition in a SQL table schema */
export interface SqlColumn {
    name: string;
    type: string;
    constraints: string;
}

/** A table definition including columns and pre-populated sample data */
export interface SqlTable {
    tableName: string;
    columns: SqlColumn[];
    sampleData: Record<string, unknown>[];
}

/** An example showing expected rows from the schema */
export interface SqlExample {
    description: string;
    expectedRows: Record<string, unknown>[];
}

/** A SQL test case — expected output is row objects, not strings */
export interface SqlTestCase {
    description: string;
    expectedOutput: Record<string, unknown>[];
    isHidden: boolean;
}

/** A fully-generated SQL question from the LLM */
export interface SqlQuestion {
    _id?: string;
    questionId: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    dialect: string;
    description: string;
    schema: SqlTable[];
    constraints: string[];
    examples: SqlExample[];
    testCases: SqlTestCase[];
    tags: string[];
}

/** Per-test-case result for a SQL execution */
export interface SqlTestCaseResult {
    caseId: number;
    status: "PASS" | "FAIL" | "ERROR";
    description: string;
    actualOutput: Record<string, unknown>[];
    expectedOutput: Record<string, unknown>[];
    executionTime: number;
    errorMessage: string | null;
}

/** SQL AI analysis */
export interface SqlAIAnalysis {
    codeQuality: number;
    complexity: string;
    feedback: string;
    suggestions: string[];
    securityIssues: string[];
}

/** Full result from a SQL execution/submission */
export interface SqlExecutionResult {
    status: "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "PARTIAL";
    testCases: SqlTestCaseResult[];
    summary: {
        total: number;
        passed: number;
        failed: number;
        totalExecutionTime: number;
    };
    aiAnalysis: SqlAIAnalysis;
}
