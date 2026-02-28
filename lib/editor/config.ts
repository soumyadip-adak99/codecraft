import type { Monaco } from "@monaco-editor/react";

export const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontLigatures: true,
  lineNumbers: "on" as const,
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 16, bottom: 16 },
  folding: true,
  lineDecorationsWidth: 8,
  lineNumbersMinChars: 3,
  renderWhitespace: "selection" as const,
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true, indentation: true },
  suggest: { showKeywords: true, showSnippets: true },
  quickSuggestions: true,
  wordBasedSuggestions: "currentDocument" as const,
  parameterHints: { enabled: true },
  formatOnPaste: true,
  formatOnType: true,
  tabSize: 2,
  insertSpaces: true,
  smoothScrolling: true,
  cursorBlinking: "smooth" as const,
  cursorSmoothCaretAnimation: "on" as const,
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
};

export type EditorThemeId =
  | "codecarft-dark"
  | "vs-dark"
  | "vs"
  | "hc-black"
  | "github-dark"
  | "monokai"
  | "dracula";

export const EDITOR_THEMES: { value: EditorThemeId; label: string; base: "vs-dark" | "vs" | "hc-black" }[] = [
  { value: "codecarft-dark", label: "CodeCraft Dark", base: "vs-dark" },
  { value: "vs-dark",        label: "VS Dark",        base: "vs-dark" },
  { value: "vs",             label: "Light",          base: "vs"      },
  { value: "hc-black",       label: "High Contrast",  base: "hc-black"},
  { value: "github-dark",    label: "GitHub Dark",    base: "vs-dark" },
  { value: "monokai",        label: "Monokai",        base: "vs-dark" },
  { value: "dracula",        label: "Dracula",        base: "vs-dark" },
];

export function defineCustomTheme(monaco: Monaco) {
  // CodeCraft Dark (custom orange-accented VSCode theme)
  monaco.editor.defineTheme("codecarft-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment",    foreground: "6A9955", fontStyle: "italic" },
      { token: "keyword",    foreground: "569CD6" },
      { token: "identifier", foreground: "9CDCFE" },
      { token: "string",     foreground: "CE9178" },
      { token: "number",     foreground: "B5CEA8" },
      { token: "function",   foreground: "DCDCAA" },
      { token: "type",       foreground: "4EC9B0" },
      { token: "class",      foreground: "4EC9B0" },
      { token: "operator",   foreground: "D4D4D4" },
      { token: "delimiter",  foreground: "D4D4D4" },
    ],
    colors: {
      "editor.background":                "#0f0f0f",
      "editor.foreground":                "#D4D4D4",
      "editor.lineHighlightBackground":   "#1a1a1a",
      "editorLineNumber.foreground":      "#555",
      "editorLineNumber.activeForeground":"#f97316",
      "editor.selectionBackground":       "#264f7850",
      "editor.inactiveSelectionBackground":"#3a3d4130",
      "editorCursor.foreground":          "#f97316",
      "editorSuggestWidget.background":   "#1a1a1a",
      "editorSuggestWidget.border":       "#333",
      "editorSuggestWidget.selectedBackground":"#264f78",
      "editorWidget.background":          "#1a1a1a",
      "editorWidget.border":              "#333",
      "editor.findMatchBackground":       "#f9731630",
      "editor.findMatchHighlightBackground":"#f9731620",
      "scrollbarSlider.background":       "#33333360",
      "scrollbarSlider.hoverBackground":  "#f9731640",
      "minimap.background":               "#0d0d0d",
    },
  });

  // GitHub Dark
  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment",    foreground: "8b949e", fontStyle: "italic" },
      { token: "keyword",    foreground: "ff7b72" },
      { token: "string",     foreground: "a5d6ff" },
      { token: "number",     foreground: "79c0ff" },
      { token: "function",   foreground: "d2a8ff" },
      { token: "type",       foreground: "ffa657" },
      { token: "class",      foreground: "ffa657" },
    ],
    colors: {
      "editor.background":               "#0d1117",
      "editor.foreground":               "#c9d1d9",
      "editor.lineHighlightBackground":  "#161b22",
      "editorLineNumber.foreground":     "#6e7681",
      "editorLineNumber.activeForeground":"#e6edf3",
      "editor.selectionBackground":      "#264f7840",
      "editorCursor.foreground":         "#58a6ff",
    },
  });

  // Monokai
  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment",    foreground: "75715e", fontStyle: "italic" },
      { token: "keyword",    foreground: "f92672" },
      { token: "identifier", foreground: "f8f8f2" },
      { token: "string",     foreground: "e6db74" },
      { token: "number",     foreground: "ae81ff" },
      { token: "function",   foreground: "a6e22e" },
      { token: "type",       foreground: "66d9ef", fontStyle: "italic" },
      { token: "class",      foreground: "a6e22e" },
    ],
    colors: {
      "editor.background":               "#272822",
      "editor.foreground":               "#f8f8f2",
      "editor.lineHighlightBackground":  "#3e3d32",
      "editorLineNumber.foreground":     "#75715e",
      "editorLineNumber.activeForeground":"#f8f8f2",
      "editor.selectionBackground":      "#49483e",
      "editorCursor.foreground":         "#f8f8f0",
    },
  });

  // Dracula
  monaco.editor.defineTheme("dracula", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment",    foreground: "6272a4", fontStyle: "italic" },
      { token: "keyword",    foreground: "ff79c6" },
      { token: "string",     foreground: "f1fa8c" },
      { token: "number",     foreground: "bd93f9" },
      { token: "function",   foreground: "50fa7b" },
      { token: "type",       foreground: "8be9fd", fontStyle: "italic" },
      { token: "class",      foreground: "8be9fd" },
      { token: "variable",   foreground: "f8f8f2" },
    ],
    colors: {
      "editor.background":               "#282a36",
      "editor.foreground":               "#f8f8f2",
      "editor.lineHighlightBackground":  "#44475a",
      "editorLineNumber.foreground":     "#6272a4",
      "editorLineNumber.activeForeground":"#f8f8f2",
      "editor.selectionBackground":      "#44475a",
      "editorCursor.foreground":         "#f8f8f0",
    },
  });
}
