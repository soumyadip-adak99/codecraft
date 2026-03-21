"use client";

import { Button } from "@/components/ui/button";
import { defineCustomTheme, EDITOR_THEMES, editorOptions, type EditorThemeId } from "@/lib/editor/config";
import { useSqlStore, type SqlDialect } from "@/store/sqlStore";
import { Editor, useMonaco } from "@monaco-editor/react";
import { ChevronDown, Loader2, Palette, Play, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const SQL_DIALECTS: { value: SqlDialect; label: string }[] = [
    { value: "mysql", label: "MySQL" },
    { value: "postgresql", label: "PostgreSQL" },
    { value: "oracle", label: "Oracle SQL" },
    { value: "sqlite", label: "SQLite" },
];

const THEME_STORAGE_KEY = "codeCraft-editor-theme";

function getStoredTheme(): EditorThemeId {
    if (typeof window === "undefined") return "codeCraft-dark";
    return (localStorage.getItem(THEME_STORAGE_KEY) as EditorThemeId) || "codeCraft-dark";
}

export function SqlEditor() {
    const monaco = useMonaco();
    const {
        currentSqlQuestion,
        sqlCode,
        setSqlCode,
        sqlDialect,
        setSqlDialect,
        executeSql,
        isSqlRunning,
        isSqlSubmitting,
        isSqlGenerating,
        isSqlRunPass,
        sqlTestResults,
    } = useSqlStore();

    const [selectedTheme, setSelectedTheme] = useState<EditorThemeId>(getStoredTheme);

    const isSolved = sqlTestResults?.status === "ACCEPTED";

    useEffect(() => {
        if (!monaco) return;
        defineCustomTheme(monaco);
        monaco.editor.setTheme(selectedTheme);
    }, [monaco]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleThemeChange = (theme: EditorThemeId) => {
        setSelectedTheme(theme);
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        if (monaco) monaco.editor.setTheme(theme);
    };

    const handleChange = useCallback((value: string | undefined) => setSqlCode(value || ""), [setSqlCode]);

    const editorBg =
        selectedTheme === "vs" ? "#ffffff" :
        selectedTheme === "github-dark" ? "#0d1117" :
        selectedTheme === "monokai" ? "#272822" :
        selectedTheme === "dracula" ? "#282a36" :
        "#0f0f0f";

    return (
        <div className="flex flex-col h-full w-full min-h-0 min-w-0" style={{ background: editorBg }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-[#0a0a0a] shrink-0 gap-2">
                {/* Left: Dialect + Theme */}
                <div className="flex items-center gap-2">
                    {/* Dialect */}
                    <div className="relative">
                        <select
                            value={sqlDialect}
                            onChange={(e) => setSqlDialect(e.target.value as SqlDialect)}
                            className="appearance-none bg-zinc-900 border border-white/8 rounded-lg pl-3 pr-7 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                        >
                            {SQL_DIALECTS.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
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
                                    <option key={t.value} value={t.value}>{t.label}</option>
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
                        onClick={() => executeSql("run")}
                        disabled={isSqlRunning || isSqlGenerating}
                        className="gap-1.5 border-white/8 text-zinc-300 hover:text-white hover:border-green-500/40 bg-white/3 text-xs h-8 min-w-18"
                    >
                        {isSqlRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin text-green-400" /> : <Play className="h-3.5 w-3.5 text-green-400" />}
                        {isSqlRunning ? "Running…" : "Run"}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => executeSql("submit")}
                        disabled={isSqlSubmitting || isSqlGenerating || !isSqlRunPass}
                        title={!isSqlRunPass ? "Run your query first" : "Submit solution"}
                        className={`gap-1.5 text-xs h-8 shadow-lg min-w-20 ${
                            !isSqlRunPass
                                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed shadow-none"
                                : "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/20"
                        }`}
                    >
                        {isSqlSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        {isSqlSubmitting ? "Submitting…" : "Submit"}
                    </Button>

                    {isSolved && (
                        <Button
                            size="sm"
                            onClick={() => {/* handled via WorkspaceLayout */}}
                            className="ml-2 gap-1.5 bg-green-500 hover:bg-green-400 text-white text-xs h-8 shadow-lg shadow-green-500/20 animate-in fade-in slide-in-from-left-2"
                        >
                            <span>Solved ✓</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Monaco Editor — SQL mode */}
            <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-hidden relative">
                <Editor
                    height="100%"
                    language="sql"
                    value={sqlCode}
                    theme={selectedTheme}
                    onChange={handleChange}
                    options={{
                        ...editorOptions,
                        wordWrap: "on",
                    }}
                    loading={
                        <div className="flex flex-col items-center justify-center h-full gap-3" style={{ background: editorBg }}>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce" />
                                <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                                <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            </div>
                            <p className="text-xs text-zinc-600">Loading SQL editor…</p>
                        </div>
                    }
                    onMount={() => {
                        if (monaco) monaco.editor.setTheme(selectedTheme);
                    }}
                />
            </div>
        </div>
    );
}
