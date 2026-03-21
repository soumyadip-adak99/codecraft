import { ExecutionResult, GeneratedQuestion, LLMConfig, TestCase, SqlQuestion, SqlExecutionResult } from "@/@types";
import OpenAI from "openai";

export class LLMGateway {
    public config: LLMConfig;

    constructor(config: LLMConfig) {
        this.config = config;
    }

    private getOpenAIClient(): OpenAI {
        return new OpenAI({
            apiKey: this.config.apiKey,
            baseURL: this.config.baseURL,
        });
    }

    private getGroqClient(): OpenAI {
        return new OpenAI({
            apiKey: this.config.apiKey,
            baseURL: "https://api.groq.com/openai/v1",
        });
    }

    private async resolveGoogleModel(): Promise<string> {
        if (this.config.model) return this.config.model;
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${this.config.apiKey}`
            );
            if (response.ok) {
                const data = await response.json();
                const available = data.models
                    .filter((m: { name: string; supportedGenerationMethods?: string[] }) =>
                        m.supportedGenerationMethods?.includes("generateContent")
                    )
                    .map((m: { name: string; supportedGenerationMethods?: string[] }) =>
                        m.name.replace("models/", "")
                    );

                const preferred = [
                    "gemini-1.5-flash-latest",
                    "gemini-1.5-flash",
                    "gemini-1.5-pro",
                    "gemini-1.0-pro",
                    "gemini-pro",
                ];
                for (const p of preferred) {
                    if (available.includes(p)) return p;
                }
            }
        } catch (e) {
            console.warn("Failed to resolve Google models, using fallback.", e);
        }
        return "models/gemini-2.5-flash";
    }

    private async resolveOpenAIModel(): Promise<string> {
        if (this.config.model) return this.config.model;
        try {
            const client = this.getOpenAIClient();
            const response = await client.models.list();
            const available = response.data.map((m) => m.id);

            const preferred = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"];
            for (const p of preferred) {
                if (available.includes(p)) return p;
            }
        } catch (e) {
            console.warn("Failed to resolve OpenAI models, using fallback.", e);
        }
        return "gpt-4o-mini";
    }

    private async resolveAnthropicModel(): Promise<string> {
        if (this.config.model) return this.config.model;
        try {
            const response = await fetch("https://api.anthropic.com/v1/models", {
                headers: {
                    "x-api-key": this.config.apiKey,
                    "anthropic-version": "2023-06-01",
                },
            });
            if (response.ok) {
                const data = await response.json();
                const available = data.data.map((m: { id: string }) => m.id);

                const preferred = [
                    "claude-3-5-sonnet-20240620",
                    "claude-3-haiku-20240307",
                    "claude-3-sonnet-20240229",
                    "claude-3-opus-20240229",
                ];
                for (const p of preferred) {
                    if (available.includes(p)) return p;
                }
            }
        } catch (e) {
            console.warn("Failed to resolve Anthropic models, using fallback.", e);
        }
        return "claude-3-haiku-20240307";
    }

    private async getResolvedModel(): Promise<string> {
        switch (this.config.provider) {
            case "google":
                return await this.resolveGoogleModel();
            case "anthropic":
                return await this.resolveAnthropicModel();
            case "groq":
                return this.config.model || "llama-3.3-70b-versatile";
            case "openai":
            default:
                return await this.resolveOpenAIModel();
        }
    }

    private buildQuestionPrompt(
        difficulty: string,
        topic?: string,
        usedQuestionIds: string[] = []
    ): string {
        const avoidNote =
            usedQuestionIds.length > 0
                ? `\nIMPORTANT: This question is part of an ongoing session. Generate a DIFFERENT question from the ones already generated (session has ${usedQuestionIds.length} previous question(s)). Do NOT repeat the same problem type or algorithm.\n`
                : "";
        return `Generate a ${difficulty} coding interview question${topic ? ` about ${topic}` : ""}.${avoidNote}

IMPORTANT: Return ONLY a valid JSON object, no markdown, no explanation text.

Requirements:
- Title: Concise, descriptive (max 10 words)
- Description: Clear problem statement with context
- Constraints: 3-5 input limits and edge cases
- 3 Examples: input, output, explanation
- 5 Test Cases: 2 visible (isHidden: false), 3 hidden (isHidden: true)
- Tags: 2-4 relevant topic tags

RULES:
- Must be completely new
- Different algorithm
- Different logic
- Return ONLY valid JSON
- No markdown
- No explanation

Return this exact JSON structure:
{
  "title": "Problem Title Here",
  "difficulty": "${difficulty}",
  "description": "Full problem description here...",
  "constraints": ["1 <= n <= 10^5", "Input is always valid"],
  "examples": [
    {"input": "nums = [1,2,3]", "output": "6", "explanation": "Sum is 1+2+3=6"}
  ],
  "starterCode": {
    "javascript": "/**\\n * @param {number[]} nums\\n * @return {number}\\n */\\nfunction solve(nums) {\\n  // Write your solution here\\n};",
    "typescript": "function solve(nums: number[]): number {\\n  // Write your solution here\\n};",
    "python": "def solve(nums: list) -> int:\\n    # Write your solution here\\n    pass",
    "java": "class Solution {\\n    public int solve(int[] nums) {\\n        // Write your solution here\\n        return 0;\\n    }\\n}",
    "cpp": "#include <vector>\\nusing namespace std;\\n\\nclass Solution {\\npublic:\\n    int solve(vector<int>& nums) {\\n        // Write your solution here\\n        return 0;\\n    }\\n};"
  },
  "testCases": [
    {"input": "[1,2,3]", "expectedOutput": "6", "isHidden": false},
    {"input": "[0]", "expectedOutput": "0", "isHidden": false},
    {"input": "[-1,-2,3]", "expectedOutput": "0", "isHidden": true},
    {"input": "[100,200,300]", "expectedOutput": "600", "isHidden": true},
    {"input": "[]", "expectedOutput": "0", "isHidden": true}
  ],
  "tags": ["arrays", "math"]
}`;
    }

    private buildEvaluationPrompt(
        code: string,
        language: string,
        testCases: TestCase[],
        description: string
    ): string {
        return `You are a code judge. Evaluate the following ${language} code against the given test cases for this problem.

PROBLEM: ${description}

CODE:
\`\`\`${language}
${code}
\`\`\`

TEST CASES:
${JSON.stringify(testCases, null, 2)}

Analyze the code carefully and determine the expected output for each test case based on what the code actually does.

Return ONLY a valid JSON object in this exact format:
{
  "testCaseResults": [
    {
      "caseId": 0,
      "status": "PASS",
      "input": "test input here",
      "actualOutput": "actual output",
      "expectedOutput": "expected output",
      "executionTime": 45,
      "memoryUsed": 2.1,
      "errorMessage": null
    }
  ],
  "aiAnalysis": {
    "codeQuality": 85,
    "complexity": "O(n)",
    "spaceComplexity": "O(1)",
    "feedback": "Your solution is efficient and readable. Consider edge cases for empty arrays.",
    "suggestions": ["Add comments to explain logic", "Handle edge case when input is empty"],
    "securityIssues": []
  }
}`;
    }

    private async sendOpenAIRequest(prompt: string): Promise<string> {
        const client = this.getOpenAIClient();
        const modelName = await this.getResolvedModel();

        const response = await client.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 3000,
        });
        return response.choices[0]?.message?.content || "";
    }

    private async sendAnthropicRequest(prompt: string): Promise<string> {
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey: this.config.apiKey });
        const modelName = await this.getResolvedModel();

        const response = await client.messages.create({
            model: modelName,
            max_tokens: 3000,
            messages: [{ role: "user", content: prompt }],
        });

        const block = response.content[0];
        return block.type === "text" ? block.text : "";
    }

    private async sendGoogleRequest(prompt: string): Promise<string> {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");

        const genAI = new GoogleGenerativeAI(this.config.apiKey);
        const modelName = await this.getResolvedModel();

        const model = genAI.getGenerativeModel({
            model: modelName,
        });

        const result = await model.generateContent(prompt);

        return result.response.text();
    }

    private async sendGroqRequest(prompt: string): Promise<string> {
        const client = this.getGroqClient();
        const modelName = await this.getResolvedModel();
        const response = await client.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 3000,
        });
        return response.choices[0]?.message?.content || "";
    }

    private async sendRequest(prompt: string): Promise<string> {
        try {
            switch (this.config.provider) {
                case "anthropic":
                    return await this.sendAnthropicRequest(prompt);
                case "google":
                    return await this.sendGoogleRequest(prompt);
                case "groq":
                    return await this.sendGroqRequest(prompt);
                case "openai":
                case "custom":
                default:
                    return await this.sendOpenAIRequest(prompt);
            }
        } catch (err) {
            console.error("LLM Error:", err);
            throw new Error("LLM request failed");
        }
    }

    private parseJSON<T>(text: string): T {
        try {
            // 1. Remove markdown code blocks if present
            let cleanText = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

            // 2. Find the first '{' and last '}'
            const startIdx = cleanText.indexOf("{");
            const endIdx = cleanText.lastIndexOf("}");

            if (startIdx === -1 || endIdx === -1) {
                throw new Error("No JSON object found in response");
            }

            cleanText = cleanText.substring(startIdx, endIdx + 1);

            return JSON.parse(cleanText) as T;
        } catch (err) {
            console.error("Failed to parse JSON from LLM response:", text);
            throw err;
        }
    }

    async generateQuestion(
        difficulty: string,
        topic?: string,
        usedQuestionIds: string[] = []
    ): Promise<GeneratedQuestion> {
        const prompt = this.buildQuestionPrompt(difficulty, topic, usedQuestionIds);
        const raw = await this.sendRequest(prompt);
        return this.parseJSON<GeneratedQuestion>(raw);
    }

    async evaluateCode(
        code: string,
        language: string,
        testCases: TestCase[],
        description: string
    ): Promise<{
        testCaseResults: ExecutionResult["testCases"];
        aiAnalysis: ExecutionResult["aiAnalysis"];
    }> {
        const prompt = this.buildEvaluationPrompt(code, language, testCases, description);
        const raw = await this.sendRequest(prompt);
        return this.parseJSON(raw);
    }

    // ── SQL Methods ──────────────────────────────────────────────────────────

    private buildSQLQuestionPrompt(
        dialect: string,
        difficulty: string,
        topic?: string,
        usedQuestionIds: string[] = []
    ): string {
        const avoidNote =
            usedQuestionIds.length > 0
                ? `\nIMPORTANT: This is part of an ongoing SQL session. Generate a DIFFERENT question from the ${usedQuestionIds.length} already seen. Use a different scenario.\n`
                : "";
        const dialectNote = dialect === "oracle" ? "Use Oracle SQL syntax (use ROWNUM for limiting, not LIMIT)." :
            dialect === "sqlite" ? "Use SQLite syntax (lightweight, no stored procedures)." :
            dialect === "postgresql" ? "Use PostgreSQL syntax (support CTEs, window functions when relevant)." :
            "Use MySQL syntax.";

        return `Generate a ${difficulty} SQL interview question for ${dialect.toUpperCase()}.${avoidNote}
${dialectNote}

IMPORTANT: Return ONLY a single valid JSON object, no markdown, no explanation text.

Requirements:
- Title: concise, descriptive (max 10 words)
- Include 1-3 schema tables with realistic columns and data types matching the dialect
- Each table must have 4-6 rows of sample data
- 2 visible test cases + 3 hidden test cases
- Expected output for each test case is an array of row objects (column:value)
- Tags: 2-4 SQL concept tags (e.g. "JOIN", "GROUP BY", "subquery")

RULES:
- The SQL question must be solvable with a single SELECT statement (or subquery)
- Do NOT include DDL/DML questions (no INSERT/UPDATE/DELETE/CREATE)
- Must be completely new — different scenario from any typical SQL 101 example
- Return ONLY valid JSON, no markdown, no explanation

Return this EXACT JSON structure:
{
  "title": "Find Top Earning Employees per Department",
  "difficulty": "${difficulty}",
  "dialect": "${dialect}",
  "description": "Given the Employees and Departments tables, write a SQL query to find the employee with the highest salary in each department. Return the department name, employee name, and salary.",
  "schema": [
    {
      "tableName": "employees",
      "columns": [
        {"name": "id", "type": "INT", "constraints": "PRIMARY KEY"},
        {"name": "name", "type": "VARCHAR(100)", "constraints": "NOT NULL"},
        {"name": "salary", "type": "DECIMAL(10,2)", "constraints": ""},
        {"name": "dept_id", "type": "INT", "constraints": "FOREIGN KEY"}
      ],
      "sampleData": [
        {"id": 1, "name": "Alice", "salary": 90000, "dept_id": 1},
        {"id": 2, "name": "Bob", "salary": 85000, "dept_id": 1},
        {"id": 3, "name": "Carol", "salary": 95000, "dept_id": 2},
        {"id": 4, "name": "Dave", "salary": 70000, "dept_id": 2}
      ]
    },
    {
      "tableName": "departments",
      "columns": [
        {"name": "id", "type": "INT", "constraints": "PRIMARY KEY"},
        {"name": "name", "type": "VARCHAR(100)", "constraints": "NOT NULL"}
      ],
      "sampleData": [
        {"id": 1, "name": "Engineering"},
        {"id": 2, "name": "Marketing"}
      ]
    }
  ],
  "constraints": ["Each department has at least one employee", "Salaries are positive values"],
  "examples": [
    {
      "description": "For the sample data above",
      "expectedRows": [
        {"department": "Engineering", "employee": "Alice", "salary": 90000},
        {"department": "Marketing", "employee": "Carol", "salary": 95000}
      ]
    }
  ],
  "testCases": [
    {
      "description": "Basic visible test",
      "expectedOutput": [{"department": "Engineering", "employee": "Alice", "salary": 90000}],
      "isHidden": false
    },
    {
      "description": "Multiple departments visible",
      "expectedOutput": [{"department": "Engineering", "employee": "Alice", "salary": 90000}, {"department": "Marketing", "employee": "Carol", "salary": 95000}],
      "isHidden": false
    },
    {
      "description": "Hidden test 1",
      "expectedOutput": [{"department": "Engineering", "employee": "Alice", "salary": 90000}],
      "isHidden": true
    },
    {
      "description": "Hidden test 2",
      "expectedOutput": [],
      "isHidden": true
    },
    {
      "description": "Hidden test 3",
      "expectedOutput": [{"department": "Marketing", "employee": "Carol", "salary": 95000}],
      "isHidden": true
    }
  ],
  "tags": ["JOIN", "GROUP BY", "aggregation"]
}`;
    }

    private buildSQLEvaluationPrompt(
        sql: string,
        dialect: string,
        question: SqlQuestion,
        testCases: SqlQuestion["testCases"]
    ): string {
        return `You are a SQL judge. Evaluate the following ${dialect.toUpperCase()} query for this SQL problem.

PROBLEM: ${question.description}

DIALECT: ${dialect.toUpperCase()}

SCHEMA & SAMPLE DATA:
${JSON.stringify(question.schema, null, 2)}

USER'S SQL QUERY:
\`\`\`sql
${sql}
\`\`\`

TEST CASES TO EVALUATE:
${JSON.stringify(testCases, null, 2)}

Carefully analyze the SQL query logic against the provided schema and sample data. Simulate execution mentally.
For each test case, determine if the query would produce rows matching the expectedOutput (column names and values must match, order does not matter unless ORDER BY is in the query).

Return ONLY valid JSON in this exact format:
{
  "testCaseResults": [
    {
      "caseId": 0,
      "status": "PASS",
      "description": "Basic visible test",
      "actualOutput": [{"department": "Engineering", "employee": "Alice", "salary": 90000}],
      "expectedOutput": [{"department": "Engineering", "employee": "Alice", "salary": 90000}],
      "executionTime": 12,
      "errorMessage": null
    }
  ],
  "aiAnalysis": {
    "codeQuality": 82,
    "complexity": "O(n log n)",
    "feedback": "Your query correctly uses JOIN and GROUP BY. Consider adding an index on dept_id for better performance in production.",
    "suggestions": ["Use table aliases for readability", "Consider a CTE for complex subqueries"],
    "securityIssues": []
  }
}`;
    }

    async generateSQLQuestion(
        dialect: string,
        difficulty: string,
        topic?: string,
        usedQuestionIds: string[] = []
    ): Promise<SqlQuestion> {
        const prompt = this.buildSQLQuestionPrompt(dialect, difficulty, topic, usedQuestionIds);
        const raw = await this.sendRequest(prompt);
        return this.parseJSON<SqlQuestion>(raw);
    }

    async evaluateSQL(
        sql: string,
        dialect: string,
        question: SqlQuestion,
        testCases: SqlQuestion["testCases"]
    ): Promise<{
        testCaseResults: SqlExecutionResult["testCases"];
        aiAnalysis: SqlExecutionResult["aiAnalysis"];
    }> {
        const prompt = this.buildSQLEvaluationPrompt(sql, dialect, question, testCases);
        const raw = await this.sendRequest(prompt);
        return this.parseJSON(raw);
    }
}
