"use client";

import { useCounter } from "@/hooks/useCounter";
import { useRef, useState } from "react";

export function StatCounter({
    value,
    suffix,
    label,
}: {
    value: number;
    suffix: string;
    label: string;
}) {
    const spanRef = useRef<HTMLSpanElement>(null);
    const blockRef = useRef<HTMLDivElement>(null);
    const [glowing, setGlowing] = useState(false);

    useCounter(spanRef, value, {
        triggerEl: blockRef.current ?? undefined,
        onComplete: () => setGlowing(true),
    });

    return (
        <div ref={blockRef} className="relative flex flex-col items-center">
            <div
                className={`text-5xl sm:text-6xl font-black tracking-tighter mb-3 ${glowing ? "animate-glow-pulse" : ""}`}
                style={{ color: "var(--color-text)" }}
            >
                <span ref={spanRef}>0</span>
                <span style={{ color: "var(--color-accent)" }}>{suffix}</span>
            </div>
            <p className="text-[var(--color-muted)] font-semibold uppercase tracking-widest text-xs">
                {label}
            </p>
        </div>
    );
}
