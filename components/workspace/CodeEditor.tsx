"use client";

import { useCallback, useEffect, useState } from "react";
import { Editor, useMonaco } from "@monaco-editor/react";
import { useChallengeStore, type Language } from "@/store/challengeStore";
import {
    editorOptions,
    defineCustomTheme,
    EDITOR_THEMES,
    type EditorThemeId,
} from "@/lib/editor/config";
import { Play, Send, ChevronDown, Palette, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const LANGUAGES: { value: Language; label: string }[] = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
];

const MONACO_LANG_MAP: Record<Language, string> = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
    cpp: "cpp",
};

const THEME_STORAGE_KEY = "codecarft-editor-theme";

function getStoredTheme(): EditorThemeId {
    if (typeof window === "undefined") return "codecarft-dark";
    return (localStorage.getItem(THEME_STORAGE_KEY) as EditorThemeId) || "codecarft-dark";
}

export function CodeEditor() {
    const monaco = useMonaco();
    const {
        currentQuestion, code, setCode, language, setLanguage,
        executeCode, isExecuting, testResults,
        generateQuestion, isGenerating, apiKey, provider
    } = useChallengeStore();

    const [selectedTheme, setSelectedTheme] = useState<EditorThemeId>(getStoredTheme);
    const [editorReady, setEditorReady] = useState(false);

    // Check if current question was solved successfully
    const isSolved = testResults?.status === "ACCEPTED";

    // Define all custom themes + set saved theme once Monaco is ready
    useEffect(() => {
        if (!monaco) return;
        defineCustomTheme(monaco);
        monaco.editor.setTheme(selectedTheme);
        setEditorReady(true);
    }, [monaco]); // eslint-disable-line react-hooks/exhaustive-deps

    // Apply theme change immediately
    const handleThemeChange = (theme: EditorThemeId) => {
        setSelectedTheme(theme);
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        if (monaco) {
            monaco.editor.setTheme(theme);
        }
    };

    const handleChange = useCallback(
        (value: string | undefined) => setCode(value || ""),
        [setCode]
    );

    const handleNextQuestion = async () => {
        if (!currentQuestion) return;
        await generateQuestion(currentQuestion.difficulty, apiKey, provider);
    };

    // Determine editor bg for theme-aware placeholder
    const editorBg =
        selectedTheme === "vs"
            ? "#ffffff"
            : selectedTheme === "github-dark"
                ? "#0d1117"
                : selectedTheme === "monokai"
                    ? "#272822"
                    : selectedTheme === "dracula"
                        ? "#282a36"
                        : "#0f0f0f";

    return (
        <div className="flex flex-col h-full" style={{ background: editorBg }}>
            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-[#0a0a0a] shrink-0 gap-2">
                {/* Left: Language + Theme selectors */}
                <div className="flex items-center gap-2">
                    {/* Language */}
                    <div className="relative">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="appearance-none bg-zinc-900 border border-white/8 rounded-lg pl-3 pr-7 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                        >
                            {LANGUAGES.map((l) => (
                                <option key={l.value} value={l.value}>
                                    {l.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
                    </div>

                    {/* Theme */}
                    <div className="relative">
                        <div className="flex items-center gap-1 bg-zinc-900 border border-white/8 rounded-lg pl-2 pr-1 py-1.5 text-xs text-white">
                            <Palette className="h-3 w-3 text-zinc-400 shrink-0" />
                            <select
                                value={selectedTheme}
                                onChange={(e) => handleThemeChange(e.target.value as EditorThemeId)}
                                className="appearance-none border-none focus:outline-none cursor-pointer text-xs text-white pr-5 bg-gray-900"
                                style={{ minWidth: 90 }}
                            >
                                {EDITOR_THEMES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Right: Run + Submit */}
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => executeCode("run")}
                        disabled={isExecuting || isGenerating}
                        className="gap-1.5 border-white/8 text-zinc-300 hover:text-white hover:border-green-500/40 bg-white/3 text-xs h-8 min-w-[72px]"
                    >
                        {isExecuting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-green-400" />
                        ) : (
                            <Play className="h-3.5 w-3.5 text-green-400" />
                        )}
                        {isExecuting ? "Running…" : "Run"}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => executeCode("submit")}
                        disabled={isExecuting || isGenerating}
                        className="gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs h-8 shadow-lg shadow-orange-500/20 min-w-[80px]"
                    >
                        {isExecuting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Send className="h-3.5 w-3.5" />
                        )}
                        {isExecuting ? "Submitting…" : "Submit"}
                    </Button>

                    {isSolved && (
                        <Button
                            size="sm"
                            onClick={handleNextQuestion}
                            disabled={isGenerating}
                            className="ml-2 gap-1.5 bg-green-500 hover:bg-green-400 text-white text-xs h-8 shadow-lg shadow-green-500/20 animate-in fade-in slide-in-from-left-2"
                        >
                            {isGenerating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <span>Next Question ➔</span>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Editor ── */}
            <div className="flex-1 overflow-hidden">
                <Editor
                    height="100%"
                    language={MONACO_LANG_MAP[language]}
                    value={code}
                    theme={selectedTheme}
                    onChange={handleChange}
                    options={editorOptions}
                    loading={
                        <div
                            className="flex flex-col items-center justify-center h-full gap-3"
                            style={{ background: editorBg }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce" />
                                <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                                <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            </div>
                            <p className="text-xs text-zinc-600">Loading editor…</p>
                        </div>
                    }
                    onMount={() => {
                        // ensure theme is applied after mount too
                        if (monaco) monaco.editor.setTheme(selectedTheme);
                    }}
                />
            </div>
        </div >
    );
}
