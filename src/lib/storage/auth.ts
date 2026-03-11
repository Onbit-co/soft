import { prisma, hashPasswordSecure, verifyPasswordSecure } from "./core";

export async function getStoredPasswordHash(): Promise<string | null> {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    return settings?.adminPassword || null;
  } catch {
    return null;
  }
}

export async function savePassword(newPassword: string): Promise<void> {
  const hash = hashPasswordSecure(newPassword);
  const now = new Date();
  await prisma.settings.upsert({
    where: { id: 1 },
    update: { adminPassword: hash, passwordUpdatedAt: now },
    create: { id: 1, adminPassword: hash, passwordUpdatedAt: now },
  });
}

export async function verifyStoredPassword(password: string): Promise<boolean> {
  try { // ✅ Bug #3: wrap completo en try/catch
    const storedHash = await getStoredPasswordHash();
    if (!storedHash) {
      const envPassword = (process.env.ADMIN_PASSWORD || "admin123").trim();
      if (password.trim() === envPassword) {
        await savePassword(password.trim());
        return true;
      }
      return false;
    }
    const isValid = verifyPasswordSecure(password, storedHash);
    if (isValid && !storedHash.includes(":")) {
      await savePassword(password);
    }
    return isValid;
  } catch {
    return false;
  }
}
