"use client";

import { useEffect } from "react";
import { useChallengeStore } from "@/store/challengeStore";

export function useBeforeUnload() {
    const { hasUnsavedChanges } = useChallengeStore();

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                // The browser determines the message to show
                e.returnValue = "";
                return "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);
}
