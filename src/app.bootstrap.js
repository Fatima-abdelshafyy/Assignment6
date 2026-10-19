import express from "express";
import collectionRoutes from "./modules/collection.routes.js";
import booksRoutes from "./modules/books.routes.js";
import { Log } from "./DB/models/logs.model.js";

const app = express();

app.use(express.json());
app.use("/collection", collectionRoutes);
app.use("/books", booksRoutes);

app.post("/logs", async (req, res, next) => {
  try {
    const { message, level = "info" } = req.body;
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "message must be a non-empty string." });
    }
    const log = await Log.create({ message, level });
    return res.status(201).json({ message: "Log inserted successfully.", data: log });
  } catch (error) {
    next(error);
  }
});

app.get("/", (_req, res) => {
  res.json({ message: "Assignment 6 API is running." });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error.", error: error.message });
});

export default app;
