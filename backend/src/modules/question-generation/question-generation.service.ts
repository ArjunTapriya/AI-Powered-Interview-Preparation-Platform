import { GeminiProvider } from "../ai/ai.providers/gemini.provider";
import { prisma } from "../../config/database";
import { logger } from "../../utils/logger";

export interface GeneratedQuestion {
  title: string;
  problemStatement: string;
  realWorldScenario: string | null;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  tags: string[];
  hints: string[];
  constraints: string[];
  examples?: { input: string; output: string; explanation?: string }[];
  editorial?: { content: string; timeComplexity: string; spaceComplexity: string };
  starterCode?: { language: string; code: string }[];
  testCases?: { input: string; expectedOutput: string; isHidden: boolean; testCaseType?: string }[];
  executionTemplate?: string;
  functionName?: string;
  returnType?: string;
}

function getProvider() {
  return new GeminiProvider();
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function ensureUniqueSlug(base: string): string {
  return `${base}-${Date.now()}`;
}

export class QuestionGenerationService {
  /**
   * Generate a single question with full metadata via AI.
   */
  async generateQuestion(
    topic: string,
    difficulty: "Easy" | "Medium" | "Hard",
    type: "DSA" | "System_Design" | "Behavioral" = "DSA"
  ): Promise<GeneratedQuestion> {
    const provider = getProvider();

    const systemPrompt = this.buildSystemPrompt(type, topic, difficulty);
    const userPrompt = "Generate the problem now. Return only valid JSON.";

    try {
      const response = await provider.evaluate(systemPrompt, userPrompt);
      const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      return parsed as GeneratedQuestion;
    } catch (error: any) {
      logger.error("Failed to generate question", { topic, difficulty, error: error.message });
      throw new Error(`Question generation failed: ${error.message}`);
    }
  }

  /**
   * Generate a question and immediately persist to DB atomically.
   */
  async generateAndPersist(
    topic: string,
    difficulty: "Easy" | "Medium" | "Hard",
    type: "DSA" | "System_Design" | "Behavioral",
    createdBy: string
  ): Promise<string> {
    const generated = await this.generateQuestion(topic, difficulty, type);

    const baseSlug = slugify(generated.title || `${topic}-${difficulty}`);
    const slug = ensureUniqueSlug(baseSlug);

    const question = await prisma.question.create({
      data: {
        title: generated.title,
        slug,
        problemStatement: generated.problemStatement,
        realWorldScenario: generated.realWorldScenario || null,
        difficulty,
        topic,
        executionTemplate: generated.executionTemplate || null,
        functionName: generated.functionName || null,
        returnType: generated.returnType || null,

        tags: {
          create: (generated.tags || []).map((name: string) => ({ name })),
        },
        hints: {
          create: (generated.hints || []).map((content: string, i: number) => ({
            hintOrder: i + 1,
            content,
          })),
        },
        constraints: {
          create: (generated.constraints || []).map((content: string) => ({ content })),
        },
        examples: {
          create: (generated.examples || []).map((ex: any, i: number) => ({
            exampleOrder: i + 1,
            input: ex.input || "",
            output: ex.output || "",
            explanation: ex.explanation || null,
          })),
        },
        ...(generated.editorial
          ? {
              editorials: {
                create: {
                  content: generated.editorial.content,
                  timeComplexity: generated.editorial.timeComplexity || "O(n)",
                  spaceComplexity: generated.editorial.spaceComplexity || "O(n)",
                  authorId: createdBy,
                },
              },
            }
          : {}),
        starterCodes: {
          create: (generated.starterCode || []).map((sc: any) => ({
            language: sc.language,
            code: sc.code,
          })),
        },
        testCases: {
          create: (generated.testCases || []).map((tc: any) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden ?? false,
            testCaseType: tc.testCaseType || null,
          })),
        },
      },
    });

    logger.info(`Generated and persisted question: ${question.id} (${question.title})`);
    return question.id;
  }

  /**
   * Bulk generate N questions of a given type/topic/difficulty in the background.
   * Creates a GenerationJob and processes asynchronously.
   */
  async bulkGenerate(
    type: "DSA" | "System_Design" | "Behavioral",
    topic: string,
    difficulty: "Easy" | "Medium" | "Hard",
    count: number,
    createdBy: string
  ): Promise<string> {
    // Create job record
    const job = await prisma.generationJob.create({
      data: { type, topic, difficulty, count, createdBy, status: "PENDING" },
    });

    // Run async (fire and forget with error capture)
    this.runBulkJob(job.id, type, topic, difficulty, count, createdBy).catch((err) => {
      logger.error(`Bulk generation job ${job.id} failed`, { error: err.message });
    });

    return job.id;
  }

  private async runBulkJob(
    jobId: string,
    type: "DSA" | "System_Design" | "Behavioral",
    topic: string,
    difficulty: "Easy" | "Medium" | "Hard",
    count: number,
    createdBy: string
  ): Promise<void> {
    await prisma.generationJob.update({ where: { id: jobId }, data: { status: "RUNNING" } });

    const resultIds: string[] = [];
    try {
      for (let i = 0; i < count; i++) {
        const qId = await this.generateAndPersist(topic, difficulty, type, createdBy);
        resultIds.push(qId);
        logger.info(`Bulk job ${jobId}: generated ${i + 1}/${count}`);
      }

      await prisma.generationJob.update({
        where: { id: jobId },
        data: { status: "DONE", resultIds },
      });
    } catch (err: any) {
      await prisma.generationJob.update({
        where: { id: jobId },
        data: { status: "FAILED", errorMsg: err.message, resultIds },
      });
      throw err;
    }
  }

  /**
   * Get job status.
   */
  async getJobStatus(jobId: string) {
    return prisma.generationJob.findUnique({ where: { id: jobId } });
  }

  private buildSystemPrompt(
    type: "DSA" | "System_Design" | "Behavioral",
    topic: string,
    difficulty: "Easy" | "Medium" | "Hard"
  ): string {
    if (type === "DSA") {
      return `You are an expert technical interviewer at a FAANG company. Generate a high-quality, completely original DSA coding problem.

REQUIREMENTS:
- Topic: ${topic}
- Difficulty: ${difficulty}
- The problem must be unique and practical.
- Include a real-world scenario.
- Provide 2-3 progressive hints.
- Provide standard constraints.
- Provide 2-3 examples (input/output/explanation).
- Provide an editorial with time and space complexity.
- Provide starter code for JavaScript and Python.
- Provide 3-5 test cases (some hidden).
- Suggest executionTemplate: ARRAY_INPUT | STRING_INPUT | LINKED_LIST | TREE | GRAPH | MATRIX | CUSTOM
- Suggest functionName: the main function to implement.
- Suggest returnType: the return type of the function.

Return STRICT VALID JSON with this structure:
{
  "title": "...",
  "problemStatement": "...",
  "realWorldScenario": "...",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "tags": ["array", "hash-table"],
  "hints": ["Hint 1", "Hint 2"],
  "constraints": ["1 <= n <= 10^5"],
  "examples": [{ "input": "...", "output": "...", "explanation": "..." }],
  "editorial": { "content": "...", "timeComplexity": "O(n)", "spaceComplexity": "O(n)" },
  "starterCode": [{ "language": "javascript", "code": "..." }, { "language": "python", "code": "..." }],
  "testCases": [{ "input": "...", "expectedOutput": "...", "isHidden": false, "testCaseType": "Basic" }],
  "executionTemplate": "ARRAY_INPUT",
  "functionName": "solve",
  "returnType": "number[]"
}`;
    }

    if (type === "System_Design") {
      return `You are a Principal Infrastructure Architect. Generate a high-quality System Design interview question.

REQUIREMENTS:
- Topic: ${topic}
- Difficulty: ${difficulty}

Return STRICT VALID JSON:
{
  "title": "...",
  "problemStatement": "...",
  "realWorldScenario": "...",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "tags": ["system-design", "scalability"],
  "hints": ["Think about scale first", "Consider CAP theorem"],
  "constraints": ["Handle 1M requests/sec", "99.99% uptime SLA"],
  "examples": [{ "input": "10M daily active users", "output": "Proposed architecture description", "explanation": "..." }],
  "editorial": { "content": "Full design walkthrough...", "timeComplexity": "O(log n) reads", "spaceComplexity": "O(n) storage" },
  "starterCode": [],
  "testCases": [],
  "executionTemplate": "CUSTOM"
}`;
    }

    // Behavioral
    return `You are a Senior Engineering Manager. Generate a high-quality Behavioral interview question using the STAR framework.

REQUIREMENTS:
- Topic: ${topic}
- Difficulty: ${difficulty}

Return STRICT VALID JSON:
{
  "title": "...",
  "problemStatement": "...",
  "realWorldScenario": "...",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "tags": ["behavioral", "leadership"],
  "hints": ["Use the STAR method", "Include metrics"],
  "constraints": ["Answer in 3-5 minutes", "Be specific with examples"],
  "examples": [{ "input": "Tell me about a time you led a difficult project", "output": "STAR-structured response example", "explanation": "Strong answer demonstrates ownership" }],
  "editorial": { "content": "Key evaluation criteria...", "timeComplexity": "N/A", "spaceComplexity": "N/A" },
  "starterCode": [],
  "testCases": [],
  "executionTemplate": "CUSTOM"
}`;
  }
}

export const questionGenerationService = new QuestionGenerationService();
