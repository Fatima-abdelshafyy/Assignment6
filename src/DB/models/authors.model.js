import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    birthYear: { type: Number }
  },
  {
    collection: "authors",
    timestamps: true
  }
);

export const Author = mongoose.model("Author", authorSchema);
