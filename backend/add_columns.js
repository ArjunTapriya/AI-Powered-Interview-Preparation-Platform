const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding streakCount...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "streakCount" INTEGER NOT NULL DEFAULT 0;`);
    
    console.log("Adding lastActiveDate...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "lastActiveDate" TIMESTAMP(3);`);
    
    console.log("Adding manualCompletedQuestions...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "manualCompletedQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[];`);
    
    console.log("Successfully added all columns!");
  } catch (e) {
    console.error("Error adding columns:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
