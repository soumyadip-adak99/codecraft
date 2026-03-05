/**
 * client.ts — Server-only GitHub REST API helpers.
 * Never import this file from client components.
 *
 * All functions take a decrypted access token — decryption happens in callers.
 */

export interface CreateRepoOptions {
    name: string;
    description?: string;
    private?: boolean;
    auto_init?: boolean;
}

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    private: boolean;
    owner: { login: string };
    created_at: string;
}

export interface GitHubUser {
    id: number;
    login: string;
    email: string | null;
    avatar_url: string;
}

export interface FileContentResponse {
    content: { sha: string } | null;
}

// ─── GitHub base URL ──────────────────────────────────────────────────────────

const GITHUB_API = "https://api.github.com";

function headers(token: string) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
    };
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getGitHubUser(token: string): Promise<GitHubUser> {
    const res = await fetch(`${GITHUB_API}/user`, {
        headers: headers(token),
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`GitHub /user failed: ${res.status}`);
    return res.json();
}

// ─── Repository ───────────────────────────────────────────────────────────────

/**
 * Create a new repository in the authenticated user's account.
 * Uses auto_init=true so the repo has an initial commit (needed for file pushes).
 */
export async function createRepository(
    token: string,
    options: CreateRepoOptions
): Promise<GitHubRepo> {
    const body = {
        name: options.name,
        description: options.description ?? "",
        private: options.private ?? false,
        auto_init: options.auto_init ?? true, // creates an initial README commit
    };

    const res = await fetch(`${GITHUB_API}/user/repos`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(body),
        cache: "no-store",
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
            (err as any).message ?? `GitHub create repo failed: ${res.status}`
        );
    }
    return res.json();
}

/**
 * List the authenticated user's repos (first 100, sorted by pushed).
 */
export async function getUserRepos(token: string): Promise<GitHubRepo[]> {
    const res = await fetch(
        `${GITHUB_API}/user/repos?per_page=100&sort=pushed&affiliation=owner`,
        { headers: headers(token), cache: "no-store" }
    );
    if (!res.ok) throw new Error(`GitHub list repos failed: ${res.status}`);
    return res.json();
}

// ─── File / Content ───────────────────────────────────────────────────────────

/**
 * Get existing file SHA (needed to update a file that already exists).
 * Returns null if the file does not exist.
 */
async function getFileSha(
    token: string,
    owner: string,
    repo: string,
    path: string
): Promise<string | null> {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
        headers: headers(token),
        cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const data = await res.json();
    return (data as any).sha ?? null;
}

/**
 * Push (create or update) a single file in a GitHub repository.
 * `content` should be the raw string content — encoding to Base64 happens here.
 */
export async function pushFile(
    token: string,
    owner: string,
    repo: string,
    path: string,
    content: string,
    commitMessage: string
): Promise<{ html_url: string }> {
    const sha = await getFileSha(token, owner, repo, path);
    const base64Content = Buffer.from(content, "utf8").toString("base64");

    const body: Record<string, unknown> = {
        message: commitMessage,
        content: base64Content,
    };
    if (sha) body.sha = sha; // required when updating existing file

    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
        method: "PUT",
        headers: headers(token),
        body: JSON.stringify(body),
        cache: "no-store",
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
            (err as any).message ?? `GitHub push file failed: ${res.status}`
        );
    }

    const data = await res.json();
    // Return the HTML URL of the commit
    return { html_url: (data as any).commit?.html_url ?? "" };
}
