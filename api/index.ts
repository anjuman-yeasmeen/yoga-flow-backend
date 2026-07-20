import app from "../src/app";
import { client } from "../src/lib/db";

// Warm the MongoDB connection once per serverless instance.
// The driver dedupes concurrent connect() calls and operations
// auto-connect, so this is a best-effort optimization.
client.connect().catch((error) => {
  console.error("MongoDB warm-up connect failed:", error);
});

export default app;
