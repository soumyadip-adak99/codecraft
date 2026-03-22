"use client";

import { useChallengeStore, type Question } from "@/store/challengeStore";
import {
    ChevronRight,
    Code2,
    FileText,
    Loader2,
    Lock,
    LogOut,
    SkipForward,
    Github,
    Info,
    Terminal,
    LayoutPanelLeft,
} from "lucide-react";
import Link from "next/link";
import { Group, Panel, Separator } from "react-resizable-panels";
import { CodeEditor } from "./CodeEditor";
import { ProblemPanel } from "./ProblemPanel";
import { TestResultsPanel } from "./TestResultsPanel";
import { useState, useEffect } from "react";

const difficultyConfig = {
    Easy: { cls: "bg-green-500/15 text-green-400 border-green-500/30" },
    Medium: { cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
    Hard: { cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

type MobileTab = "problem" | "code" | "results";

function useBreakpoint() {
    const [width, setWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1024
    );
    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return { isMobile: width < 768, isTablet: width >= 768 && width < 1100 };
}

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

    const { isMobile, isTablet } = useBreakpoint();
    const [mobileTab, setMobileTab] = useState<MobileTab>("problem");

    const handleEndSession = () => openExitModal("/dashboard");

    const handleNextQuestion = async () => {
        if (!canGoNext) return;
        await generateQuestion(question.difficulty, apiKey, provider);
    };

    // ── Top chrome bar ──────────────────────────────────────────
    const TopBar = (
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-10 sm:h-11 bg-[#1a1a1a] border-b border-white/8 shrink-0 min-w-0">
            {/* Breadcrumb */}
            <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-xs shrink-0"
            >
                <Code2 className="h-3.5 w-3.5 text-orange-500" />
                <span className="hidden sm:inline">CodeCraft</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-zinc-700 shrink-0" />
            <span className="text-zinc-300 text-xs font-medium truncate min-w-0 flex-1 sm:flex-none sm:max-w-[160px] md:max-w-[220px]">
                {question.title}
            </span>
            <span
                className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.cls}`}
            >
                {question.difficulty}
            </span>

            {/* Solved count */}
            {solvedQuestions.length > 0 && (
                <span className="hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 shrink-0">
                    {solvedQuestions.length} solved
                </span>
            )}

            {/* Right-side actions */}
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Next Question */}
                <button
                    onClick={handleNextQuestion}
                    disabled={!canGoNext || isGenerating}
                    title={canGoNext ? "Next question" : "Submit first to unlock"}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        canGoNext
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
                    <span className="hidden sm:inline">
                        {canGoNext ? "Next" : "Submit first"}
                    </span>
                </button>

                {/* GitHub info + End Session */}
                <div className="flex items-center gap-1.5 border-l border-white/10 pl-1.5 sm:pl-2">
                    <div className="relative group/gh hidden sm:flex items-center justify-center h-8 w-8 rounded hover:bg-white/5 cursor-help transition-colors">
                        <Github className="h-4 w-4 text-zinc-400 group-hover/gh:text-white transition-colors" />
                        <div className="absolute top-10 right-0 w-60 p-2.5 rounded-xl bg-zinc-900 border border-white/10 shadow-xl opacity-0 invisible group-hover/gh:opacity-100 group-hover/gh:visible select-none pointer-events-none transition-all z-50">
                            <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-zinc-300 leading-relaxed text-left">
                                    Pushed to GitHub{" "}
                                    <strong className="text-white font-medium">
                                        only when you End Session
                                    </strong>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleEndSession}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20 text-xs font-medium cursor-pointer"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">End Session</span>
                    </button>
                </div>
            </div>
        </div>
    );

    // ── Mobile tab navigation ───────────────────────────────────
    const MobileTabBar = (
        <div className="flex items-center border-b border-white/8 bg-[#161616] shrink-0">
            {(
                [
                    { id: "problem", icon: FileText, label: "Problem" },
                    { id: "code", icon: Code2, label: "Code" },
                    { id: "results", icon: Terminal, label: "Results" },
                ] as { id: MobileTab; icon: React.ElementType; label: string }[]
            ).map(({ id, icon: Icon, label }) => (
                <button
                    key={id}
                    onClick={() => setMobileTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                        mobileTab === id
                            ? "border-orange-500 text-orange-400"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                </button>
            ))}
        </div>
    );

    // ── MOBILE layout (< 768px) — stacked tabs ──────────────────
    if (isMobile) {
        return (
            <div className="flex flex-col h-[calc(100dvh-56px)] w-full overflow-hidden bg-[#111111]">
                {TopBar}
                {MobileTabBar}
                <div className="flex-1 min-h-0 overflow-hidden">
                    {mobileTab === "problem" && <ProblemPanel question={question} />}
                    {mobileTab === "code" && <CodeEditor />}
                    {mobileTab === "results" && <TestResultsPanel />}
                </div>
            </div>
        );
    }

    // ── TABLET layout (768px–1099px) — vertical split ───────────
    if (isTablet) {
        return (
            <div className="flex flex-col h-[calc(100dvh-56px)] w-full overflow-hidden bg-[#111111]">
                {TopBar}
                {/* Vertical: Problem top-half, Code+Results lower half */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    {/* Problem panel — scrollable */}
                    <div className="h-[38%] min-h-0 border-b border-white/8">
                        <ProblemPanel question={question} />
                    </div>
                    {/* Code + Results — horizontal split */}
                    <div className="flex-1 min-h-0 flex flex-row">
                        <div className="flex-1 min-w-0 border-r border-white/8 h-full">
                            <CodeEditor />
                        </div>
                        <div className="w-[38%] min-w-[260px] max-w-[420px] h-full">
                            <TestResultsPanel />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── DESKTOP layout (≥ 1100px) — full resizable panels ───────
    return (
        <div className="flex flex-col h-[calc(100dvh-56px)] w-full overflow-hidden bg-[#111111]">
            {TopBar}
            <div className="flex-1 overflow-hidden">
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
