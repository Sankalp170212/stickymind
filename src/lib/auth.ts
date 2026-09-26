import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "stickymind_fallback_jwt_secret_dev_key_2026";

export interface AuthPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

/**
 * Extracts and verifies the Bearer token from the incoming Request.
 * Throws an Error with status 401 if missing or invalid.
 */
export function verifyAuth(req: Request): AuthPayload {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Missing or invalid authorization token");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  const token = authHeader.substring(7).trim();
  try {
    const payload = verifyToken(token);
    return payload;
  } catch {
    const error = new Error("Invalid or expired session token");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }
}
