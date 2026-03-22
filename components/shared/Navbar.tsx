"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/components/ui/logo";
import { useUIStore } from "@/store";
import { ChevronDown, LogOut, Settings, Trophy, Zap } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
    const { data: session } = useAuth();
    const router = useRouter();
    const { openModeModal } = useUIStore();

    const handleSignOut = () => {
        // Clear all localStorage
        localStorage.clear();
        sessionStorage.clear();

        // Clear all accessible cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Redirect to server-side logout to clear HTTP-only cc_token cookie
        window.location.href = "/api/auth/logout";
    };

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <div className="flex items-center gap-2.5 group">
                    <Logo />
                </div>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/docs"
                        className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        Docs
                    </Link>
                    <Link
                        href="/dashboard"
                        className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/settings"
                        className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        Settings
                    </Link>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {session ? (
                        <>
                            <Button
                                onClick={openModeModal}
                                className="gap-2 shadow-lg shadow-primary/20 cursor-pointer glow-primary-hover animate-pulse-orange"
                                size="sm"
                            >
                                <Zap className="h-4 w-4" />
                                <span className="hidden sm:inline">New Challenge</span>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 rounded-full hover:bg-white/5 p-1 pr-2 transition-colors cursor-pointer">
                                        <Avatar className="h-8 w-8 ring-2 ring-primary/30 shadow-[0_0_10px_rgba(255,106,0,0.2)]">
                                            <AvatarImage src={session.user?.image || ""} />
                                            <AvatarFallback className="bg-primary/20 text-primary uppercase text-xs font-bold">
                                                {session.user?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="end"
                                    className="w-52 bg-zinc-900 border-zinc-800"
                                >
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium text-white truncate">
                                            {session.user?.name}
                                        </p>
                                        <p className="text-xs text-zinc-500 truncate">
                                            {session.user?.email}
                                        </p>
                                    </div>

                                    <DropdownMenuSeparator className="bg-zinc-800" />

                                    <DropdownMenuItem
                                        asChild
                                        className="text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <Link href="/dashboard" className="flex items-center gap-2">
                                            <Trophy className="h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        asChild
                                        className="text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <Link href="/settings" className="flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="bg-zinc-800" />

                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="text-red-400 hover:text-red-300 hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/20"
                            >
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}