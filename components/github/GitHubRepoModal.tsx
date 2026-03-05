"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Lock, Globe, X, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Repository {
    name: string;
    url: string;
    owner: string;
    full_name: string;
    is_private: boolean;
}

interface GitHubRepoModalProps {
    username: string;
    existingRepo: Repository | null;
    onClose: () => void;
    onCreated: (repo: Repository) => void;
}

export function GitHubRepoModal({
    username,
    existingRepo,
    onClose,
    onCreated,
}: GitHubRepoModalProps) {
    const [name, setName] = useState("codecraft-solutions");
    const [description, setDescription] = useState("Coding solutions from CodeCraft platform");
    const [isPrivate, setIsPrivate] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error("Repository name is required");
            return;
        }
        // Clean the repo name (GitHub rules: alphanumeric, hyphens, underscores)
        const cleanName = name.trim().replace(/[^a-zA-Z0-9._-]/g, "-");
        setCreating(true);
        try {
            const res = await fetch("/api/github/repo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: cleanName, description: description.trim(), is_private: isPrivate }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to create repository");
            toast.success(`Repository "${cleanName}" created on GitHub! 🎉`);
            onCreated(data.repository);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create repository");
        } finally {
            setCreating(false);
        }
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800">
                            <Github className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">GitHub Repository</h2>
                            <p className="text-xs text-zinc-500">@{username}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* If a repo already exists, show its info */}
                    {existingRepo ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                                <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-green-300">Repository Linked</p>
                                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                                        {existingRepo.full_name}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={existingRepo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View on GitHub
                            </a>
                            <Button
                                onClick={onClose}
                                className="w-full bg-orange-500 hover:bg-orange-400 text-white"
                            >
                                Done
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Repository Name */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                    Repository Name <span className="text-red-400">*</span>
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="codecraft-solutions"
                                    className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-orange-500/50"
                                />
                                <p className="text-xs text-zinc-600 mt-1">
                                    Will be created at github.com/{username}/{name || "…"}
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                    Description <span className="text-zinc-600">(optional)</span>
                                </label>
                                <Input
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Coding solutions from CodeCraft platform"
                                    className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-orange-500/50"
                                />
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2">
                                    Visibility
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: "Public", icon: Globe, value: false },
                                        { label: "Private", icon: Lock, value: true },
                                    ].map(({ label, icon: Icon, value }) => (
                                        <button
                                            key={label}
                                            onClick={() => setIsPrivate(value)}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${isPrivate === value
                                                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                                                    : "border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20"
                                                }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={creating}
                                    className="flex-1 border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreate}
                                    disabled={creating || !name.trim()}
                                    className="flex-1 bg-orange-500 hover:bg-orange-400 text-white gap-2 disabled:opacity-50"
                                >
                                    {creating ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
                                    ) : (
                                        <><Github className="h-4 w-4" /> Create Repository</>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
