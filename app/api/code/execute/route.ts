import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { CodeExecutionEngine } from "@/lib/code/execution-engine";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { incGlobalStats } from "@/models/GlobalStats";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      questionId,
      title,
      difficulty,
      code,
      language,
      testCases, // passed from localStorage — no DB lookup needed
      description,
      apiKey: clientApiKey,
      provider: clientProvider = "groq",
      type = "run",
    } = await req.json();

    if (!questionId || !code || !language || !testCases) {
      return NextResponse.json(
        { error: "questionId, code, language, and testCases are required" },
        { status: 400 }
      );
    }

    // ── Groq default key fallback ──
    let apiKey = clientApiKey?.trim() || "";
    let provider = clientProvider;

    if (!apiKey) {
      const groqKey = process.env.GROQ_API_KEY?.trim();
      if (!groqKey) {
        return NextResponse.json(
          {
            error:
              "LLM not loaded. Session could not be started. Please try again.",
          },
          { status: 503 }
        );
      }
      apiKey = groqKey;
      provider = "groq";
    }

    const engine = new CodeExecutionEngine();
    const results = await engine.execute(
      code,
      language,
      testCases,
      description || "",
      apiKey,
      provider
    );

    const isAccepted = results.status === "ACCEPTED";

    // ── Update DB stats on submit (non-blocking, fast path) ──
    if (type === "submit") {
      connectDB()
        .then(async () => {
          const dbUser = await User.findOne({ email: session.user?.email }).select("_id").lean();
          if (!dbUser) return;

          const diffField =
            difficulty === "Easy"
              ? "stats.easySolved"
              : difficulty === "Hard"
              ? "stats.hardSolved"
              : "stats.mediumSolved";

          const inc: Record<string, number> = { "stats.totalAttempts": 1 };
          if (isAccepted) {
            inc["stats.totalSolved"] = 1;
            inc[diffField] = 1;
          }

          await User.updateOne({ email: session.user?.email }, { $inc: inc });

          if (isAccepted) {
            await incGlobalStats({ totalSolved: 1 });
          }
        })
        .catch((err) => console.error("Stats update error:", err));
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Execution failed";
    console.error("Code execute error:", error);
    return NextResponse.json(
      { error: "Something went wrong on the server. Please try again later." },
      { status: 500 }
    );
  }
}
