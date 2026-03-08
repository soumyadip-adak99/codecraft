import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Add a new review.
 */
export const addReview = mutation({
    args: {
        reviewText: v.string(),
        userName: v.string(),
        userEmail: v.string(),
        userImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("reviews", {
            ...args,
        });
    },
});

/**
 * Get all reviews.
 */
export const getReviews = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("reviews").order("desc").collect();
    },
});
