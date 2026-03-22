"use client";

import { UserStats } from "@/@types";
import { SessionProgressModal } from "@/components/challenge/SessionProgressModal";
import { DailyActivity } from "@/components/dashboard/ContributionTracker";
import { ReviewModal } from "@/components/dashboard/ReviewModal";
import { GitHubDashboardBanner } from "@/components/github/GitHubDashboardBanner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/store";
import { useChallengeStore } from "@/store/challengeStore";
import { useSqlStore } from "@/store/sqlStore";
import { useMutation, useQuery } from "convex/react";
import {
    ArrowRight,
    BarChart2,
    BookOpen,
    Database,
    Flame,
    MessageSquarePlus,
    Star,
    Target,
    Trophy,
    Zap,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";

export default function DashboardPage() {
    const { data: session } = useAuth();
    const { openChallengeModal, openSqlModal, openModeModal } = useUIStore();
    const { sessionActive, solvedQuestions, currentQuestion } = useChallengeStore();
    const { sqlSessionActive, currentSqlQuestion } = useSqlStore();
    const backfill = useMutation(api.userStatus.backfillDailyActivity);
    const backfillRan = useRef(false);

    // Backfill existing users' historical data once per session load
    useEffect(() => {
        if (session?.user?.email && !backfillRan.current) {
            backfillRan.current = true;
            backfill().catch(() => { /* silent — idempotent */ });
        }
    }, [session?.user?.email, backfill]);

    // ── Real-time user stats from Convex ──
    const userStatus = useQuery(
        api.userStatus.getByEmail,
        session?.user?.email ? { email: session.user.email } : "skip"
    );

    const loading = userStatus === undefined;
    const stats: UserStats | null = userStatus
        ? {
            totalSolved: userStatus.totalSolved,
            easySolved: userStatus.easySolved,
            mediumSolved: userStatus.mediumSolved,
            hardSolved: userStatus.hardSolved,
            totalAttempts: userStatus.totalAttempts,
        }
        : null;

    const dashBoardContent = [
        {
            icon: Trophy,
            label: "Total Solved",
            value: stats?.totalSolved ?? 0,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            icon: BookOpen,
            label: "Easy Solved",
            value: stats?.easySolved ?? 0,
            color: "text-green-400",
            bg: "bg-green-500/10",
        },
        {
            icon: BarChart2,
            label: "Medium Solved",
            value: stats?.mediumSolved ?? 0,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
        },
        {
            icon: Flame,
            label: "Hard Solved",
            value: stats?.hardSolved ?? 0,
            color: "text-red-400",
            bg: "bg-red-500/10",
        },
        {
            icon: Target,
            label: "Total Attempts",
            value: stats?.totalAttempts ?? 0,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
        },
    ];

    const [showReviewModal, setShowReviewModal] = useState(false);

    return (
        <div className="min-h-screen bg-black">
            {/* Session progress modal — shown when user navigated back from /challenge */}
            <SessionProgressModal />

            {/* Floating review modal */}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                userName={session?.user?.name ?? ""}
                userEmail={session?.user?.email ?? ""}
                userImageUrl={session?.user?.image}
            />

            <div className="max-w-5xl mx-auto px-4 py-10">
                {/* Welcome */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white">
                            {loading
                                ? "Welcome"
                                : !stats || (stats.totalAttempts === 0 && stats.totalSolved === 0)
                                    ? "Welcome"
                                    : "Welcome back"}{" "}
                            <span className="text-orange-500">
                                {session?.user?.name?.split(" ")[0]}
                            </span>{" "}
                            👋
                        </h1>
                        <p className="text-zinc-500 mt-1">
                            {sessionActive
                                ? `Active session — ${solvedQuestions.length} problem${solvedQuestions.length !== 1 ? "s" : ""} solved so far`
                                : "Start a session to get AI-generated challenges"}
                        </p>
                    </div>
                    <Button
                        onClick={openModeModal}
                        className="bg-orange-500 hover:bg-orange-400 text-white gap-2 shadow-lg shadow-orange-500/20 self-start sm:self-auto cursor-pointer"
                    >
                        <Zap className="h-4 w-4" />
                        {sessionActive ? "New Question" : "Start Session"}
                    </Button>
                </div>

                {/* GitHub Status nudge */}
                <GitHubDashboardBanner />

                {/* Active session banner */}
                {sessionActive && currentQuestion && (
                    <Link
                        href={`/challenge/${currentQuestion.questionId}`}
                        className="mb-6 flex items-center gap-3 glass rounded-2xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-colors px-5 py-4 cursor-pointer group"
                    >
                        <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-orange-300 group-hover:text-orange-400 transition-colors">
                                Session in progress
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                {solvedQuestions.length} question
                                {solvedQuestions.length !== 1 ? "s" : ""} solved — click to
                                continue or end the session
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-orange-500/50 group-hover:text-orange-500 group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                )}

                {/* Active SQL session banner */}
                {sqlSessionActive && currentSqlQuestion && (
                    <Link
                        href={`/sql`}
                        className="mb-6 flex items-center gap-3 glass rounded-2xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors px-5 py-4 cursor-pointer group"
                    >
                        <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-cyan-300 group-hover:text-cyan-400 transition-colors">
                                SQL Session in progress
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Click to continue or end your active database session
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-cyan-500/50 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                    {dashBoardContent.map(({ icon: Icon, label, value, color, bg }) => (
                        <div
                            key={label}
                            className="bg-white/10 rounded-2xl p-5 border border-white/10 shadow-2xl shadow-white/5"
                        >
                            {loading ? (
                                <>
                                    <Skeleton className="h-10 w-10 rounded-xl mb-3 bg-white/5" />
                                    <Skeleton className="h-6 w-16 mb-1.5 bg-white/5" />
                                    <Skeleton className="h-4 w-24 bg-white/5" />
                                </>
                            ) : (
                                <>
                                    <div
                                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}
                                    >
                                        <Icon className={`h-5 w-5 ${color}`} />
                                    </div>
                                    <p className="text-2xl font-black text-white">{value}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Empty state when no stats */}
                {!loading && stats?.totalSolved === 0 && (
                    <div className="glass rounded-2xl border border-white/5 p-12 text-center">
                        <Zap className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">No challenges solved yet.</p>
                        <p className="text-zinc-600 text-xs mt-1">
                            Start a session and solve your first AI-generated challenge!
                        </p>
                        <Button
                            onClick={openModeModal}
                            className="mt-4 bg-orange-500 hover:bg-orange-400 text-white"
                            size="sm"
                        >
                            Start Session
                        </Button>
                    </div>
                )}
                {/* SQL Practice Feature Card */}
                <div className="mt-8 mb-2">
                    <div className="glass rounded-2xl border border-orange-500/15 bg-gradient-to-br from-orange-500/5 to-transparent overflow-hidden">
                        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/20">
                                <Database className="h-7 w-7 text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-lg font-bold text-white">SQL Practice</h2>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">NEW</span>
                                </div>
                                <p className="text-sm text-zinc-400 mb-3">
                                    Practice SQL queries with AI-generated challenges. Write, run, and submit queries — schema tables, sample data, and result tables all rendered beautifully.
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {["MySQL", "PostgreSQL", "Oracle SQL", "SQLite"].map((d) => (
                                        <span key={d} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-zinc-400">{d}</span>
                                    ))}
                                </div>
                            </div>
                            <Button
                                onClick={openSqlModal}
                                className="shrink-0 bg-orange-500 hover:bg-orange-400 text-white gap-2 shadow-lg shadow-orange-500/20 self-start sm:self-auto cursor-pointer"
                            >
                                <Zap className="h-4 w-4" />
                                Start SQL Session
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Help us improve — review CTA */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
                            Help us improve
                        </h2>
                        <Button
                            onClick={() => setShowReviewModal(true)}
                            variant="outline"
                            className="border-orange-500/20 text-orange-400 hover:bg-orange-500/10 cursor-pointer"
                            size="sm"
                        >
                            <MessageSquarePlus className="h-4 w-4 mr-2" />
                            Write a Review
                        </Button>
                    </div>
                    <p className="text-sm text-zinc-500">
                        Your feedback helps us make CodeCraft better for everyone.
                    </p>
                </div>

                {/* Daily activity heatmap */}
                {session?.user?.email && (
                    <DailyActivity email={session.user.email} />
                )}
            </div>
        </div>
    );
}
