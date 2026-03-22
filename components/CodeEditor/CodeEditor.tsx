"use client";

import { useRef } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion, AnimatePresence } from "framer-motion";

// ── Python Code lines ──────────────────────────────────────
const CODE_LINES: { tokens: { text: string; type: "keyword" | "string" | "comment" | "plain" | "fn" }[] }[] = [
  { tokens: [{ text: "def", type: "keyword" }, { text: " twoSum(nums: list[int], target: int) -> list[int]:", type: "plain" }] },
  { tokens: [{ text: "    ", type: "plain" }, { text: '"""', type: "string" }, { text: " AI-generated challenge · O(n) time ", type: "comment" }, { text: '"""', type: "string" }] },
  { tokens: [{ text: "    seen: dict[int, int]", type: "plain" }, { text: " = {}", type: "plain" }] },
  { tokens: [{ text: "    for", type: "keyword" }, { text: " i, num ", type: "plain" }, { text: "in", type: "keyword" }, { text: " enumerate(nums):", type: "plain" }] },
  { tokens: [{ text: "        diff", type: "plain" }, { text: " = ", type: "plain" }, { text: "target", type: "fn" }, { text: " - num", type: "plain" }] },
  { tokens: [{ text: "        if", type: "keyword" }, { text: " diff ", type: "plain" }, { text: "in", type: "keyword" }, { text: " seen:", type: "plain" }] },
  { tokens: [{ text: "            return", type: "keyword" }, { text: " [seen[diff], i]", type: "plain" }] },
  { tokens: [{ text: "        seen[num] = i", type: "plain" }] },
  { tokens: [{ text: "    return", type: "keyword" }, { text: " []", type: "plain" }, { text: "  # no solution found", type: "comment" }] },
];
const LINE_DELAYS = [400, 300, 500, 400, 350, 380, 320, 380, 450];
const OUTPUT_LINES = [
  { label: "✓", text: "Test case 1 passed · [0, 1]",   colour: "text-emerald-400" },
  { label: "✓", text: "Test case 2 passed · [1, 2]",   colour: "text-emerald-400" },
  { label: "✓", text: "All 47 test cases passed",       colour: "text-emerald-400" },
  { label: "⚡", text: "Runtime: 52ms · Beats 94.8%",  colour: "text-[#ff6b00]" },
];

// ── JS Code lines ──────────────────────────────────────────
const JS_CODE_LINES: { tokens: { text: string; type: "keyword" | "string" | "comment" | "plain" | "fn" }[] }[] = [
  { tokens: [{ text: "function", type: "keyword" }, { text: " twoSum", type: "fn" }, { text: "(nums, target) {", type: "plain" }] },
  { tokens: [{ text: "  ", type: "plain" }, { text: "// O(n) hash map approach", type: "comment" }] },
  { tokens: [{ text: "  const", type: "keyword" }, { text: " seen = ", type: "plain" }, { text: "new", type: "keyword" }, { text: " Map();", type: "fn" }] },
  { tokens: [{ text: "  for", type: "keyword" }, { text: " (", type: "plain" }, { text: "let", type: "keyword" }, { text: " i = 0; i < nums.length; i++) {", type: "plain" }] },
  { tokens: [{ text: "    const", type: "keyword" }, { text: " diff = target - nums[i];", type: "plain" }] },
  { tokens: [{ text: "    if", type: "keyword" }, { text: " (seen.has(diff)) {", type: "plain" }] },
  { tokens: [{ text: "      return", type: "keyword" }, { text: " [seen.get(diff), i];", type: "plain" }] },
  { tokens: [{ text: "    }", type: "plain" }] },
  { tokens: [{ text: "    seen.set(nums[i], i);", type: "plain" }] },
  { tokens: [{ text: "  }", type: "plain" }] },
  { tokens: [{ text: "  return", type: "keyword" }, { text: " [];", type: "plain" }] },
  { tokens: [{ text: "}", type: "plain" }] },
];
const JS_LINE_DELAYS = [300, 200, 350, 400, 350, 300, 320, 150, 350, 150, 250, 150];
const JS_OUTPUT_LINES = [
  { label: "✓", text: "Test cases passed (47/47)", colour: "text-emerald-400" },
  { label: "⚡", text: "Runtime: 49ms · 96.1%", colour: "text-[#fcd34d]" },
];

// ── Token colour map ────────────────────────────────────────
const tokenColour: Record<string, string> = {
  keyword: "text-[#ff6b00]",
  string:  "text-[#86efac]",
  comment: "text-[#4a4a5a] italic",
  fn:      "text-[#93c5fd]",
  plain:   "text-[#e2e8f0]",
};

const jsTokenColour: Record<string, string> = {
  keyword: "text-[#fcd34d]", // Yellow for JS
  string:  "text-[#86efac]",
  comment: "text-[#4a4a5a] italic",
  fn:      "text-[#93c5fd]",
  plain:   "text-[#e2e8f0]",
};

export default function CodeEditor({ className = "" }: { className?: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  // GSAP fade-up the whole section on scroll entry
  useScrollAnimation(sectionRef as React.RefObject<HTMLElement>, {
    from: { opacity: 0, y: 60, scale: 0.97 },
    to:   { opacity: 1, y: 0,  scale: 1    },
    start: "top 85%",
    duration: 0.9,
  });

  // Typewriter triggered on scroll
  const { visibleLines: pyVisible, isComplete: pyComplete } = useTypewriter(sectionRef as React.RefObject<HTMLElement>, {
    totalLines: CODE_LINES.length,
    lineDelays: LINE_DELAYS,
    scrollStart: "top 75%",
  });

  const { visibleLines: jsVisible, isComplete: jsComplete } = useTypewriter(sectionRef as React.RefObject<HTMLElement>, {
    totalLines: JS_CODE_LINES.length,
    lineDelays: JS_LINE_DELAYS,
    scrollStart: "top 75%",
  });

  return (
    <section
      ref={sectionRef}
      className={`relative pt-8 sm:pt-12 pb-20 sm:pb-32 px-4 sm:px-6 max-w-6xl mx-auto z-20 ${className}`}
    >
      <div className="flex justify-center items-center w-full">
        {/* ── Desktop Python Editor ─────────────────────────────────── */}
        <div className="hidden lg:block glass-editor rounded-xl sm:rounded-2xl overflow-hidden w-full max-w-4xl relative drop-shadow-2xl">
          {/* Title bar */}
          <div className="flex items-center px-3 sm:px-5 py-2.5 sm:py-3 bg-white/[0.03] border-b border-white/[0.06]">
            {/* Traffic lights */}
            <div className="flex gap-1.5" aria-hidden="true">
              <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#28c840]" />
            </div>
            {/* File name */}
            <span className="mx-auto text-[10px] sm:text-xs font-mono text-[#666] select-none tracking-widest">
              solution.py
            </span>
            {/* Language badge */}
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#ff6b00]/70 bg-[#ff6b00]/10 px-1.5 sm:px-2 py-0.5 rounded">
              Python
            </span>
          </div>

          {/* Code body */}
          <div className="p-4 sm:p-6 font-mono text-[11px] sm:text-sm leading-6 sm:leading-7 overflow-x-auto min-h-[220px] sm:min-h-[280px] bg-[#080808]/60">
            <div className="flex gap-3 sm:gap-4 min-w-max sm:min-w-0">
              {/* Line numbers */}
              <div
                className="flex flex-col text-[#333] select-none text-right shrink-0 w-5 sm:w-6 pt-[1px]"
                aria-hidden="true"
              >
                {CODE_LINES.map((_, i) => (
                  <span
                    key={i}
                    className={`transition-opacity duration-200 ${i < pyVisible ? "opacity-100" : "opacity-0"}`}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>

              {/* Code lines */}
              <div className="flex flex-col">
                {CODE_LINES.map((line, i) => (
                  <div
                    key={i}
                    className={`whitespace-pre transition-all duration-200 ${
                      i < pyVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                    }`}
                  >
                    {line.tokens.map((tok, j) => (
                      <span key={j} className={tokenColour[tok.type]}>
                        {tok.text}
                      </span>
                    ))}
                  </div>
                ))}

                {/* Blinking cursor */}
                {!pyComplete && (
                  <span
                    className="inline-block w-1.5 sm:w-2 h-4 sm:h-5 bg-[#ff6b00] animate-blink ml-0.5 align-middle"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Output panel — slides in on complete ────────── */}
          <AnimatePresence>
            {pyComplete && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden border-t border-white/[0.06]"
              >
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#050505]/80 font-mono text-[10px] sm:text-xs">
                  <p className="text-[#444] mb-2 uppercase tracking-wider text-[9px] sm:text-[10px]">
                    ▶ Output
                  </p>
                  {OUTPUT_LINES.map((line, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 0.3 }}
                      className={`flex items-center gap-1.5 sm:gap-2 ${line.colour}`}
                    >
                      <span>{line.label}</span>
                      <span>{line.text}</span>
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Mobile JavaScript Editor ─────────────────────────────────── */}
        <div className="lg:hidden relative mx-auto w-full flex-shrink-0 max-w-[300px] sm:max-w-[340px] aspect-[9/19] bg-[#050505] rounded-[2.5rem] border-[8px] sm:border-[10px] border-[#1a1a1a] drop-shadow-2xl overflow-hidden flex flex-col group">
          {/* Mobile Notch */}
          <div className="absolute top-0 inset-x-0 w-28 sm:w-32 h-6 sm:h-7 bg-[#1a1a1a] mx-auto rounded-b-2xl z-20 flex items-center justify-center gap-2" aria-hidden="true">
             <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />
             <div className="w-1 h-1 rounded-full bg-white/10" />
          </div>

          {/* Top status bar (mock) */}
          <div className="h-7 w-full flex items-center justify-between px-5 text-[#888] text-[9px] font-medium pt-1 z-10 selection:bg-transparent cursor-default">
            <span>9:41</span>
            <div className="flex gap-1 items-center">
              <span className="w-3 h-2 bg-[#888] rounded-sm"></span>
              <span className="w-2 h-2 rounded-full bg-[#888]"></span>
            </div>
          </div>

          {/* Mobile Title bar */}
          <div className="flex items-center px-4 py-2.5 border-b border-white/[0.04] bg-[#090909]/90 mt-1">
            <span className="text-[9px] sm:text-[10px] font-mono text-[#666] select-none tracking-widest bg-white/[0.02] px-2 py-0.5 rounded">
               index.js
            </span>
            <span className="ml-auto text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest text-[#fcd34d]/80 bg-[#fcd34d]/10 px-1.5 py-0.5 rounded">
              JS
            </span>
          </div>

          {/* JS Body */}
          <div className="flex-1 p-4 font-mono text-[9px] sm:text-[10.5px] leading-6 sm:leading-[1.7] overflow-x-auto bg-[#030303]">
            <div className="flex gap-2 min-w-max">
              <div className="flex flex-col text-[#333] select-none text-right shrink-0 w-3 sm:w-4 pt-[1px]" aria-hidden="true">
                {JS_CODE_LINES.map((_, i) => (
                  <span key={i} className={`transition-opacity duration-200 ${i < jsVisible ? "opacity-100" : "opacity-0"}`}>
                    {i + 1}
                  </span>
                ))}
              </div>
              <div className="flex flex-col">
                {JS_CODE_LINES.map((line, i) => (
                  <div key={i} className={`whitespace-pre transition-all duration-200 ${i < jsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                    {line.tokens.map((tok, j) => (
                      <span key={j} className={jsTokenColour[tok.type]}>{tok.text}</span>
                    ))}
                  </div>
                ))}
                {!jsComplete && (
                  <span className="inline-block w-1.5 h-3.5 bg-[#fcd34d] animate-blink ml-0.5 align-middle" aria-hidden="true" />
                )}
              </div>
            </div>
          </div>

          {/* Output panel */}
          <AnimatePresence>
            {jsComplete && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden border-t border-white/[0.04]"
              >
                <div className="px-4 py-3 bg-[#0a0a0a]/80 font-mono text-[9px] sm:text-[10px]">
                  <p className="text-[#444] mb-2 uppercase tracking-wider text-[8px] sm:text-[9px]">
                    ▶ Output
                  </p>
                  {JS_OUTPUT_LINES.map((line, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 0.3 }}
                      className={`flex items-center gap-1.5 ${line.colour}`}
                    >
                      <span>{line.label}</span>
                      <span>{line.text}</span>
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Home Indicator */}
          <div className="mt-auto h-1 w-28 bg-white/20 rounded-full mx-auto mb-3" />
          
          {/* Subtle inner shadow for screen depth */}
          <div className="absolute inset-0 rounded-[1.8rem] pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" aria-hidden="true"/>
        </div>
      </div>

      {/* ── Decorative glow behind the section ─────────────── */}
      <div
        className="absolute inset-0 rounded-2xl bg-[#ff6b00] blur-[100px] opacity-[0.03] pointer-events-none"
        aria-hidden="true"
      />
      <div 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#fcd34d] blur-[120px] opacity-[0.02] pointer-events-none"
        aria-hidden="true" 
      />
    </section>
  );
}
