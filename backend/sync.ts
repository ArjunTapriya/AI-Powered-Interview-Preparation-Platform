import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  console.log("Creating tables...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "refresh_tokens" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "tokenHash" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "revokedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
    );
  `);
  
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");
  `);

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
  } catch (e) {
    // Constraint might already exist
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "WorkspaceState" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "questionId" TEXT,
      "draftCode" TEXT,
      "language" TEXT NOT NULL DEFAULT 'javascript',
      "editorSettings" JSONB,
      "lastSavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "WorkspaceState_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceState_userId_key" ON "WorkspaceState"("userId");
  `);

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WorkspaceState" ADD CONSTRAINT "WorkspaceState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
  } catch (e) {
    // Constraint might already exist
  }

  console.log("Tables created successfully");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
