import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
