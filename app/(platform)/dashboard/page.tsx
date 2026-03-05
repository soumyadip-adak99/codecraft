"use client";

import { UserStats } from "@/@types";
import { SessionProgressModal } from "@/components/challenge/SessionProgressModal";
import { GitHubDashboardBanner } from "@/components/github/GitHubDashboardBanner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/store";
import { useChallengeStore } from "@/store/challengeStore";
import { useMutation, useQuery } from "convex/react";
import {
    ArrowRight,
    BarChart2,
    BookOpen,
    Flame,
    Loader2,
    MessageSquarePlus,
    Send,
    Star,
    Target,
    Trophy,
    Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export default function DashboardPage() {
    const { data: session } = useSession();
    const { openChallengeModal } = useUIStore();
    const { sessionActive, solvedQuestions, currentQuestion } = useChallengeStore();

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
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
    ];

    const [reviewText, setReviewText] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    // Add review mutation hook
    const addReview = useMutation(api.reviews.addReview);

    const handleSubmitReview = async () => {
        if (!session?.user?.name || !session?.user?.email) {
            toast.error("Please log in to submit a review");
            return;
        }
        if (reviewText.trim().length < 10) {
            toast.error("Review must be at least 10 characters");
            return;
        }
        setSubmittingReview(true);
        try {
            await addReview({
                reviewText: reviewText,
                userName: session.user.name,
                userEmail: session.user.email,
                userImageUrl: session.user.image || undefined,
            });
            toast.success("Review submitted! Thank you 🎉");
            setReviewText("");
            setShowReviewForm(false);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Session progress modal — shown when user navigated back from /challenge */}
            <SessionProgressModal />
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
                        onClick={openChallengeModal}
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
                            onClick={openChallengeModal}
                            className="mt-4 bg-orange-500 hover:bg-orange-400 text-white"
                            size="sm"
                        >
                            Start Coding
                        </Button>
                    </div>
                )}

                {/* Review submission form */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
                            Help us improve
                        </h2>
                        {!showReviewForm && (
                            <Button
                                onClick={() => setShowReviewForm(true)}
                                variant="outline"
                                className="border-orange-500/20 text-orange-400 hover:bg-orange-500/10 cursor-pointer"
                                size="sm"
                            >
                                <MessageSquarePlus className="h-4 w-4 mr-2" />
                                Write a Review
                            </Button>
                        )}
                    </div>

                    {showReviewForm && (
                        <div className="glass rounded-2xl p-6 border border-orange-500/20 bg-orange-500/5 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-base font-bold text-white mb-4">
                                Share your experience with CodeCraft
                            </h3>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="I really enjoyed using CodeCraft because..."
                                maxLength={500}
                                rows={4}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 resize-none transition-colors"
                            />
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xs text-zinc-500">
                                    {reviewText.length}/500 characters
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setShowReviewForm(false)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-zinc-400 hover:text-white cursor-pointer"
                                        disabled={submittingReview}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview || reviewText.trim().length < 10}
                                        size="sm"
                                        className="bg-orange-500 hover:bg-orange-400 text-white gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {submittingReview ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                        Submit Review
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
