"use client";

import { useSqlStore, type SqlDialect } from "@/store/sqlStore";
import { useUIStore } from "@/store";
import { SqlWorkspaceLayout } from "@/components/sql/SqlWorkspaceLayout";
import { Button } from "@/components/ui/button";
import { Database, Zap } from "lucide-react";
import { useState } from "react";

const SQL_DIALECTS: { value: SqlDialect; label: string; description: string; activeColor: string; dotColor: string }[] = [
    { value: "mysql",      label: "MySQL",       description: "Most popular open-source RDBMS",    activeColor: "border-orange-500/50 bg-orange-500/10 text-orange-300",  dotColor: "bg-orange-400" },
    { value: "postgresql", label: "PostgreSQL",  description: "Advanced open-source relational DB", activeColor: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300",         dotColor: "bg-cyan-400" },
    { value: "oracle",     label: "Oracle SQL",  description: "Enterprise-grade database",          activeColor: "border-red-500/50 bg-red-500/10 text-red-300",            dotColor: "bg-red-400" },
    { value: "sqlite",     label: "SQLite",      description: "Lightweight embedded database",      activeColor: "border-green-500/50 bg-green-500/10 text-green-300",      dotColor: "bg-green-400" },
];

export default function SqlPracticePage() {
    const { currentSqlQuestion } = useSqlStore();
    const { openSqlModal } = useUIStore();
    const [selectedDialect, setSelectedDialect] = useState<SqlDialect>("mysql");

    if (currentSqlQuestion) {
        return <SqlWorkspaceLayout question={currentSqlQuestion} />;
    }

    const selected = SQL_DIALECTS.find(d => d.value === selectedDialect)!;

    return (
        <div className="min-h-[calc(100vh-56px)] bg-[#080808] flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
            <div className="w-full max-w-lg sm:max-w-xl">

                {/* Icon + title */}
                <div className="text-center mb-8 sm:mb-10">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/20 mx-auto mb-4 sm:mb-5">
                        <Database className="h-7 w-7 sm:h-8 sm:w-8 text-orange-400" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">SQL Practice</h1>
                    <p className="text-zinc-400 text-xs sm:text-sm max-w-xs sm:max-w-sm mx-auto leading-relaxed">
                        AI-generated challenges. Write real queries, see table results, and get instant AI feedback.
                    </p>
                </div>

                {/* Dialect Selector */}
                <div className="mb-6 sm:mb-8">
                    <p className="text-[11px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 text-center">
                        Choose SQL Dialect
                    </p>
                    {/* 2 cols on mobile, 4 cols on sm+ */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                        {SQL_DIALECTS.map((d) => {
                            const isActive = selectedDialect === d.value;
                            return (
                                <button
                                    key={d.value}
                                    onClick={() => setSelectedDialect(d.value)}
                                    className={`relative flex flex-col items-start p-3 sm:p-4 rounded-xl border transition-all duration-200 text-left group ${
                                        isActive
                                            ? d.activeColor
                                            : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15"
                                    }`}
                                >
                                    {/* Dot indicator */}
                                    <div className={`h-2 w-2 rounded-full mb-2 sm:mb-2.5 transition-all ${isActive ? d.dotColor : "bg-zinc-700 group-hover:bg-zinc-500"}`} />
                                    <span className={`text-xs sm:text-sm font-bold leading-tight ${isActive ? "" : "text-zinc-300"}`}>
                                        {d.label}
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] text-zinc-500 leading-snug mt-0.5 hidden sm:block">
                                        {d.description}
                                    </span>
                                    {isActive && (
                                        <span className="absolute top-2 right-2 text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-60">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Start Button */}
                <Button
                    onClick={openSqlModal}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white gap-2 shadow-lg shadow-orange-500/20 py-5 sm:py-6 text-sm sm:text-base font-semibold transition-all duration-200 hover:shadow-orange-500/30"
                >
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    Start SQL Session — {selected.label}
                </Button>
                <p className="text-center text-[11px] text-zinc-600 mt-3">
                    Difficulty &amp; API key settings appear in the next step
                </p>
            </div>
        </div>
    );
}
