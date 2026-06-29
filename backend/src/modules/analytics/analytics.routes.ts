import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const analyticsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Dynamic aggregation and performance insights
 */

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Retrieve dashboard summary metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary
 */
analyticsRouter.get("/dashboard", authenticate, asyncHandler(analyticsController.getDashboardSummary));

/**
 * @swagger
 * /analytics/skills:
 *   get:
 *     summary: Retrieve average scores across core skills
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skill breakdown
 */
analyticsRouter.get("/skills", authenticate, asyncHandler(analyticsController.getSkillBreakdown));

/**
 * @swagger
 * /analytics/trends:
 *   get:
 *     summary: Retrieve score trends over time
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Aggregation period
 *     responses:
 *       200:
 *         description: Array of trend points
 */
analyticsRouter.get("/trends", authenticate, asyncHandler(analyticsController.getTrends));

/**
 * @swagger
 * /analytics/insights:
 *   get:
 *     summary: Retrieve rule-based strengths, weaknesses, and recommendations
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance insights
 */
analyticsRouter.get("/insights", authenticate, asyncHandler(analyticsController.getInsights));

export { analyticsRouter };
