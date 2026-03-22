"use client";

import { Review } from "@/@types";
import { AuthLoader } from "@/components/shared/AuthLoader";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import CodeEditor from "@/components/CodeEditor/CodeEditor";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  BarChart2,
  Brain,
  Code2,
  Github,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCounter } from "@/hooks/useCounter";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// ── Lazy-load Three.js canvases (avoid SSR issues) ──────────
const HeroParticles  = dynamic(() => import("@/components/Hero/HeroParticles"),   { ssr: false });
const FooterParticles= dynamic(() => import("@/components/Footer/FooterParticles"),{ ssr: false });

// ══════════════════════════════════════════════════════════════
// STAT COUNTER — individual unit so each ref stays stable
// ══════════════════════════════════════════════════════════════
function StatCounter({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const spanRef  = useRef<HTMLSpanElement>(null);
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

// ══════════════════════════════════════════════════════════════
// HOW IT WORKS — connector line + sequential step reveal
// ══════════════════════════════════════════════════════════════
const HOW_STEPS = [
  {
    step: "01",
    title: "Select Difficulty",
    desc: "Choose Easy, Medium, or Hard. The AI instantly generates a compelling algorithmic challenge tailored to your level.",
  },
  {
    step: "02",
    title: "Write Solution",
    desc: "Code in our VS Code-like Monaco environment with real language servers, syntax highlighting, and intelligent hints.",
  },
  {
    step: "03",
    title: "Get Insights",
    desc: "Submit for automatic judging and receive a deep-dive PDF analysis of your time complexity, style, and performance.",
  },
];

function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);

  useScrollAnimation(sectionRef as React.RefObject<HTMLElement>, {
    from:          { opacity: 0, y: 50 },
    to:            { opacity: 1, y: 0  },
    childSelector: ".step-item",
    stagger:       0.18,
    start:         "top 75%",
    duration:      0.75,
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
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
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
          style={{ top: '36px', transformOrigin: "left center" }}
          aria-hidden="true"
        />

        {HOW_STEPS.map((item, i) => (
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
                background: 'var(--color-surface)',
                border: '1px solid rgba(255,107,0,0.22)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.6)',
              }}
            >
              <span className="text-[var(--color-accent)] font-semibold">{item.step}</span>
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

// ══════════════════════════════════════════════════════════════
// FEATURES GRID
// ══════════════════════════════════════════════════════════════
const FEATURES = [
  {
    icon: Brain,
    title: "AI Question Generation",
    desc: "Generate unique Easy, Medium, or Hard challenges on any topic using our default Groq key or your own API key.",
  },
  {
    icon: Code2,
    title: "VS Code-Like Editor",
    desc: "Monaco Editor with syntax highlighting, IntelliSense, multi-language support, and JetBrains Mono font.",
  },
  {
    icon: Zap,
    title: "Session-Based Learning",
    desc: "Start a session, solve questions, unlock the next on correct submission, end with a full PDF performance report.",
  },
  {
    icon: BarChart2,
    title: "Progress Analytics",
    desc: "Track easy, medium, and hard problems solved across all your sessions on a real-time dashboard.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    desc: "Your code is never stored in our database. Only your stats are saved — nothing else, ever.",
  },
  {
    icon: Github,
    title: "GitHub Integration",
    desc: "Connect GitHub and automatically commit all solutions into a personal repository after each session.",
  },
];

function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollAnimation(sectionRef as React.RefObject<HTMLElement>, {
    from:          { opacity: 0, y: 50 },
    to:            { opacity: 1, y: 0  },
    childSelector: ".feature-card",
    stagger:       0.08,
    start:         "top 78%",
    duration:      0.65,
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
        {FEATURES.map(({ icon: Icon, title, desc }) => (
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
            <p className="text-[var(--color-muted)] text-sm leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN LANDING PAGE
// ══════════════════════════════════════════════════════════════
export default function LandingPage() {
  const { data: session, status } = useAuth();
  const router = useRouter();

  // ── Refs ─────────────────────────────────────────────────
  const heroRef   = useRef<HTMLDivElement>(null);
  const statsRef  = useRef<HTMLDivElement>(null);
  const ctaRef    = useRef<HTMLElement>(null);

  // ── Convex data ──────────────────────────────────────────
  const platformStats  = useQuery(api.platformStats.get);
  const totalDevelopers= platformStats?.totalDevelopers       ?? 0;
  const totalQuestions = platformStats?.totalQuestionsGenerated?? 0;
  const totalSolved    = platformStats?.totalProblemsSolved    ?? 0;

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
        { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.7, ease: "power2.out" },
        i * 0.11
      );
    });
    return () => { tl.kill(); };
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
    return () => { tl.kill(); };
  }, []);

  // ── Auth guard ───────────────────────────────────────────
  if (status === "loading" || status === "authenticated") {
    return (
      <AuthLoader
        authenticatedRedirect="/dashboard"
        unauthenticatedRedirect="/"
      />
    );
  }

  return (
    <div
      className="relative overflow-hidden min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* ── Ambient background grid ─────────────────────── */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none" aria-hidden="true" />

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
        className="fixed top-0 inset-x-0 z-50 border-b"
        style={{
          background: "rgba(10,10,10,0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "var(--color-border)",
        }}
      >
        <nav className="flex h-[68px] items-center justify-between px-6 lg:px-12 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/docs">
              <Button
                variant="ghost"
                className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] focus-visible:ring-[var(--color-accent)]"
              >
                Docs
              </Button>
            </Link>
            {session ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="gap-2 glow-primary-hover focus-visible:ring-[var(--color-accent)] cursor-pointer"
              >
                Dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Link href="/login">
                <Button className="cursor-pointer glow-primary-hover focus-visible:ring-[var(--color-accent)]">
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
      <section ref={heroRef} className="relative pt-40 pb-28 px-4 text-center z-10 overflow-hidden">
        {/* Three.js particle background */}
        <HeroParticles className="opacity-70" />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <div data-animate className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium animate-float"
              style={{
                borderColor: "rgba(255,107,0,0.25)",
                background:  "rgba(255,107,0,0.08)",
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
            <span className="text-[var(--color-accent)] px-2">AI-Generated</span> challenges
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
                  color:       "var(--color-text)",
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
            {["OpenAI GPT-4o", "Claude 3.5", "Gemini 2.0", "Groq Llama 3.3"].map((m) => (
              <span key={m} className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--color-accent)" }}
                  aria-hidden="true"
                />
                {m}
              </span>
            ))}
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
              <StatCounter value={totalQuestions} suffix="+" label="AI Questions Generated" />
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
                Loved by <span className="text-[var(--color-accent)]">developers</span>
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

                      <div className="flex items-center gap-3 mt-auto pt-4 border-t"
                           style={{ borderColor: "var(--color-border)" }}>
                        {(r as any).userImageUrl ? (
                          <img
                            src={(r as any).userImageUrl as string}
                            alt={r.userName}
                            className="w-9 h-9 rounded-full object-cover ring-2"
                            style={{ "--tw-ring-color": "rgba(255,107,0,0.2)" } as React.CSSProperties}
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
                          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
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
            Join developers using codeCraft to sharpen their skills and ace
            their next coding interview — completely free.
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
        <div className="absolute inset-0 opacity-100 pointer-events-none" aria-hidden="true">
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
                  { label: "Dashboard",     href: "/dashboard" },
                  { label: "Start Free",    href: "/login" },
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
                background:   "rgba(255,255,255,0.03)",
                borderColor:  "var(--color-border)",
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
