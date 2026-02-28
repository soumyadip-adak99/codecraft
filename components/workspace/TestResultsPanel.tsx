"use client";

import { useEffect, useRef, useState } from "react";
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Zap,
    Brain,
    BarChart3,
    Lightbulb,
    Terminal,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { animations } from "@/lib/animations/config";
import { useChallengeStore } from "@/store/challengeStore";

type ResultTab = "testcases" | "analysis";

export function TestResultsPanel() {
    const { testResults, isExecuting } = useChallengeStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<HTMLDivElement[]>([]);
    const [tab, setTab] = useState<ResultTab>("testcases");

    useEffect(() => {
        if (!testResults || !containerRef.current) return;
        const items = itemsRef.current.filter(Boolean);
        if (items.length > 0) {
            animations.testCaseReveal(containerRef.current, items);
        }
    }, [testResults]);

    /* ── Loading state ── */
    if (isExecuting) {
        return (
            <div className="flex flex-col h-full bg-[#0a0a0a]">
                {/* Mini tab bar (greyed out) */}
                <div className="flex items-center border-b border-white/5 px-2 pt-1 shrink-0">
                    <div className="px-4 py-2 text-xs font-medium text-zinc-600 border-b-2 border-transparent -mb-px">
                        Test Cases
                    </div>
                    <div className="px-4 py-2 text-xs font-medium text-zinc-600 border-b-2 border-transparent -mb-px">
                        AI Analysis
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center flex-1 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 bg-orange-500 rounded-full animate-bounce" />
                        <div className="h-2.5 w-2.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <div className="h-2.5 w-2.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-zinc-300">Evaluating your code…</p>
                        <p className="text-xs text-zinc-600 mt-1">AI is analysing your solution</p>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Empty state ── */
    if (!testResults) {
        return (
            <div className="flex flex-col h-full bg-[#0a0a0a]">
                {/* Tab bar */}
                <div className="flex items-center border-b border-white/5 px-2 pt-1 shrink-0">
                    <div className="px-4 py-2 text-xs font-medium text-zinc-600 border-b-2 border-transparent -mb-px">
                        Test Cases
                    </div>
                    <div className="px-4 py-2 text-xs font-medium text-zinc-600 border-b-2 border-transparent -mb-px">
                        AI Analysis
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-6">
                    <Terminal className="h-9 w-9 text-zinc-800" />
                    <p className="text-sm text-zinc-500">Run your code to see results</p>
                    <p className="text-xs text-zinc-700">Test cases and AI analysis will appear here</p>
                </div>
            </div>
        );
    }

    const isAccepted = testResults.status === "ACCEPTED";
    const total = testResults.summary.total;
    const passed = testResults.summary.passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    return (
        <div ref={containerRef} className="flex flex-col h-full bg-[#0a0a0a]">
            {/* ── Tab bar ── */}
            <div className="flex items-center border-b border-white/5 px-2 pt-1 shrink-0">
                {(["testcases", "analysis"] as ResultTab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === t
                                ? "border-orange-500 text-white"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        {t === "testcases" ? "Test Cases" : "AI Analysis"}
                    </button>
                ))}

                {/* Status badge in tab bar */}
                <div className="ml-auto pr-2">
                    <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAccepted
                                ? "bg-green-500/15 text-green-400"
                                : "bg-red-500/15 text-red-400"
                            }`}
                    >
                        {passed}/{total} passed
                    </span>
                </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Status banner */}
                <div
                    className={`flex items-center gap-3 rounded-xl p-3.5 border ${isAccepted
                            ? "bg-green-500/10 border-green-500/20"
                            : "bg-red-500/10 border-red-500/20"
                        }`}
                >
                    {isAccepted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                    ) : (
                        <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${isAccepted ? "text-green-400" : "text-red-400"}`}>
                            {isAccepted ? "Accepted ✓" : testResults.status.replace(/_/g, " ")}
                        </p>
                        <Progress
                            value={passRate}
                            className={`h-1 mt-2 ${isAccepted ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`}
                        />
                    </div>
                </div>

                {/* ── Test Cases tab ── */}
                {tab === "testcases" && (
                    <div className="space-y-2">
                        {testResults.testCases.map((tc, i) => {
                            const isPassed = tc.status === "PASS";
                            const isError = tc.status === "ERROR";
                            return (
                                <div
                                    key={i}
                                    ref={(el) => { if (el) itemsRef.current[i] = el; }}
                                    className={`rounded-xl border p-3.5 text-sm ${isPassed
                                            ? "bg-green-500/5 border-green-500/15"
                                            : isError
                                                ? "bg-amber-500/5 border-amber-500/15"
                                                : "bg-red-500/5 border-red-500/15"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {isPassed ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                            ) : isError ? (
                                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-400" />
                                            )}
                                            <span className="text-xs font-medium text-zinc-300">
                                                Case {i + 1}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-zinc-600">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {tc.executionTime}ms
                                            </span>
                                            <span>{tc.memoryUsed?.toFixed(1)}MB</span>
                                        </div>
                                    </div>

                                    {tc.input && (
                                        <div className="space-y-1">
                                            <div className="flex gap-2">
                                                <span className="text-xs text-zinc-600 w-16 shrink-0">Input:</span>
                                                <code className="text-xs text-zinc-300 font-mono break-all">{tc.input}</code>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-xs text-zinc-600 w-16 shrink-0">Expected:</span>
                                                <code className="text-xs text-green-300 font-mono break-all">{tc.expectedOutput}</code>
                                            </div>
                                            {!isPassed && tc.actualOutput && (
                                                <div className="flex gap-2">
                                                    <span className="text-xs text-zinc-600 w-16 shrink-0">Got:</span>
                                                    <code className="text-xs text-red-300 font-mono break-all">{tc.actualOutput}</code>
                                                </div>
                                            )}
                                            {tc.errorMessage && (
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs text-amber-500 w-16 shrink-0">Error:</span>
                                                    <code className="text-xs text-amber-300 font-mono break-all">{tc.errorMessage}</code>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── AI Analysis tab ── */}
                {tab === "analysis" && testResults.aiAnalysis && (
                    <div className="space-y-3">
                        {/* Quality Score */}
                        <div className="glass rounded-xl p-4 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                                    <BarChart3 className="h-3.5 w-3.5 text-orange-500" />
                                    Code Quality
                                </span>
                                <span className="text-lg font-black text-orange-500">
                                    {testResults.aiAnalysis.codeQuality}/100
                                </span>
                            </div>
                            <Progress
                                value={testResults.aiAnalysis.codeQuality}
                                className="h-1.5 [&>div]:bg-orange-500"
                            />
                        </div>

                        {/* Complexity */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="glass rounded-lg p-3 border border-white/5">
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Time</p>
                                <p className="text-sm font-bold text-white mt-0.5 font-mono">
                                    {testResults.aiAnalysis.complexity}
                                </p>
                            </div>
                            <div className="glass rounded-lg p-3 border border-white/5">
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Space</p>
                                <p className="text-sm font-bold text-white mt-0.5 font-mono">
                                    {testResults.aiAnalysis.spaceComplexity || "O(1)"}
                                </p>
                            </div>
                        </div>

                        {/* Feedback */}
                        {testResults.aiAnalysis.feedback && (
                            <div className="glass rounded-xl p-4 border border-white/5">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <Brain className="h-3 w-3 text-orange-500" />
                                    Feedback
                                </p>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    {testResults.aiAnalysis.feedback}
                                </p>
                            </div>
                        )}

                        {/* Suggestions */}
                        {testResults.aiAnalysis.suggestions?.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2">
                                    <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                                    Suggestions
                                </h4>
                                <ul className="space-y-1.5">
                                    {testResults.aiAnalysis.suggestions.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-500">
                                            <span className="text-orange-500 shrink-0">•</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {tab === "analysis" && !testResults.aiAnalysis && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                        <Brain className="h-8 w-8 text-zinc-800" />
                        <p className="text-sm text-zinc-600">No AI analysis available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
