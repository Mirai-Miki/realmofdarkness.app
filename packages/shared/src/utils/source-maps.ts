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
import { Logging } from "logger";

// Auto-initialize enhanced error handling when this module is imported
handleUncaughtErrors();

/**
 * Configures enhanced error reporting with source maps
 * This is automatically called when the module is imported
 */
export function handleUncaughtErrors(): void {
  // Source map support is already registered via the import above
  // This function can be extended for additional error handling configuration
  const logger = Logging.getLogger();

  // Handle unhandled promise rejections in all environments
  process.on("unhandledRejection", (reason: unknown) => {
    logger.fatal("Unhandled Promise Rejection", {
      fields: [
        { name: "Reason", value: String(reason), inline: false },
        {
          name: "Environment",
          value: process.env.NODE_ENV || "unknown",
          inline: true,
        },
      ],
    });
  });

  // Handle uncaught exceptions in all environments
  process.on("uncaughtException", (error: Error) => {
    logger.fatal("Uncaught Exception", {
      fields: [
        { name: "Error", value: error.message, inline: false },
        {
          name: "Stack",
          value: error.stack || "No stack trace",
          inline: false,
        },
        {
          name: "Environment",
          value: process.env.NODE_ENV || "unknown",
          inline: true,
        },
      ],
    });
  });
}
