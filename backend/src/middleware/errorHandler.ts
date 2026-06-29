import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/apiResponse";
import { logger } from "../utils/logger";
import { env } from "../config/env";
import { Prisma } from "@prisma/client";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
}

export function jsonSyntaxErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof SyntaxError && "body" in err) {
    sendError(res, "Invalid JSON payload", 400);
    return;
  }
  next(err);
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response | void {
  if (res.headersSent) {
    logger.error("Error after headers sent", {
      requestId: req.requestId,
      error: err.message,
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn(err.message, {
      requestId: req.requestId,
      statusCode: err.statusCode,
      details: err.details,
    });
    return sendError(res, err.message, err.statusCode, err.details ?? null);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn("Prisma error", { requestId: req.requestId, code: err.code });

    if (err.code === "P2002") {
      return sendError(res, "A record with this value already exists", 409);
    }
    if (err.code === "P2025") {
      return sendError(res, "Record not found", 404);
    }
    if (err.code === "P2003") {
      return sendError(res, "Related record not found", 400);
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return sendError(res, "Invalid database query", 400);
  }

  logger.error("Unhandled error", {
    requestId: req.requestId,
    error: err.message,
    stack: err.stack,
  });

  const message = env.NODE_ENV === "production" ? "Internal server error" : err.message;
  return sendError(res, message, 500);
}
