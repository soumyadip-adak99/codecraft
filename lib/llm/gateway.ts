import { ExecutionResult, GeneratedQuestion, LLMConfig, TestCase } from "@/@types";
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
}
