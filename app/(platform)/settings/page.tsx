"use client";

import { useState } from "react";
import { Key, Save, Trash2, Check, AlertTriangle, ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUserStore } from "@/store";
import { API_KEY_PROVIDER_LINK, PROVIDERS } from "@/constant";

export default function SettingsPage() {
    const { hasApiKey, setHasApiKey } = useUserStore();
    const [apiKey, setApiKey] = useState("");
    const [provider, setProvider] = useState("openai");
    const [saving, setSaving] = useState(false);
    const [removing, setRemoving] = useState(false);

    const handleSave = async () => {
        if (!apiKey.trim()) {
            toast.error("Please enter an API key");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/user/apikey", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey: apiKey.trim(), provider }),
            });
            if (!res.ok) throw new Error("Failed to save");
            setHasApiKey(true);
            setApiKey("");
            toast.success("API key saved successfully!");
        } catch {
            toast.error("Failed to save API key");
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        setRemoving(true);
        try {
            const res = await fetch("/api/user/apikey", { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove");
            setHasApiKey(false);
            toast.success("API key removed");
        } catch {
            toast.error("Failed to remove API key");
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-2xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-black text-white mb-2">Settings</h1>
                <p className="text-zinc-500 mb-10">Manage your API keys and preferences</p>

                {/* API Key Status */}
                {hasApiKey && (
                    <div className="flex items-center gap-3 glass rounded-2xl border border-green-500/20 bg-green-500/5 p-4 mb-6">
                        <Check className="h-5 w-5 text-green-400 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-green-300">
                                API Key Connected
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Your LLM API key is saved and ready to use
                            </p>
                        </div>
                    </div>
                )}

                {/* API Key Card */}
                <div className="glass rounded-2xl border border-white/5 p-6 space-y-5">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
                            <Key className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">LLM API Key</h2>
                            <p className="text-xs text-zinc-500">
                                Used for question generation & evaluation
                            </p>
                        </div>
                    </div>

                    {/* Provider */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">
                            Provider
                        </label>
                        <div className="relative">
                            <select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                                className="w-full appearance-none bg-zinc-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                            >
                                {PROVIDERS.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">
                            {hasApiKey ? "Replace API Key" : "API Key"}
                        </label>
                        <Input
                            type="password"
                            placeholder={`Enter your ${PROVIDERS.find((p) => p.value === provider)?.label} API key...`}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="bg-white/3 border-white/8 text-white placeholder:text-zinc-600 focus:border-orange-500/50 font-mono"
                        />
                    </div>

                    {/* Security note */}
                    <div className="flex items-start gap-2 rounded-xl bg-blue-500/5 border border-blue-500/15 p-3">
                        <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Your API key is stored securely on your account. It is only used to make
                            requests to your chosen LLM provider and is never shared with anyone.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1">
                        <Button
                            onClick={handleSave}
                            disabled={saving || !apiKey.trim()}
                            className="flex-1 bg-orange-500 hover:bg-orange-400 text-white gap-2 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save Key"}
                        </Button>
                        {hasApiKey && (
                            <Button
                                variant="outline"
                                onClick={handleRemove}
                                disabled={removing}
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                {removing ? "Removing..." : "Remove"}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Provider Docs */}
                <div className="mt-6 glass rounded-2xl border border-white/5 p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Where to get API keys
                    </h3>
                    <div className="space-y-3 text-sm text-zinc-400">
                        {API_KEY_PROVIDER_LINK.map(({ name, url, badge }) => (
                            <div key={name} className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    {name}
                                    {badge && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                            {badge}
                                        </span>
                                    )}
                                </span>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-orange-400 hover:text-orange-300 hover:underline"
                                >
                                    Get key →
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
