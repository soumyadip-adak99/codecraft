import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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
 * If accepted, also increments totalSolved + the relevant difficulty counter
 * and upserts the dailyActivity row for today's date.
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
            await ctx.runMutation(internal.userStatus.recordDailyActivity, { email });
        }

        await ctx.db.patch(row._id, patch);
    },
});

/**
 * Internal: upsert (increment) today's daily activity count.
 */
export const recordDailyActivity = internalMutation({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const today = new Date().toISOString().slice(0, 10);
        const existing = await ctx.db
            .query("dailyActivity")
            .withIndex("by_email_date", (q) =>
                q.eq("email", email).eq("date", today)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { count: existing.count + 1 });
        } else {
            await ctx.db.insert("dailyActivity", { email, date: today, count: 1 });
        }
    },
});

/**
 * Get all daily activity rows for a user (for the heatmap).
 */
export const getDailyActivity = query({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        return await ctx.db
            .query("dailyActivity")
            .withIndex("by_email_date", (q) => q.eq("email", email))
            .collect();
    },
});

/**
 * Backfill dailyActivity from existing userStatus data.
 *
 * For every user who has totalSolved > 0 but no dailyActivity rows yet,
 * we distribute their solves across plausible days in the past 180 days
 * using a deterministic pseudo-random spread (based on email hash).
 * This gives existing users a realistic-looking heatmap history.
 *
 * Safe to run multiple times — skips users who already have activity rows.
 */
export const backfillDailyActivity = mutation({
    args: {},
    handler: async (ctx) => {
        const allUsers = await ctx.db.query("userStatus").collect();
        let backfilledCount = 0;

        for (const user of allUsers) {
            if (user.totalSolved === 0) continue;

            // Check if this user already has daily activity rows
            const existing = await ctx.db
                .query("dailyActivity")
                .withIndex("by_email_date", (q) => q.eq("email", user.email))
                .first();
            if (existing) continue; // already seeded — skip

            // Deterministic pseudo-random from email string
            const seed = user.email.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
            const rand = (n: number, offset: number) => ((seed * (n + 1) * 6364136223846793005 + offset) >>> 0) % 100;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const totalSolves = user.totalSolved;
            // Distribute solves: ~70% in last 60 days, ~30% in 61–180 days
            const recentSolves = Math.ceil(totalSolves * 0.7);
            const olderSolves = totalSolves - recentSolves;

            const insertions: Map<string, number> = new Map();

            // Helper: pick random days in range and add 1 solve per day slot
            const distributeSolves = (count: number, minDaysAgo: number, maxDaysAgo: number, seedOffset: number) => {
                for (let i = 0; i < count; i++) {
                    const daysAgo = minDaysAgo + (rand(i * 3, seedOffset + i) % (maxDaysAgo - minDaysAgo + 1));
                    const date = new Date(today);
                    date.setDate(date.getDate() - daysAgo);
                    const dateStr = date.toISOString().slice(0, 10);
                    // Sometimes cluster 2 solves on the same day
                    const bonus = rand(i * 7, seedOffset + i * 13) < 20 ? 1 : 0;
                    insertions.set(dateStr, (insertions.get(dateStr) ?? 0) + 1 + bonus);
                }
            };

            distributeSolves(recentSolves, 1, 60, seed % 1000);
            distributeSolves(olderSolves, 61, 180, (seed * 37) % 1000);

            for (const [date, count] of insertions.entries()) {
                await ctx.db.insert("dailyActivity", {
                    email: user.email,
                    date,
                    count,
                });
            }

            backfilledCount++;
        }

        return { backfilledCount };
    },
});

/**
 * Delete a user's status row by email (called on account deletion).
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

        const activityRows = await ctx.db
            .query("dailyActivity")
            .withIndex("by_email_date", (q) => q.eq("email", email))
            .collect();
        for (const r of activityRows) {
            await ctx.db.delete(r._id);
        }
    },
});
