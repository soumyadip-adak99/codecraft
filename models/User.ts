import { Schema, model, models } from "mongoose";

/**
 * MongoDB User model — stores ONLY identity + credentials.
 * All counters / stats / status live in Convex.
 *
 * Indexes:
 *   - email: unique index (auto-created by `unique: true`) — used for O(1) upsert lookups
 *   - createdAt: index — supports sorting / querying new registrations
 */
const UserSchema = new Schema(
    {
        email:          { type: String, required: true, unique: true },
        image:          { type: String },
        llmApiKey:      { type: String },
        preferredModel: { type: String, default: "groq" },
    },
    { timestamps: true }
);

// Explicit index on createdAt — useful for admin queries on new registrations
UserSchema.index({ createdAt: 1 });

const User = models.User || model("User", UserSchema);
export default User;
