"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ConvexProvider client={convex}>{children}</ConvexProvider>
        </AuthProvider>
    );
}
