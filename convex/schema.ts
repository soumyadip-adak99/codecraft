import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Singleton row — global platform counters
    platformStats: defineTable({
        totalDevelopers: v.number(),
        totalQuestionsGenerated: v.number(),
        totalProblemsSolved: v.number(),
    }),

    // Per-user solve status, keyed by email
    userStatus: defineTable({
        email: v.string(),
        totalSolved: v.number(),
        easySolved: v.number(),
        mediumSolved: v.number(),
        hardSolved: v.number(),
        totalAttempts: v.number(),
    }).index("by_email", ["email"]),

    // Submission history
    submissions: defineTable({
        email: v.string(),
        userId: v.optional(v.string()), // Optional, since we primarily use email
        questionId: v.string(),
        title: v.string(),
        difficulty: v.string(),
        code: v.string(),
        language: v.string(),
        status: v.string(),
        executionTime: v.number(),
        userImageUrl: v.optional(v.string()),
    }).index("by_email", ["email"]),

    // User reviews
    reviews: defineTable({
        reviewText: v.string(),
        userName: v.string(),
        userEmail: v.string(),
        userImageUrl: v.optional(v.string()),
    }).index("by_email", ["userEmail"]),
});
