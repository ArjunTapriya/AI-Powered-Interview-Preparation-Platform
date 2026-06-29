const { Client } = require('pg');

const connectionString = "postgresql://postgres.fycbavumuhfzunnznwbl:Arjun%402006Arjun%4020061A1@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function run() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("Connected to DB");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "PrepGuide" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "steps" JSONB NOT NULL,
          "completedIndices" JSONB NOT NULL,
          "historyCount" INTEGER NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "PrepGuide_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("Created table");

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "PrepGuide_userId_category_key" ON "PrepGuide"("userId", "category");
    `);
    console.log("Created index");

    try {
        await client.query(`
          ALTER TABLE "PrepGuide" ADD CONSTRAINT "PrepGuide_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        console.log("Created FK constraint");
    } catch (e) {
        if (!e.message.includes("already exists")) {
            console.warn("FK constraint might already exist or failed:", e.message);
        } else {
            console.log("FK constraint already exists.");
        }
    }

    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
