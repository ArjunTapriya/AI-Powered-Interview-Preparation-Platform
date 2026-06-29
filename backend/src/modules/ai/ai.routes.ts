import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { aiController } from "./ai.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const aiRouter = Router();

// Rate Limit: Max 3 evaluations/re-evaluations per 5 minutes per IP to control LLM cost abuse.
const aiEvaluationRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: {
    success: false,
    error: {
      message: "Rate limit exceeded. You can only request AI evaluation 3 times per 5 minutes.",
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const evaluateInputSchema = z
  .object({
    sessionId: z.string().min(1, "sessionId is required"),
    questionId: z.string().min(1, "questionId is required"),
    answer: z.any().optional(),
    code: z.string().optional(),
    executionResults: z.any().optional(),
  })
  .strict();

const reEvaluateInputSchema = z
  .object({
    sessionId: z.string().min(1, "sessionId is required"),
    questionId: z.string().min(1, "questionId is required"),
  })
  .strict();

/**
 * @swagger
 * tags:
 *   name: AI Evaluation
 *   description: Automated AI Interview Session Evaluation using OpenAI and Gemini
 */

/**
 * @swagger
 * /ai/evaluate:
 *   post:
 *     summary: Evaluate an interview session
 *     description: Generates an AI-driven feedback report and stores it in the database.
 *     tags: [AI Evaluation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - questionId
 *             properties:
 *               sessionId:
 *                 type: string
 *               questionId:
 *                 type: string
 *               answer:
 *                 type: string
 *               code:
 *                 type: string
 *               executionResults:
 *                 type: object
 *     responses:
 *       200:
 *         description: AI evaluation succeeded and report stored.
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
aiRouter.post(
  "/evaluate",
  authenticate,
  aiEvaluationRateLimiter,
  validate(evaluateInputSchema, "body"),
  asyncHandler(aiController.evaluate)
);

/**
 * @swagger
 * /ai/re-evaluate:
 *   post:
 *     summary: Re-evaluate an interview session
 *     description: Regenerates the AI-driven feedback report for an existing session.
 *     tags: [AI Evaluation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - questionId
 *             properties:
 *               sessionId:
 *                 type: string
 *               questionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI re-evaluation succeeded and report updated.
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
aiRouter.post(
  "/re-evaluate",
  authenticate,
  aiEvaluationRateLimiter,
  validate(reEvaluateInputSchema, "body"),
  asyncHandler(aiController.reEvaluate)
);

/**
 * @swagger
 * /ai/resume-intelligence:
 *   post:
 *     summary: Generate Elite Resume Intelligence Report
 *     description: Analyzes candidate resume across 17 vectors using Gemini AI and returns a deeply nested JSON report.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume analysis succeeded
 *       401:
 *         description: Unauthorized
 */
aiRouter.post(
  "/resume-intelligence",
  authenticate,
  aiEvaluationRateLimiter,
  asyncHandler(aiController.generateResumeReport)
);

aiRouter.post(
  "/evaluate-single-answer",
  aiEvaluationRateLimiter,
  asyncHandler(aiController.evaluateSingleAnswer)
);

aiRouter.post(
  "/generate-final-report",
  authenticate,
  asyncHandler(aiController.generateFinalReport)
);

/**
 * @swagger
 * /api/ai/prep-guide:
 *   post:
 *     summary: Generate a 10-step preparation guide based on history
 *     tags: [AI Evaluation]
 *     security:
 *       - bearerAuth: []
 */
aiRouter.post(
  "/prep-guide",
  authenticate,
  asyncHandler(aiController.generatePrepGuide)
);

aiRouter.get(
  "/prep-guide/:category",
  authenticate,
  asyncHandler(aiController.getPrepGuide)
);

aiRouter.put(
  "/prep-guide/:category/progress",
  authenticate,
  asyncHandler(aiController.updatePrepGuideProgress)
);

export { aiRouter };
