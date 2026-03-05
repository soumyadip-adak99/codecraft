"use client";

import { useEffect, useState } from "react";
import { Github, Loader2 } from "lucide-react";

interface GitHubStatus {
    connected: boolean;
    username: string | null;
    repository: {
        name: string;
        url: string;
        owner: string;
        full_name: string;
        is_private: boolean;
    } | null;
}

interface GitHubStatusBadgeProps {
    /** If provided, the component uses this value instead of fetching */
    status?: GitHubStatus | null;
    /** Show a compact variant suitable for small spaces */
    compact?: boolean;
}

export function GitHubStatusBadge({ status: externalStatus, compact = false }: GitHubStatusBadgeProps) {
    const [status, setStatus] = useState<GitHubStatus | null>(externalStatus ?? null);
    const [loading, setLoading] = useState(!externalStatus);

    useEffect(() => {
        if (externalStatus !== undefined) {
            setStatus(externalStatus);
            setLoading(false);
            return;
        }
        fetch("/api/github/status")
            .then((r) => r.json())
            .then((data) => { setStatus(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [externalStatus]);

    if (loading) {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                {!compact && "Checking GitHub…"}
            </span>
        );
    }

    if (!status?.connected) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                <Github className="h-3 w-3" />
                {compact ? "Not connected" : "GitHub — Not Connected"}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <Github className="h-3 w-3" />
            {compact ? `@${status.username}` : `Connected · @${status.username}`}
        </span>
    );
}
