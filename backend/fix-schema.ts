import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Adding columns manually...");
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "EvaluationReport" ADD COLUMN IF NOT EXISTS "grammar" INTEGER;`);
    console.log("Added grammar column.");
  } catch (e) {
    console.error("Failed to add grammar:", e);
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "EvaluationReport" ADD COLUMN IF NOT EXISTS "relevance" INTEGER;`);
    console.log("Added relevance column.");
  } catch (e) {
    console.error("Failed to add relevance:", e);
  }

  try {
    const reports = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'EvaluationReport';`;
    console.log("Columns now:", reports);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
