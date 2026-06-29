import "dotenv/config";
import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { registerProcessHandlers } from "./middleware/processHandlers";

async function bootstrap(): Promise<void> {
  registerProcessHandlers();
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    if (env.swaggerEnabled) {
      logger.info(`API docs: http://localhost:${env.PORT}${env.API_PREFIX}/docs`);
    }
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    // Start force-shutdown watchdog only after a signal is received
    const forceShutdownTimer = setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, env.SHUTDOWN_TIMEOUT_MS);
    forceShutdownTimer.unref(); // Don't keep the process alive just for this timer

    server.close(async () => {
      clearTimeout(forceShutdownTimer);
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((error) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
