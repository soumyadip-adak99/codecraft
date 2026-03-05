"use client";

import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { NavigationConfirmModal } from "./NavigationConfirmModal";
import { SessionAuthGuard } from "./SessionAuthGuard";
import { useChallengeStore } from "@/store/challengeStore";

export function ChallengeLayout({ children }: { children: React.ReactNode }) {
    const { sessionActive, codeModified } = useChallengeStore();

    // 1. Browser-level exit protection (refresh, close tab) — active when user
    //    has an open session and has modified the code without submitting.
    useBeforeUnload(!!sessionActive && codeModified);

    // 2. Next.js App Router internal navigation protection
    useNavigationGuard();

    return (
        <SessionAuthGuard>
            {/* The main workspace page contents */}
            {children}

            {/* Global navigation confirmation modal for the challenge section */}
            <NavigationConfirmModal />
        </SessionAuthGuard>
    );
}
