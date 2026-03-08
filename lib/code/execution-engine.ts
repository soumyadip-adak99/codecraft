import { LLMGateway } from "@/lib/llm/gateway";
import { ExecutionResult, TestCase } from "@/@types";

export class CodeExecutionEngine {
    private performStaticAnalysis(code: string): {
        criticalErrors: string[];
        warnings: string[];
    } {
        const dangerousPatterns = [
            { pattern: /child_process/i, msg: "Use of child_process detected" },
            { pattern: /require\s*\(\s*['"]fs['"]\s*\)/i, msg: "File system access detected" },
            { pattern: /process\.exit/i, msg: "process.exit() detected" },
            { pattern: /import\s+os\b/, msg: "OS module import detected (Python)" },
            { pattern: /Runtime\.exec/i, msg: "Runtime.exec() detected (Java)" },
        ];

        const criticalErrors: string[] = [];
        const warnings: string[] = [];

        for (const { pattern, msg } of dangerousPatterns) {
            if (pattern.test(code)) {
                criticalErrors.push(`Security: ${msg}`);
            }
        }

        if (code.length > 50000) {
            warnings.push("Code is unusually long — consider splitting logic");
        }

        return { criticalErrors, warnings };
    }

    async execute(
        code: string,
        language: string,
        testCases: TestCase[],
        description: string,
        userApiKey: string,
        provider: string = "openai"
    ): Promise<ExecutionResult> {
        // Step 1: Static Analysis
        const { criticalErrors } = this.performStaticAnalysis(code);
        if (criticalErrors.length > 0) {
            return {
                status: "COMPILATION_ERROR",
                testCases: [],
                summary: {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    totalExecutionTime: 0,
                    averageMemoryUsed: 0,
                },
                aiAnalysis: {
                    codeQuality: 0,
                    suggestions: criticalErrors,
                    complexity: "N/A",
                    feedback: "Security check failed: " + criticalErrors.join(", "),
                    securityIssues: criticalErrors,
                },
            };
        }

        // Step 2: AI-Powered Evaluation
        const llm = new LLMGateway({
            provider: provider as "openai" | "anthropic" | "google" | "custom",
            apiKey: userApiKey,
        });

        const { testCaseResults, aiAnalysis } = await llm.evaluateCode(
            code,
            language,
            testCases,
            description
        );

        // Step 3: Compute summary
        const passed: number = testCaseResults.filter((r) => r.status === "PASS").length;
        const failed = testCaseResults.filter((r) => r.status !== "PASS").length;
        const total = testCaseResults.length;
        const totalExecutionTime = testCaseResults.reduce(
            (sum, r) => sum + (r.executionTime || 0),
            0
        );
        const averageMemoryUsed =
            total > 0
                ? testCaseResults.reduce((sum, r) => sum + (r.memoryUsed || 0), 0) / total
                : 0;

        const allPass = passed === total && total > 0;
        const hasError = testCaseResults.some((r) => r.status === "ERROR");

        let status: ExecutionResult["status"] = "WRONG_ANSWER";
        if (allPass) status = "ACCEPTED";
        else if (hasError) status = "RUNTIME_ERROR";
        else if (passed === 0) status = "WRONG_ANSWER";

        return {
            status,
            testCases: testCaseResults,
            summary: { total, passed, failed, totalExecutionTime, averageMemoryUsed },
            aiAnalysis: aiAnalysis || {
                codeQuality: 50,
                suggestions: [],
                complexity: "O(n)",
                feedback: "Evaluation complete.",
                securityIssues: [],
            },
        };
    }
}
