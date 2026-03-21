"use client";

import { useSqlStore } from "@/store/sqlStore";
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronRight, Loader2, Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { SqlTestCaseResult } from "@/@types";

function ResultTable({ rows }: { rows: Record<string, unknown>[] }) {
    if (!rows || rows.length === 0) {
        return <p className="text-xs text-zinc-600 italic px-2 py-1">(empty result set)</p>;
    }
    const cols = Object.keys(rows[0]);
    return (
        <div className="overflow-x-auto rounded-lg border border-white/8 mt-1">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b border-white/8 bg-white/3">
                        {cols.map((c) => (
                            <th key={c} className="px-3 py-1.5 text-left text-zinc-400 font-semibold whitespace-nowrap font-mono">{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, ri) => (
                        <tr key={ri} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                            {Object.values(row).map((val, ci) => (
                                <td key={ci} className="px-3 py-1.5 text-zinc-300 font-mono whitespace-nowrap">{String(val)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TestCaseRow({ tc, index }: { tc: SqlTestCaseResult; index: number }) {
    const [open, setOpen] = useState(index === 0);
    const isPassed = tc.status === "PASS";

    return (
        <div className={`rounded-xl border ${isPassed ? "border-green-500/20" : "border-red-500/20"} overflow-hidden`}>
            <button
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${isPassed ? "bg-green-500/5 hover:bg-green-500/10" : "bg-red-500/5 hover:bg-red-500/10"}`}
            >
                {isPassed
                    ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                }
                <span className={`text-sm font-medium ${isPassed ? "text-green-300" : "text-red-300"}`}>
                    Test Case {index + 1}
                    {tc.description ? ` — ${tc.description}` : ""}
                </span>
                <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isPassed ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25"}`}>
                    {isPassed ? "PASS" : "FAIL"}
                </span>
                {open ? <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-500 shrink-0" />}
            </button>

            {open && (
                <div className="px-4 pb-4 pt-1 space-y-3 bg-black/20">
                    {tc.errorMessage && (
                        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                            <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-400 font-mono">{tc.errorMessage}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-semibold mb-1">Your Output</p>
                            <ResultTable rows={tc.actualOutput ?? []} />
                        </div>
                        {!isPassed && (
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-semibold mb-1">Expected Output</p>
                                <ResultTable rows={tc.expectedOutput ?? []} />
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-zinc-600">Execution time: {tc.executionTime ?? 0}ms</p>
                </div>
            )}
        </div>
    );
}

export function SqlResultsPanel() {
    const { sqlTestResults, isSqlRunning, isSqlSubmitting, currentSqlQuestion } = useSqlStore();
    const isLoading = isSqlRunning || isSqlSubmitting;

    // Empty state
    if (!isLoading && !sqlTestResults) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[#0a0a0a] text-zinc-600 gap-2">
                <Bot className="h-8 w-8 text-zinc-700" />
                <p className="text-sm">Run or Submit your SQL query to see results</p>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[#0a0a0a] gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <p className="text-sm text-zinc-500">{isSqlRunning ? "Running SQL query…" : "Evaluating submission…"}</p>
                <p className="text-xs text-zinc-700">AI is simulating execution against the schema</p>
            </div>
        );
    }

    const results = sqlTestResults!;
    const { summary, aiAnalysis, status } = results;

    const statusConfig = {
        ACCEPTED: { label: "Accepted", cls: "text-green-400 bg-green-500/10 border-green-500/20" },
        WRONG_ANSWER: { label: "Wrong Answer", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
        PARTIAL: { label: "Partial Pass", cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
        RUNTIME_ERROR: { label: "Runtime Error", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
    };
    const sc = statusConfig[status] ?? statusConfig.WRONG_ANSWER;

    return (
        <div data-lenis-prevent="true" className="h-full w-full overflow-y-auto bg-[#0a0a0a] p-4 space-y-4 scrollbar-thin">
            {/* Header */}
            <div className="flex items-center gap-3">
                <span className={`text-sm font-bold px-3 py-1.5 rounded-xl border ${sc.cls}`}>{sc.label}</span>
                <span className="text-xs text-zinc-500">{summary.passed}/{summary.total} test cases passed</span>
                <span className="text-xs text-zinc-600 ml-auto">{summary.totalExecutionTime}ms total</span>
            </div>

            {/* Test case results */}
            <div className="space-y-2">
                {results.testCases.map((tc, i) => (
                    <TestCaseRow key={i} tc={tc} index={i} />
                ))}
            </div>

            {/* AI Analysis */}
            {aiAnalysis && (
                <div className="rounded-xl bg-orange-500/5 border border-orange-500/15 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-orange-400" />
                        <h3 className="text-sm font-semibold text-orange-300">AI Feedback</h3>
                        {typeof aiAnalysis.codeQuality === "number" && (
                            <span className="ml-auto text-xs text-zinc-500">Quality: <span className="text-orange-300 font-semibold">{aiAnalysis.codeQuality}/100</span></span>
                        )}
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{aiAnalysis.feedback}</p>
                    {aiAnalysis.complexity && (
                        <p className="text-xs text-zinc-500">Complexity: <span className="text-cyan-400 font-mono">{aiAnalysis.complexity}</span></p>
                    )}
                    {aiAnalysis.suggestions?.length > 0 && (
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-semibold mb-1.5">Suggestions</p>
                            <ul className="space-y-1">
                                {aiAnalysis.suggestions.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                                        <span className="text-orange-500 shrink-0 mt-0.5">•</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
