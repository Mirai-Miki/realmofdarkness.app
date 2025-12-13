/**
 * Logger interface for the Realm of Darkness application.
 * Defines the contract that all logger implementations must follow.
 *
 * This interface provides a clean abstraction layer, allowing:
 * - Easy testing with mock loggers
 * - Swappable logger implementations
 * - No dependency on specific logging libraries in business logic
 *
 * @packageDocumentation
 */

import type { LoggerConfig, LogOptions } from "./logger.types.js";

/**
 * Logger interface contract.
 *
 * Implementations must provide:
 * - Multiple log levels (debug, info, warning, error, fatal)
 * - Application name tracking
 * - Configuration support
 *
 * @example
 * ```typescript
 * // In business logic (depends only on interface)
 * import type { ILogger } from '@realm/common';
 *
 * class CharacterService {
 *   constructor(private logger: ILogger) {}
 *
 *   createCharacter(name: string) {
 *     this.logger.info('Creating character', {
 *       fields: { name }
 *     });
 *   }
 * }
 *
 * // In application assembly (uses concrete implementation)
 * import { logger } from '@realm/logger';
 * const service = new CharacterService(logger);
 * ```
 */
export interface ILogger {
  /**
   * Sets the application name for this logger.
   *
   * @param appName - The name of the application
   */
  setAppName(appName: string): void;

  /**
   * Gets the current application name.
   *
   * @returns The current application name
   */
  getAppName(): string;

  /**
   * Configures the logger with custom settings.
   *
   * @param config - Custom logger configuration
   */
  configure(config: Partial<LoggerConfig>): void;

  /**
   * Logs a debug message.
   *
   * @param message - The log message
   * @param options - Optional logging options
   */
  debug(message: string, options?: LogOptions): void;

  /**
   * Logs an informational message.
   *
   * @param message - The log message
   * @param options - Optional logging options
   */
  info(message: string, options?: LogOptions): void;

  /**
   * Logs a warning message.
   *
   * @param message - The log message
   * @param options - Optional logging options
   */
  warning(message: string, options?: LogOptions): void;

  /**
   * Logs an error message.
   *
   * @param message - The log message
   * @param options - Optional logging options
   */
  error(message: string, options?: LogOptions): void;

  /**
   * Logs an exception with error details.
   * Use this method when you have an actual Error object (e.g., in catch blocks).
   * Use error() for error-level logs without an actual error object.
   *
   * @param message - The log message
   * @param error - The error object to log
   * @param options - Optional logging options (error field will be overridden)
   *
   * @example
   * ```typescript
   * try {
   *   await riskyOperation();
   * } catch (error) {
   *   logger.exception('Operation failed', error, {
   *     fields: { operation: 'riskyOperation' }
   *   });
   * }
   * ```
   */
  exception(
    message: string,
    error: unknown,
    options?: Omit<LogOptions, "error">
  ): void;

  /**
   * Logs a fatal error message.
   *
   * @param message - The log message
   * @param options - Optional logging options
   */
  fatal(message: string, options?: LogOptions): void;
}
