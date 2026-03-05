import { Schema, model, models } from "mongoose";

/**
 * Repository — stores one linked GitHub repository per user.
 * A user can have at most one "active" linked repo for CodeCraft solutions.
 */
const RepositorySchema = new Schema(
    {
        /** User's email — foreign-key reference to User.email */
        user_email:  { type: String, required: true },
        repo_name:   { type: String, required: true },
        repo_url:    { type: String, required: true },
        repo_owner:  { type: String, required: true },
        /** Full name e.g. "username/codecraft-solutions" */
        full_name:   { type: String, required: true },
        is_private:  { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "repo_created_at", updatedAt: "repo_updated_at" } }
);

RepositorySchema.index({ user_email: 1 }, { unique: true });

const Repository = models.Repository || model("Repository", RepositorySchema);
export default Repository;
