/**
 * gsap-config.ts
 * ─────────────────────────────────────────────────────────
 * Single source-of-truth for GSAP throughout the marketing site.
 * Import `gsap` and `ScrollTrigger` from here — never directly from "gsap".
 * This ensures the plugin is always registered before any animation runs.
 * ─────────────────────────────────────────────────────────
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once at module load time (safe to call multiple times)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Global GSAP defaults ────────────────────────────────
gsap.defaults({
  ease: "power2.out",
  duration: 0.6,
});

// ─── Shared easing constants ─────────────────────────────
export const ease = {
  /** General entrance / exit */
  smooth: "power2.out",
  /** Energetic pop for icons / badges */
  bounce: "back.out(1.7)",
  /** Organic wobble for hero elements */
  elastic: "elastic.out(1, 0.3)",
  /** Crisp in-out for UI transitions */
  snappy: "power2.inOut",
  /** Gentle deceleration for counters */
  counter: "power1.out",
} as const;

// ─── Shared animation durations (seconds) ────────────────
export const dur = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.9,
  counter: 2.5,
} as const;

// ─── ScrollTrigger default config helper ─────────────────
export const defaultST = (trigger: Element, start = "top 80%") =>
  ({
    trigger,
    start,
    once: true,
  }) satisfies ScrollTrigger.Vars;

export { gsap, ScrollTrigger };
