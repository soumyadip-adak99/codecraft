import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

interface UIState {
    isModeModalOpen: boolean;
    isChallengeModalOpen: boolean;
    isSqlModalOpen: boolean;
    isSettingsOpen: boolean;
    toasts: Toast[];

    openModeModal: () => void;
    closeModeModal: () => void;
    openChallengeModal: () => void;
    closeChallengeModal: () => void;
    openSqlModal: () => void;
    closeSqlModal: () => void;
    openSettings: () => void;
    closeSettings: () => void;
    addToast: (message: string, type?: Toast["type"]) => void;
    removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
    devtools(
        (set) => ({
            isModeModalOpen: false,
            isChallengeModalOpen: false,
            isSqlModalOpen: false,
            isSettingsOpen: false,
            toasts: [],

            openModeModal: () => set({ isModeModalOpen: true }),
            closeModeModal: () => set({ isModeModalOpen: false }),
            openChallengeModal: () => set({ isChallengeModalOpen: true }),
            closeChallengeModal: () => set({ isChallengeModalOpen: false }),
            openSqlModal: () => set({ isSqlModalOpen: true }),
            closeSqlModal: () => set({ isSqlModalOpen: false }),
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
