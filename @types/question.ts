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
    _id: string;
    userId: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    description: string;
    constraints: string[];
    examples: QuestionExample[];
    starterCode: StarterCode;
    testCases: TestCase[];
    tags: string[];
    createdAt: number;
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
