import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Singleton row — global platform counters
    platformStats: defineTable({
        totalDevelopers: v.number(),
        totalQuestionsGenerated: v.number(),
        totalProblemsSolved: v.number(),
    }),

    // Per-user solve status, keyed by email.
    // Source code is NEVER stored here — only aggregate solve counts.
    userStatus: defineTable({
        email: v.string(),
        totalSolved: v.number(),
        easySolved: v.number(),
        mediumSolved: v.number(),
        hardSolved: v.number(),
        totalAttempts: v.number(),
    }).index("by_email", ["email"]),

    // User reviews
    reviews: defineTable({
        reviewText: v.string(),
        userName: v.string(),
        userEmail: v.string(),
        userImageUrl: v.optional(v.string()),
    }).index("by_email", ["userEmail"]),
});
