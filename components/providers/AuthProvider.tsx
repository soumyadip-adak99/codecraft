"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    hasApiKey?: boolean;
}

export interface AuthSession {
    user: AuthUser;
}

export interface AuthContextValue {
    /** Mirrors NextAuth's `data` field — null when unauthenticated or loading */
    data: AuthSession | null;
    /** Mirrors NextAuth's `status` field */
    status: AuthStatus;
    /** Call to re-fetch the session (e.g. after saving an API key) */
    refresh: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
    data: null,
    status: "loading",
    refresh: async () => { },
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<AuthSession | null>(null);
    const [status, setStatus] = useState<AuthStatus>("loading");

    const fetchSession = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me", { credentials: "include" });
            if (res.ok) {
                const json = await res.json();
                if (json.user) {
                    setData({ user: json.user });
                    setStatus("authenticated");
                    return;
                }
            }
        } catch {
            // Network error or similar — treat as unauthenticated
        }
        setData(null);
        setStatus("unauthenticated");
    }, []);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    return (
        <AuthContext.Provider value={{ data, status, refresh: fetchSession }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useAuth — Drop-in replacement for NextAuth's `useSession`.
 *
 * Returns `{ data, status }` with the exact same shape:
 *   - data:   AuthSession | null
 *   - status: "loading" | "authenticated" | "unauthenticated"
 */
export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
