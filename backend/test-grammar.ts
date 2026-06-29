import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const reports = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'EvaluationReport';`;
    console.log("Columns in EvaluationReport:", reports);
    const count = await prisma.evaluationReport.count();
    console.log("Count:", count);
  } catch (e) {
    console.error("Failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
