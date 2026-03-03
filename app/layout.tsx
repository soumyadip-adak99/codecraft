import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SmoothScrolling } from "@/components/providers/SmoothScrolling";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: {
        default: "codeCarft — LLM-Powered Coding Challenges",
        template: "%s | codeCarft AI",
    },
    description:
        "Generate unlimited AI-powered coding challenges, solve them in a VS Code-like environment, and get real-time AI feedback. Built for developers who want to level up.",
    keywords: [
        "coding",
        "interview prep",
        "AI",
        "LeetCode",
        "coding challenges",
        "developer tools",
    ],
    authors: [{ name: "codeCarft" }],
    openGraph: {
        title: "codeCarft AI",
        description: "AI-powered coding challenge platform",
        type: "website",
    },
    icons: {
        icon: "/logo.svg",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className={`font-sans antialiased bg-black text-white`}>
                <SmoothScrolling>
                    <SessionProvider>
                        {children}
                        <Toaster
                            theme="dark"
                            toastOptions={{
                                style: {
                                    background: "#111",
                                    border: "1px solid #222",
                                    color: "#fff",
                                },
                            }}
                        />
                    </SessionProvider>
                </SmoothScrolling>
            </body>
        </html>
    );
}
