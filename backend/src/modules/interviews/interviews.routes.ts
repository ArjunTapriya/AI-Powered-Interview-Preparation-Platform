import { Router } from "express";
import { interviewsController } from "./interviews.controller";
import { createInterviewSchema } from "./interviews.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const interviewsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Interviews
 *   description: Interview Session history and practice logs
 */

/**
 * @swagger
 * /interviews:
 *   post:
 *     summary: Create a new interview session
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - company
 *               - overallScore
 *               - durationMin
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [DSA, System Design, Behavioral]
 *               company:
 *                 type: string
 *               overallScore:
 *                 type: number
 *               durationMin:
 *                 type: number
 *               codeSnippet:
 *                 type: string
 *               metrics:
 *                 type: object
 *                 properties:
 *                   correctness:
 *                     type: number
 *                   speed:
 *                     type: number
 *                   architecture:
 *                     type: number
 *                   communication:
 *                     type: number
 *               transcript:
 *                 type: array
 *               feedbackNotes:
 *                 type: array
 *               optimalCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session created successfully
 *       400:
 *         description: Validation Error
 */
interviewsRouter.post(
  "/",
  authenticate,
  validate(createInterviewSchema),
  asyncHandler(interviewsController.create)
);

/**
 * @swagger
 * /interviews:
 *   get:
 *     summary: Get all interview sessions for the current user
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of sessions
 */
interviewsRouter.get(
  "/",
  authenticate,
  asyncHandler(interviewsController.getAll)
);

/**
 * @swagger
 * /interviews/{id}:
 *   get:
 *     summary: Get a specific interview session
 *     tags: [Interviews]
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
 *         description: Session details
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
interviewsRouter.get(
  "/:id",
  authenticate,
  asyncHandler(interviewsController.getById)
);

/**
 * @swagger
 * /interviews/{id}:
 *   delete:
 *     summary: Delete a specific interview session
 *     tags: [Interviews]
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
 *         description: Session deleted successfully
 */
interviewsRouter.delete(
  "/:id",
  authenticate,
  asyncHandler(interviewsController.delete)
);

/**
 * @swagger
 * /interviews/{id}/report:
 *   get:
 *     summary: Get a specific interview session and its evaluation report in one payload
 *     tags: [Interviews]
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
 *         description: Session and report details
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
interviewsRouter.get(
  "/:id/report",
  authenticate,
  asyncHandler(interviewsController.getReport)
);

export { interviewsRouter };
