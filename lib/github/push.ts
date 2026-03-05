/**
 * push.ts — Orchestrates pushing CodeCraft solutions to a user's GitHub repository.
 *
 * Called server-side from /api/session/end after the email report is sent.
 * GitHub push failures are NON-FATAL — they are logged and the session ends normally.
 */

import { decryptToken } from "@/lib/github/crypto";
import { pushFile } from "@/lib/github/client";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Repository from "@/models/Repository";

export interface SolutionToPush {
    title: string;
    description?: string;
    code?: string;
    language: string;
}

/** Map display language name → common file extension */
const LANGUAGE_EXTENSION: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python:     "py",
    java:       "java",
    "c++":      "cpp",
    cpp:        "cpp",
    c:          "c",
    go:         "go",
    rust:       "rs",
    kotlin:     "kt",
    swift:      "swift",
    ruby:       "rb",
};

function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

function getExtension(language: string): string {
    return LANGUAGE_EXTENSION[language.toLowerCase()] ?? "txt";
}

function buildQuestionMd(title: string, description?: string): string {
    return [
        `# Problem: ${title}`,
        "",
        description ?? "No description provided.",
        "",
    ].join("\n");
}

export interface PushResult {
    pushed: number;
    commitUrls: string[];
    error?: string;
}

/**
 * Push all solved questions to the user's linked GitHub repository.
 * Returns a summary of what was pushed and any commit URLs.
 */
export async function pushSolutionsToGitHub(
    userEmail: string,
    solutions: SolutionToPush[]
): Promise<PushResult> {
    if (!solutions.length) return { pushed: 0, commitUrls: [] };

    try {
        await connectDB();

        // Fetch user and repo in parallel
        const [dbUser, dbRepo] = await Promise.all([
            User.findOne({ email: userEmail })
                .select("github_access_token github_connected")
                .lean(),
            Repository.findOne({ user_email: userEmail }).lean(),
        ]);

        if (!dbUser || !(dbUser as any).github_connected || !(dbUser as any).github_access_token) {
            return { pushed: 0, commitUrls: [] }; // GitHub not connected — silent skip
        }
        if (!dbRepo) {
            return { pushed: 0, commitUrls: [] }; // No repo linked — silent skip
        }

        const token = decryptToken((dbUser as any).github_access_token);
        const owner = (dbRepo as any).repo_owner as string;
        const repo  = (dbRepo as any).repo_name  as string;

        const commitUrls: string[] = [];
        let pushed = 0;

        for (const solution of solutions) {
            const slug = slugify(solution.title);
            const ext  = getExtension(solution.language);
            const dir  = `coding-solutions/${slug}`;

            try {
                // Push question.md
                const questionContent = buildQuestionMd(solution.title, solution.description);
                await pushFile(
                    token, owner, repo,
                    `${dir}/question.md`,
                    questionContent,
                    `Add question for ${solution.title}`
                );

                // Push solution file
                const solutionContent = solution.code ?? "// No code submitted";
                const result = await pushFile(
                    token, owner, repo,
                    `${dir}/solution.${ext}`,
                    solutionContent,
                    `Add solution for ${solution.title}`
                );

                if (result.html_url) commitUrls.push(result.html_url);
                pushed++;
            } catch (err) {
                console.error(`[GitHub Push] Failed for "${solution.title}":`, err);
            }
        }

        return { pushed, commitUrls };
    } catch (err) {
        console.error("[GitHub Push] Fatal error:", err);
        return {
            pushed: 0,
            commitUrls: [],
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}
