"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Code2, Zap, Brain, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) router.push("/dashboard");
    }, [session, router]);

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="h-8 w-8 rounded-lg bg-orange-500 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black flex">
            {/* Background effects */}
            <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none" />
            <div className="fixed top-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />

            {/* Left Panel — Marketing */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 border-r border-white/5">
                <div className="flex items-center gap-2.5">
                    {/* <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/40">
                        <Code2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-black text-white">
                        code<span className="text-orange-500">Carft</span>
                    </span> */}
                    <Logo />
                </div>

                <div>
                    <h2 className="text-4xl font-black text-white leading-tight mb-6">
                        Master coding with <span className="text-orange-500">AI-generated</span>{" "}
                        challenges
                    </h2>
                    <div className="space-y-4">
                        {[
                            { icon: Zap, text: "Unlimited AI-generated problems" },
                            { icon: Brain, text: "Real-time code evaluation & feedback" },
                            { icon: Globe, text: "5 languages: JS, TS, Python, Java, C++" },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3 text-zinc-400">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                                    <Icon className="h-4 w-4 text-orange-500" />
                                </div>
                                <span className="text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-zinc-600">
                    @{new Date().getFullYear()} codeCarft AI · Powered by your LLM API key
                </p>
            </div>

            {/* Right Panel — Auth */}
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-10 justify-center">
                        {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
                            <Code2 className="h-4.5 w-4.5 text-white" />
                        </div>
                        <span className="text-xl font-black text-white">
                            code<span className="text-orange-500">Carft</span>
                        </span> */}
                        <Logo />
                    </div>

                    <div className="glass rounded-2xl p-8 border border-white/8">
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
                        <p className="text-zinc-400 text-sm mb-8">
                            Sign in to access your coding challenges and progress
                        </p>

                        <Button
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 hover:bg-zinc-100 font-semibold py-5 text-base transition-all duration-200 hover:shadow-lg"
                            size="lg"
                        >
                            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <p className="mt-6 text-center text-xs text-zinc-600 leading-relaxed">
                            By signing in, you agree to our{" "}
                            <span className="text-zinc-400 cursor-pointer hover:text-white">
                                Terms of Service
                            </span>{" "}
                            and{" "}
                            <span className="text-zinc-400 cursor-pointer hover:text-white">
                                Privacy Policy
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
