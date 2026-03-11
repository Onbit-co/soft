import { cookies } from "next/headers";
import { verifyStoredPassword } from "./storage";

const AUTH_COOKIE = "str_admin_session";
const SECRET = process.env.AUTH_SECRET || "str-default-secret";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// ✅ Mismo algoritmo que middleware.ts
async function hashToken(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(password: string): Promise<boolean> {
  return await verifyStoredPassword(password);
}

// ✅ Ahora async
export async function createSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const random = crypto.getRandomValues(new Uint8Array(16));
  const randomHex = Array.from(random).map(b => b.toString(16).padStart(2, "0")).join("");
  const raw = `${timestamp}-${randomHex}`;
  const hash = await hashToken(raw);
  return `${raw}.${hash}`;
}

export async function validateSessionToken(token: string): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [raw, hash] = token.split(".");
  if (!raw || !hash || raw.length < 10 || hash.length !== 64) return false;

  try {
    const timestamp = parseInt(raw.split("-")[0], 10);
    if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE_MS) return false;
  } catch {
    return false;
  }

  const expected = await hashToken(raw);
  return expected === hash;
}

export async function getSessionFromCookies(): Promise<boolean> {
  try {
    const cookieStore = await cookies(); // ✅ await requerido en Next.js 14
    const session = cookieStore.get(AUTH_COOKIE);
    if (!session?.value) return false;
    return validateSessionToken(session.value);
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return await getSessionFromCookies();
}

export { AUTH_COOKIE };
