/**
 * Logger package for the Realm of Darkness application.
 *
 * Provides comprehensive logging functionality with:
 * - Discord integration for production logging
 * - File backup logging
 * - Source map support for better stack traces
 * - Global error handling
 * - Custom error types (RealmError, UserError)
 *
 * Simply importing this package initializes source map support and global error handlers.
 *
 * @example
 * ```typescript
 * import { logger } from "@realm/logger";
 *
 * // Set app name at the entry point
 * logger.setAppName("api");
 *
 * // Log messages
 * logger.info("Server started", { fields: { port: "3000" } });
 * logger.error("Database error", { error: dbError });
 * ```
 */

export { logger } from "./logger";
export type { LoggerConfig, LogOptions } from "./logger.types";
