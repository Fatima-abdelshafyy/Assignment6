import { Router } from "express";
import mongoose from "mongoose";
import { Author } from "../DB/models/authors.model.js";
import { Book } from "../DB/models/books.model.js";
import { Log } from "../DB/models/logs.model.js";

const router = Router();

// POST /collection/books — explicitly create books with title validation.
router.post("/books", async (req, res, next) => {
  try {
    const db = mongoose.connection.db;
    const existing = await db.listCollections({ name: "books" }).hasNext();

    if (existing) {
      return res.status(200).json({ message: "The books collection already exists." });
    }

    await db.createCollection("books", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["title"],
          properties: {
            title: {
              bsonType: "string",
              minLength: 1,
              description: "title must be a non-empty string"
            }
          }
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    return res.status(201).json({ message: "Books collection created with title validation." });
  } catch (error) {
    next(error);
  }
});

// POST /collection/authors — inserting data creates this collection implicitly.
router.post("/authors", async (req, res, next) => {
  try {
    const authors = Array.isArray(req.body) ? req.body : [req.body];
    if (!authors.length || authors.some((author) => !author?.name?.trim())) {
      return res.status(400).json({ message: "Provide at least one author with a non-empty name." });
    }

    const inserted = await Author.insertMany(authors);
    return res.status(201).json({ message: "Authors inserted; the collection is created implicitly.", data: inserted });
  } catch (error) {
    next(error);
  }
});

// POST /collection/logs/capped — create a capped collection with a 1 MB size limit.
router.post("/logs/capped", async (req, res, next) => {
  try {
    const db = mongoose.connection.db;
    const exists = await db.listCollections({ name: "logs" }).hasNext();

    if (exists) {
      const info = await db.listCollections({ name: "logs" }).next();
      if (info?.options?.capped) {
        return res.status(200).json({ message: "The logs collection is already capped.", options: info.options });
      }
      return res.status(409).json({
        message: "A non-capped logs collection already exists. Remove it before creating a capped collection."
      });
    }

    await db.createCollection("logs", { capped: true, size: 1048576 });
    return res.status(201).json({ message: "Capped logs collection created.", sizeBytes: 1048576 });
  } catch (error) {
    next(error);
  }
});

// POST /collection/books/index — create an ascending index on title.
router.post("/books/index", async (req, res, next) => {
  try {
    const indexName = await mongoose.connection.db.collection("books").createIndex({ title: 1 });
    return res.status(201).json({ message: "Index created on books.title.", indexName });
  } catch (error) {
    next(error);
  }
});

export default router;
