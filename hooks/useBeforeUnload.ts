import { useEffect } from "react";

/**
 * useBeforeUnload
 *
 * Attaches a `beforeunload` event handler to warn the user that they have
 * unsaved code before closing or reloading the browser tab.
 *
 * @param active - When true, the warning is active. Pass `sessionActive && codeModified`.
 */
export function useBeforeUnload(active: boolean) {
    useEffect(() => {
        if (!active) return;

        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue =
                "You have unsubmitted code. Leaving now will discard your work.";
            return e.returnValue;
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [active]);
}
