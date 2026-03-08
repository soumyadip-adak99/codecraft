import { Wrench, Zap, Sparkles } from "lucide-react";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Background gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0%,rgba(0,0,0,1)_100%)] z-0 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] z-0 pointer-events-none" />

            {/* Content Container */}
            <div className="z-10 flex flex-col items-center text-center max-w-2xl px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                <div className="flex items-center justify-center mb-10 relative">
                    <div className="relative flex items-center justify-center w-28 h-28 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_40px_rgba(249,115,22,0.1)]">
                        <Wrench className="w-12 h-12 text-orange-500 animate-pulse" />

                        <div className="absolute inset-x-0 -top-12 -bottom-12 -left-12 -right-12 border border-orange-500/20 rounded-full z-[-1] animate-[spin_15s_linear_infinite]" />
                        <div className="absolute inset-x-0 -top-6 -bottom-6 -left-6 -right-6 border border-white/[0.05] rounded-full z-[-1] animate-[spin_20s_linear_infinite_reverse]" />
                    </div>
                </div>

                <Badge className="mb-6" />

                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                    Under Maintenance
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed max-w-xl">
                    We are currently upgrading the platform to bring you an even better experience. We'll be back online in a short amount of time!
                </p>

                <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium backdrop-blur-md shadow-2xl">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <span>Exciting new features coming soon</span>
                    <Zap className="w-5 h-5 text-orange-500" />
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 text-xs font-mono tracking-widest uppercase">
                codeCarft Platform
            </div>
        </div>
    );
}

function Badge({ className }: { className?: string }) {
    return (
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-medium ${className}`}>
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            System Update in Progress
        </div>
    );
}
