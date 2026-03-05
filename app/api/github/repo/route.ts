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

    const { name, description, is_private } = (await req.json()) as {
        name: string;
        description?: string;
        is_private?: boolean;
    };

    if (!name?.trim()) {
        return NextResponse.json({ error: "Repository name is required." }, { status: 400 });
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

        const token = decryptToken((dbUser as any).github_access_token);

        // Create repo on GitHub
        const ghRepo = await createRepository(token, {
            name: name.trim(),
            description: description?.trim(),
            private: is_private ?? false,
            auto_init: true,
        });

        // Upsert repository record in MongoDB (one repo per user)
        const repoDoc = await Repository.findOneAndUpdate(
            { user_email: session.user.email },
            {
                $set: {
                    repo_name:  ghRepo.name,
                    repo_url:   ghRepo.html_url,
                    repo_owner: ghRepo.owner.login,
                    full_name:  ghRepo.full_name,
                    is_private: ghRepo.private,
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
