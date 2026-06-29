import { logger } from "../utils/logger";
import { env } from "../config/env";

export function registerProcessHandlers(): void {
  process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught exception", { error: error.message, stack: error.stack });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason: unknown) => {
    logger.error("Unhandled promise rejection", { reason });
    process.exit(1);
  });

  if (env.NODE_ENV === "production") {
    process.on("warning", (warning) => {
      logger.warn("Process warning", { name: warning.name, message: warning.message });
    });
  }
}
