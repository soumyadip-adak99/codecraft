"use client";

import { Review } from "@/@types";
import CodeEditor from "@/components/CodeEditor/CodeEditor";
import { FeaturesGrid } from "@/components/landingPage/FeaturesGrid";
import { HowItWorks } from "@/components/landingPage/HowItWorks";
import { StatCounter } from "@/components/landingPage/StatCounter";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthLoader } from "@/components/shared/AuthLoader";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { gsap } from "@/lib/gsap-config";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";

// ── Lazy-load Three.js canvases (avoid SSR issues) ──────────
const HeroParticles = dynamic(() => import("@/components/Hero/HeroParticles"), { ssr: false });
const FooterParticles = dynamic(() => import("@/components/Footer/FooterParticles"), {
    ssr: false,
});

export default function LandingPage() {
    const { data: session, status } = useAuth();
    const router = useRouter();

    // ── Refs ─────────────────────────────────────────────────
    const heroRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    // ── Convex data ──────────────────────────────────────────
    const platformStats = useQuery(api.platformStats.get);
    const totalDevelopers = platformStats?.totalDevelopers ?? 0;
    const totalQuestions = platformStats?.totalQuestionsGenerated ?? 0;
    const totalSolved = platformStats?.totalProblemsSolved ?? 0;

    const [reviews, setReviews] = useState<Review[]>([]);
    const fetchedReviews = useQuery(api.reviews.getReviews);
    useEffect(() => {
        if (fetchedReviews) setReviews(fetchedReviews as unknown as Review[]);
    }, [fetchedReviews]);

    // ── Hero stagger entrance ────────────────────────────────
    useEffect(() => {
        if (!heroRef.current) return;
        const els = heroRef.current.querySelectorAll("[data-animate]");
        const tl = gsap.timeline({ delay: 0.1 });
        els.forEach((el, i) => {
            tl.fromTo(
                el,
                { opacity: 0, y: 45, filter: "blur(6px)" },
                { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power2.out" },
                i * 0.11
            );
        });
        return () => {
            tl.kill();
        };
    }, []);

    // ── CTA infinite gradient shift ──────────────────────────
    useEffect(() => {
        const el = ctaRef.current;
        if (!el) return;
        const glow = el.querySelector(".cta-glow") as HTMLElement | null;
        if (!glow) return;
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to(glow, {
            scale: 1.25,
            opacity: 0.12,
            duration: 3.5,
            ease: "power1.inOut",
        });
        return () => {
            tl.kill();
        };
    }, []);

    // ── Auth guard ───────────────────────────────────────────
    if (status === "loading" || status === "authenticated") {
        return <AuthLoader authenticatedRedirect="/dashboard" unauthenticatedRedirect="/" />;
    }

    return (
        <div
            className="relative overflow-hidden min-h-screen"
            style={{ background: "var(--color-background)" }}
        >
            {/* ── Ambient background grid ─────────────────────── */}
            <div
                className="fixed inset-0 bg-grid opacity-100 pointer-events-none"
                aria-hidden="true"
            />

            {/* ── Ambient radial glows ─────────────────────────── */}
            <div
                className="fixed top-[-25%] right-[-15%] w-[900px] h-[900px] rounded-full pointer-events-none"
                style={{ background: "rgba(255,107,0,0.07)", filter: "blur(130px)" }}
                aria-hidden="true"
            />
            <div
                className="fixed bottom-[-25%] left-[-15%] w-[700px] h-[700px] rounded-full pointer-events-none"
                style={{ background: "rgba(255,107,0,0.04)", filter: "blur(110px)" }}
                aria-hidden="true"
            />

            {/* ════════════════════════════════════════════════════
          NAVBAR
          ════════════════════════════════════════════════════ */}
            <header
                className="fixed top-0 inset-x-0 z-50"
                style={{
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    background: "none",
                }}
            >
                <nav className="flex h-17 items-center justify-between px-6 lg:px-12 max-w-screen-xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Logo />
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/docs">
                            <Button
                                variant="ghost"
                                className="text-sm font-medium text-muted hover:text-(--color-text) focus-visible:ring-(--color-accent)"
                            >
                                Docs
                            </Button>
                        </Link>
                        {session ? (
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="gap-2 glow-primary-hover focus-visible:ring-(--color-accent) cursor-pointer"
                            >
                                Dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        ) : (
                            <Link href="/login">
                                <Button className="cursor-pointer glow-primary-hover focus-visible:ring-(--color-accent)">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </nav>
            </header>

            {/* ════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════ */}
            <section
                ref={heroRef}
                className="relative pt-40 pb-28 px-4 text-center z-10 overflow-hidden"
            >
                {/* Three.js particle background */}
                <HeroParticles className="opacity-70" />

                <div className="relative z-10 max-w-5xl mx-auto">
                    {/* Badge */}
                    <div data-animate className="flex justify-center mb-8">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium animate-float"
                            style={{
                                borderColor: "rgba(255,107,0,0.25)",
                                background: "rgba(255,107,0,0.08)",
                                backdropFilter: "blur(10px)",
                                color: "var(--color-accent)",
                                boxShadow: "0 0 20px rgba(255,107,0,0.12)",
                            }}
                        >
                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                            Ultra-Premium AI Coding Environment
                        </div>
                    </div>

                    {/* Headline — fluid clamp typography */}
                    <h1
                        data-animate
                        className="text-hero font-black leading-[1.04] mb-8 text-[var(--color-text)]"
                        style={{ letterSpacing: "-0.03em" }}
                    >
                        Master engineering with
                        <br className="hidden sm:block" />
                        <span className="text-[var(--color-accent)] px-2">AI-Generated</span>{" "}
                        challenges
                    </h1>

                    {/* Subheadline — max ~60 chars per line via max-w */}
                    <p
                        data-animate
                        className="text-lg sm:text-xl max-w-[52ch] mx-auto mb-12 leading-[1.75]"
                        style={{ color: "var(--color-muted)" }}
                    >
                        Start an immersive session, solve adaptive problems across multiple
                        languages, and receive instant PDF performance reviews.
                    </p>

                    {/* CTAs */}
                    <div data-animate className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/login">
                            <Button
                                size="lg"
                                className="h-13 px-8 text-base font-bold gap-2 animate-pulse-orange glow-primary-hover rounded-full transition-transform hover:scale-[1.03] focus-visible:ring-[var(--color-accent)]"
                                style={{ boxShadow: "0 8px 30px rgba(255,107,0,0.25)" }}
                                aria-label="Start coding for free"
                            >
                                <Zap className="h-5 w-5" aria-hidden="true" />
                                Start Coding Free
                            </Button>
                        </Link>
                        <Link href="/docs">
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-13 px-8 text-base font-semibold gap-2 rounded-full
                           transition-transform hover:scale-[1.03]
                           focus-visible:ring-[var(--color-accent)]"
                                style={{
                                    borderColor: "var(--color-border)",
                                    color: "var(--color-text)",
                                }}
                                aria-label="Read the documentation"
                            >
                                Learn More <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </Link>
                    </div>

                    {/* Trust badges — AI model logos */}
                    <div
                        data-animate
                        className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium"
                        style={{ color: "var(--color-muted)" }}
                    >
                        {["OpenAI GPT-4o", "Claude 3.5", "Gemini 2.0", "Groq Llama 3.3"].map(
                            (m) => (
                                <span key={m} className="flex items-center gap-1.5">
                                    <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ background: "var(--color-accent)" }}
                                        aria-hidden="true"
                                    />
                                    {m}
                                </span>
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════
          LIVE CODE EDITOR
          ════════════════════════════════════════════════════ */}
            <CodeEditor />

            {/* ════════════════════════════════════════════════════
          STATS — real-time from Convex
          ════════════════════════════════════════════════════ */}
            <section
                ref={statsRef}
                className="py-20 relative z-10"
                aria-label="Platform statistics"
            >
                <div
                    className="absolute inset-0 border-y pointer-events-none"
                    style={{
                        borderColor: "var(--color-border)",
                        background:
                            "linear-gradient(to right, transparent, rgba(255,107,0,0.04), transparent)",
                    }}
                    aria-hidden="true"
                />
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {/* Vertical dividers on desktop */}
                        <div className="relative">
                            <StatCounter value={totalDevelopers} suffix="+" label="Developers" />
                        </div>
                        <div
                            className="relative md:border-x"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <StatCounter
                                value={totalQuestions}
                                suffix="+"
                                label="AI Questions Generated"
                            />
                        </div>
                        <div className="relative">
                            <StatCounter value={totalSolved} suffix="+" label="Problems Solved" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════════════ */}
            <HowItWorks />

            {/* ════════════════════════════════════════════════════
          FEATURES GRID
          ════════════════════════════════════════════════════ */}
            <FeaturesGrid />

            {/* ════════════════════════════════════════════════════
          REVIEWS — infinite slider
          ════════════════════════════════════════════════════ */}
            {reviews.length >= 4 && (
                <section
                    className="section-padding px-6 border-t overflow-hidden relative z-10"
                    style={{
                        borderColor: "var(--color-border)",
                        background: "rgba(0,0,0,0.35)",
                    }}
                    aria-label="User testimonials"
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4">
                                Testimonials
                            </span>
                            <h2 className="text-section font-black text-[var(--color-text)]">
                                Loved by{" "}
                                <span className="text-[var(--color-accent)]">developers</span>
                            </h2>
                        </div>

                        <div
                            className="relative"
                            style={{
                                maskImage:
                                    "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
                                WebkitMaskImage:
                                    "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
                            }}
                        >
                            <InfiniteSlider speed={25} speedOnHover={15} gap={20}>
                                <div className="flex gap-5">
                                    {reviews.map((r) => (
                                        <motion.div
                                            key={r._id}
                                            initial={{ opacity: 0, x: 40 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5 }}
                                            className="min-w-[340px] rounded-2xl p-7 flex flex-col gap-4 glass-panel
                                 hover:border-white/10 hover:-translate-y-1.5 transition-all duration-400 cursor-default"
                                        >
                                            {/* Star rating */}
                                            <div className="flex gap-1" aria-label="5 star rating">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="h-3.5 w-3.5 fill-[var(--color-accent)] text-[var(--color-accent)]"
                                                        aria-hidden="true"
                                                    />
                                                ))}
                                            </div>

                                            <p
                                                className="text-sm leading-relaxed line-clamp-4"
                                                style={{ color: "var(--color-muted)" }}
                                            >
                                                {(r as any).reviewText}
                                            </p>

                                            <div
                                                className="flex items-center gap-3 mt-auto pt-4 border-t"
                                                style={{ borderColor: "var(--color-border)" }}
                                            >
                                                {(r as any).userImageUrl ? (
                                                    <img
                                                        src={(r as any).userImageUrl as string}
                                                        alt={r.userName}
                                                        className="w-9 h-9 rounded-full object-cover ring-2"
                                                        style={
                                                            {
                                                                "--tw-ring-color":
                                                                    "rgba(255,107,0,0.2)",
                                                            } as React.CSSProperties
                                                        }
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold uppercase"
                                                        style={{
                                                            background: "rgba(255,107,0,0.12)",
                                                            color: "var(--color-accent)",
                                                            border: "1px solid rgba(255,107,0,0.2)",
                                                        }}
                                                    >
                                                        {r.userName.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--color-text)]">
                                                        {r.userName}
                                                    </p>
                                                    <p
                                                        className="text-xs"
                                                        style={{ color: "var(--color-muted)" }}
                                                    >
                                                        Developer
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </InfiniteSlider>
                        </div>
                    </div>
                </section>
            )}

            {/* ════════════════════════════════════════════════════
          CTA BANNER
          Full-width, orange radial glow, infinite gradient shift
          ════════════════════════════════════════════════════ */}
            <section
                ref={ctaRef}
                className="py-40 px-6 text-center relative z-10 overflow-hidden"
                aria-label="Call to action"
            >
                {/* Radial orange glow — GSAP pulses scale */}
                <div
                    className="cta-glow absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,107,0,0.18) 0%, transparent 70%)",
                        opacity: 0.08,
                    }}
                    aria-hidden="true"
                />

                {/* Static subtle gradient bg */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(120deg, var(--color-background) 0%, rgba(255,107,0,0.04) 50%, var(--color-background) 100%)",
                    }}
                    aria-hidden="true"
                />

                <div className="max-w-4xl mx-auto relative z-20">
                    <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6">
                        Get Started Today
                    </span>
                    <h2
                        className="text-hero font-black text-[var(--color-text)] mb-8"
                        style={{ letterSpacing: "-0.03em" }}
                    >
                        Ready to <span className="text-[var(--color-accent)]">level up?</span>
                    </h2>
                    <p
                        className="text-xl font-medium mb-12 max-w-[48ch] mx-auto leading-relaxed"
                        style={{ color: "var(--color-muted)" }}
                    >
                        Join developers using codeCraft to sharpen their skills and ace their next
                        coding interview — completely free.
                    </p>
                    <Link href="/login">
                        <Button
                            size="lg"
                            className="h-16 px-12 text-lg font-bold gap-3 rounded-full
                         animate-pulse-orange glow-primary-hover
                         transition-transform hover:scale-[1.04]
                         focus-visible:ring-[var(--color-accent)]"
                            style={{ boxShadow: "0 0 50px rgba(255,107,0,0.35)" }}
                            aria-label="Get started for free"
                        >
                            <Zap className="h-6 w-6" aria-hidden="true" />
                            Get Started — It&apos;s Free
                        </Button>
                    </Link>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════ */}
            <footer
                className="relative border-t overflow-hidden z-10"
                style={{
                    borderColor: "var(--color-border)",
                    background: "rgba(0,0,0,0.6)",
                }}
                aria-label="Site footer"
            >
                {/* Three.js wave mesh */}
                <div
                    className="absolute inset-0 opacity-100 pointer-events-none"
                    aria-hidden="true"
                >
                    <FooterParticles />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-8">
                    {/* 4-column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <Logo />
                            <p
                                className="mt-5 text-sm leading-relaxed max-w-xs"
                                style={{ color: "var(--color-muted)" }}
                            >
                                The ultra-premium coding environment for mastering algorithmic
                                challenges with next-generation AI insights.
                            </p>
                        </div>

                        {/* Platform */}
                        <div>
                            <h4
                                className="font-semibold mb-5 text-sm uppercase tracking-widest"
                                style={{ color: "var(--color-text)" }}
                            >
                                Platform
                            </h4>
                            <ul className="space-y-3 text-sm">
                                {[
                                    { label: "Documentation", href: "/docs" },
                                    { label: "Dashboard", href: "/dashboard" },
                                    { label: "Start Free", href: "/login" },
                                ].map(({ label, href }) => (
                                    <li key={label}>
                                        <Link href={href} className="footer-link">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4
                                className="font-semibold mb-5 text-sm uppercase tracking-widest"
                                style={{ color: "var(--color-text)" }}
                            >
                                Company
                            </h4>
                            <ul className="space-y-3 text-sm">
                                {["About Us", "Community", "Terms & Privacy"].map((label) => (
                                    <li key={label}>
                                        <span className="footer-link cursor-pointer">{label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div
                        className="pt-8 border-t flex flex-col md:flex-row items-center justify-between text-xs gap-4"
                        style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-muted)",
                        }}
                    >
                        <p>© {new Date().getFullYear()} codeCraft. All rights reserved.</p>
                        <div
                            className="flex items-center gap-2 px-3 py-1 rounded-full border"
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                                aria-hidden="true"
                            />
                            Systems Operational
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
