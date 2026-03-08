"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useChallengeStore } from "@/store/challengeStore";

/**
 * useNavigationGuard
 *
 * Intercepts ALL internal navigation attempts while a challenge session
 * is active and shows the custom exit-confirmation modal instead.
 *
 * Covers:
 *  1. <Link> / <a> clicks (capture phase)
 *  2. window.history.pushState  (Next.js router.push)
 *  3. window.history.replaceState (Next.js router.replace)
 *  4. window.history.back/forward via the `popstate` event (browser back button)
 *     → Special case: back button redirects to /dashboard and shows the
 *       SessionProgressModal there instead of blocking in place.
 */
export function useNavigationGuard() {
    const pathname = usePathname();
    const { hasUnsavedChanges, openExitModal, openSessionProgressModal } = useChallengeStore();

    // Keep stable refs so history-patch closures don't go stale
    const guardRef = useRef(hasUnsavedChanges);
    guardRef.current = hasUnsavedChanges;

    const openModalRef = useRef(openExitModal);
    openModalRef.current = openExitModal;

    const openProgressModalRef = useRef(openSessionProgressModal);
    openProgressModalRef.current = openSessionProgressModal;

    const pathnameRef = useRef(pathname);
    pathnameRef.current = pathname;

    // ── 1. <Link> / <a> click interceptor ──────────────────────────────────
    const handleLinkClick = useCallback(
        (e: MouseEvent) => {
            if (!guardRef.current) return;

            const anchor = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
            if (!anchor || anchor.target === "_blank") return;

            const href = anchor.href;
            if (!href) return;

            try {
                const target = new URL(href);
                // Only guard same-origin, different-path navigations
                if (
                    target.origin !== window.location.origin ||
                    target.pathname === pathnameRef.current
                )
                    return;

                e.preventDefault();
                e.stopPropagation();
                openModalRef.current(target.href);
            } catch {
                // Ignore unparseable hrefs
            }
        },
        [] // stable — reads from refs
    );

    useEffect(() => {
        document.addEventListener("click", handleLinkClick, { capture: true });
        return () => document.removeEventListener("click", handleLinkClick, { capture: true });
    }, [handleLinkClick]);

    // ── 2 & 3. Patch pushState / replaceState ──────────────────────────────
    useEffect(() => {
        const origPush = window.history.pushState.bind(window.history);
        const origReplace = window.history.replaceState.bind(window.history);

        function patchedPush(
            this: History,
            data: unknown,
            unused: string,
            url?: string | URL | null
        ) {
            if (!intercept(url)) return origPush(data, unused, url);
        }

        function patchedReplace(
            this: History,
            data: unknown,
            unused: string,
            url?: string | URL | null
        ) {
            if (!intercept(url)) return origReplace(data, unused, url);
        }

        function intercept(url?: string | URL | null): boolean {
            if (!guardRef.current || !url) return false;
            try {
                const target = new URL(url.toString(), window.location.origin);
                if (target.pathname === pathnameRef.current) return false;
                // Show modal, block navigation
                openModalRef.current(target.href);
                return true; // intercepted — do NOT call original
            } catch {
                return false;
            }
        }

        window.history.pushState = patchedPush as typeof window.history.pushState;
        window.history.replaceState = patchedReplace as typeof window.history.replaceState;

        return () => {
            window.history.pushState = origPush;
            window.history.replaceState = origReplace;
        };
    }, [pathname]); // re-patch when pathname changes

    // ── 4. Browser back/forward (popstate) ─────────────────────────────────
    // Special case: when the user hits the browser back button from /challenge
    // we let them navigate to /dashboard but immediately flag the store so
    // the dashboard renders the SessionProgressModal (resume vs end session).
    useEffect(() => {
        const handlePopState = () => {
            if (!guardRef.current) return;

            // Set the flag BEFORE navigating so the dashboard can read it on mount
            openProgressModalRef.current();

            // Navigate to dashboard bypassing our patched pushState
            window.location.assign("/dashboard");
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);
}
