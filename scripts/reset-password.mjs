import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.settings.updateMany({
      data: { adminPassword: null }
    });
    console.log("✅ Contraseña reseteada. Usa: admin123 para ingresar.");
  } catch (e) {
    console.log("⚠️ No se pudo resetear (puede que la DB esté vacía, es normal).");
  } finally {
    await prisma.$disconnect();
  }
}

main();
