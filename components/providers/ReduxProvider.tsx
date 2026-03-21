"use client";

import { store, persistor } from "@/store/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

/**
 * ReduxProvider wraps the entire app with the Redux store and the
 * redux-persist PersistGate (which delays rendering until rehydration
 * from localStorage is complete, matching the old Zustand persist behaviour).
 */
export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
}
