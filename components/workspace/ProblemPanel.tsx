"use client";

import { Separator } from "@/components/ui/separator";
import { AlertCircle, BookOpen, List, Tag } from "lucide-react";
import { useState } from "react";
import { Question } from "@/store/challengeStore";

const difficultyConfig = {
    Easy: "difficulty-easy",
    Medium: "difficulty-medium",
    Hard: "difficulty-hard",
};

type Tab = "description" | "hints";

export function ProblemPanel({ question }: { question: Question }) {
    const [tab, setTab] = useState<Tab>("description");

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Tab bar */}
            <div className="flex items-center gap-0 border-b border-white/5 shrink-0 px-2 pt-1">
                {(["description", "hints"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px capitalize ${tab === t
                                ? "border-orange-500 text-white"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        {t === "description" ? "Description" : "Hints"}
                    </button>
                ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
                {tab === "description" ? (
                    <>
                        {/* Title & Difficulty */}
                        <div>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <h1 className="text-base font-bold text-white leading-snug">
                                    {question.title}
                                </h1>
                                <span
                                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg ${difficultyConfig[question.difficulty]}`}
                                >
                                    {question.difficulty}
                                </span>
                            </div>

                            {/* Tags */}
                            {question.tags?.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Tag className="h-3 w-3 text-zinc-600 shrink-0" />
                                    {question.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator className="bg-white/5" />

                        {/* Description */}
                        <div>
                            <h2 className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                                <BookOpen className="h-3.5 w-3.5 text-orange-500" />
                                Problem Statement
                            </h2>
                            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {question.description}
                            </div>
                        </div>

                        {/* Examples */}
                        {question.examples?.length > 0 && (
                            <>
                                <Separator className="bg-white/5" />
                                <div>
                                    <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                                        Examples
                                    </h2>
                                    <div className="space-y-3">
                                        {question.examples.map((ex, i) => (
                                            <div
                                                key={i}
                                                className="rounded-xl bg-white/3 border border-white/5 p-4 space-y-2"
                                            >
                                                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                                                    Example {i + 1}
                                                </p>
                                                <div className="space-y-1.5">
                                                    <div className="flex gap-2 text-sm">
                                                        <span className="text-zinc-500 shrink-0 font-mono text-xs w-14">
                                                            Input:
                                                        </span>
                                                        <code className="text-orange-300 font-mono text-xs break-all">
                                                            {ex.input}
                                                        </code>
                                                    </div>
                                                    <div className="flex gap-2 text-sm">
                                                        <span className="text-zinc-500 shrink-0 font-mono text-xs w-14">
                                                            Output:
                                                        </span>
                                                        <code className="text-green-300 font-mono text-xs break-all">
                                                            {ex.output}
                                                        </code>
                                                    </div>
                                                    {ex.explanation && (
                                                        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed border-t border-white/5 pt-2">
                                                            <span className="text-zinc-600">
                                                                Explanation:{" "}
                                                            </span>
                                                            {ex.explanation}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Constraints */}
                        {question.constraints?.length > 0 && (
                            <>
                                <Separator className="bg-white/5" />
                                <div>
                                    <h2 className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                                        <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                                        Constraints
                                    </h2>
                                    <ul className="space-y-1.5">
                                        {question.constraints.map((c, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-orange-500 shrink-0 mt-0.5 text-xs">
                                                    •
                                                </span>
                                                <code className="text-zinc-400 font-mono text-xs">
                                                    {c}
                                                </code>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    /* Hints tab */
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <List className="h-4 w-4 text-orange-500" />
                            <h2 className="text-sm font-semibold">Hints</h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                "Break the problem down into smaller sub-problems and think about the base cases.",
                                "Consider the time and space complexity requirements based on the constraints.",
                                "Look for patterns in the examples — they often reveal the algorithmic approach.",
                            ].map((hint, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl bg-orange-500/5 border border-orange-500/15 p-4"
                                >
                                    <p className="text-xs font-medium text-orange-400 mb-1">
                                        Hint {i + 1}
                                    </p>
                                    <p className="text-sm text-zinc-400">{hint}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
