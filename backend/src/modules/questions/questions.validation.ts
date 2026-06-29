import { z } from "zod";
import { Difficulty, InterviewType } from "@prisma/client";

export const getQuestionsQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .pipe(z.number().int().min(1).optional()),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .pipe(z.number().int().min(1).max(100).optional()),
    search: z.string().trim().optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    category: z.nativeEnum(InterviewType).optional(),
    topic: z.string().trim().optional(),
    company: z.string().trim().optional(),
  })
  .strict();

export const getRandomQuestionQuerySchema = z
  .object({
    difficulty: z.nativeEnum(Difficulty).optional(),
    category: z.nativeEnum(InterviewType).optional(),
    topic: z.string().trim().optional(),
  })
  .strict();

export type GetQuestionsQuery = z.infer<typeof getQuestionsQuerySchema>;
export type GetRandomQuestionQuery = z.infer<typeof getRandomQuestionQuerySchema>;
