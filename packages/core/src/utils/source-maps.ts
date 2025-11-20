/**
 * Source Map Support Initialization
 *
 * This utility initializes source map support for better TypeScript stack traces
 * in development and production environments. Import this at the very top of
 * your application's main entry point.
 *
 * @example
 * ```typescript
 * import "shared/utils/source-maps";
 * // ... rest of your imports
 * ```
 */

import "source-map-support/register";
import { logger } from "../logger";

// Auto-initialize enhanced error handling when this module is imported
handleUncaughtErrors();

/**
 * Configures enhanced error reporting with source maps
 * This is automatically called when the module is imported
 */
export function handleUncaughtErrors(): void {
  // Source map support is already registered via the import above
  // This function can be extended for additional error handling configuration

  // Handle unhandled promise rejections in all environments
  process.on("unhandledRejection", (reason: unknown) => {
    logger.fatal("Unhandled Promise Rejection", {
      fields: {
        Reason: String(reason),
        Environment: process.env.NODE_ENV || "unknown",
      },
    });
  });

  // Handle uncaught exceptions in all environments
  process.on("uncaughtException", (error: Error) => {
    logger.fatal("Uncaught Exception", {
      fields: {
        Error: error.message,
        Stack: error.stack || "No stack trace",
        Environment: process.env.NODE_ENV || "unknown",
      },
    });
  });
}
