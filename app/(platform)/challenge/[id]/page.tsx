"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChallengeStore } from "@/store/challengeStore";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";

// LeetCode-style full-page loading skeleton
function ChallengeSkeleton() {
    return (
        <div className="h-[calc(100vh-56px)] w-full flex overflow-hidden bg-[#111111]">
            {/* Left: Problem skeleton */}
            <div className="w-[38%] border-r border-white/5 flex flex-col">
                {/* Tab strip */}
                <div className="flex items-center border-b border-white/5 px-2 pt-1 h-10 shrink-0">
                    <div className="w-20 h-4 bg-white/5 rounded animate-pulse mx-2" />
                    <div className="w-14 h-4 bg-white/5 rounded animate-pulse mx-2" />
                </div>
                <div className="p-5 space-y-4 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="h-6 w-3/4 bg-white/5 rounded-lg animate-pulse" />
                        <div className="h-6 w-16 bg-orange-500/10 rounded-lg animate-pulse shrink-0" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-5 w-16 bg-white/5 rounded-full animate-pulse" />
                        <div className="h-5 w-20 bg-white/5 rounded-full animate-pulse" />
                        <div className="h-5 w-14 bg-white/5 rounded-full animate-pulse" />
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="space-y-2.5">
                        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-[90%] bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-[95%] bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-[80%] bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-[85%] bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="rounded-xl bg-white/3 border border-white/5 p-4 space-y-2">
                        <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className="rounded-xl bg-white/3 border border-white/5 p-4 space-y-2">
                        <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Right: Editor + Results skeleton */}
            <div className="flex-1 flex flex-col">
                {/* Editor toolbar */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-[#0a0a0a] h-[44px] shrink-0">
                    <div className="flex gap-2">
                        <div className="h-7 w-32 bg-white/5 rounded-lg animate-pulse" />
                        <div className="h-7 w-32 bg-white/5 rounded-lg animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
                        <div className="h-8 w-20 bg-orange-500/10 rounded-lg animate-pulse" />
                    </div>
                </div>
                {/* Editor lines */}
                <div className="flex-1 bg-[#0f0f0f] p-4 space-y-2 relative">
                    <div className="flex items-center gap-1 absolute top-4 left-4 right-4">
                        <div className="h-3 w-2 bg-white/5 rounded animate-pulse" />
                        <div className="h-3 w-48 bg-white/5 rounded animate-pulse ml-6" />
                    </div>
                    {[80, 60, 72, 90, 65, 55, 70, 40, 78, 62].map((w, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-1"
                            style={{ marginTop: i === 0 ? 24 : 0 }}
                        >
                            <div className="h-3 w-3 bg-white/5 rounded animate-pulse text-right" />
                            <div
                                className="h-3 bg-white/5 rounded animate-pulse ml-6"
                                style={{ width: `${w}%` }}
                            />
                        </div>
                    ))}
                </div>
                {/* Test results area */}
                <div className="h-[40%] border-t border-white/5 bg-[#0a0a0a] p-4">
                    <div className="flex gap-3 border-b border-white/5 pb-2 mb-4">
                        <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className="flex flex-col items-center justify-center h-[calc(100%-48px)] gap-3">
                        <div className="flex gap-1.5">
                            <div className="h-2 w-2 bg-orange-500/30 rounded-full animate-bounce" />
                            <div className="h-2 w-2 bg-orange-500/30 rounded-full animate-bounce [animation-delay:0.15s]" />
                            <div className="h-2 w-2 bg-orange-500/30 rounded-full animate-bounce [animation-delay:0.3s]" />
                        </div>
                        <p className="text-xs text-zinc-700">Loading challenge…</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ChallengePage() {
    const params = useParams();
    const questionId = params?.id as string;
    const { currentQuestion } = useChallengeStore();

    // If question is not in store (e.g., page refresh), redirect to dashboard
    useEffect(() => {
        if (!currentQuestion || currentQuestion.questionId !== questionId) {
            const timer = setTimeout(() => {
                if (!currentQuestion) {
                    window.location.href = "/dashboard";
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, questionId]);

    if (!currentQuestion) {
        return <ChallengeSkeleton />;
    }

    return <WorkspaceLayout question={currentQuestion} />;
}
