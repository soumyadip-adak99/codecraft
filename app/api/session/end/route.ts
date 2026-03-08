import { SessionSolvedQuestion } from "@/@types";
import { requireAuth } from "@/lib/auth/withAuth";
import { EmailService } from "@/lib/email/service";
import { generateSessionPDF } from "@/lib/pdf/generator";
import { pushSolutionsToGitHub } from "@/lib/github/push";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { session } = await requireAuth(req);

        const { solvedQuestions = [], sessionId } = (await req.json()) as {
            solvedQuestions: SessionSolvedQuestion[];
            sessionId: string;
        };

        const userName = session.user.name || "Coder";
        const userEmail = session.user.email;

        // ── Push solutions to GitHub (non-fatal) ──────────────────────────────
        // NOTE: Stats (totalSolved, easySolved, etc.) are recorded at code-submit
        // time in /api/code/execute — no double-write needed here.
        let githubCommitUrls: string[] = [];
        let githubRepoUrl: string | undefined;

        if (solvedQuestions.length > 0) {
            try {
                const pushResult = await pushSolutionsToGitHub(
                    userEmail,
                    solvedQuestions.map((q) => ({
                        title:       q.title,
                        description: q.description,
                        code:        q.code,
                        language:    q.language,
                    }))
                );
                githubCommitUrls = pushResult.commitUrls;
                // Use first commit URL's repo portion as repo URL for email
                if (githubCommitUrls.length > 0) {
                    // e.g. https://github.com/user/repo/commit/abc => https://github.com/user/repo
                    githubRepoUrl = githubCommitUrls[0].replace(/\/commit\/[a-f0-9]+$/, "");
                }
                if (pushResult.pushed > 0) {
                    console.log(`[GitHub Push] Pushed ${pushResult.pushed} solutions for ${userEmail}`);
                }
            } catch (ghErr) {
                console.error("[GitHub Push] Non-fatal error:", ghErr);
            }
        }

        // ── Generate PDF + send email ─────────────────────────────────────────
        const sendEmail = async () => {
            try {
                const easySolved   = solvedQuestions.filter((q) => q.difficulty === "Easy").length;
                const mediumSolved = solvedQuestions.filter((q) => q.difficulty === "Medium").length;
                const hardSolved   = solvedQuestions.filter((q) => q.difficulty === "Hard").length;
                const totalSolved  = solvedQuestions.length;

                const pdfBuffer = await generateSessionPDF({
                    userName,
                    sessionId,
                    date: new Date(),
                    totalSolved,
                    easySolved,
                    mediumSolved,
                    hardSolved,
                    solvedQuestions,
                });

                const emailService = new EmailService();
                await emailService.sendSessionReport(
                    userEmail,
                    userName,
                    {
                        totalSolved,
                        easySolved,
                        mediumSolved,
                        hardSolved,
                        solvedQuestions,
                        sessionId,
                    },
                    pdfBuffer,
                    githubRepoUrl  // pass repo URL to email template
                );
            } catch (err) {
                console.error("Session end email error:", err);
                throw err; // Re-throw so client knows email failed and keeps localStorage
            }
        };

        await sendEmail();

        return NextResponse.json({ success: true, githubCommitUrls });
    } catch (error) {
        if (error instanceof NextResponse) return error;
        console.error("Session end error:", error);
        return NextResponse.json(
            { error: "Something went wrong on the server. Please try again later." },
            { status: 500 }
        );
    }
}
