import { z } from "zod";

const SUPPORTED_LANGUAGES = ["javascript", "python", "cpp", "java"];

export const runCodeSchema = z
  .object({
    language: z
      .string()
      .trim()
      .toLowerCase()
      .refine(
        (val) => SUPPORTED_LANGUAGES.includes(val),
        `Language must be one of: ${SUPPORTED_LANGUAGES.join(", ")}`
      ),
    sourceCode: z
      .string()
      .min(1, "Source code is required")
      .max(102400, "Source code cannot exceed 100KB"),
    stdin: z
      .string()
      .max(10240, "Stdin cannot exceed 10KB")
      .optional()
      .default(""),
  })
  .strict();

export const submitCodeSchema = z
  .object({
    language: z
      .string()
      .trim()
      .toLowerCase()
      .refine(
        (val) => SUPPORTED_LANGUAGES.includes(val),
        `Language must be one of: ${SUPPORTED_LANGUAGES.join(", ")}`
      ),
    sourceCode: z
      .string()
      .min(1, "Source code is required")
      .max(102400, "Source code cannot exceed 100KB"),
  })
  .strict();

export const getSubmissionsQuerySchema = z
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
    questionId: z.string().uuid("Invalid question ID format").optional(),
  })
  .strict();

export type RunCodeSchemaInput = z.infer<typeof runCodeSchema>;
export type SubmitCodeSchemaInput = z.infer<typeof submitCodeSchema>;
export type GetSubmissionsQueryInput = z.infer<typeof getSubmissionsQuerySchema>;
