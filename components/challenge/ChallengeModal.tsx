"use client";

import { useRef, useEffect, useState } from "react";
import { Zap, ChevronDown, Key, X, AlertCircle, Loader2, Server, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore, useChallengeStore } from "@/store";
import { animations } from "@/lib/animations/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
const PROVIDERS = [
    { value: "openai", label: "OpenAI (GPT-4)" },
    { value: "anthropic", label: "Anthropic (Claude)" },
    { value: "google", label: "Google (Gemini)" },
    { value: "groq", label: "Groq (Llama 3.3)" },
    { value: "custom", label: "Custom / Local" },
];

export function ChallengeModal() {
    const { isChallengeModalOpen, closeChallengeModal } = useUIStore();
    const {
        generateQuestion,
        startSession,
        sessionActive,
        isGenerating,
        generationError,
        currentQuestion,
        canGoNext,
    } = useChallengeStore();
    const router = useRouter();

    const backdropRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
    const [provider, setProvider] = useState("groq");
    const [apiKey, setApiKey] = useState("");
    const [topic, setTopic] = useState("");
    const [customBaseUrl, setCustomBaseUrl] = useState("");
    const [useDefaultKey, setUseDefaultKey] = useState(true);

    useEffect(() => {
        if (!backdropRef.current || !contentRef.current) return;
        if (isChallengeModalOpen) {
            animations.modalOpen(backdropRef.current, contentRef.current);
        }
    }, [isChallengeModalOpen]);

    const handleClose = () => {
        if (!backdropRef.current || !contentRef.current) return;
        animations.modalClose(backdropRef.current, contentRef.current, closeChallengeModal);
    };

    const handleGenerate = async () => {
        const effectiveKey = useDefaultKey ? "" : apiKey.trim();
        if (!useDefaultKey && !effectiveKey) {
            toast.error("Please enter your API key or use the default server key");
            return;
        }

        // If no active session, start one
        if (!sessionActive) {
            startSession();
        }

        await generateQuestion(
            difficulty,
            effectiveKey,
            useDefaultKey ? "groq" : provider,
            topic.trim() || undefined
        );
    };

    useEffect(() => {
        if (currentQuestion && !isGenerating) {
            handleClose();
            router.push(`/challenge/${currentQuestion.questionId}`);
        }
    }, [currentQuestion, isGenerating]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!isChallengeModalOpen) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => {
                if (e.target === backdropRef.current) handleClose();
            }}
        >
            <div
                ref={contentRef}
                className="w-full max-w-lg glass rounded-2xl border border-white/8 overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20">
                            <Play className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">
                                {sessionActive ? "Next Question" : "Start Session"}
                            </h2>
                            <p className="text-xs text-zinc-500">
                                AI-generated challenge just for you
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Difficulty */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">
                            Difficulty
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {DIFFICULTIES.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${difficulty === d
                                        ? d === "Easy"
                                            ? "bg-green-500/20 border-green-500/40 text-green-400"
                                            : d === "Medium"
                                                ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                                                : "bg-red-500/20 border-red-500/40 text-red-400"
                                        : "border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300 bg-white/2"
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topic */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">
                            Topic <span className="text-zinc-600">(optional)</span>
                        </label>
                        <Input
                            placeholder="e.g. Binary Trees, Dynamic Programming, Graphs…"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-white/3 border-white/8 text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-orange-500/20"
                        />
                    </div>

                    {/* Default key toggle */}
                    <div
                        onClick={() => setUseDefaultKey(!useDefaultKey)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${useDefaultKey
                            ? "bg-orange-500/10 border-orange-500/30"
                            : "bg-white/3 border-white/8 hover:border-white/15"
                            }`}
                    >
                        <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${useDefaultKey ? "bg-orange-500/20" : "bg-white/5"}`}
                        >
                            <Server
                                className={`h-4 w-4 ${useDefaultKey ? "text-orange-400" : "text-zinc-500"}`}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p
                                className={`text-sm font-medium ${useDefaultKey ? "text-orange-300" : "text-zinc-300"}`}
                            >
                                Use Default Server Key
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                                Powered by Groq Llama 3.3 — no key needed
                            </p>
                        </div>
                        <div
                            className={`h-5 w-9 rounded-full transition-colors ${useDefaultKey ? "bg-orange-500" : "bg-zinc-700"}`}
                        >
                            <div
                                className={`h-4 w-4 bg-white rounded-full shadow m-0.5 transition-transform ${useDefaultKey ? "translate-x-4" : "translate-x-0"}`}
                            />
                        </div>
                    </div>

                    {/* Custom key section */}
                    {!useDefaultKey && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">
                                    LLM Provider
                                </label>
                                <div className="relative">
                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value)}
                                        className="w-full appearance-none bg-zinc-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                                    >
                                        {PROVIDERS.map((p) => (
                                            <option key={p.value} value={p.value}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>

                            {provider === "custom" && (
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-2">
                                        Base URL
                                    </label>
                                    <Input
                                        placeholder="https://api.example.com/v1"
                                        value={customBaseUrl}
                                        onChange={(e) => setCustomBaseUrl(e.target.value)}
                                        className="bg-white/3 border-white/8 text-white placeholder:text-zinc-600 focus:border-orange-500/50"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
                                    <Key className="h-3.5 w-3.5" />
                                    API Key
                                </label>
                                <Input
                                    type="password"
                                    placeholder="sk-… or your API key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="bg-white/3 border-white/8 text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-orange-500/20 font-mono text-sm"
                                />
                                <p className="mt-1.5 text-[11px] text-zinc-600">
                                    Your key is used to call the LLM directly and never stored on
                                    our servers.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Error */}
                    {generationError && (
                        <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{generationError}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 space-y-3">
                    {/* Hint when button is locked mid-session */}
                    {sessionActive && !canGoNext && !isGenerating && (
                        <p className="text-center text-xs text-zinc-500 mb-3">
                            Submit the current challenge first to unlock the next one.
                        </p>
                    )}
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || (!useDefaultKey && !apiKey.trim()) || (sessionActive && !canGoNext)}
                        title={sessionActive && !canGoNext ? "Submit the current challenge first" : undefined}
                        className="w-full bg-orange-500 hover:bg-orange-400 text-white gap-2 py-5 text-base font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating {difficulty} challenge…
                            </>
                        ) : (
                            <>
                                <Zap className="h-4 w-4" />
                                {sessionActive
                                    ? `Next ${difficulty} Challenge`
                                    : `Start Session — ${difficulty}`}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
