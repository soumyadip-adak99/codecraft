"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useChallengeStore } from "@/store/challengeStore";
import { Shield } from "lucide-react";

// The full-page skeleton for the Challenge Workspace Loading Phase
export function ChallengeSkeleton() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#111111] gap-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                        <Shield className="h-8 w-8 text-orange-500" />
                    </div>
                    {/* Spinner ring */}
                    <svg className="absolute inset-0 h-16 w-16 -rotate-90 text-orange-500/20" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                    <svg className="absolute inset-0 h-16 w-16 -rotate-90 text-orange-500 animate-[spin_2s_linear_infinite]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="290" strokeDashoffset="220" />
                    </svg>
                </div>

                <h2 className="text-xl font-medium text-white tracking-wide">Verifying Session...</h2>
                <p className="text-sm text-zinc-500 max-w-xs text-center">
                    Securing your workspace and loading the latest challenges.
                </p>

                {/* Micro-loading dots */}
                <div className="flex gap-1.5 mt-2">
                    <div className="h-1.5 w-1.5 bg-orange-500/40 rounded-full animate-bounce" />
                    <div className="h-1.5 w-1.5 bg-orange-500/40 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <div className="h-1.5 w-1.5 bg-orange-500/40 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
            </div>
        </div>
    );
}

interface SessionAuthGuardProps {
    children: React.ReactNode;
}

export function SessionAuthGuard({ children }: SessionAuthGuardProps) {
    const { status } = useSession();
    const router = useRouter();
    const { currentQuestion, sessionActive, isGenerating } = useChallengeStore();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // State 1: Auth check is still loading
        if (status === "loading") {
            return;
        }

        // State 2: User is not authenticated
        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        // State 3: A new question is being generated — hold position, don't redirect.
        // The ChallengePage useEffect will handle the URL update when ready.
        if (isGenerating) {
            return;
        }

        // State 4: User is authenticated but there is no active challenge session
        if (status === "authenticated" && (!sessionActive || !currentQuestion)) {
            router.replace("/dashboard");
            return;
        }

        // State 5: User is authenticated and has an active session
        if (status === "authenticated" && sessionActive && currentQuestion) {
            // Need a slight delay to allow rendering phase to switch safely without flashing
            const timer = setTimeout(() => setIsAuthorized(true), 100);
            return () => clearTimeout(timer);
        }
    }, [status, sessionActive, currentQuestion, isGenerating, router]);

    // Show loading skeleton while verifying, generating, or waiting for redirect
    if (status === "loading" || (!isAuthorized && !isGenerating)) {
        return <ChallengeSkeleton />;
    }

    // Only render children when fully authorized
    return <>{children}</>;
}
