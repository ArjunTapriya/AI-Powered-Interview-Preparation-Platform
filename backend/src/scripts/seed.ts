import { PrismaClient, Difficulty } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Starting database seeding for 303 Question Sets...");

  const dataPath = path.join(__dirname, "..", "data", "question_sets.json");
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found at ${dataPath}`);
  }

  const rawData = fs.readFileSync(dataPath, "utf-8");
  const parsedData = JSON.parse(rawData);

  const processSet = async (setName: string, items: any[]) => {
    console.log(`Processing ${setName} with ${items.length} questions...`);
    for (let i = 0; i < items.length; i++) {
      const q = items[i];
      const slug = slugify(q.title) + "-" + q.id.split("-").pop(); // Ensure uniqueness
      
      let diffEnum: Difficulty = Difficulty.Medium;
      if (q.difficulty === "Easy") diffEnum = Difficulty.Easy;
      if (q.difficulty === "Hard") diffEnum = Difficulty.Hard;

      // Ensure we don't have duplicate tags if re-running
      try {
        const existing = await prisma.question.findUnique({ where: { slug } });
        
        if (!existing) {
          await prisma.question.create({
            data: {
              title: q.title,
              slug: slug,
              problemStatement: q.description || "No description provided.",
              difficulty: diffEnum,
              topic: q.category || "DSA",
              
              // Add Tag to signify the roadmap set
              tags: {
                create: [{ name: setName }]
              },
              
              // Add Starter Code
              starterCodes: {
                create: [
                  {
                    language: "typescript",
                    code: q.codeTemplate || "function solveQuestion() {\n  \n}"
                  }
                ]
              },

              // Add Optimal Code as Solution
              solutions: {
                create: [
                  {
                    language: "typescript",
                    code: q.optimalCode || "// Optimal solution",
                    approachName: "Optimal"
                  }
                ]
              }
            }
          });
          process.stdout.write("."); // Progress dot
        }
      } catch (err) {
        console.error(`Failed to process ${q.title}:`, err);
      }
    }
    console.log(`\nCompleted ${setName}!\n`);
  };

  if (parsedData.set1) await processSet("Set 1", parsedData.set1);
  if (parsedData.set2) await processSet("Set 2", parsedData.set2);
  if (parsedData.set3) await processSet("Set 3", parsedData.set3);

  console.log("Database seeding fully completed!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
