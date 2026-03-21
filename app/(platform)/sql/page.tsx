"use client";

import { useSqlStore } from "@/store/sqlStore";
import { useUIStore } from "@/store";
import { SqlWorkspaceLayout } from "@/components/sql/SqlWorkspaceLayout";
import { Button } from "@/components/ui/button";
import { Database, Zap } from "lucide-react";

export default function SqlPracticePage() {
    const { currentSqlQuestion } = useSqlStore();
    const { openSqlModal } = useUIStore();

    if (currentSqlQuestion) {
        return <SqlWorkspaceLayout question={currentSqlQuestion} />;
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-lg">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/20 mx-auto mb-6">
                    <Database className="h-8 w-8 text-orange-400" />
                </div>
                <h1 className="text-3xl font-black text-white mb-3">SQL Practice</h1>
                <p className="text-zinc-400 mb-2">
                    Practice SQL across multiple dialects with AI-generated challenges. Write real queries, see results as tables, and get instant AI feedback.
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
                    {["MySQL", "PostgreSQL", "Oracle SQL", "SQLite"].map((d) => (
                        <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                            {d}
                        </span>
                    ))}
                </div>
                <Button
                    onClick={openSqlModal}
                    className="bg-orange-600 hover:bg-orange-500 text-white gap-2 shadow-lg shadow-orange-500/20 px-8 py-6 text-base font-semibold"
                >
                    <Zap className="h-5 w-5" />
                    Start SQL Session
                </Button>
            </div>
        </div>
    );
}
