"use client";

import { Review } from "@/@types";
import { AuthLoader } from "@/components/shared/AuthLoader";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { animations } from "@/lib/animations/config";
import { useQuery } from "convex/react";
import { ArrowRight, BarChart2, Brain, Code2, Globe, Shield, Sparkles, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";

export default function LandingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const heroRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const reviewsRef = useRef<HTMLDivElement>(null);

    // ── Real-time platform counters from Convex ──
    const platformStats = useQuery(api.platformStats.get);
    const totalDevelopers = platformStats?.totalDevelopers ?? 0;
    const totalQuestions = platformStats?.totalQuestionsGenerated ?? 0;
    const totalSolved = platformStats?.totalProblemsSolved ?? 0;

    const [reviews, setReviews] = useState<Review[]>([]);

    // Fetch reviews from convex directly
    const fetchedReviews = useQuery(api.reviews.getReviews);

    useEffect(() => {
        if (fetchedReviews) {
            setReviews(fetchedReviews as unknown as Review[]);
        }
    }, [fetchedReviews]);

    useEffect(() => {
        if (!heroRef.current) return;
        const elements = Array.from(heroRef.current.querySelectorAll("[data-animate]"));
        animations.heroEntrance(elements);
    }, []);

    useEffect(() => {
        if (!statsRef.current || !totalDevelopers) return;
        const counters = statsRef.current.querySelectorAll("[data-counter]");
        counters.forEach((el) => {
            const val = parseInt(el.getAttribute("data-counter") || "0");
            animations.countUp(el, val, 2.5);
        });
    }, [totalDevelopers, totalQuestions, totalSolved]);

    useEffect(() => {
        if (!reviewsRef.current || reviews.length === 0) return;
        const cards = reviewsRef.current.querySelectorAll("[data-review-card]");
        animations.staggerCards(cards, reviewsRef.current);
    }, [reviews]);

    // ── Auth gate: blocks render & redirects automatically ──
    // - status "loading"         → full-screen overlay (no page flash)
    // - status "authenticated"   → overlay stays up, router.replace("/dashboard")
    // - status "unauthenticated" → hide overlay, render the landing page
    if (status === "loading" || status === "authenticated") {
        return (
            <AuthLoader
                authenticatedRedirect="/dashboard"
                unauthenticatedRedirect="/"
            />
        );
    }

    return (
        <div className="relative overflow-hidden">
            {/* Background grid */}
            <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
            <div className="fixed top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Navbar */}
            <nav className="relative z-50 flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2.5">
                    <Logo />
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/docs">
                        <Button
                            variant="ghost"
                            className="text-zinc-400 hover:text-white cursor-pointer"
                        >
                            Docs
                        </Button>
                    </Link>
                    {session ? (
                        <Button
                            onClick={() => router.push("/dashboard")}
                            className="bg-orange-500 hover:bg-orange-400 text-white gap-2 cursor-pointer"
                        >
                            Dashboard <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Link href="/login">
                            <Button className="bg-orange-500 hover:bg-orange-400 text-white cursor-pointer">
                                Sing In
                            </Button>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <section
                ref={heroRef}
                className="relative pt-24 pb-32 px-4 text-center max-w-5xl mx-auto"
            >
                <div data-animate>
                    <Badge className="mb-6 border-orange-500/30 bg-orange-500/10 text-orange-400 px-4 py-1.5 text-sm gap-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI-Powered Coding Challenges
                    </Badge>
                </div>

                <h1 data-animate className="text-5xl sm:text-7xl font-black leading-[1.05] mb-6">
                    Code Better with <span className="gradient-text">AI-Generated</span> Challenges
                </h1>

                <p
                    data-animate
                    className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Start a session, get AI-generated coding problems, submit solutions, and receive
                    a PDF performance report in your inbox — all in one seamless flow.
                </p>

                <div data-animate className="flex flex-wrap items-center justify-center gap-4">
                    <Link href="/login">
                        <Button
                            size="lg"
                            className="bg-orange-500 hover:bg-orange-400 text-white gap-2 shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 text-base px-8 py-6"
                        >
                            <Zap className="h-5 w-5" />
                            Start Coding Free
                        </Button>
                    </Link>
                </div>

                {/* Trust badges */}
                <div
                    data-animate
                    className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500"
                >
                    {["OpenAI GPT-4", "Claude 3", "Google Gemini", "Groq Llama 3.3"].map((m) => (
                        <span key={m} className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            {m}
                        </span>
                    ))}
                </div>
            </section>

            {/* Stats — real-time from Convex */}
            <section ref={statsRef} className="py-16 border-y border-white/5 bg-white/2">
                <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
                    {[
                        { label: "Developers", value: totalDevelopers, suffix: "+" },
                        {
                            label: "AI Questions Generated",
                            value: totalQuestions,
                            suffix: "+",
                        },
                        { label: "Problems Solved", value: totalSolved, suffix: "+" },
                    ].map(({ label, value, suffix }) => (
                        <div key={label}>
                            <div className="text-4xl sm:text-5xl font-black text-white mb-2">
                                <span data-counter={value}>0</span>
                                <span className="text-orange-500">{suffix}</span>
                            </div>
                            <p className="text-zinc-500 text-sm">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-4 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-white mb-4">
                        Everything you need to{" "}
                        <span className="text-orange-500">master coding</span>
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        Powered by the best AI models in the world
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Brain,
                            title: "AI Question Generation",
                            desc: "Generate unique Easy, Medium, or Hard challenges on any topic using our default Groq key or your own.",
                        },
                        {
                            icon: Code2,
                            title: "VS Code-Like Editor",
                            desc: "Monaco Editor with syntax highlighting, IntelliSense, and JetBrains Mono font.",
                        },
                        {
                            icon: Zap,
                            title: "Session-Based Learning",
                            desc: "Start a session, solve questions, unlock next on correct submission, end with a full PDF report.",
                        },
                        {
                            icon: Globe,
                            title: "5 Languages",
                            desc: "JavaScript, TypeScript, Python, Java, and C++ — all with language-specific starter code.",
                        },
                        {
                            icon: BarChart2,
                            title: "Progress Analytics",
                            desc: "Track easy, medium, and hard problems solved across all your sessions.",
                        },
                        {
                            icon: Shield,
                            title: "Privacy First",
                            desc: "Code is never stored in our database. Only your stats are saved — nothing else.",
                        },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div
                            key={title}
                            className="glass rounded-2xl p-6 hover:border-orange-500/20 hover:bg-orange-500/5 transition-all duration-300 group"
                        >
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                                <Icon className="h-6 w-6 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Reviews */}
            {reviews.length >= 4 && (
                <section className="py-24 px-4 border-t border-white/5 bg-white/1 overflow-hidden">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-white mb-4">
                                Loved by <span className="text-orange-500">developers</span>
                            </h2>
                        </div>

                        <div
                            className="relative"
                            style={{
                                maskImage:
                                    "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                                WebkitMaskImage:
                                    "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                            }}
                        >
                            <InfiniteSlider speedOnHover={25} gap={24}>
                                <div className="flex gap-6">
                                    {reviews.map((r) => (
                                        <div
                                            key={r._id}
                                            className="min-w-[320px] rounded-2xl border border-white/10 
                                                    bg-white/5 backdrop-blur-xl p-6 
                                                    shadow-lg shadow-black/30 w-10
                                                    transition-all duration-300
                                                    hover:border-white/20 hover:scale-[1.02]"
                                        >
                                            <div className="flex items-center gap-3 mt-4 mb-5">
                                                {(r as any).userImageUrl ? (
                                                    <img
                                                        src={(r as any).userImageUrl as string}
                                                        alt={r.userName}
                                                        className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xs uppercase">
                                                        {r.userName.charAt(0)}
                                                    </div>
                                                )}
                                                <p className="text-zinc-400 text-sm font-medium">
                                                    {r.userName}
                                                </p>
                                            </div>

                                            <p className="text-zinc-300 text-sm leading-relaxed mb-4 line-clamp-4">
                                                {(r as any).reviewText};
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </InfiniteSlider>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-32 px-4 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-5xl font-black text-white mb-6">
                        Ready to <span className="text-orange-500">level up?</span>
                    </h2>
                    <p className="text-zinc-400 text-lg mb-10">
                        Join developers using codeCarft to ace their next coding interview.
                    </p>
                    <Link href="/login">
                        <Button
                            size="lg"
                            className="bg-orange-500 hover:bg-orange-400 text-white gap-2 shadow-2xl shadow-orange-500/30 text-base px-10 py-7 animate-pulse-orange cursor-pointer"
                        >
                            <Zap className="h-5 w-5" />
                            Get Started — It&apos;s Free
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
