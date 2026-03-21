import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";
import challengeReducer from "./challengeSlice";
import uiReducer from "./uiSlice";
import userReducer from "./userSlice";

// ── SSR-safe storage ──────────────────────────────────────────────────────────
// On the server localStorage doesn't exist. redux-persist prints a warning and
// falls back to a noop — we provide the noop ourselves to silence it cleanly.
const createNoopStorage = () => ({
    getItem: (_key: string) => Promise.resolve(null),
    setItem: (_key: string, value: unknown) => Promise.resolve(value),
    removeItem: (_key: string) => Promise.resolve(),
});

const storage =
    typeof window !== "undefined"
        ? require("redux-persist/lib/storage").default
        : createNoopStorage();


// ── Persist config for challenge slice ────────────────────────────────────────
// Mirrors the Zustand persist partialize — only persist session metadata &
// credentials; transient state (current question, code, results) is excluded.
const challengePersistConfig = {
    key: "cc-session",
    storage,
    whitelist: ["sessionId", "sessionActive", "usedQuestionIds", "apiKey", "language"],
};

// ── Persist config for user slice ─────────────────────────────────────────────
const userPersistConfig = {
    key: "codeCraft-user",
    storage,
    whitelist: ["hasApiKey"],
};

// ── Root reducer ──────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
    challenge: persistReducer(challengePersistConfig, challengeReducer),
    ui: uiReducer, // UI state is NOT persisted
    user: persistReducer(userPersistConfig, userReducer),
});

// ── Store ─────────────────────────────────────────────────────────────────────
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore redux-persist internal actions
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

// ── Types ─────────────────────────────────────────────────────────────────────
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
