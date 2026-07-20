import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role?: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
      return;
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as { role?: string | null }).role ?? "user",
    };
    next();
  } catch (error) {
    console.error("Auth check failed:", error);
    res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
  }
}
