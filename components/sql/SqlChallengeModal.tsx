"use client";

import { useRef, useEffect, useState } from "react";
import { Database, ChevronDown, Key, X, AlertCircle, Loader2, Server, Play, BookKey } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store";
import { useSqlStore, type SqlDialect, type SqlDifficulty } from "@/store/sqlStore";
import { animations } from "@/lib/animations/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DIFFICULTIES: SqlDifficulty[] = ["Easy", "Medium", "Hard"];
const PROVIDERS = [
    { value: "openai", label: "OpenAI (GPT-4)" },
    { value: "anthropic", label: "Anthropic (Claude)" },
    { value: "google", label: "Google (Gemini)" },
    { value: "groq", label: "Groq (Llama 3.3)" },
    { value: "custom", label: "Custom / Local" },
];
const SQL_DIALECTS: { value: SqlDialect; label: string; color: string }[] = [
    { value: "mysql", label: "MySQL", color: "text-orange-400" },
    { value: "postgresql", label: "PostgreSQL", color: "text-cyan-400" },
    { value: "oracle", label: "Oracle SQL", color: "text-red-400" },
    { value: "sqlite", label: "SQLite", color: "text-green-400" },
];

type KeyMode = "default" | "saved" | "custom";

export function SqlChallengeModal() {
    const { isSqlModalOpen, closeSqlModal } = useUIStore();
    const { generateSqlQuestion, startSqlSession, sqlSessionActive, isSqlGenerating, sqlGenerationError, currentSqlQuestion, canGoNextSql } = useSqlStore();
    const router = useRouter();

    const backdropRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [difficulty, setDifficulty] = useState<SqlDifficulty>("Medium");
    const [dialect, setDialect] = useState<SqlDialect>("mysql");
    const [provider, setProvider] = useState("groq");
    const [apiKey, setApiKey] = useState("");
    const [topic, setTopic] = useState("");
    const [keyMode, setKeyMode] = useState<KeyMode>("default");
    const [savedKeyStatus, setSavedKeyStatus] = useState<{ hasKey: boolean; provider: string | null; loaded: boolean }>({ hasKey: false, provider: null, loaded: false });

    useEffect(() => {
        fetch("/api/user/apikey")
            .then((res) => res.json())
            .then((data) => {
                setSavedKeyStatus({ hasKey: !!data.hasKey, provider: data.provider ?? null, loaded: true });
                if (data.hasKey && !sqlSessionActive) setKeyMode("saved");
            })
            .catch(() => setSavedKeyStatus({ hasKey: false, provider: null, loaded: true }));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!backdropRef.current || !contentRef.current) return;
        if (isSqlModalOpen) animations.modalOpen(backdropRef.current, contentRef.current);
    }, [isSqlModalOpen]);

    const handleClose = () => {
        if (!backdropRef.current || !contentRef.current) return;
        animations.modalClose(backdropRef.current, contentRef.current, closeSqlModal);
    };

    const handleGenerate = async () => {
        if (keyMode === "custom" && !apiKey.trim()) {
            toast.error("Please enter your API key or use the default server key");
            return;
        }
        if (!sqlSessionActive) startSqlSession();

        if (keyMode === "saved") {
            await generateSqlQuestion(dialect, difficulty, "__SAVED__", savedKeyStatus.provider || "groq", topic.trim() || undefined, true);
        } else {
            const effectiveKey = keyMode === "default" ? "" : apiKey.trim();
            await generateSqlQuestion(dialect, difficulty, effectiveKey, keyMode === "default" ? "groq" : provider, topic.trim() || undefined, false);
        }
    };

    useEffect(() => {
        if (currentSqlQuestion && !isSqlGenerating) {
            handleClose();
            router.push("/sql");
        }
    }, [currentSqlQuestion, isSqlGenerating]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!isSqlModalOpen) return null;

    const isButtonDisabled = isSqlGenerating || (keyMode === "custom" && !apiKey.trim()) || (sqlSessionActive && !canGoNextSql);

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === backdropRef.current) handleClose(); }}
        >
            <div ref={contentRef} className="w-full max-w-lg glass rounded-2xl border border-white/8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20">
                            <Database className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">
                                {sqlSessionActive ? "Next SQL Question" : "Start SQL Practice"}
                            </h2>
                            <p className="text-xs text-zinc-500">AI-generated SQL challenges</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* SQL Dialect */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">SQL Dialect</label>
                        <div className="grid grid-cols-4 gap-2">
                            {SQL_DIALECTS.map((d) => (
                                <button
                                    key={d.value}
                                    onClick={() => setDialect(d.value)}
                                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                                        dialect === d.value
                                            ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                                            : "border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300 bg-white/2"
                                    }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Difficulty</label>
                        <div className="grid grid-cols-3 gap-2">
                            {DIFFICULTIES.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                                        difficulty === d
                                            ? d === "Easy" ? "bg-green-500/20 border-green-500/40 text-green-400"
                                            : d === "Medium" ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
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
                            placeholder="e.g. JOINs, GROUP BY, subqueries, window functions…"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-white/3 border-white/8 text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-orange-500/20"
                        />
                    </div>

                    {/* API Key Mode */}
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-400">API Key</label>
                        {/* Default */}
                        <div onClick={() => setKeyMode("default")} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${keyMode === "default" ? "bg-orange-500/10 border-orange-500/30" : "bg-white/3 border-white/8 hover:border-white/15"}`}>
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${keyMode === "default" ? "bg-orange-500/20" : "bg-white/5"}`}>
                                <Server className={`h-4 w-4 ${keyMode === "default" ? "text-orange-400" : "text-zinc-500"}`} />
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${keyMode === "default" ? "text-orange-300" : "text-zinc-300"}`}>Use Default Server Key</p>
                                <p className="text-[11px] text-zinc-500 mt-0.5">Powered by Groq Llama 3.3 — no key needed</p>
                            </div>
                            <div className={`h-5 w-9 rounded-full transition-colors ${keyMode === "default" ? "bg-orange-500" : "bg-zinc-700"}`}>
                                <div className={`h-4 w-4 bg-white rounded-full shadow m-0.5 transition-transform ${keyMode === "default" ? "translate-x-4" : "translate-x-0"}`} />
                            </div>
                        </div>

                        {/* Saved key */}
                        {savedKeyStatus.loaded && savedKeyStatus.hasKey && (
                            <div onClick={() => setKeyMode("saved")} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${keyMode === "saved" ? "bg-green-500/10 border-green-500/30" : "bg-white/3 border-white/8 hover:border-white/15"}`}>
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${keyMode === "saved" ? "bg-green-500/20" : "bg-white/5"}`}>
                                    <BookKey className={`h-4 w-4 ${keyMode === "saved" ? "text-green-400" : "text-zinc-500"}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-medium ${keyMode === "saved" ? "text-green-300" : "text-zinc-300"}`}>Use Saved API Key</p>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">{savedKeyStatus.provider?.toUpperCase() ?? "SAVED"}</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">Securely saved in Settings</p>
                                </div>
                                <div className={`h-5 w-9 rounded-full transition-colors ${keyMode === "saved" ? "bg-green-500" : "bg-zinc-700"}`}>
                                    <div className={`h-4 w-4 bg-white rounded-full shadow m-0.5 transition-transform ${keyMode === "saved" ? "translate-x-4" : "translate-x-0"}`} />
                                </div>
                            </div>
                        )}

                        {/* Custom key */}
                        <div onClick={() => setKeyMode("custom")} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${keyMode === "custom" ? "bg-purple-500/10 border-purple-500/30" : "bg-white/3 border-white/8 hover:border-white/15"}`}>
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${keyMode === "custom" ? "bg-purple-500/20" : "bg-white/5"}`}>
                                <Key className={`h-4 w-4 ${keyMode === "custom" ? "text-purple-400" : "text-zinc-500"}`} />
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${keyMode === "custom" ? "text-purple-300" : "text-zinc-300"}`}>Use Custom Key</p>
                                <p className="text-[11px] text-zinc-500 mt-0.5">Enter your own API key</p>
                            </div>
                            <div className={`h-5 w-9 rounded-full transition-colors ${keyMode === "custom" ? "bg-purple-500" : "bg-zinc-700"}`}>
                                <div className={`h-4 w-4 bg-white rounded-full shadow m-0.5 transition-transform ${keyMode === "custom" ? "translate-x-4" : "translate-x-0"}`} />
                            </div>
                        </div>
                    </div>

                    {/* Custom key inputs */}
                    {keyMode === "custom" && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">LLM Provider</label>
                                <div className="relative">
                                    <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full appearance-none bg-zinc-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 cursor-pointer">
                                        {PROVIDERS.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1.5"><Key className="h-3.5 w-3.5" /> API Key</label>
                                <Input type="password" placeholder="sk-… or your API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="bg-white/3 border-white/8 text-white placeholder:text-zinc-600 focus:border-orange-500/50 font-mono text-sm" />
                            </div>
                        </>
                    )}

                    {/* Error */}
                    {sqlGenerationError && (
                        <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{sqlGenerationError}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 space-y-3">
                    {sqlSessionActive && !canGoNextSql && !isSqlGenerating && (
                        <p className="text-center text-xs text-zinc-500 mb-3">Submit the current SQL challenge first to unlock the next one.</p>
                    )}
                    <Button
                        onClick={handleGenerate}
                        disabled={isButtonDisabled}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white gap-2 py-5 text-base font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSqlGenerating ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Generating {difficulty} SQL challenge…</>
                        ) : (
                            <><Play className="h-4 w-4" />{sqlSessionActive ? `Next ${difficulty} SQL Challenge` : `Start SQL Session — ${difficulty}`}</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
