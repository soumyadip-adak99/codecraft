/**
 * useScrollAnimation.ts
 * ─────────────────────────────────────────────────────────
 * Declarative wrapper around a GSAP fromTo paired with ScrollTrigger.
 * Animation fires once when the trigger element enters the viewport.
 *
 * Usage:
 *   const ref = useRef<HTMLElement>(null);
 *   useScrollAnimation(ref, {
 *     from: { opacity: 0, y: 40 },
 *     to:   { opacity: 1, y: 0 },
 *     stagger: 0.08,
 *     childSelector: '.card',
 *   });
 * ─────────────────────────────────────────────────────────
 */

"use client";

import { useEffect, RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";

export interface ScrollAnimationOptions {
  /** GSAP fromTo vars for the start state */
  from: gsap.TweenVars;
  /** GSAP fromTo vars for the end state */
  to: gsap.TweenVars;
  /** ScrollTrigger start string (default: "top 80%") */
  start?: string;
  /** If provided, animate matching child elements instead of the ref itself */
  childSelector?: string;
  /** Stagger seconds between child items (default: 0) */
  stagger?: number;
  /** Duration in seconds (default: 0.6) */
  duration?: number;
  /** Delay before animation fires (seconds, default: 0) */
  delay?: number;
}

export function useScrollAnimation(
  ref: RefObject<HTMLElement | null>,
  options: ScrollAnimationOptions
) {
  const {
    from,
    to,
    start = "top 80%",
    childSelector,
    stagger = 0,
    duration = 0.6,
    delay = 0,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = childSelector
      ? el.querySelectorAll(childSelector)
      : el;

    const tween = gsap.fromTo(targets, from, {
      ...to,
      duration,
      delay,
      stagger,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
      } as ScrollTrigger.Vars,
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
