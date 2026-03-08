/**
 * sessionStorage.ts
 *
 * Typed helpers for storing coding-session submissions in browser localStorage.
 *
 * Data model:
 *   Key   : `cc-sub-<uuid>`            (one key per submitted solution)
 *   Value : JSON of LocalSubmission
 *
 * Goal:
 *   • Keep full submission data (including source code) ONLY in the browser.
 *   • Convex never receives source code.
 *   • All keys for the current session are cleared after the email report is sent.
 */

import { v4 as uuidv4 } from "uuid";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocalSubmission {
    /** Unique ID for this submission (UUID) */
    submissionId: string;
    /** ID of the coding session this belongs to */
    sessionId: string;
    /** Problem / question identifier */
    problemId: string;
    /** Display title of the problem */
    title: string;
    /** Difficulty label */
    difficulty: "Easy" | "Medium" | "Hard";
    /** The actual source code submitted */
    submittedCode: string;
    /** Programming language used */
    language: string;
    /** Total execution time in ms */
    executionTime: number;
    /** Problem description (used for email report body) */
    description: string;
    /** ISO timestamp of the submission */
    timestamp: string;
}

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------

const SUB_PREFIX = "cc-sub-";

function submissionKey(submissionId: string): string {
    return `${SUB_PREFIX}${submissionId}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Save a successful submission to localStorage.
 * Returns the generated submissionId so callers can reference it later.
 */
export function saveSubmission(
    data: Omit<LocalSubmission, "submissionId" | "timestamp">
): string {
    if (typeof window === "undefined") return "";

    const submissionId = uuidv4();
    const entry: LocalSubmission = {
        ...data,
        submissionId,
        timestamp: new Date().toISOString(),
    };

    try {
        localStorage.setItem(submissionKey(submissionId), JSON.stringify(entry));
    } catch (err) {
        // Quota exceeded or private-browsing restriction — swallow silently
        console.warn("[sessionStorage] Could not save submission:", err);
    }

    return submissionId;
}

/**
 * Retrieve all submissions belonging to a specific session from localStorage.
 * Returns an empty array if none are found or when called server-side.
 */
export function getSessionSubmissions(sessionId: string): LocalSubmission[] {
    if (typeof window === "undefined") return [];

    const results: LocalSubmission[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(SUB_PREFIX)) continue;

        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const entry: LocalSubmission = JSON.parse(raw);
            if (entry.sessionId === sessionId) {
                results.push(entry);
            }
        } catch {
            // Malformed entry — skip
        }
    }

    // Sort by timestamp ascending so the email report lists problems in order
    return results.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}

/**
 * Convert localStorage submissions for a session into the SessionSolvedQuestion
 * shape that the email API and PDF generator expect.
 */
export function getSessionSolvedList(
    sessionId: string
): Array<{
    questionId: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    code: string;
    language: string;
    executionTime: number;
    description: string;
}> {
    return getSessionSubmissions(sessionId).map((sub) => ({
        questionId: sub.problemId,
        title: sub.title,
        difficulty: sub.difficulty,
        code: sub.submittedCode,
        language: sub.language,
        executionTime: sub.executionTime,
        description: sub.description,
    }));
}

/**
 * Delete all submission keys belonging to a session.
 * Call this ONLY after the email report has been confirmed sent.
 */
export function clearSessionSubmissions(sessionId: string): void {
    if (typeof window === "undefined") return;

    // Collect keys first — modifying localStorage while iterating is unsafe
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(SUB_PREFIX)) continue;

        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const entry: LocalSubmission = JSON.parse(raw);
            if (entry.sessionId === sessionId) {
                keysToRemove.push(key);
            }
        } catch {
            // Malformed — remove it anyway
            keysToRemove.push(key!);
        }
    }

    for (const key of keysToRemove) {
        localStorage.removeItem(key);
    }
}

/**
 * Check whether any submissions for a given session exist in localStorage.
 * Useful to quickly determine if there's session data worth sending.
 */
export function hasSessionSubmissions(sessionId: string): boolean {
    if (typeof window === "undefined") return false;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(SUB_PREFIX)) continue;

        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const entry: LocalSubmission = JSON.parse(raw);
            if (entry.sessionId === sessionId) return true;
        } catch {
            /* skip */
        }
    }

    return false;
}
