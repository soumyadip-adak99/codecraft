"use client";

import { useSqlStore } from "@/store/sqlStore";
import { useUIStore } from "@/store";
import { SqlQuestion } from "@/@types";
import { ChevronRight, Database, Loader2, Lock, LogOut, SkipForward, Github, Info } from "lucide-react";
import Link from "next/link";
import { Group, Panel, Separator } from "react-resizable-panels";
import { SqlEditor } from "./SqlEditor";
import { SqlProblemPanel } from "./SqlProblemPanel";
import { SqlResultsPanel } from "./SqlResultsPanel";
import { SqlNavigationConfirmModal } from "./SqlNavigationConfirmModal";

const difficultyConfig = {
    Easy: { cls: "bg-green-500/15 text-green-400 border-green-500/30" },
    Medium: { cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
    Hard: { cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const dialectLabels: Record<string, string> = {
    mysql: "MySQL",
    postgresql: "PostgreSQL",
    oracle: "Oracle SQL",
    sqlite: "SQLite",
};

export function SqlWorkspaceLayout({ question }: { question: SqlQuestion }) {
    const diff = difficultyConfig[question.difficulty];
    const { canGoNextSql, generateSqlQuestion, sqlApiKey, sqlProvider, sqlDialect, isSqlGenerating, solvedSqlCount, openSqlExitModal } = useSqlStore();
    const { openSqlModal } = useUIStore();

    const handleNextQuestion = async () => {
        if (!canGoNextSql) return;
        openSqlModal();
    };

    const handleEndSession = () => {
        openSqlExitModal("/dashboard");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-56px)] w-full overflow-hidden bg-[#111111]">
            <SqlNavigationConfirmModal />
            {/* Top chrome bar */}
            <div className="flex items-center gap-2 px-4 h-10 bg-[#1a1a1a] border-b border-white/8 shrink-0">
                <Link href="/dashboard" className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-xs">
                    <Database className="h-3.5 w-3.5 text-orange-500" />
                    SQL Practice
                </Link>
                <ChevronRight className="h-3 w-3 text-zinc-700" />
                <span className="text-zinc-300 text-xs font-medium truncate max-w-[200px]">{question.title}</span>
                <span className={`ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.cls}`}>{question.difficulty}</span>
                {/* Dialect badge */}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400">
                    {dialectLabels[question.dialect] ?? question.dialect.toUpperCase()}
                </span>

                {solvedSqlCount > 0 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        {solvedSqlCount} solved
                    </span>
                )}

                {/* Right side actions */}
                <div className="ml-auto flex items-center gap-2">
                    {/* Next Question */}
                    <button
                        onClick={handleNextQuestion}
                        disabled={!canGoNextSql || isSqlGenerating}
                        title={canGoNextSql ? "Go to next SQL question" : "Submit the current question first to unlock"}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            canGoNextSql
                                ? "bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/25 hover:text-orange-300 cursor-pointer"
                                : "bg-white/5 text-zinc-500 border-white/8 cursor-not-allowed"
                        }`}
                    >
                        {isSqlGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : canGoNextSql ? <SkipForward className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />}
                        {canGoNextSql ? "Next" : "Submit first"}
                    </button>

                    {/* End Session */}
                    <div className="flex items-center gap-2 border-l border-white/10 pl-2">
                        {/* GitHub Push Indicator Tooltip Area */}
                        <div className="relative group/gh flex items-center justify-center h-8 w-8 rounded hover:bg-white/5 cursor-help transition-colors">
                            <Github className="h-4 w-4 text-zinc-400 group-hover/gh:text-white transition-colors" />
                            <div className="absolute top-10 right-0 w-64 p-2.5 rounded-xl bg-zinc-900 border border-white/10 shadow-xl opacity-0 invisible group-hover/gh:opacity-100 group-hover/gh:visible select-none pointer-events-none transition-all z-50">
                                <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-zinc-300 leading-relaxed text-left">
                                        Submissions are saved locally. They will be pushed to your connected GitHub repository <strong className="text-white font-medium">only when you End Session</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleEndSession}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20 text-xs font-medium cursor-pointer"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            End Session
                        </button>
                    </div>
                </div>
            </div>

            {/* Resizable layout */}
            <div className="flex-1 overflow-hidden">
                <Group orientation="horizontal" className="h-full" id="sql-workspace-h" defaultLayout={{ problem: 38, right: 62 }}>
                    {/* Problem Panel */}
                    <Panel id="sql-problem" minSize="22%" maxSize="55%" defaultSize="38%" className="overflow-hidden">
                        <SqlProblemPanel question={question} />
                    </Panel>

                    <Separator id="sql-h-sep" className="group flex items-center justify-center w-[5px] bg-transparent data-[separator]:bg-transparent cursor-col-resize">
                        <div className="w-[2px] h-full bg-white/8 group-hover:bg-orange-500/60 transition-colors rounded-full" />
                    </Separator>

                    {/* Right column */}
                    <Panel id="sql-right" minSize="35%" className="overflow-hidden">
                        <Group orientation="vertical" className="h-full" id="sql-workspace-v" defaultLayout={{ editor: 60, results: 40 }}>
                            {/* SQL Editor */}
                            <Panel id="sql-editor" minSize="30%" defaultSize="60%" className="overflow-hidden">
                                <SqlEditor />
                            </Panel>

                            <Separator id="sql-v-sep" className="group flex items-center justify-center h-[5px] bg-transparent data-[separator]:bg-transparent cursor-row-resize">
                                <div className="h-[2px] w-full bg-white/8 group-hover:bg-orange-500/60 transition-colors rounded-full" />
                            </Separator>

                            {/* Results */}
                            <Panel id="sql-results" minSize="20%" maxSize="70%" defaultSize="40%" className="overflow-hidden">
                                <SqlResultsPanel />
                            </Panel>
                        </Group>
                    </Panel>
                </Group>
            </div>
        </div>
    );
}
