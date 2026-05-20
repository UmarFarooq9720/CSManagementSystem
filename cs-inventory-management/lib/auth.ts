import { createHash, randomBytes } from "crypto";
import { sign, verify, type JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "cs-inventory-secret";
const COOKIE_NAME = "inventory_token";

export function hashPassword(password: string) {
  const salt = SECRET.slice(0, 16);
  return createHash("sha256").update(password + salt).digest("hex");
}

export function verifyPassword(password: string, hashed: string) {
  return hashPassword(password) === hashed;
}

export function createToken(payload: { email: string; name: string; id: string }) {
  return sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return verify(token, SECRET) as JwtPayload & { email: string; name: string; id: string };
}

export function serializeCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 7) {
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${value}; Path=/; Expires=${expires}; HttpOnly; SameSite=Lax${secureFlag}`;
}

export function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const cookie of cookieHeader.split(";")) {
    const [name, ...rest] = cookie.trim().split("=");
    cookies[name] = rest.join("=");
  }
  return cookies;
}

export function createExpiredCookie(name: string) {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secureFlag}`;
}
