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

        // ── GitHub Integration ──────────────────────────────────────────────
        github_id:           { type: String },
        github_username:     { type: String },
        /** AES-256-GCM encrypted access token — never exposed to the client */
        github_access_token: { type: String },
        github_connected:    { type: Boolean, default: false },
        /** "google" | "github" — which provider the account was first created with */
        auth_provider:       { type: String, default: "google" },
    },
    { timestamps: true }
);

// Explicit index on createdAt — useful for admin queries on new registrations
UserSchema.index({ createdAt: 1 });
// Sparse index on github_id — fast lookup when exchanging OAuth codes
UserSchema.index({ github_id: 1 }, { sparse: true });

const User = models.User || model("User", UserSchema);
export default User;
