import { Router } from "express";
import rateLimit from "express-rate-limit";
import { executionController } from "./execution.controller";
import { runCodeSchema, submitCodeSchema, getSubmissionsQuerySchema } from "./execution.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const executionRouter = Router();

// Rate limiter: Max 5 runs/submissions per minute per IP to prevent infinite loop abuse.
const codeExecutionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    error: {
      message: "Rate limit exceeded. You can only execute code 5 times per minute.",
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Code Execution
 *   description: Compiler integration using Judge0 for code compile runs and question submissions
 */

/**
 * @swagger
 * /code/run:
 *   post:
 *     summary: Run code on-demand
 *     description: Executes custom source code with optional custom stdin using Judge0 sandbox compiler.
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *               - sourceCode
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [javascript, python, cpp, java]
 *               sourceCode:
 *                 type: string
 *               stdin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code executed successfully
 *       400:
 *         description: Validation failed
 *       429:
 *         description: Rate limit exceeded
 */
executionRouter.post(
  "/run",
  authenticate,
  codeExecutionRateLimiter,
  validate(runCodeSchema, "body"),
  asyncHandler(executionController.run)
);

/**
 * @swagger
 * /code/submit/{questionId}:
 *   post:
 *     summary: Submit question solution code
 *     description: Submits source code to be executed against hidden test cases. Saves submission metrics.
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *               - sourceCode
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [javascript, python, cpp, java]
 *               sourceCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code submitted and evaluated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Question not found
 *       429:
 *         description: Rate limit exceeded
 */
executionRouter.post(
  "/submit/:questionId",
  authenticate,
  codeExecutionRateLimiter,
  validate(submitCodeSchema, "body"),
  asyncHandler(executionController.submit)
);

/**
 * @swagger
 * /code/submissions:
 *   get:
 *     summary: Get submission history
 *     description: Retrieves list of paginated code execution submissions for the authenticated user.
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: questionId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submissions history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
executionRouter.get(
  "/submissions",
  authenticate,
  validate(getSubmissionsQuerySchema, "query"),
  asyncHandler(executionController.getHistory)
);

/**
 * @swagger
 * /code/submissions/{id}:
 *   get:
 *     summary: Get submission details
 *     description: Retrieves detailed test results for a specific code submission by ID.
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submission details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Submission not found
 */
executionRouter.get(
  "/submissions/:id",
  authenticate,
  asyncHandler(executionController.getById)
);

export { executionRouter };
