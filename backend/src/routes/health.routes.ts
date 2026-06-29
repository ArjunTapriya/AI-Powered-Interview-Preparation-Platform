import { Router } from "express";
import { sendError, sendSuccess } from "../utils/apiResponse";
import { checkDatabaseHealth } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";

const healthRouter = Router();

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Process is alive
 */
healthRouter.get(
  "/health/live",
  asyncHandler(async (_req, res) => {
    sendSuccess(
      res,
      { status: "alive", timestamp: new Date().toISOString() },
      "Service is alive"
    );
  })
);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
healthRouter.get(
  "/health/ready",
  asyncHandler(async (_req, res) => {
    const dbHealthy = await checkDatabaseHealth();

    if (!dbHealthy) {
      sendError(res, "Service is not ready", 503, { database: "down" });
      return;
    }

    sendSuccess(
      res,
      { status: "ready", database: "up", timestamp: new Date().toISOString() },
      "Service is ready"
    );
  })
);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check (liveness alias)
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 */
healthRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    sendSuccess(
      res,
      { status: "ok", timestamp: new Date().toISOString() },
      "Service is healthy"
    );
  })
);

export { healthRouter };
