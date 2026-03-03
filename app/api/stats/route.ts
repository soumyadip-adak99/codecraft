import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { getGlobalStats } from "@/models/GlobalStats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const [totalUsers, globalStats] = await Promise.all([
      User.countDocuments(),
      getGlobalStats(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalQuestions: globalStats?.totalAIGenerated ?? 0,
      totalSolved: globalStats?.totalSolved ?? 0,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Something went wrong on the server. Please try again later." },
      { status: 500 }
    );
  }
}
