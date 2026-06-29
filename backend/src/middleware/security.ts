import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const HEALTH_PATHS = new Set(["/health", "/health/live", "/health/ready"]);

function isHealthPath(path: string): boolean {
  return HEALTH_PATHS.has(path);
}

export const helmetMiddleware = helmet({
  contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
});

export const corsMiddleware = cors({
  origin: env.corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
});

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isHealthPath(req.path),
  message: {
    success: false,
    message: "Too many requests, please try again later",
    data: null,
  },
});

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const { method, originalUrl } = req;
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("HTTP request", {
      requestId: req.requestId,
      method,
      url: originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
}
