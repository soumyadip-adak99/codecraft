"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { ChallengeModal } from "@/components/challenge/ChallengeModal";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-orange-500 animate-pulse" />
                    <p className="text-zinc-500 text-sm animate-pulse">Loading codeCarft...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="flex min-h-screen flex-col bg-black">
            <Navbar />
            <main className="flex-1">{children}</main>
            <ChallengeModal />
        </div>
    );
}
