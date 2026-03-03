import { Schema, model, models } from "mongoose";

// Singleton document — one row, always upserted with _id: "global"
const GlobalStatsSchema = new Schema(
  {
    _id: { type: String, default: "global" },
    totalAIGenerated: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const GlobalStats = models.GlobalStats || model("GlobalStats", GlobalStatsSchema);
export default GlobalStats;

// Helper: get-or-create the singleton
export async function getGlobalStats() {
  return GlobalStats.findOneAndUpdate(
    { _id: "global" },
    { $setOnInsert: { totalAIGenerated: 0, totalSolved: 0 } },
    { upsert: true, new: true }
  );
}

// Helper: increment fields atomically
export async function incGlobalStats(fields: { totalAIGenerated?: number; totalSolved?: number }) {
  const inc: Record<string, number> = {};
  if (fields.totalAIGenerated) inc.totalAIGenerated = fields.totalAIGenerated;
  if (fields.totalSolved) inc.totalSolved = fields.totalSolved;
  return GlobalStats.findOneAndUpdate(
    { _id: "global" },
    { $inc: inc },
    { upsert: true, new: true }
  );
}
