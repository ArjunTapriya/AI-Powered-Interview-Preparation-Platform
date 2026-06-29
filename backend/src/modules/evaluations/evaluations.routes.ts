import { Router } from "express";
import { evaluationsController } from "./evaluations.controller";
import { createEvaluationSchema } from "./evaluations.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const evaluationsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Evaluations
 *   description: Evaluation Reports for Interview Sessions
 */

/**
 * @swagger
 * /evaluations:
 *   post:
 *     summary: Create an evaluation report for an interview session
 *     tags: [Evaluations]
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
 *               - correctness
 *               - speed
 *               - architecture
 *               - communication
 *               - feedback
 *             properties:
 *               sessionId:
 *                 type: string
 *               correctness:
 *                 type: number
 *               speed:
 *                 type: number
 *               architecture:
 *                 type: number
 *               communication:
 *                 type: number
 *               feedback:
 *                 type: string
 *               strengths:
 *                 type: array
 *                 items:
 *                   type: string
 *               weaknesses:
 *                 type: array
 *                 items:
 *                   type: string
 *               recommendations:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Validation Error
 */
evaluationsRouter.post(
  "/",
  authenticate,
  validate(createEvaluationSchema),
  asyncHandler(evaluationsController.create)
);

/**
 * @swagger
 * /evaluations/{id}:
 *   get:
 *     summary: Get an evaluation report by ID
 *     tags: [Evaluations]
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
 *         description: Report details
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
evaluationsRouter.get(
  "/:id",
  authenticate,
  asyncHandler(evaluationsController.getById)
);

export { evaluationsRouter };
