import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Question" ADD COLUMN "functionName" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Question" ADD COLUMN "returnType" TEXT;`);
    console.log("Added functionName and returnType to Question table successfully.");
  } catch(e: any) {
    console.log("Might already exist or failed:", e.message);
  }
}

main().finally(() => prisma.$disconnect());
