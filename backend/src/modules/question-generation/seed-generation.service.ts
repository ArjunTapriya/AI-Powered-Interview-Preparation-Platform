
import { questionGenerationService } from "./question-generation.service";
import { editorialGenerationService } from "./editorial-generation.service";
import { testCaseGenerationService } from "./testcase-generation.service";
import { solutionGenerationService } from "./solution-generation.service";
import { logger } from "../../utils/logger";
import { prisma } from "../../config/database";

export class SeedGenerationService {
  /**
   * Orchestrates the creation of a full question object with all relations
   * and saves it to the database.
   */
  async generateAndSaveFullQuestion(topic: string, difficulty: "Easy" | "Medium" | "Hard") {
    logger.info(`Starting generation for topic: ${topic}, difficulty: ${difficulty}`);
    
    // 1. Generate base question
    const question = await questionGenerationService.generateQuestion(topic, difficulty);
    logger.info(`Generated Base Question: ${question.title}`);

    // 2. Generate Editorial
    const editorial = await editorialGenerationService.generateEditorial(question);
    
    // 3. Generate Test Cases
    const testCases = await testCaseGenerationService.generateTestCases(question);

    // 4. Generate Solutions & Starter Code
    const codeGen = await solutionGenerationService.generateSolutionsAndStarterCode(question);

    // 5. Generate Slug
    const slug = question.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    // 6. Save to Database
    logger.info(`Saving Question ${question.title} to database...`);
    const savedQuestion = await prisma.question.create({
      data: {
        title: question.title,
        slug: slug,
        problemStatement: question.problemStatement,
        realWorldScenario: question.realWorldScenario,
        difficulty: question.difficulty,
        topic: question.topic,
        tags: {
          create: question.tags.map((tag) => ({ name: tag })),
        },
        hints: {
          create: question.hints.map((hint, index) => ({ hintOrder: index + 1, content: hint })),
        },
        constraints: {
          create: question.constraints.map((c) => ({ content: c })),
        },
        testCases: {
          create: testCases.map((tc) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            testCaseType: tc.testCaseType,
          })),
        },
        editorials: {
          create: {
            content: editorial.content,
            timeComplexity: editorial.timeComplexity,
            spaceComplexity: editorial.spaceComplexity,
          },
        },
        starterCodes: {
          create: codeGen.starterCodes.map((sc) => ({
            language: sc.language,
            code: sc.code,
          })),
        },
        solutions: {
          create: codeGen.solutions.map((sol) => ({
            language: sol.language,
            code: sol.code,
            approachName: sol.approachName,
          })),
        },
      },
    });

    logger.info(`Successfully saved question: ${savedQuestion.id}`);
    return savedQuestion;
  }
}

export const seedGenerationService = new SeedGenerationService();
