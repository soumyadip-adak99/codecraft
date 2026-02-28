import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { EmailService } from "@/lib/email/service";
import { generateSessionPDF } from "@/lib/pdf/generator";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export interface SessionSolvedQuestion {
  questionId: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  code: string;
  language: string;
  executionTime: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { solvedQuestions = [], sessionId } = await req.json() as {
      solvedQuestions: SessionSolvedQuestion[];
      sessionId: string;
    };

    const userName = session.user.name || "Coder";
    const userEmail = session.user.email;

    // ── Fire-and-forget email with PDF (runs async after response) ──
    const sendEmail = async () => {
      try {
        await connectDB();
        const user = await User.findOne({ email: userEmail }).lean();
        
        const stats = (user as any)?.stats ?? {};
        const easySolved = solvedQuestions.filter((q) => q.difficulty === "Easy").length;
        const mediumSolved = solvedQuestions.filter((q) => q.difficulty === "Medium").length;
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
        await emailService.sendSessionReport(userEmail, userName, {
          totalSolved,
          easySolved,
          mediumSolved,
          hardSolved,
          solvedQuestions,
          sessionId,
        }, pdfBuffer);
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
