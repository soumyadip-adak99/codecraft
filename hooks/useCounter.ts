/**
 * useCounter.ts
 * ─────────────────────────────────────────────────────────
 * GSAP-powered count-up animation tied to a ScrollTrigger.
 * Fires once when the element enters the viewport.
 * Accepts an optional `onComplete` callback — used to trigger a
 * glow-pulse CSS animation on the numeral when counting finishes.
 *
 * Usage:
 *   const spanRef = useRef<HTMLSpanElement>(null);
 *   useCounter(spanRef, 1500, { duration: 2.5, onComplete: addGlow });
 * ─────────────────────────────────────────────────────────
 */

"use client";

import { useEffect, RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";

export interface CounterOptions {
  /** Animation duration in seconds (default: 2.5) */
  duration?: number;
  /** ScrollTrigger start string (default: "top 80%") */
  scrollStart?: string;
  /** Fires when the counter reaches its end value */
  onComplete?: () => void;
  /** Trigger element — if different from the span itself */
  triggerEl?: Element | null;
}

export function useCounter(
  spanRef: RefObject<HTMLElement | null>,
  endValue: number,
  options: CounterOptions = {}
) {
  const { duration = 2.5, scrollStart = "top 80%", onComplete, triggerEl } =
    options;

  useEffect(() => {
    const span = spanRef.current;
    if (!span || endValue === 0) return;

    const trigger = triggerEl ?? span;
    const obj = { value: 0 };

    let tween: gsap.core.Tween;

    const st = ScrollTrigger.create({
      trigger,
      start: scrollStart,
      once: true,
      onEnter: () => {
        tween = gsap.to(obj, {
          value: endValue,
          duration,
          ease: "power1.out",
          onUpdate: () => {
            span.textContent = Math.floor(obj.value).toLocaleString();
          },
          onComplete: () => {
            span.textContent = endValue.toLocaleString();
            onComplete?.();
          },
        });
      },
    });

    return () => {
      st.kill();
      tween?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endValue]);
}
