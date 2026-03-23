"use client";

import { LANDING_FEATURES } from "@/constant";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useRef } from "react";

export function FeaturesGrid() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollAnimation(sectionRef as React.RefObject<HTMLElement>, {
        from: { opacity: 0, y: 50 },
        to: { opacity: 1, y: 0 },
        childSelector: ".feature-card",
        stagger: 0.08,
        start: "top 78%",
        duration: 0.65,
    });

    return (
        <section
            ref={sectionRef}
            className="section-padding px-6 max-w-7xl mx-auto relative z-10 border-t"
            style={{ borderColor: "var(--color-border)" }}
        >
            <div className="text-center mb-20 max-w-3xl mx-auto">
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4">
                    Platform Features
                </span>
                <h2 className="text-section font-black text-[var(--color-text)] mb-6">
                    Everything you need to{" "}
                    <span className="text-[var(--color-accent)]">master coding</span>
                </h2>
                <p className="text-[var(--color-muted)] text-lg font-medium">
                    Powered by the best AI models in the world.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {LANDING_FEATURES.map(({ icon: Icon, title, desc }) => (
                    <div
                        key={title}
                        className="feature-card glass-panel rounded-2xl p-8 group cursor-default"
                        aria-label={title}
                    >
                        <div
                            className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl
                         bg-[rgba(255,107,0,0.08)]
                         group-hover:bg-[rgba(255,107,0,0.16)] transition-all duration-400"
                            style={{ boxShadow: "0 0 20px rgba(255,107,0,0.1)" }}
                        >
                            <Icon
                                className="h-6 w-6"
                                style={{ color: "var(--color-accent)" }}
                                aria-hidden="true"
                            />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--color-text)] mb-3 tracking-tight">
                            {title}
                        </h3>
                        <p className="text-[var(--color-muted)] text-sm leading-relaxed">{desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
