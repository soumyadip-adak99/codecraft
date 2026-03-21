import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// ── Typed hooks ───────────────────────────────────────────────────────────────
/** Use throughout the app instead of plain `useDispatch` */
export const useAppDispatch: () => AppDispatch = useDispatch;

/** Use throughout the app instead of plain `useSelector` */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ── Re-exports ────────────────────────────────────────────────────────────────
export { store, persistor } from "./store";
export type { RootState, AppDispatch } from "./store";

// Challenge
export {
    startSession,
    setQuestion,
    setCode,
    setLanguage,
    setApiKey,
    setProvider,
    clearResults,
    setHasUnsavedChanges,
    setCodeModified,
    openExitModal,
    closeExitModal,
    setExitTargetUrl,
    openSessionProgressModal,
    closeSessionProgressModal,
} from "./challengeSlice";
export { generateQuestionThunk, executeCodeThunk, endSessionThunk } from "./challengeThunks";
export type { Question, SolvedQuestion, Language, Difficulty } from "./challengeSlice";

// UI
export {
    openChallengeModal,
    closeChallengeModal,
    openSettings,
    closeSettings,
    addToast,
    removeToast,
} from "./uiSlice";

// User
export { setHasApiKey, reset as resetUser } from "./userSlice";
