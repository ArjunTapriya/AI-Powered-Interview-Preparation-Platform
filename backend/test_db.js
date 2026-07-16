const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$connect()
  .then(() => console.log('Successfully connected to Prisma'))
  .catch(e => console.error('Prisma connection error:', e))
  .finally(() => process.exit(0));
