export interface UserStats {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalAttempts: number;
}

/** Slim MongoDB user — only email + image (+ llmApiKey kept as exception) */
export interface IUser {
    _id: string;
    email: string;
    image?: string;
}
