"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, BookOpen, Database, List, Tag, Table2 } from "lucide-react";
import { SqlQuestion } from "@/@types";

const difficultyConfig = {
    Easy: "difficulty-easy",
    Medium: "difficulty-medium",
    Hard: "difficulty-hard",
};

const dialectLabels: Record<string, { label: string; color: string }> = {
    mysql: { label: "MySQL", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    postgresql: { label: "PostgreSQL", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    oracle: { label: "Oracle SQL", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    sqlite: { label: "SQLite", color: "text-green-400 bg-green-500/10 border-green-500/20" },
};

type Tab = "description" | "hints";

export function SqlProblemPanel({ question }: { question: SqlQuestion }) {
    const [tab, setTab] = useState<Tab>("description");
    const dialect = dialectLabels[question.dialect] ?? { label: question.dialect.toUpperCase(), color: "text-zinc-400 bg-white/5 border-white/10" };

    return (
        <div className="h-full w-full min-h-0 min-w-0 flex flex-col bg-[#0a0a0a]">
            {/* Tab bar */}
            <div className="flex items-center gap-0 border-b border-white/5 shrink-0 px-2 pt-1">
                {(["description", "hints"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px capitalize ${
                            tab === t ? "border-orange-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        {t === "description" ? "Description" : "Hints"}
                    </button>
                ))}
            </div>

            {/* Scrollable content */}
            <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5 scrollbar-thin">
                {tab === "description" ? (
                    <>
                        {/* Title & badges */}
                        <div>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <h1 className="text-base font-bold text-white leading-snug">{question.title}</h1>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${dialect.color}`}>
                                        {dialect.label}
                                    </span>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${difficultyConfig[question.difficulty]}`}>
                                        {question.difficulty}
                                    </span>
                                </div>
                            </div>

                            {/* Tags */}
                            {question.tags?.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Tag className="h-3 w-3 text-zinc-600 shrink-0" />
                                    {question.tags.map((tag) => (
                                        <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
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

                        {/* Schema & Sample Data (Inline) */}
                        {question.schema?.length > 0 && (
                            <>
                                <Separator className="bg-white/5" />
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                        <Database className="h-4 w-4 text-orange-500" />
                                        <h2 className="text-sm font-semibold uppercase tracking-wide">Database Schema</h2>
                                    </div>
                                    {question.schema.map((table) => (
                                        <div key={table.tableName} className="space-y-3">
                                            {/* Table header */}
                                            <div className="flex items-center gap-2">
                                                <Table2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                                                <h3 className="text-sm font-bold text-white font-mono">Table: {table.tableName}</h3>
                                            </div>

                                            {/* Column definitions */}
                                            <div className="overflow-x-auto rounded-xl border border-white/8">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="border-b border-white/8 bg-orange-500/5">
                                                            <th className="px-3 py-2 text-left text-orange-400 font-semibold">Column Name</th>
                                                            <th className="px-3 py-2 text-left text-orange-400 font-semibold">Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {table.columns.map((col) => (
                                                            <tr key={col.name} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                                                                <td className="px-3 py-2 text-white font-mono font-medium">{col.name}</td>
                                                                <td className="px-3 py-2 text-cyan-400 font-mono">
                                                                    {col.type}
                                                                    {col.constraints ? <span className="text-zinc-500 ml-2">({col.constraints})</span> : ""}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Sample data */}
                                            {table.sampleData?.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-[10px] text-zinc-500 font-medium uppercase mb-1.5">Example Data: {table.tableName}</p>
                                                    <div className="overflow-x-auto rounded-xl border border-white/8">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="border-b border-white/8 bg-white/3">
                                                                    {Object.keys(table.sampleData[0]).map((col) => (
                                                                        <th key={col} className="px-3 py-2 text-left text-zinc-400 font-semibold whitespace-nowrap font-mono">{col}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {table.sampleData.map((row, ri) => (
                                                                    <tr key={ri} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                                                                        {Object.values(row).map((val, ci) => (
                                                                            <td key={ci} className="px-3 py-2 text-zinc-300 font-mono whitespace-nowrap">
                                                                                {String(val)}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Examples (expected output preview) */}
                        {question.examples?.length > 0 && (
                            <>
                                <Separator className="bg-white/5" />
                                <div>
                                    <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Expected Output (Example)</h2>
                                    {question.examples.map((ex, i) => (
                                        <div key={i} className="space-y-2 mb-3">
                                            <p className="text-[10px] text-zinc-500 font-medium uppercase">{ex.description}</p>
                                            {ex.expectedRows?.length > 0 && (
                                                <div className="overflow-x-auto rounded-xl border border-white/8">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="border-b border-white/8 bg-white/3">
                                                                {Object.keys(ex.expectedRows[0]).map((col) => (
                                                                    <th key={col} className="px-3 py-2 text-left text-zinc-400 font-semibold whitespace-nowrap">{col}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {ex.expectedRows.map((row, ri) => (
                                                                <tr key={ri} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                                                                    {Object.values(row).map((val, ci) => (
                                                                        <td key={ci} className="px-3 py-2 text-orange-300 font-mono whitespace-nowrap">
                                                                            {String(val)}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    ))}
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
                                                <span className="text-orange-500 shrink-0 mt-0.5 text-xs">•</span>
                                                <span className="text-zinc-400 text-xs">{c}</span>
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
                            <h2 className="text-sm font-semibold">SQL Hints</h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                "Read the schema carefully — understand what each table and column represents.",
                                "Think about which SQL clauses you need: SELECT, FROM, WHERE, JOIN, GROUP BY, HAVING, ORDER BY.",
                                "Write the query step by step — start with a simple SELECT, then add JOINs and filters.",
                                "Check column names in the expected output — they must match what your SELECT returns.",
                            ].map((hint, i) => (
                                <div key={i} className="rounded-xl bg-orange-500/5 border border-orange-500/15 p-4">
                                    <p className="text-xs font-medium text-orange-400 mb-1">Hint {i + 1}</p>
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
