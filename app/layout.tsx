import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

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
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
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
            </body>
        </html>
    );
}
