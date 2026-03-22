/**
 * useTypewriter.ts
 * ─────────────────────────────────────────────────────────
 * Scroll-triggered typewriter effect for the Live Code Editor.
 * Returns the count of lines currently visible so the component can
 * render only that many lines — giving a "typed live" illusion.
 *
 * Usage:
 *   const { visibleLines, isComplete } = useTypewriter(containerRef, {
 *     totalLines: codeLines.length,
 *     lineDelay: 600,            // ms between each new line
 *     scrollStart: 'top 80%',
 *   });
 * ─────────────────────────────────────────────────────────
 */

"use client";

import { useEffect, useState, RefObject } from "react";
import { ScrollTrigger } from "@/lib/gsap-config";

export interface TypewriterOptions {
  /** Total number of lines to "type" */
  totalLines: number;
  /** Base delay between lines in ms (default: 650) */
  lineDelay?: number;
  /** Per-line delay overrides (length must equal totalLines if provided) */
  lineDelays?: number[];
  /** ScrollTrigger start string (default: "top 80%") */
  scrollStart?: string;
}

export interface TypewriterResult {
  /** How many lines are currently visible (0 → totalLines) */
  visibleLines: number;
  /** True once all lines have been revealed */
  isComplete: boolean;
}

export function useTypewriter(
  ref: RefObject<HTMLElement | null>,
  options: TypewriterOptions
): TypewriterResult {
  const {
    totalLines,
    lineDelay = 650,
    lineDelays,
    scrollStart = "top 80%",
  } = options;

  const [visibleLines, setVisibleLines] = useState(0);
  const [started, setStarted] = useState(false);

  // ── Step 1: fire setStarted when the section scrolls into view ──
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: scrollStart,
      once: true,
      onEnter: () => setStarted(true),
    });

    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 2: once started, reveal lines one by one ───────
  useEffect(() => {
    if (!started) return;

    let current = 0;
    let timerId: ReturnType<typeof setTimeout>;

    const revealNext = () => {
      if (current >= totalLines) return;
      const delay = lineDelays?.[current] ?? lineDelay;
      timerId = setTimeout(() => {
        current++;
        setVisibleLines(current);
        revealNext();
      }, delay);
    };

    revealNext();
    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  return { visibleLines, isComplete: visibleLines >= totalLines };
}
