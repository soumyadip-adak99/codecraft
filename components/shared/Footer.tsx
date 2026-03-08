import Logo from "@/components/ui/logo";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2.5">
                        {/* <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500">
                            <Code2 className="h-4 w-4 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-black text-white">
                            code<span className="text-orange-500">Carft</span>
                        </span> */}
                        <Logo />
                    </div>

                    <div className="flex items-center gap-6 text-sm text-zinc-500">
                        <Link href="/" className="hover:text-zinc-300 transition-colors">
                            Home
                        </Link>
                        <Link href="/docs" className="hover:text-zinc-300 transition-colors">
                            Docs
                        </Link>
                        <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/settings" className="hover:text-zinc-300 transition-colors">
                            Settings
                        </Link>
                    </div>

                    <p className="text-xs text-zinc-600">
                        © {new Date().getFullYear()} codeCraft. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
