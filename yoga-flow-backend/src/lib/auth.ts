import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import dotenv from "dotenv";
import { db } from "./db.js";

dotenv.config();

const trustedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// In production the frontend (Vercel) and backend live on different domains,
// so session cookies must be cross-site: SameSite=None + Secure.
const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },
  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: isProduction
      ? { sameSite: "none", secure: true }
      : undefined,
  },
});
