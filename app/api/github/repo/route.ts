/**
 * /api/github/repo — Create or fetch the user's linked GitHub repository.
 *
 * POST: Creates a new repo via GitHub API and stores metadata in MongoDB.
 * GET:  Returns the stored repository info for the current user.
 */
import { auth } from "@/lib/auth/config";
import { decryptToken } from "@/lib/github/crypto";
import { createRepository } from "@/lib/github/client";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Repository from "@/models/Repository";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ─── GET — fetch existing linked repo ─────────────────────────────────────────
export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const repo = await Repository.findOne({ user_email: session.user.email })
            .select("-_id -__v")
            .lean();
        return NextResponse.json({ repository: repo ?? null });
    } catch (err) {
        console.error("[GitHub Repo GET]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// ─── POST — create a new GitHub repository ───────────────────────────────────
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, name, description, is_private, existingRepo } = (await req.json()) as {
        action?: "create" | "link"; // Defaults to create for backward compatibility
        name?: string;
        description?: string;
        is_private?: boolean;
        existingRepo?: {
            name: string;
            html_url: string;
            owner: { login: string };
            full_name: string;
            private: boolean;
        };
    };

    const isLinkAction = action === "link";

    if (!isLinkAction && !name?.trim()) {
        return NextResponse.json({ error: "Repository name is required." }, { status: 400 });
    }

    if (isLinkAction && !existingRepo) {
         return NextResponse.json({ error: "Existing repository data is required to link." }, { status: 400 });
    }

    try {
        await connectDB();

        // Verify GitHub is connected and grab the encrypted token
        const dbUser = await User.findOne({ email: session.user.email })
            .select("github_access_token github_connected")
            .lean();

        if (!(dbUser as any)?.github_connected || !(dbUser as any)?.github_access_token) {
            return NextResponse.json(
                { error: "GitHub account is not connected." },
                { status: 400 }
            );
        }

        let ghRepoRecord = {
            name: existingRepo?.name || "",
            html_url: existingRepo?.html_url || "",
            owner: { login: existingRepo?.owner?.login || "" },
            full_name: existingRepo?.full_name || "",
            private: existingRepo?.private || false,
        };

        if (!isLinkAction) {
            const token = decryptToken((dbUser as any).github_access_token);

            // Create repo on GitHub
            const createdGhRepo = await createRepository(token, {
                name: name!.trim(),
                description: description?.trim(),
                private: is_private ?? false,
                auto_init: true,
            });

            ghRepoRecord = {
                 name: createdGhRepo.name,
                 html_url: createdGhRepo.html_url,
                 owner: { login: createdGhRepo.owner.login },
                 full_name: createdGhRepo.full_name,
                 private: createdGhRepo.private,
            }
        }


        // Upsert repository record in MongoDB (one repo per user)
        const repoDoc = await Repository.findOneAndUpdate(
            { user_email: session.user.email },
            {
                $set: {
                    repo_name:  ghRepoRecord.name,
                    repo_url:   ghRepoRecord.html_url,
                    repo_owner: ghRepoRecord.owner.login,
                    full_name:  ghRepoRecord.full_name,
                    is_private: ghRepoRecord.private,
                },
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            repository: {
                name:      repoDoc.repo_name,
                url:       repoDoc.repo_url,
                owner:     repoDoc.repo_owner,
                full_name: repoDoc.full_name,
                is_private:repoDoc.is_private,
            },
        });
    } catch (err) {
        console.error("[GitHub Repo POST]", err);
        const message = err instanceof Error ? err.message : "Server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
