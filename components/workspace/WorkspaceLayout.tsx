"use client";

import { useChallengeStore, type Question } from "@/store/challengeStore";
import { ChevronRight, Code2, Loader2, Lock, LogOut, SkipForward } from "lucide-react";
import Link from "next/link";
import { Group, Panel, Separator } from "react-resizable-panels";
import { CodeEditor } from "./CodeEditor";
import { ProblemPanel } from "./ProblemPanel";
import { TestResultsPanel } from "./TestResultsPanel";

const difficultyConfig = {
    Easy: { cls: "bg-green-500/15 text-green-400 border-green-500/30" },
    Medium: { cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
    Hard: { cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export function WorkspaceLayout({ question }: { question: Question }) {
    const diff = difficultyConfig[question.difficulty];
    const {
        solvedQuestions,
        canGoNext,
        generateQuestion,
        apiKey,
        provider,
        isGenerating,
        openExitModal,
    } = useChallengeStore();

    const handleEndSession = () => {
        // Open the global exit modal which will handle confirmation
        openExitModal("/dashboard");
    };

    const handleNextQuestion = async () => {
        if (!canGoNext) return;
        // Generate next question with the same difficulty, preventing repeats
        await generateQuestion(question.difficulty, apiKey, provider);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-56px)] w-full overflow-hidden bg-[#111111]">
            {/* LeetCode-style top chrome bar */}
            <div className="flex items-center gap-2 px-4 h-10 bg-[#1a1a1a] border-b border-white/8 shrink-0">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-xs"
                >
                    <Code2 className="h-3.5 w-3.5 text-orange-500" />
                    CodeCraft
                </Link>
                <ChevronRight className="h-3 w-3 text-zinc-700" />
                <span className="text-zinc-300 text-xs font-medium truncate max-w-[200px]">
                    {question.title}
                </span>
                <span
                    className={`ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.cls}`}
                >
                    {question.difficulty}
                </span>

                {/* Solved count badge */}
                {solvedQuestions.length > 0 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        {solvedQuestions.length} solved
                    </span>
                )}

                {/* Right side actions */}
                <div className="ml-auto flex items-center gap-2">
                    {/* Next Question Button */}
                    <button
                        onClick={handleNextQuestion}
                        disabled={!canGoNext || isGenerating}
                        title={canGoNext ? "Go to next question" : "Submit the current question first to unlock"}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${canGoNext
                            ? "bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/25 hover:text-orange-300 cursor-pointer"
                            : "bg-white/5 text-zinc-500 border-white/8 cursor-not-allowed"
                            }`}
                    >
                        {isGenerating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : canGoNext ? (
                            <SkipForward className="h-3.5 w-3.5" />
                        ) : (
                            <Lock className="h-3 w-3" />
                        )}
                        {canGoNext ? "Next" : "Submit first"}
                    </button>

                    {/* End Session Button */}
                    <button
                        onClick={handleEndSession}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20 text-xs font-medium cursor-pointer"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        End Session
                    </button>
                </div>
            </div>

            {/* ── Main resizable layout ── */}
            <div className="flex-1 overflow-hidden">
                {/* Horizontal group: Problem | Right column */}
                <Group
                    orientation="horizontal"
                    className="h-full"
                    id="workspace-h"
                    defaultLayout={{ problem: 38, right: 62 }}
                >
                    {/* Problem Panel */}
                    <Panel
                        id="problem"
                        minSize="22%"
                        maxSize="55%"
                        defaultSize="38%"
                        className="overflow-hidden"
                    >
                        <ProblemPanel question={question} />
                    </Panel>

                    <Separator
                        id="h-sep"
                        className="group flex items-center justify-center w-[5px] bg-transparent data-[separator]:bg-transparent cursor-col-resize"
                    >
                        <div className="w-[2px] h-full bg-white/8 group-hover:bg-orange-500/60 transition-colors rounded-full" />
                    </Separator>

                    {/* Right column: vertical split */}
                    <Panel id="right" minSize="35%" className="overflow-hidden">
                        <Group
                            orientation="vertical"
                            className="h-full"
                            id="workspace-v"
                            defaultLayout={{ editor: 60, results: 40 }}
                        >
                            {/* Code Editor */}
                            <Panel
                                id="editor"
                                minSize="30%"
                                defaultSize="60%"
                                className="overflow-hidden"
                            >
                                <CodeEditor />
                            </Panel>

                            <Separator
                                id="v-sep"
                                className="group flex items-center justify-center h-[5px] bg-transparent data-[separator]:bg-transparent cursor-row-resize"
                            >
                                <div className="h-[2px] w-full bg-white/8 group-hover:bg-orange-500/60 transition-colors rounded-full" />
                            </Separator>

                            {/* Test Results */}
                            <Panel
                                id="results"
                                minSize="20%"
                                maxSize="70%"
                                defaultSize="40%"
                                className="overflow-hidden"
                            >
                                <TestResultsPanel />
                            </Panel>
                        </Group>
                    </Panel>
                </Group>
            </div>
        </div>
    );
}
