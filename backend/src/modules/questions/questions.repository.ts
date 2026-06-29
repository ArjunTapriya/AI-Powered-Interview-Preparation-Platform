import { Question } from "@prisma/client";
import { prisma } from "../../config/database";
import { GetQuestionsQuery, GetRandomQuestionQuery } from "./questions.validation";

export class QuestionsRepository {
  /**
   * Find a specific question by primary key.
   */
  async findById(id: string) {
    try {
      const question = await prisma.question.findUnique({
        where: { id },
        include: {
          testCases: true,
          tags: true,
        }
      });
      if (question) return question;
    } catch (e) {
      // Catch Prisma UUID validation errors
    }

    // Fallback for frontend hardcoded "dsa-fallback" -> 'two-sum'
    if (id === "dsa-fallback" || id === "two-sum") {
      return prisma.question.findUnique({
        where: { slug: "two-sum" },
        include: {
          testCases: true,
          tags: true,
        }
      });
    }

    return null;
  }

  /**
   * Fetch paginated list of questions with matching filters.
   */
  async findAndCount(
    filters: GetQuestionsQuery
  ): Promise<{ questions: Question[]; count: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [questions, count] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { title: "asc" },
      }),
      prisma.question.count({ where }),
    ]);

    return { questions, count };
  }

  /**
   * Find a random question matching the given category/difficulty filters.
   */
  async findRandom(filters: GetRandomQuestionQuery): Promise<Question | null> {
    const where = this.buildWhereClause(filters);
    const count = await prisma.question.count({ where });

    if (count === 0) {
      return null;
    }

    const skip = Math.floor(Math.random() * count);
    return prisma.question.findFirst({
      where,
      skip,
    });
  }

  /**
   * Helper to construct Prisma where clauses based on filters.
   */
  private buildWhereClause(filters: any): any {
    const where: any = {};

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.topic) {
      where.topic = { equals: filters.topic, mode: "insensitive" };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { problemStatement: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return where;
  }

  /**
   * Find questions that contain a specific tag.
   */
  async findManyByTag(tagName: string) {
    return prisma.question.findMany({
      where: {
        tags: {
          some: {
            name: tagName
          }
        }
      },
      include: {
        starterCodes: true,
        solutions: true
      }
    });
  }
}

export const questionsRepository = new QuestionsRepository();
