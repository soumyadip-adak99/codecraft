"use client";

import { Github, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface GitHubStatus {
    connected: boolean;
    username: string | null;
    repository: { name: string; url: string; full_name: string } | null;
}

/**
 * A compact GitHub status banner for the dashboard.
 * - Not connected: subtle "Connect GitHub" nudge
 * - Connected + repo: green pill showing repo
 * - Connected, no repo: amber nudge to create repo
 */
export function GitHubDashboardBanner() {
    const [status, setStatus] = useState<GitHubStatus | null>(null);

    useEffect(() => {
        fetch("/api/github/status")
            .then((r) => r.json())
            .then((d) => setStatus(d))
            .catch(() => {});
    }, []);

    if (!status) return null; // Don't show anything until loaded

    // Connected with repo — show a compact green pill
    if (status.connected && status.repository) {
        return (
            <div className="mb-6 flex items-center gap-2.5 glass rounded-xl border border-green-500/15 bg-green-500/5 px-4 py-3">
                <Github className="h-4 w-4 text-green-400 shrink-0" />
                <p className="text-xs text-green-300 font-medium flex-1">
                    GitHub connected — solutions auto-push to{" "}
                    <span className="font-mono text-green-200">{status.repository.full_name}</span>
                </p>
                <a
                    href={status.repository.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </div>
        );
    }

    // Connected but no repo linked
    if (status.connected && !status.repository) {
        return (
            <Link
                href="/settings?scroll=github"
                className="mb-6 flex items-center gap-2.5 glass rounded-xl border border-orange-500/15 bg-orange-500/5 px-4 py-3 hover:border-orange-500/30 transition-colors group"
            >
                <Github className="h-4 w-4 text-orange-400 shrink-0" />
                <p className="text-xs text-orange-300 flex-1">
                    GitHub connected — create a repository to enable auto-push
                </p>
                <span className="text-xs text-orange-500 group-hover:text-orange-400 transition-colors">
                    Create Repo →
                </span>
            </Link>
        );
    }

    // Not connected at all
    return (
        <Link
            href="/settings"
            className="mb-6 flex items-center gap-2.5 glass rounded-xl border border-blue-800 px-4 py-3 hover:border-blue-900/10 transition-colors group"
        >
            <Github className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" />
            <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                Connect GitHub to enable automatic solution backup
            </p>
            <span className="text-xs text-zinc-600 group-hover:text-orange-500 transition-colors ml-auto">
                Connect →
            </span>
        </Link>
    );
}
