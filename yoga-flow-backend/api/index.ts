import type { IncomingMessage, ServerResponse } from "http";

const REQUIRED_ENV = ["MONGO_URI", "MONGO_DB", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "CLIENT_ORIGIN"];

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

// The app is imported lazily so a failure during module init (bad MONGO_URI,
// missing secret, …) produces a readable JSON error instead of an opaque
// FUNCTION_INVOCATION_FAILED crash.
let appPromise: Promise<Handler> | null = null;

function sendJson(res: ServerResponse, status: number, body: object): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    sendJson(res, 500, {
      success: false,
      error: "MISSING_ENV_VARS",
      message:
        `The server is missing environment variables: ${missing.join(", ")}. ` +
        "Add them in Vercel → Project → Settings → Environment Variables (Production), then redeploy.",
    });
    return;
  }

  try {
    if (!appPromise) {
      // Depending on how the bundler compiles this dynamic import, the Express
      // app can land on mod.default (CJS interop) or mod.default.default
      // (real import() of a CJS module). Pick whichever is the function.
      appPromise = import("../src/app.js").then((mod) => {
        const m = mod as Record<string, unknown>;
        const inner = m.default as Record<string, unknown> | Handler | undefined;
        const candidates = [
          typeof inner === "object" && inner !== null ? inner.default : undefined,
          inner,
          mod,
        ];
        const app = candidates.find((c) => typeof c === "function");
        if (!app) throw new Error("Could not resolve the Express app export.");
        return app as Handler;
      });
    }
    const app = await appPromise;
    app(req, res);
  } catch (error) {
    appPromise = null;
    console.error("Failed to initialize app:", error);
    sendJson(res, 500, {
      success: false,
      error: "APP_INIT_FAILED",
      message: error instanceof Error ? error.message : "Unknown initialization error.",
    });
  }
}
