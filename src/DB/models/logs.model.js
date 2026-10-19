import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    level: { type: String, default: "info" },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: "logs",
    versionKey: false
  }
);

export const Log = mongoose.model("Log", logSchema);
