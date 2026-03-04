"use client";

import { ChallengeModal } from "@/components/challenge/ChallengeModal";
import { AuthLoader } from "@/components/shared/AuthLoader";
import { Navbar } from "@/components/shared/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    // Block render until auth is resolved
    if (status === "loading" || status === "unauthenticated") {
        return (
            <AuthLoader
                authenticatedRedirect="/dashboard"
                unauthenticatedRedirect="/login"
            />
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
