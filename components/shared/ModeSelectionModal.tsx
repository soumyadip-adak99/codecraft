"use client";

import { useUIStore } from "@/store";
import { Code2, Database, X } from "lucide-react";
import { useEffect, useState } from "react";

export function ModeSelectionModal() {
    const { isModeModalOpen, closeModeModal, openChallengeModal, openSqlModal } = useUIStore();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isModeModalOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isModeModalOpen]);

    if (!isModeModalOpen && !isVisible) return null;

    const handleSelectCoding = () => {
        closeModeModal();
        setTimeout(() => openChallengeModal(), 100);
    };

    const handleSelectSql = () => {
        closeModeModal();
        setTimeout(() => openSqlModal(), 100);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isModeModalOpen ? "bg-black/80 backdrop-blur-sm" : "bg-transparent pointer-events-none"}`}>
            <div
                className={`w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isModeModalOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white mb-1">Choose Practice Mode</h2>
                        <p className="text-sm text-zinc-400">Select what you'd like to practice today.</p>
                    </div>
                    <button
                        onClick={closeModeModal}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Coding Card */}
                        <button
                            onClick={handleSelectCoding}
                            className="group text-left flex flex-col p-6 rounded-xl border border-white/8 bg-white/5 hover:bg-white/10 hover:border-orange-500/50 transition-all"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 mb-4 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all">
                                <Code2 className="h-6 w-6 text-orange-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Coding Challenge</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Practice data structures and algorithms in Python, JavaScript, Java, C++, or TypeScript.
                            </p>
                        </button>

                        {/* SQL Card */}
                        <button
                            onClick={handleSelectSql}
                            className="group text-left flex flex-col p-6 rounded-xl border border-white/8 bg-white/5 hover:bg-white/10 hover:border-orange-500/50 transition-all"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 mb-4 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all">
                                <Database className="h-6 w-6 text-orange-400" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-white">SQL Practice</h3>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">NEW</span>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Master relational databases by writing queries in MySQL, PostgreSQL, Oracle SQL, or SQLite.
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
