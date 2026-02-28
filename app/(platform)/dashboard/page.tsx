"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Zap, Trophy, Target, BarChart2, BookOpen, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/store";
import { useChallengeStore } from "@/store/challengeStore";

interface Progress {
    stats: {
        totalSolved: number;
        easySolved: number;
        mediumSolved: number;
        hardSolved: number;
        totalAttempts: number;
    };
    hasApiKey: boolean;
    preferredModel: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const { openChallengeModal } = useUIStore();
    const { sessionActive, solvedQuestions } = useChallengeStore();
    const [progress, setProgress] = useState<Progress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/progress", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => {
                setProgress(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const stats = progress?.stats;

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-5xl mx-auto px-4 py-10">
                {/* Welcome */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white">
                            Welcome back,{" "}
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
                        onClick={openChallengeModal}
                        className="bg-orange-500 hover:bg-orange-400 text-white gap-2 shadow-lg shadow-orange-500/20 self-start sm:self-auto"
                    >
                        <Zap className="h-4 w-4" />
                        {sessionActive ? "New Question" : "Start Session"}
                    </Button>
                </div>

                {/* Active session banner */}
                {sessionActive && (
                    <div className="mb-6 flex items-center gap-3 glass rounded-2xl border border-orange-500/20 bg-orange-500/5 px-5 py-4">
                        <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                        <div>
                            <p className="text-sm font-semibold text-orange-300">
                                Session in progress
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                {solvedQuestions.length} question
                                {solvedQuestions.length !== 1 ? "s" : ""} solved — go to your
                                challenge page to continue or end the session
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                    {[
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
                            color: "text-blue-400",
                            bg: "bg-blue-500/10",
                        },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
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
                            onClick={openChallengeModal}
                            className="mt-4 bg-orange-500 hover:bg-orange-400 text-white"
                            size="sm"
                        >
                            Start Coding
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
