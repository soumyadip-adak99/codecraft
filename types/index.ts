import { ObjectId } from "mongoose";

export interface UserStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalAttempts: number;
}

export interface IUser {
  _id: ObjectId;
  email: string;
  name: string;
  image?: string;
  googleId?: string;
  llmApiKey?: string;
  preferredModel?: string;
  stats: UserStats;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface StarterCode {
  javascript: string;
  typescript: string;
  python: string;
  java: string;
  cpp: string;
}

export interface IQuestion {
  _id: ObjectId;
  questionId: string;
  userId: ObjectId;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  constraints: string[];
  examples: QuestionExample[];
  starterCode: StarterCode;
  testCases: TestCase[];
  tags: string[];
  generatedBy: string;
  generationPrompt: string;
  createdAt: Date;
  usageCount: number;
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

export type AttemptStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Time Limit Exceeded"
  | "Runtime Error"
  | "Compilation Error"
  | "In Progress";

export interface IAttempt {
  _id: ObjectId;
  userId: ObjectId;
  questionId: string;
  code: string;
  language: string;
  status: AttemptStatus;
  testCaseResults: TestCaseResults;
  aiAnalysis?: AIAnalysis;
  executionTime: number;
  submittedAt: Date;
}

export interface IReview {
  _id: ObjectId;
  userId: ObjectId;
  userName: string;
  userImage?: string;
  rating: number;
  review: string;
  tags: string[];
  isVisible: boolean;
  helpfulCount: number;
  createdAt: Date;
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

export type LLMProvider = "openai" | "anthropic" | "google" | "groq" | "custom";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  baseURL?: string;
}

export interface GeneratedQuestion {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  constraints: string[];
  examples: QuestionExample[];
  starterCode: StarterCode;
  testCases: TestCase[];
  tags: string[];
}

export interface PlatformStats {
  totalUsers: number;
  totalQuestions: number;
  totalSolved: number;
}

// NextAuth session extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      stats?: UserStats;
      hasApiKey?: boolean;
    };
  }
}
