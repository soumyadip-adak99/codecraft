import { SessionSolvedQuestion } from "@/@types";
import { auth } from "@/lib/auth/config";
import { EmailService } from "@/lib/email/service";
import { generateSessionPDF } from "@/lib/pdf/generator";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { solvedQuestions = [], sessionId } = (await req.json()) as {
            solvedQuestions: SessionSolvedQuestion[];
            sessionId: string;
        };

        const userName = session.user.name || "Coder";
        const userEmail = session.user.email;

        // ── Generate PDF + send email ──
        const sendEmail = async () => {
            try {
                const easySolved = solvedQuestions.filter((q) => q.difficulty === "Easy").length;
                const mediumSolved = solvedQuestions.filter(
                    (q) => q.difficulty === "Medium"
                ).length;
                const hardSolved = solvedQuestions.filter((q) => q.difficulty === "Hard").length;
                const totalSolved = solvedQuestions.length;

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
                    pdfBuffer
                );
            } catch (err) {
                console.error("Session end email error:", err);
            }
        };

        // Wait for the email to send before responding
        await sendEmail();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Session end error:", error);
        return NextResponse.json(
            { error: "Something went wrong on the server. Please try again later." },
            { status: 500 }
        );
    }
}
