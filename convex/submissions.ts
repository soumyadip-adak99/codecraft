import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Record a successful submission.
 */
export const recordSubmission = mutation({
    args: {
        email: v.string(),
        userId: v.optional(v.string()),
        questionId: v.string(),
        title: v.string(),
        difficulty: v.string(),
        code: v.string(),
        language: v.string(),
        status: v.string(),
        executionTime: v.number(),
        userImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("submissions", {
            ...args,
        });
    },
});

/**
 * Get submissions for a specific user by email.
 */
export const getByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        return await ctx.db
            .query("submissions")
            .withIndex("by_email", (q) => q.eq("email", email))
            .order("desc")
            .collect();
    },
});
