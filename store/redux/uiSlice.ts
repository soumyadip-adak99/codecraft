import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

interface UIState {
    isChallengeModalOpen: boolean;
    isSettingsOpen: boolean;
    toasts: Toast[];
}

// ── Initial State ──────────────────────────────────────────────────────────────
const initialState: UIState = {
    isChallengeModalOpen: false,
    isSettingsOpen: false,
    toasts: [],
};

// ── Slice ──────────────────────────────────────────────────────────────────────
const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openChallengeModal(state) {
            state.isChallengeModalOpen = true;
        },
        closeChallengeModal(state) {
            state.isChallengeModalOpen = false;
        },
        openSettings(state) {
            state.isSettingsOpen = true;
        },
        closeSettings(state) {
            state.isSettingsOpen = false;
        },
        addToast(
            state,
            action: PayloadAction<{ message: string; type?: Toast["type"] }>
        ) {
            const id = Math.random().toString(36).slice(2);
            state.toasts.push({
                id,
                message: action.payload.message,
                type: action.payload.type ?? "info",
            });
            // Note: auto-removal after 4 s is handled in the component via setTimeout
            // because reducers cannot schedule side effects
        },
        removeToast(state, action: PayloadAction<string>) {
            state.toasts = state.toasts.filter((t) => t.id !== action.payload);
        },
    },
});

export const {
    openChallengeModal,
    closeChallengeModal,
    openSettings,
    closeSettings,
    addToast,
    removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
