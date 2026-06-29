import { z } from "zod";

/**
 * Validation schema for POST /api/interviews
 */
export const createInterviewSchema = z
  .object({
    type: z.enum(["DSA", "System Design", "Behavioral"], {
      errorMap: () => ({ message: "Type must be DSA, System Design, or Behavioral" }),
    }),
    company: z.string().trim().min(1, "Company is required").max(100),
    overallScore: z.number().min(0).max(100),
    durationMin: z.number().int().min(1).max(300),
    codeSnippet: z.string().optional(),

    // Optional frontend payload fields that get mapped to EvaluationReport & JSON columns
    metrics: z
      .object({
        correctness: z.number().min(0).max(100),
        speed: z.number().min(0).max(100),
        architecture: z.number().min(0).max(100),
        communication: z.number().min(0).max(100),
      })
      .optional(),
    transcript: z.array(z.any()).optional(),
    feedbackNotes: z.array(z.string()).optional(),
    optimalCode: z.string().optional(),
  })
  .strict();

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
