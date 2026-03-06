"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import { Activity } from "lucide-react";

interface Props {
    email: string;
}

const WEEKS = 52;
const DAYS = 7;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Cell size in px — bigger than before for better visibility
const CELL = 14;
const GAP = 3;

type Cell = { date: string; count: number; isFuture: boolean };

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
}

const LEVEL_STYLES: Record<number, string> = {
    0: "bg-[#1a1a1a] border border-white/5",
    1: "bg-[#431407] border border-[#5c1a06]",
    2: "bg-[#9a3412] border border-[#c2410c]",
    3: "bg-[#ea580c] border border-[#f97316]",
    4: "bg-[#f97316] border border-[#fb923c] shadow-[0_0_10px_rgba(249,115,22,0.4)]",
};

const LEVEL_LABELS = ["No activity", "1 solve", "2 solves", "3 solves", "4+ solves"];

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function DailyActivity({ email }: Props) {
    const rawActivity = useQuery(api.userStatus.getDailyActivity, { email });
    const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

    const { grid, monthLabels, totalContributions, longestStreak, currentStreak } = useMemo(() => {
        const activityMap = new Map<string, number>();
        (rawActivity ?? []).forEach((row) => {
            activityMap.set(row.date, row.count);
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().slice(0, 10);

        // Start from the Sunday WEEKS ago
        const dayOfWeek = today.getDay();
        const gridStart = new Date(today);
        gridStart.setDate(gridStart.getDate() - dayOfWeek - (WEEKS - 1) * DAYS);

        const grid: Array<Array<Cell>> = [];
        const cursor = new Date(gridStart);

        for (let w = 0; w < WEEKS; w++) {
            const week: Array<Cell> = [];
            for (let d = 0; d < DAYS; d++) {
                const dateStr = cursor.toISOString().slice(0, 10);
                week.push({
                    date: dateStr,
                    count: activityMap.get(dateStr) ?? 0,
                    isFuture: dateStr > todayStr,
                });
                cursor.setDate(cursor.getDate() + 1);
            }
            grid.push(week);
        }

        // Month labels — track where each month starts
        const monthLabels: Array<{ label: string; col: number }> = [];
        let lastMonth = new Date(grid[0][0].date + "T00:00:00").getMonth();

        grid.forEach((week, col) => {
            if (col === 0) return;
            for (const cell of week) {
                const m = new Date(cell.date + "T00:00:00").getMonth();
                if (m !== lastMonth) {
                    monthLabels.push({ label: MONTH_NAMES[m], col });
                    lastMonth = m;
                    break;
                }
            }
        });

        const totalContributions = [...activityMap.values()].reduce((a, b) => a + b, 0);

        // Compute streaks over the flat sorted dates
        const sortedDates = [...activityMap.keys()].filter((d) => activityMap.get(d)! > 0).sort();
        let longestStreak = 0;
        let currentStreak = 0;
        let streak = 0;
        let prev: string | null = null;

        for (const date of sortedDates) {
            if (prev) {
                const diff = (new Date(date).getTime() - new Date(prev).getTime()) / 86400000;
                if (diff === 1) {
                    streak++;
                } else {
                    streak = 1;
                }
            } else {
                streak = 1;
            }
            longestStreak = Math.max(longestStreak, streak);
            prev = date;
        }

        // Current streak: count back from today
        const cur = new Date(today);
        let cs = 0;
        while (true) {
            const ds = cur.toISOString().slice(0, 10);
            if ((activityMap.get(ds) ?? 0) > 0) {
                cs++;
                cur.setDate(cur.getDate() - 1);
            } else break;
        }
        currentStreak = cs;

        return { grid, monthLabels, totalContributions, longestStreak, currentStreak };
    }, [rawActivity]);

    const isLoading = rawActivity === undefined;

    const handleMouseEnter = (cell: Cell, e: React.MouseEvent, col: number, row: number) => {
        if (cell.isFuture) return;
        const parent = (e.currentTarget as HTMLElement).closest(".heatmap-grid");
        const root = (e.currentTarget as HTMLElement).closest(".daily-activity-root");
        if (!parent || !root) return;

        const parentRect = parent.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();

        const cellX = col * (CELL + GAP);
        const cellY = row * (CELL + GAP);

        const text = cell.count === 0
            ? `No solves — ${formatDate(cell.date)}`
            : `${cell.count} solve${cell.count !== 1 ? "s" : ""} — ${formatDate(cell.date)}`;

        setTooltip({
            text,
            x: (parentRect.left - rootRect.left) + cellX + CELL / 2,
            y: (parentRect.top - rootRect.top) + cellY - 8,
        });
    };

    return (
        <div className="mt-10 rounded-2xl glass relative daily-activity-root">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/5 bg-white/[0.02] rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15">
                        <Activity className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white leading-tight">Daily Activity</h2>
                        <p className="text-[11px] text-zinc-500 leading-tight">Problems solved over the past year</p>
                    </div>
                </div>

                {/* Stat pills */}
                {!isLoading && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatPill label="Total" value={totalContributions} color="text-orange-500" />
                        <StatPill label="Current streak" value={`${currentStreak}d`} color="text-white" />
                        <StatPill label="Longest streak" value={`${longestStreak}d`} color="text-white" />
                    </div>
                )}
            </div>

            {/* Heatmap area */}
            <div className="px-6 py-5">
                <div
                    className="relative overflow-x-auto heatmap-scroll pb-2"
                    onScroll={() => setTooltip(null)}
                >
                    <div className="min-w-max">
                        {/* Month labels row */}
                        <div className="flex mb-2" style={{ paddingLeft: 40 }}>
                            <div className="relative h-4" style={{ width: WEEKS * (CELL + GAP) - GAP }}>
                                {monthLabels.map(({ label, col }) => (
                                    <span
                                        key={col}
                                        className="absolute text-xs text-zinc-500 select-none"
                                        style={{ left: col * (CELL + GAP) }}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Day labels + grid */}
                        <div className="flex items-start gap-2">
                            {/* Day-of-week labels */}
                            <div className="flex flex-col select-none" style={{ gap: GAP }}>
                                {DAY_LABELS.map((label, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-end"
                                        style={{ height: CELL, width: 32 }}
                                    >
                                        {/* Show only Mon, Wed, Fri */}
                                        {(i === 1 || i === 3 || i === 5) && (
                                            <span className="text-xs text-zinc-500 leading-none">{label}</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Grid cells */}
                            <div className="heatmap-grid relative flex" style={{ gap: GAP }}>
                                {isLoading
                                    ? Array.from({ length: WEEKS }).map((_, col) => (
                                        <div key={col} className="flex flex-col" style={{ gap: GAP }}>
                                            {Array.from({ length: DAYS }).map((_, row) => (
                                                <div
                                                    key={row}
                                                    style={{ width: CELL, height: CELL }}
                                                    className="rounded-[3px] bg-[#1a1a1a] border border-white/5 animate-pulse"
                                                />
                                            ))}
                                        </div>
                                    ))
                                    : grid.map((week, col) => (
                                        <div key={col} className="flex flex-col" style={{ gap: GAP }}>
                                            {week.map((cell, row) => (
                                                <div
                                                    key={row}
                                                    style={{ width: CELL, height: CELL }}
                                                    className={[
                                                        "rounded-[3px] transition-all duration-100 cursor-default",
                                                        cell.isFuture
                                                            ? "opacity-0 pointer-events-none"
                                                            : [
                                                                LEVEL_STYLES[getLevel(cell.count)],
                                                                cell.count > 0 ? "hover:scale-125 hover:z-10" : "hover:border-zinc-500",
                                                            ].join(" "),
                                                    ].join(" ")}
                                                    onMouseEnter={(e) => handleMouseEnter(cell, e, col, row)}
                                                    onMouseLeave={() => setTooltip(null)}
                                                />
                                            ))}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer legend */}
                <div className="flex items-center justify-end gap-1.5 mt-4">
                    <span className="text-xs text-zinc-500 mr-1 select-none">Less</span>
                    {([0, 1, 2, 3, 4] as const).map((level) => (
                        <div
                            key={level}
                            title={LEVEL_LABELS[level]}
                            style={{ width: CELL, height: CELL }}
                            className={`rounded-[3px] cursor-default ${LEVEL_STYLES[level]}`}
                        />
                    ))}
                    <span className="text-xs text-zinc-500 ml-1 select-none">More</span>
                </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="absolute z-50 pointer-events-none -translate-x-1/2 -translate-y-full"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <div className="bg-[#111111] border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-2xl">
                        {tooltip.text}
                    </div>
                    <div className="w-2 h-2 bg-[#111111] border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
                </div>
            )}
        </div>
    );
}

function StatPill({ label, value, color }: { label: string; value: number | string; color: string }) {
    return (
        <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 min-w-[70px]">
            <span className={`text-sm font-bold leading-tight ${color}`}>{value}</span>
            <span className="text-[10px] text-zinc-500 leading-tight mt-0.5">{label}</span>
        </div>
    );
}
