export interface SessionSolvedQuestion {
    questionId: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard" | string;
    code: string;
    language: string;
    executionTime: number;
}

export interface ISession {
    _id: string;
    userId: string;
    sessionId: string;
    solvedQuestions: SessionSolvedQuestion[];
    createdAt: number;
}

export interface SessionReportData {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    solvedQuestions: SessionSolvedQuestion[];
    sessionId: string;
}
