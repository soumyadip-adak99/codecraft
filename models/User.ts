import { Schema, model, models } from "mongoose";

const UserStatsSchema = new Schema(
  {
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String },
    googleId: { type: String },
    llmApiKey: { type: String },
    preferredModel: { type: String, default: "groq" },
    stats: { type: UserStatsSchema, default: () => ({}) },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
