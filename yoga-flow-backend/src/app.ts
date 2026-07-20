import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import productsRouter from "./routes/products.js";

dotenv.config();

const app = express();

// Vercel/reverse proxies terminate TLS — required for secure cookies
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// better-auth must handle its routes before express.json()
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.use("/api/products", productsRouter);

app.get("/", (_req, res) => {
  res.json({ success: true, message: "YogaFlow Backend Server is Running!" });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

export default app;
