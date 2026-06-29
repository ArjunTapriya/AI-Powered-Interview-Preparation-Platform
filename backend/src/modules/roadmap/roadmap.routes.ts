import { Router } from "express";
import { roadmapController } from "./roadmap.controller";
import { updateRoadmapProgressSchema } from "./roadmap.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const roadmapRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Roadmap
 *   description: Curriculum syllabus and progress tracking
 */

/**
 * @swagger
 * /roadmap:
 *   get:
 *     summary: Retrieve curriculum syllabus nodes
 *     description: Returns the full catalog of syllabus challenges and metadata.
 *     tags: [Roadmap]
 *     responses:
 *       200:
 *         description: Catalog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         nodes:
 *                           type: array
 *                           items:
 *                             type: object
 *       500:
 *         description: Internal server error
 */
roadmapRouter.get("/", asyncHandler(roadmapController.getRoadmap));

/**
 * @swagger
 * /roadmap/progress:
 *   get:
 *     summary: Get user completed roadmap nodes
 *     description: Returns list of node IDs marked completed by authenticated user.
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
 *       401:
 *         description: Unauthorized
 */
roadmapRouter.get("/progress", authenticate, asyncHandler(roadmapController.getProgress));

/**
 * @swagger
 * /roadmap/progress:
 *   post:
 *     summary: Update node completion progress
 *     description: Mark a syllabus node as completed or uncompleted.
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nodeId
 *               - completed
 *             properties:
 *               nodeId:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
roadmapRouter.post(
  "/progress",
  authenticate,
  validate(updateRoadmapProgressSchema),
  asyncHandler(roadmapController.markProgress)
);

/**
 * @swagger
 * /roadmap/recommendations:
 *   get:
 *     summary: Get daily recommendation
 *     description: Returns dynamic challenge recommendations based on user analytical diagnostics.
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendation retrieved successfully
 *       401:
 *         description: Unauthorized
 */
roadmapRouter.get(
  "/recommendations",
  authenticate,
  asyncHandler(roadmapController.getRecommendations)
);

export { roadmapRouter };
