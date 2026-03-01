import { Schema, model, models } from "mongoose";

/**
 * MongoDB User model — stores ONLY identity + credentials.
 * All counters / stats / status live in Convex.
 */
const UserSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        image: { type: String },
        llmApiKey: { type: String },
        preferredModel: { type: String, default: "groq" },
    },
    { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
