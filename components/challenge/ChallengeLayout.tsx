"use client";

import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { NavigationConfirmModal } from "./NavigationConfirmModal";
import { SessionAuthGuard } from "./SessionAuthGuard";

export function ChallengeLayout({ children }: { children: React.ReactNode }) {
    // 1. Browser-level exit protection (refresh, close tab)
    useBeforeUnload();

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
