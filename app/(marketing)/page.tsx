"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { animations } from "@/lib/animations/config";
import {
    ArrowRight,
    BarChart3,
    Brain,
    Code2,
    Globe,
    MessageSquarePlus,
    Shield,
    Sparkles,
    Star,
    Zap,
    Send,
    Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Review {
    _id: string;
    userName: string;
    review: string;
    createdAt: string;
}

interface PlatformStats {
    totalUsers: number;
    totalQuestions: number;
    totalSolved: number;
}

export default function LandingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const heroRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const reviewsRef = useRef<HTMLDivElement>(null);

    const [stats, setStats] = useState<PlatformStats>({
        totalUsers: 0,
        totalQuestions: 0,
        totalSolved: 0,
    });
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewText, setReviewText] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    // ── Auth redirect ──
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    useEffect(() => {
        fetch("/api/stats")
            .then((r) => r.json())
            .then(setStats)
            .catch(() => {
                setStats({ totalUsers: 1200, totalQuestions: 8500, totalSolved: 42000 });
            });
        fetch("/api/reviews")
            .then((r) => r.json())
            .then((d) => {
                if (Array.isArray(d)) setReviews(d);
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!heroRef.current) return;
        const elements = Array.from(heroRef.current.querySelectorAll("[data-animate]"));
        animations.heroEntrance(elements);
    }, []);

    useEffect(() => {
        if (!statsRef.current || !stats.totalUsers) return;
        const counters = statsRef.current.querySelectorAll("[data-counter]");
        counters.forEach((el) => {
            const val = parseInt(el.getAttribute("data-counter") || "0");
            animations.countUp(el, val, 2.5);
        });
    }, [stats]);

    useEffect(() => {
        if (!reviewsRef.current || reviews.length === 0) return;
        const cards = reviewsRef.current.querySelectorAll("[data-review-card]");
        animations.staggerCards(cards, reviewsRef.current);
    }, [reviews]);

    const handleSubmitReview = async () => {
        if (!session) {
            toast.error("Please log in to submit a review");
            return;
        }
        if (reviewText.trim().length < 10) {
            toast.error("Review must be at least 10 characters");
            return;
        }
        setSubmittingReview(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ review: reviewText }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to submit review");
            }
            toast.success("Review submitted! Thank you 🎉");
            setReviewText("");
            // Refresh reviews
            fetch("/api/reviews")
                .then((r) => r.json())
                .then((d) => { if (Array.isArray(d)) setReviews(d); })
                .catch(() => { });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Don't render if redirecting
    if (status === "authenticated") return null;

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
                        <Button variant="ghost" className="text-zinc-400 hover:text-white">
                            Docs
                        </Button>
                    </Link>
                    {session ? (
                        <Button
                            onClick={() => router.push("/dashboard")}
                            className="bg-orange-500 hover:bg-orange-400 text-white gap-2"
                        >
                            Dashboard <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Link href="/login">
                            <Button className="bg-orange-500 hover:bg-orange-400 text-white">
                                Get Started Free
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
                    Start a session, get AI-generated coding problems, submit solutions, and receive a
                    PDF performance report in your inbox — all in one seamless flow.
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

            {/* Stats */}
            <section ref={statsRef} className="py-16 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
                    {[
                        { label: "Developers", value: stats.totalUsers, suffix: "+" },
                        {
                            label: "AI Questions Generated",
                            value: stats.totalQuestions,
                            suffix: "+",
                        },
                        { label: "Problems Solved", value: stats.totalSolved, suffix: "+" },
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
                            icon: BarChart3,
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
            {reviews.length > 0 && (
                <section className="py-24 px-4 border-t border-white/5 bg-white/[0.01]">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-white mb-4">
                                Loved by <span className="text-orange-500">developers</span>
                            </h2>
                        </div>
                        <div ref={reviewsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((r) => (
                                <div
                                    key={r._id}
                                    data-review-card
                                    className="glass rounded-2xl p-6 hover:border-white/10 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-1 mb-3">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className="h-4 w-4 text-orange-500 fill-orange-500"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                                        &ldquo;{r.review}&rdquo;
                                    </p>
                                    <p className="text-zinc-500 text-sm font-medium">{r.userName}</p>
                                </div>
                            ))}
                        </div>

                        {/* Review submission form — logged-in users only */}
                        {session && (
                            <div className="mt-12 max-w-xl mx-auto">
                                <div className="glass rounded-2xl p-6 border border-white/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MessageSquarePlus className="h-5 w-5 text-orange-500" />
                                        <h3 className="text-base font-bold text-white">Share your experience</h3>
                                    </div>
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Tell others about your experience with codeCarft…"
                                        maxLength={500}
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/40 resize-none"
                                    />
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-zinc-600">{reviewText.length}/500</span>
                                        <Button
                                            onClick={handleSubmitReview}
                                            disabled={submittingReview || reviewText.trim().length < 10}
                                            size="sm"
                                            className="bg-orange-500 hover:bg-orange-400 text-white gap-2 disabled:opacity-50"
                                        >
                                            {submittingReview ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Send className="h-3.5 w-3.5" />
                                            )}
                                            Submit Review
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
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
                            className="bg-orange-500 hover:bg-orange-400 text-white gap-2 shadow-2xl shadow-orange-500/30 text-base px-10 py-7 animate-pulse-orange"
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
