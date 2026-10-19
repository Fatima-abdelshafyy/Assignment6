import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    genres: {
      type: [String],
      default: []
    }
  },
  {
    collection: "books",
    timestamps: true
  }
);

export const Book = mongoose.model("Book", bookSchema);
