import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

interface UIState {
    isChallengeModalOpen: boolean;
    isSettingsOpen: boolean;
    toasts: Toast[];

    openChallengeModal: () => void;
    closeChallengeModal: () => void;
    openSettings: () => void;
    closeSettings: () => void;
    addToast: (message: string, type?: Toast["type"]) => void;
    removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
    devtools(
        (set) => ({
            isChallengeModalOpen: false,
            isSettingsOpen: false,
            toasts: [],

            openChallengeModal: () => set({ isChallengeModalOpen: true }),
            closeChallengeModal: () => set({ isChallengeModalOpen: false }),
            openSettings: () => set({ isSettingsOpen: true }),
            closeSettings: () => set({ isSettingsOpen: false }),

            addToast: (message, type = "info") => {
                const id = Math.random().toString(36).slice(2);
                set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
                setTimeout(() => {
                    set((state) => ({
                        toasts: state.toasts.filter((t) => t.id !== id),
                    }));
                }, 4000);
            },

            removeToast: (id) =>
                set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
        }),
        { name: "UIStore" }
    )
);
