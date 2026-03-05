import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get a user's solve status by email.
 * Returns null if the user has no record yet.
 */
export const getByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        return await ctx.db
            .query("userStatus")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();
    },
});

/**
 * Ensure a userStatus row exists for the given email.
 * Called on sign-in — idempotent (no-op if row already exists).
 */
export const ensureUser = mutation({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const existing = await ctx.db
            .query("userStatus")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (!existing) {
            await ctx.db.insert("userStatus", {
                email,
                totalSolved: 0,
                easySolved: 0,
                mediumSolved: 0,
                hardSolved: 0,
                totalAttempts: 0,
            });
            return true;
        }
        return false;
    },
});

/**
 * Record an attempt for a user.
 * Always increments totalAttempts.
 * If accepted, also increments totalSolved + the relevant difficulty counter.
 * Scoped by email — no user can overwrite another user's data.
 */
export const recordAttempt = mutation({
    args: {
        email: v.string(),
        accepted: v.boolean(),
        difficulty: v.union(
            v.literal("Easy"),
            v.literal("Medium"),
            v.literal("Hard")
        ),
    },
    handler: async (ctx, { email, accepted, difficulty }) => {
        let row = await ctx.db
            .query("userStatus")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        // Auto-create if missing
        if (!row) {
            const id = await ctx.db.insert("userStatus", {
                email,
                totalSolved: 0,
                easySolved: 0,
                mediumSolved: 0,
                hardSolved: 0,
                totalAttempts: 0,
            });
            row = (await ctx.db.get(id))!;
        }

        const patch: Record<string, number> = {
            totalAttempts: row.totalAttempts + 1,
        };

        if (accepted) {
            patch.totalSolved = row.totalSolved + 1;
            if (difficulty === "Easy") {
                patch.easySolved = row.easySolved + 1;
            } else if (difficulty === "Medium") {
                patch.mediumSolved = row.mediumSolved + 1;
            } else {
                patch.hardSolved = row.hardSolved + 1;
            }
        }

        await ctx.db.patch(row._id, patch);
    },
});

/**
 * Delete a user's status row by email.
 * Called when the user permanently deletes their account.
 */
export const deleteByEmail = mutation({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const row = await ctx.db
            .query("userStatus")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();
        if (row) {
            await ctx.db.delete(row._id);
        }
    },
});
