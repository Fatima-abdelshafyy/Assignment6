import { Router } from "express";
import mongoose from "mongoose";
import { Book } from "../DB/models/books.model.js";
import { Log } from "../DB/models/logs.model.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { title, author, year, genres = [] } = req.body;
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "title must be a non-empty string." });
    }
    if (!author || year === undefined) {
      return res.status(400).json({ message: "author and year are required." });
    }

    const book = await Book.create({ title, author, year, genres });
    return res.status(201).json({ message: "Book inserted successfully.", data: book });
  } catch (error) {
    next(error);
  }
});

router.post("/batch", async (req, res, next) => {
  try {
    const books = req.body.books ?? req.body;
    if (!Array.isArray(books) || books.length < 3) {
      return res.status(400).json({ message: "Send at least three book objects in an array (or { books: [...] })." });
    }

    const inserted = await Book.insertMany(books);
    return res.status(201).json({ message: "Books inserted successfully.", count: inserted.length, data: inserted });
  } catch (error) {
    next(error);
  }
});

router.patch("/:title", async (req, res, next) => {
  try {
    const book = await Book.findOneAndUpdate(
      { title: req.params.title },
      { $set: { year: 2022 } },
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ message: "Book not found." });
    return res.json({ message: "Book year updated.", data: book });
  } catch (error) {
    next(error);
  }
});

router.get("/title", async (req, res, next) => {
  try {
    if (!req.query.title) return res.status(400).json({ message: "Provide the title query parameter." });
    const books = await Book.find({ title: req.query.title });
    return res.json({ count: books.length, data: books });
  } catch (error) {
    next(error);
  }
});

router.get("/year", async (req, res, next) => {
  try {
    const from = Number(req.query.from);
    const to = Number(req.query.to);
    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      return res.status(400).json({ message: "Provide numeric from and to query parameters." });
    }
    const books = await Book.find({ year: { $gte: from, $lte: to } });
    return res.json({ count: books.length, data: books });
  } catch (error) {
    next(error);
  }
});

router.get("/genre", async (req, res, next) => {
  try {
    if (!req.query.genre) return res.status(400).json({ message: "Provide the genre query parameter." });
    const books = await Book.find({ genres: req.query.genre });
    return res.json({ count: books.length, data: books });
  } catch (error) {
    next(error);
  }
});

router.get("/skip-limit", async (req, res, next) => {
  try {
    const books = await Book.find().sort({ year: -1 }).skip(2).limit(3);
    return res.json({ count: books.length, data: books });
  } catch (error) {
    next(error);
  }
});

router.get("/year-integer", async (req, res, next) => {
  try {
    const books = await mongoose.connection.db.collection("books")
      .find({ year: { $type: "int" } }).toArray();
    return res.json({ count: books.length, data: books });
  } catch (error) {
    next(error);
  }
});

router.get("/exclude-genres", async (req, res, next) => {
  try {
    const books = await Book.find({ genres: { $nin: ["Horror", "Science Fiction"] } });
    return res.json({ count: books.length, data: books });
  } catch (error) {
    next(error);
  }
});

router.delete("/before-year", async (req, res, next) => {
  try {
    const year = Number(req.query.year ?? 2000);
    if (!Number.isFinite(year)) return res.status(400).json({ message: "year must be numeric." });
    const result = await Book.deleteMany({ year: { $lt: year } });
    return res.json({ message: "Books deleted.", deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
});

// GET /books/aggregate1 — filter after 2000, sort descending.
router.get("/aggregate1", async (req, res, next) => {
  try {
    const data = await Book.aggregate([
      { $match: { year: { $gt: 2000 } } },
      { $sort: { year: -1 } }
    ]);
    return res.json({ count: data.length, data });
  } catch (error) {
    next(error);
  }
});

// GET /books/aggregate2 — after 2000, project title, author, year only.
router.get("/aggregate2", async (req, res, next) => {
  try {
    const data = await Book.aggregate([
      { $match: { year: { $gt: 2000 } } },
      { $project: { _id: 0, title: 1, author: 1, year: 1 } }
    ]);
    return res.json({ count: data.length, data });
  } catch (error) {
    next(error);
  }
});

// GET /books/aggregate3 — unwind genres into separate documents.
router.get("/aggregate3", async (req, res, next) => {
  try {
    const data = await Book.aggregate([
      { $unwind: "$genres" },
      { $project: { _id: 0, title: 1, author: 1, year: 1, genre: "$genres" } }
    ]);
    return res.json({ count: data.length, data });
  } catch (error) {
    next(error);
  }
});

// GET /books/aggregate4 — join books with logs by shared _id (usually no matches unless IDs align).
router.get("/aggregate4", async (req, res, next) => {
  try {
    const data = await Book.aggregate([
      {
        $lookup: {
          from: "logs",
          localField: "_id",
          foreignField: "_id",
          as: "logs"
        }
      }
    ]);
    return res.json({ count: data.length, data });
  } catch (error) {
    next(error);
  }
});

export default router;
