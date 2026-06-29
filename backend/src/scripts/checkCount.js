const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function count() {
  const set1 = await prisma.questionTag.count({where: {name: 'Set 1'}});
  const set2 = await prisma.questionTag.count({where: {name: 'Set 2'}});
  const set3 = await prisma.questionTag.count({where: {name: 'Set 3'}});
  const total = set1 + set2 + set3;
  console.log(`\n--- PUSH ANALYSIS ---`);
  console.log(`Total Pushed: ${total} out of 303`);
  console.log(`Set 1: ${set1} / 101`);
  console.log(`Set 2: ${set2} / 101`);
  console.log(`Set 3: ${set3} / 101`);
  console.log(`Remaining to push: ${303 - total}`);
  console.log(`---------------------\n`);
}

count().finally(() => prisma.$disconnect());
