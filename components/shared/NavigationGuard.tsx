"use client";

import { useEffect } from "react";
import { useChallengeStore } from "@/store/challengeStore";
import { useSqlStore } from "@/store/sqlStore";

/**
 * NavigationGuard
 * 
 * Intercepts completely accidental clicks on internal links (like the logo, Nav links, etc.) 
 * anywhere in the app if there's an active session. It prevents default Next.js routing 
 * and pops up the appropriate confirmation modal instead.
 */
export function NavigationGuard() {
    const { sessionActive, openExitModal } = useChallengeStore();
    const { sqlSessionActive, openSqlExitModal } = useSqlStore();

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Only care if a session is active
            if (!sessionActive && !sqlSessionActive) return;

            // Find closest anchor tag
            const target = e.target as HTMLElement;
            const a = target.closest("a");

            if (!a) return;

            const href = a.getAttribute("href");

            // Ignore external links, hashes, or pure triggers (href="#")
            if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) {
                return;
            }

            // Ignore current exact page (e.g. clicking same challenge)
            // But if it's leaving the session page entirely to e.g. /dashboard or /docs, block it
            const currentPath = window.location.pathname;
            if (href === currentPath) return;

            // Block navigation and show the modal
            e.preventDefault();

            if (sessionActive) {
                openExitModal(href);
            } else if (sqlSessionActive) {
                openSqlExitModal(href);
            }
        };

        // Capture phase to intercept before React Router / Next.js link handles it
        document.addEventListener("click", handleClick, { capture: true });

        return () => {
            document.removeEventListener("click", handleClick, { capture: true });
        };
    }, [sessionActive, sqlSessionActive, openExitModal, openSqlExitModal]);

    return null; // pure logic component
}
