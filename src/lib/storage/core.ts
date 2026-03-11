import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LEN = 64;
const SALT_LEN = 16;

export function hashPasswordSecure(password: string): string {
  const salt = crypto.randomBytes(SALT_LEN).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LEN, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPasswordSecure(password: string, stored: string): boolean {
  try { // ✅ Bug #3 corregido: capturar excepciones de timingSafeEqual
    if (stored.includes(":")) {
      const [salt, hash] = stored.split(":");
      if (!salt || !hash) return false; // ✅ guard contra hash corrupto
      const attempt = crypto
        .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LEN, "sha512")
        .toString("hex");
      // ✅ Verificar longitudes antes de comparar
      if (attempt.length !== hash.length) return false;
      return crypto.timingSafeEqual(
        Buffer.from(attempt, "hex"),
        Buffer.from(hash, "hex")
      );
    }
    // Legacy SHA-256
    const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
    return legacyHash === stored;
  } catch {
    return false; // ✅ nunca lanzar excepción hacia arriba
  }
}
