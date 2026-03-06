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

    // Per-user daily activity — one row per (email, date) pair.
    // Powers the GitHub-style contribution heatmap on the dashboard.
    dailyActivity: defineTable({
        email: v.string(),
        date: v.string(),   // "YYYY-MM-DD" in UTC
        count: v.number(),  // number of accepted solves that day
    }).index("by_email_date", ["email", "date"]),

    // User reviews
    reviews: defineTable({
        reviewText: v.string(),
        userName: v.string(),
        userEmail: v.string(),
        userImageUrl: v.optional(v.string()),
    }).index("by_email", ["userEmail"]),
});
