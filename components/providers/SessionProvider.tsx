"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextAuthSessionProvider>
            <ConvexProvider client={convex}>{children}</ConvexProvider>
        </NextAuthSessionProvider>
    );
}
