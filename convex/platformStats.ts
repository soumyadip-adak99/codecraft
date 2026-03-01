import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the singleton platform stats row.
 * Returns zeros if no row exists yet.
 */
export const get = query({
    args: {},
    handler: async (ctx) => {
        const row = await ctx.db.query("platformStats").first();
        return (
            row ?? {
                totalDevelopers: 0,
                totalQuestionsGenerated: 0,
                totalProblemsSolved: 0,
            }
        );
    },
});

/**
 * Atomically increment platform-level counters.
 * Creates the singleton row on first call.
 */
export const increment = mutation({
    args: {
        totalDevelopers: v.optional(v.number()),
        totalQuestionsGenerated: v.optional(v.number()),
        totalProblemsSolved: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const row = await ctx.db.query("platformStats").first();

        if (row) {
            await ctx.db.patch(row._id, {
                totalDevelopers:
                    row.totalDevelopers + (args.totalDevelopers ?? 0),
                totalQuestionsGenerated:
                    row.totalQuestionsGenerated +
                    (args.totalQuestionsGenerated ?? 0),
                totalProblemsSolved:
                    row.totalProblemsSolved + (args.totalProblemsSolved ?? 0),
            });
        } else {
            await ctx.db.insert("platformStats", {
                totalDevelopers: args.totalDevelopers ?? 0,
                totalQuestionsGenerated: args.totalQuestionsGenerated ?? 0,
                totalProblemsSolved: args.totalProblemsSolved ?? 0,
            });
        }
    },
});
