import "dotenv/config";
import app from "./app.bootstrap.js";
import { connectDB } from "./DB/connectionDB.js";

const PORT = 3000;

try {
  await connectDB();
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
} catch (error) {
  console.error("Failed to start the server:", error.message);
  process.exit(1);
}
