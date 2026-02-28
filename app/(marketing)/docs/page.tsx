"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { animations } from "@/lib/animations/config";
import {
    ArrowRight,
    BookOpen,
    Brain,
    Code2,
    CheckCircle2,
    FileText,
    Github,
    Mail,
    Shield,
    Terminal,
    Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function DocsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const headerRef = useRef<HTMLDivElement>(null);
    const stepsRef = useRef<HTMLDivElement>(null);
    const devRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!headerRef.current) return;
        const elements = Array.from(headerRef.current.querySelectorAll("[data-animate]"));
        animations.heroEntrance(elements);
    }, []);

    const steps = [
        {
            icon: Zap,
            title: "1. Start a Session",
            description:
                "Begin your journey from the Dashboard by clicking 'Start Session'. Choose your desired difficulty (Easy, Medium, or Hard) and optionally specify a topic like 'Dynamic Programming' or 'Trees'.",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            icon: Brain,
            title: "2. AI Question Generation",
            description:
                "Our platform uses advanced LLMs (Groq, OpenAI, Anthropic, or Gemini) to generate a unique, completely new coding challenge tailored to your chosen difficulty and topic. We ensure you never see the same question twice in a session.",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            icon: Code2,
            title: "3. Write Code in Monaco Editor",
            description:
                "Solve the problem in a professional VS Code-like environment supporting 5 languages: JavaScript, TypeScript, Python, Java, and C++. The editor comes with syntax highlighting, IntelliSense, and language-specific starter code.",
            color: "text-green-400",
            bg: "bg-green-500/10",
        },
        {
            icon: Terminal,
            title: "4. Run & Submit for Evaluation",
            description:
                "Click 'Run' to test your logic against visible test cases. When ready, click 'Submit' to evaluate against hidden edge cases. A robust execution engine grades your attempt. Once 'Accepted', your stats are updated and the 'Next' button unlocks.",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
        },
        {
            icon: FileText,
            title: "5. End Session & PDF Report",
            description:
                "When you are done practicing, click 'End Session'. A detailed performance report summarizing your solved questions, difficulty breakdown, and time spent is compiled into a beautiful PDF and instantly emailed to your inbox.",
            color: "text-red-400",
            bg: "bg-red-500/10",
        },
    ];

    return (
        <div className="relative overflow-hidden min-h-screen bg-black">
            {/* Background elements */}
            <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
            <div className="fixed top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Navbar */}
            <nav className="relative z-50 flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2.5">
                    <Logo />
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white">
                            Home
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
                                Get Started
                            </Button>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Header Section */}
            <section
                ref={headerRef}
                className="relative pt-20 pb-16 px-4 text-center max-w-4xl mx-auto"
            >
                <div data-animate>
                    <Badge className="mb-6 border-orange-500/30 bg-orange-500/10 text-orange-400 px-4 py-1.5 text-sm gap-2">
                        <BookOpen className="h-3.5 w-3.5" />
                        Documentation
                    </Badge>
                </div>
                <h1
                    data-animate
                    className="text-4xl sm:text-6xl font-black leading-tight mb-6 text-white"
                >
                    How <span className="text-orange-500">codeCarft</span> Works
                </h1>
                <p data-animate className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Everything you need to know about navigating the platform, generating AI
                    challenges, and tracking your coding mastery.
                </p>
            </section>

            {/* Steps Section */}
            <section ref={stepsRef} className="py-16 px-4 max-w-5xl mx-auto">
                <div className="space-y-6">
                    {steps.map((step, idx) => (
                        <div
                            key={idx}
                            className="glass rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div
                                className={`flex-shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center ${step.bg}`}
                            >
                                <step.icon className={`h-7 w-7 ${step.color}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    {step.title}
                                </h3>
                                <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Highlight */}
            <section className="py-16 px-4 max-w-5xl mx-auto border-t border-white/5 mt-10">
                <div className="grid sm:grid-cols-3 gap-6 text-center">
                    <div className="glass p-6 rounded-2xl">
                        <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-4" />
                        <h4 className="text-white font-bold mb-2">100% Privacy</h4>
                        <p className="text-zinc-500 text-sm">
                            Your code is evaluated on the fly and never stored in our database. Only
                            your solved counts are tracked.
                        </p>
                    </div>
                    <div className="glass p-6 rounded-2xl">
                        <CheckCircle2 className="h-8 w-8 text-orange-400 mx-auto mb-4" />
                        <h4 className="text-white font-bold mb-2">Bring Your Own Key</h4>
                        <p className="text-zinc-500 text-sm">
                            Use our free default server API key, or easily plug in your own OpenAI,
                            Anthropic, or Google API key.
                        </p>
                    </div>
                    <div className="glass p-6 rounded-2xl">
                        <CheckCircle2 className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                        <h4 className="text-white font-bold mb-2">Instant Feedback</h4>
                        <p className="text-zinc-500 text-sm">
                            No waiting in queues. Fast, multi-language code execution directly
                            integrated with advanced AI judging.
                        </p>
                    </div>
                </div>
            </section>

            {/* API Key Guide Section */}
            <section className="py-24 px-4 bg-white/[0.02] border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-white mb-4">
                            Comprehensive API Key <span className="text-orange-500">Guide</span>
                        </h2>
                        <p className="text-zinc-400 max-w-3xl mx-auto text-lg leading-relaxed">
                            codeCarft uses large language models (LLMs) to dynamically generate interview questions.
                            While we provide a free default server-side Groq key, supplying your own API key guarantees
                            zero rate limits and lets you harness the most capable models on the market.
                        </p>
                    </div>

                    <div className="mb-12 glass p-8 rounded-2xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-orange-500" />
                            How Your Keys Are Used & Stored
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-white mb-2 text-sm">Client-Side Storage Only</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    When you enter an API key into the "New Challenge" modal, it is <strong>strictly saved in your browser's local storage</strong>. Our backend databases never see, record, or store your API keys.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-2 text-sm">Secure Transmission</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Your key is transmitted directly via secure HTTPS headers to our proxy backend, which immediately forwards it to the respective AI provider without logging it anywhere.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Groq */}
                        <div className="glass p-8 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all flex flex-col md:flex-row gap-8 items-start">
                            <div className="md:w-1/3">
                                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                                    Groq (Llama 3)
                                </h3>
                                <p className="text-sm text-zinc-400 mb-4 font-medium">
                                    Insanely Fast & Free Tier
                                </p>
                                <div className="space-y-1 text-sm">
                                    <p className="text-zinc-500"><strong className="text-white">Model:</strong> llama-3.3-70b-versatile</p>
                                    <p className="text-zinc-500"><strong className="text-white">Cost:</strong> Generous free tier</p>
                                </div>
                            </div>
                            <div className="md:w-2/3">
                                <h4 className="text-white font-bold mb-3">Generation Steps:</h4>
                                <ol className="list-decimal list-outside ml-4 space-y-2 text-sm text-zinc-300">
                                    <li>Navigate to the <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">Groq Cloud Console</a>.</li>
                                    <li>Sign in using your Google, GitHub, or email account.</li>
                                    <li>On the left sidebar, click on "API Keys".</li>
                                    <li>Click the <strong>"Create API Key"</strong> button on the top right.</li>
                                    <li>Name your key (e.g. "codecarft-access") and click Submit.</li>
                                    <li>Copy the generated string starting with <code className="bg-white/10 px-1 py-0.5 rounded text-xs text-orange-200">gsk_</code> and paste it into the platform.</li>
                                </ol>
                            </div>
                        </div>

                        {/* Google Gemini */}
                        <div className="glass p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all flex flex-col md:flex-row gap-8 items-start">
                            <div className="md:w-1/3">
                                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                                    Google Gemini
                                </h3>
                                <p className="text-sm text-zinc-400 mb-4 font-medium">
                                    Excellent Reasoning & Context Window
                                </p>
                                <div className="space-y-1 text-sm">
                                    <p className="text-zinc-500"><strong className="text-white">Models:</strong> gemini-1.5-pro / flash</p>
                                    <p className="text-zinc-500"><strong className="text-white">Cost:</strong> High limits on free tier</p>
                                </div>
                            </div>
                            <div className="md:w-2/3">
                                <h4 className="text-white font-bold mb-3">Generation Steps:</h4>
                                <ol className="list-decimal list-outside ml-4 space-y-2 text-sm text-zinc-300">
                                    <li>Navigate to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 font-semibold hover:underline">Google AI Studio</a>.</li>
                                    <li>Sign in with your Google account.</li>
                                    <li>Click on <strong>"Get API Key"</strong> in the left navigation menu.</li>
                                    <li>Click "Create API Key in new project" (or use an existing Google Cloud project).</li>
                                    <li>Once generated, copy the key and paste it directly into codeCarft.</li>
                                </ol>
                            </div>
                        </div>

                        {/* OpenAI */}
                        <div className="glass p-8 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all flex flex-col md:flex-row gap-8 items-start">
                            <div className="md:w-1/3">
                                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500" />
                                    OpenAI (ChatGPT)
                                </h3>
                                <p className="text-sm text-zinc-400 mb-4 font-medium">
                                    The Industry Standard for Coding
                                </p>
                                <div className="space-y-1 text-sm">
                                    <p className="text-zinc-500"><strong className="text-white">Models:</strong> gpt-4o / gpt-4o-mini</p>
                                    <p className="text-zinc-500"><strong className="text-white">Cost:</strong> Pay-as-you-go ($5 min)</p>
                                </div>
                            </div>
                            <div className="md:w-2/3">
                                <h4 className="text-white font-bold mb-3">Generation Steps:</h4>
                                <ol className="list-decimal list-outside ml-4 space-y-2 text-sm text-zinc-300">
                                    <li>Head over to the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-green-400 font-semibold hover:underline">OpenAI Developer Platform</a>.</li>
                                    <li>Log into your OpenAI account.</li>
                                    <li>Note: You must fund your developer account with at least $5.00 in the <strong>Billing</strong> section to use the API. ChatGPT Plus subscription does <i>not</i> cover API usage.</li>
                                    <li>In the "API keys" tab, click <strong>"Create new secret key"</strong>.</li>
                                    <li>Give it a temporary name and copy the <code className="bg-white/10 px-1 py-0.5 rounded text-xs text-green-200">sk-...</code> string into codeCarft.</li>
                                </ol>
                            </div>
                        </div>

                        {/* Anthropic */}
                        <div className="glass p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all flex flex-col md:flex-row gap-8 items-start">
                            <div className="md:w-1/3">
                                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                                    Anthropic (Claude)
                                </h3>
                                <p className="text-sm text-zinc-400 mb-4 font-medium">
                                    Best-in-Class for Programming Tasks
                                </p>
                                <div className="space-y-1 text-sm">
                                    <p className="text-zinc-500"><strong className="text-white">Models:</strong> claude-3-5-sonnet</p>
                                    <p className="text-zinc-500"><strong className="text-white">Cost:</strong> Pay-as-you-go ($5 min)</p>
                                </div>
                            </div>
                            <div className="md:w-2/3">
                                <h4 className="text-white font-bold mb-3">Generation Steps:</h4>
                                <ol className="list-decimal list-outside ml-4 space-y-2 text-sm text-zinc-300">
                                    <li>Visit the <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-purple-400 font-semibold hover:underline">Anthropic Console</a>.</li>
                                    <li>Create an account or sign in.</li>
                                    <li>Similar to OpenAI, you must preload credits (minimum $5) in the <strong>Billing</strong> tab before keys become active.</li>
                                    <li>Navigate to the "API Keys" section and click <strong>"Create Key"</strong>.</li>
                                    <li>Copy the string starting with <code className="bg-white/10 px-1 py-0.5 rounded text-xs text-purple-200">sk-ant-...</code>.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Developer Info Section */}
            <section ref={devRef} className="py-24 px-4 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-black text-white mb-6">
                        Meet the <span className="text-orange-500">Developer</span>
                    </h2>
                    <p className="text-zinc-400 mb-10 text-lg">
                        Built with passion to help developers learn and ace their coding interviews.
                        Feel free to reach out, report issues, or contribute!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <a
                            href="https://github.com/soumyadip-adak99"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 py-4 glass rounded-xl border border-white/5 hover:bg-white/5 hover:border-orange-500/30 transition-all group w-full sm:w-auto"
                        >
                            <Github className="h-6 w-6 text-white group-hover:text-orange-400 transition-colors" />
                            <div className="text-left">
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                    GitHub
                                </p>
                                <p className="text-white font-semibold">@soumyadip-adak99</p>
                            </div>
                        </a>

                        <a
                            href="mailto:work.soumyadipadak@gmail.com"
                            className="flex items-center gap-3 px-6 py-4 glass rounded-xl border border-white/5 hover:bg-white/5 hover:border-orange-500/30 transition-all group w-full sm:w-auto"
                        >
                            <Mail className="h-6 w-6 text-white group-hover:text-orange-400 transition-colors" />
                            <div className="text-left">
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                    Email
                                </p>
                                <p className="text-white font-semibold">
                                    work.soumyadipadak@gmail.com
                                </p>
                            </div>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
