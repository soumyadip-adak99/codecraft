"use client";

import { LANDING_HOW_STEPS } from "@/constant";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export function HowItWorks() {
    const sectionRef = useRef<HTMLElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useScrollAnimation(sectionRef as React.RefObject<HTMLElement>, {
        from: { opacity: 0, y: 50 },
        to: { opacity: 1, y: 0 },
        childSelector: ".step-item",
        stagger: 0.18,
        start: "top 75%",
        duration: 0.75,
    });

    // Animate the connecting line scaleX: 0 → 1
    useEffect(() => {
        const line = lineRef.current;
        if (!line) return;

        const tween = gsap.fromTo(
            line,
            { scaleX: 0 },
            {
                scaleX: 1,
                duration: 1.2,
                ease: "power2.inOut",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 72%",
                    once: true,
                },
            }
        );
        return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="section-padding px-6 max-w-7xl mx-auto relative z-10 border-t"
            style={{ borderColor: "var(--color-border)" }}
        >
            {/* Section heading */}
            <div className="text-center mb-20 max-w-3xl mx-auto">
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4">
                    Simple Workflow
                </span>
                <h2 className="text-section font-black text-[var(--color-text)] mb-6">
                    How it <span className="text-[var(--color-accent)]">Works</span>
                </h2>
                <p className="text-[var(--color-muted)] text-lg font-medium">
                    Three steps from zero to verified solution.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
                {/* Animated connector line — positioned at exact centre of the 72px circles (36px = h-9) */}
                <div
                    ref={lineRef}
                    className="connector-line hidden md:block absolute left-[17%] right-[17%]"
                    style={{ top: "36px", transformOrigin: "left center" }}
                    aria-hidden="true"
                />

                {LANDING_HOW_STEPS.map((item, i) => (
                    <div
                        key={i}
                        className="step-item relative z-10 flex flex-col items-center text-center group"
                    >
                        <div
                            className="w-[72px] h-[72px] rounded-full flex items-center justify-center
                         text-2xl font-black text-[var(--color-text)] mb-8 relative z-20
                         group-hover:scale-110 transition-all duration-500
                         group-hover:shadow-[0_0_30px_rgba(255,107,0,0.25)] group-hover:border-[rgba(255,107,0,0.45)]"
                            style={{
                                background: "var(--color-surface)",
                                border: "1px solid rgba(255,107,0,0.22)",
                                boxShadow:
                                    "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.6)",
                            }}
                        >
                            <span className="text-[var(--color-accent)] font-semibold">
                                {item.step}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--color-text)] mb-4 tracking-tight">
                            {item.title}
                        </h3>
                        <p className="text-[var(--color-muted)] leading-relaxed text-sm max-w-[260px]">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
