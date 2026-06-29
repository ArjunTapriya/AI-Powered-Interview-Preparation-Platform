import { z } from "zod";

/**
 * Validation schema for POST /api/evaluations
 */
export const createEvaluationSchema = z
  .object({
    sessionId: z.string().uuid("Invalid session ID"),
    correctness: z.number().min(0).max(100),
    speed: z.number().min(0).max(100),
    architecture: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    feedback: z.string().min(1, "Feedback is required"),
    strengths: z.array(z.string()).optional(),
    weaknesses: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
  })
  .strict();

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
