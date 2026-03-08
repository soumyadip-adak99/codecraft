"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useChallengeStore } from "@/store/challengeStore";
import { useUserStore } from "@/store";
import { useRouter } from "next/navigation";

interface DeleteAccountModalProps {
    onClose: () => void;
}

export function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
    const [deleting, setDeleting] = useState(false);
    const { reset: resetUser } = useUserStore();
    const router = useRouter();

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch("/api/user/delete", { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete account");
            }

            // Clear all local state
            resetUser();
            useChallengeStore.persist.clearStorage();

            toast.success("Account deleted. Goodbye! 👋");

            // Short delay so the toast is visible before redirect
            await new Promise((r) => setTimeout(r, 600));
            router.push("/api/auth/logout");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            toast.error(message);
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md glass rounded-2xl border border-white/8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15">
                            <Trash2 className="h-5 w-5 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">Delete Account</h2>
                            <p className="text-xs text-zinc-500">Permanent action — cannot be undone</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors disabled:opacity-40"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Warning banner */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20">
                        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-red-300">
                                This action is irreversible
                            </p>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Deleting your account will permanently remove:
                            </p>
                        </div>
                    </div>

                    {/* What gets deleted */}
                    <ul className="space-y-2 text-sm text-zinc-400 pl-2">
                        {[
                            "Your profile and authentication data",
                            "Your saved API key",
                            "Your GitHub integration and linked repository",
                            "Your solve history and statistics",
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500/70 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <p className="text-xs text-zinc-600 leading-relaxed">
                        There is no way to recover your account after deletion. If you are sure, click the
                        button below.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={deleting}
                        className="flex-1 border-white/10 text-zinc-300 hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white gap-2 disabled:opacity-50"
                    >
                        {deleting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Deleting…
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete my account
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
