import { prisma } from "../../config/database";
import { CodeSubmission, ExecutionResult } from "@prisma/client";

export interface CreateSubmissionData {
  userId: string;
  questionId: string;
  language: string;
  sourceCode: string;
  status: string;
  passedTests: number;
  totalTests: number;
  runtime?: number | null;
  memory?: number | null;
  stdout?: string | null;
  stderr?: string | null;
  executionResults?: {
    testCaseNumber: number;
    passed: boolean;
    expectedOutput?: string | null;
    actualOutput?: string | null;
    executionTime?: number | null;
  }[];
}

export class ExecutionRepository {
  /**
   * Create a new CodeSubmission and nested ExecutionResult records.
   */
  async createSubmission(data: CreateSubmissionData): Promise<CodeSubmission & { executionResults: ExecutionResult[] }> {
    const { executionResults, ...submissionFields } = data;

    return prisma.codeSubmission.create({
      data: {
        ...submissionFields,
        executionResults: executionResults
          ? {
              createMany: {
                data: executionResults.map(r => ({
                  ...r,
                  output: r.actualOutput || "",
                  success: r.passed,
                })),
              },
            }
          : undefined,
      },
      include: {
        executionResults: true,
      },
    });
  }

  /**
   * Find submissions for a user with filters.
   */
  async findSubmissions(
    userId: string,
    filters: { questionId?: string; page?: number; limit?: number }
  ): Promise<{ submissions: (CodeSubmission & { question: { title: string } | null })[]; count: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (filters.questionId) {
      where.questionId = filters.questionId;
    }

    const [submissions, count] = await Promise.all([
      prisma.codeSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          question: {
            select: { title: true },
          },
        },
      }),
      prisma.codeSubmission.count({ where }),
    ]);

    return { submissions, count };
  }

  /**
   * Find a submission by ID, checking owner constraint.
   */
  async findSubmissionById(id: string, userId: string): Promise<(CodeSubmission & { executionResults: ExecutionResult[]; question: { title: string } | null }) | null> {
    return prisma.codeSubmission.findFirst({
      where: { id, userId },
      include: {
        executionResults: true,
        question: {
          select: { title: true },
        },
      },
    });
  }
}

export const executionRepository = new ExecutionRepository();
