"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import { ScrollTrigger } from "@/lib/gsap-config";

export function SmoothScrolling({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // ── Init Lenis ──────────────────────────────────────────
    const lenis = new Lenis({
      // Snappy and responsive smooth scroll — less "weighty/buffery"
      lerp: 0.08,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      // Lower multiplier = more control, less "flick" feeling
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
      // Prevents jarring stops at section boundaries
      infinite: false,
    });

    lenisRef.current = lenis;

    // ── Sync Lenis → GSAP ticker (keeps ScrollTrigger correct) ──
    // GSAP's ticker fires every rAF frame; Lenis.raf() advances its scroll.
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000); // GSAP passes seconds; Lenis expects ms
    });

    // Disable GSAP's own lag-smoothing so Lenis stays the sole driver
    gsap.ticker.lagSmoothing(0);

    // ── Tell ScrollTrigger about Lenis's scroll position ──────
    lenis.on("scroll", ScrollTrigger.update);

    // Allow ScrollTrigger to know total scroll height after Lenis init
    ScrollTrigger.refresh();

    return () => {
      lenis.destroy();
      // Remove the ticker callback to avoid memory leaks
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  return <>{children}</>;
}
