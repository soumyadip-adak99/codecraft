"use client";

/**
 * CodeEditor.tsx
 * ─────────────────────────────────────────────────────────
 * Live code editor demo with scroll-triggered typewriter effect.
 * - Glassmorphism container (glass-editor CSS class)
 * - Syntax-highlighted keyword tokens (inline, no extra lib)
 * - Blinking cursor while typing, hides on complete
 * - Simulated output panel slides in after last line
 * - Animation via useTypewriter hook (scroll-triggered, not interval)
 * ─────────────────────────────────────────────────────────
 */

import { useRef } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion, AnimatePresence } from "framer-motion";

// ── Code lines ─────────────────────────────────────────────
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

// ── Token colour map ────────────────────────────────────────
const tokenColour: Record<string, string> = {
  keyword: "text-[#ff6b00]",
  string:  "text-[#86efac]",
  comment: "text-[#4a4a5a] italic",
  fn:      "text-[#93c5fd]",
  plain:   "text-[#e2e8f0]",
};

// ── Output panel lines ──────────────────────────────────────
const OUTPUT_LINES = [
  { label: "✓", text: "Test case 1 passed · [0, 1]",   colour: "text-emerald-400" },
  { label: "✓", text: "Test case 2 passed · [1, 2]",   colour: "text-emerald-400" },
  { label: "✓", text: "All 47 test cases passed",       colour: "text-emerald-400" },
  { label: "⚡", text: "Runtime: 52ms · Beats 94.8%",  colour: "text-[#ff6b00]" },
];

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
  const { visibleLines, isComplete } = useTypewriter(sectionRef as React.RefObject<HTMLElement>, {
    totalLines: CODE_LINES.length,
    lineDelays: LINE_DELAYS,
    scrollStart: "top 75%",
  });

  return (
    <section
      ref={sectionRef}
      className={`relative pt-8 sm:pt-12 pb-20 sm:pb-32 px-4 sm:px-6 max-w-5xl mx-auto z-20 ${className}`}
    >
      {/* ── Editor window ─────────────────────────────────── */}
      <div className="glass-editor rounded-xl sm:rounded-2xl overflow-hidden mx-auto max-w-4xl relative">

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
                  className={`transition-opacity duration-200 ${i < visibleLines ? "opacity-100" : "opacity-0"}`}
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
                    i < visibleLines ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
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
              {!isComplete && (
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
          {isComplete && (
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

      {/* ── Decorative glow behind the card ─────────────── */}
      <div
        className="absolute inset-0 rounded-2xl bg-[#ff6b00] blur-[80px] opacity-[0.04] pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}
