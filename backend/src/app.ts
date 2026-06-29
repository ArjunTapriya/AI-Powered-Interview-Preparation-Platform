import express from "express";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import {
  corsMiddleware,
  helmetMiddleware,
  rateLimiter,
  requestLogger,
} from "./middleware/security";
import {
  notFoundHandler,
  errorHandler,
  jsonSyntaxErrorHandler,
} from "./middleware/errorHandler";
import { requestContext } from "./utils/requestContext";
import { createApiRouter } from "./routes/index";
import { healthRouter } from "./routes/health.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(requestContext);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(rateLimiter);
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.use(healthRouter);

  if (env.swaggerEnabled) {
    app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use(env.API_PREFIX, createApiRouter());

  app.use(notFoundHandler);
  app.use(jsonSyntaxErrorHandler);
  app.use(errorHandler);

  return app;
}
