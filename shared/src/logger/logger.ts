import type { LoggerConfig, LogEntry, LogOptions } from "../types";

import * as dotenv from "dotenv";
import * as path from "path";
import { RealmError } from "errors";
import { DiscordLogger } from "./discord-logger";
import { FileLogger } from "./file-logger";
import { LogLevel, Environment } from "types/logger";
import { HTTPError } from "discord.js";

/**
 * Log level priority mapping for filtering.
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
  fatal: 4,
} as const;

/**
 * Singleton logger class for the Realm of Darkness application.
 * Provides async logging with Discord integration and file backup.
 */
class Logger {
  private appName: string = "unknown-app";
  private environment: Environment = Environment.Development;
  private discordLogger?: DiscordLogger;
  private fileLogger?: FileLogger;
  private minLevelPriority: number = 0;
  private enableConsoleLogging: boolean = true;
  private enableDiscordLogging: boolean = false;

  /**
   * Private constructor to enforce singleton pattern.
   */
  public constructor() {
    // Load environment variables
    dotenv.config();
    this.initializeFromEnv();
  }

  /**
   * Sets the application name for this logger.
   *
   * @param appName - The name of the application
   */
  public setAppName(appName: string): void {
    this.appName = appName;

    // Reinitialize file logger with new app name if backup logging is enabled
    if (this.fileLogger) {
      const backupPath =
        process.env.LOG_FILE_PATH ||
        path.join(process.cwd(), "..", "logs", `${appName}.log`);
      this.fileLogger = new FileLogger(backupPath);
    }
  }

  /**
   * Gets the current application name.
   *
   * @returns The current application name
   */
  public getAppName(): string {
    return this.appName;
  }

  /**
   * Configures the logger with custom settings.
   * This allows overriding environment-based defaults.
   *
   * @param config - Custom logger configuration
   */
  public configure(config: Partial<LoggerConfig>): void {
    if (config.environment) {
      this.environment = config.environment;
    }

    if (config.enableConsoleLogging !== undefined) {
      this.enableConsoleLogging = config.enableConsoleLogging;
    }

    if (config.enableDiscordLogging !== undefined) {
      this.enableDiscordLogging = config.enableDiscordLogging;
    }

    if (config.customMinLogLevel) {
      this.minLevelPriority = LOG_LEVEL_PRIORITY[config.customMinLogLevel];
    }

    // Reinitialize loggers if needed
    this.initializeLoggers(config);
  }

  /**
   * Initializes the logger from environment variables.
   */
  private initializeFromEnv(): void {
    // Determine environment
    const nodeEnv = process.env.NODE_ENV?.toLowerCase();
    switch (nodeEnv) {
      case Environment.Production:
        this.environment = Environment.Production;
        this.enableConsoleLogging = false;
        this.enableDiscordLogging = true;
        this.minLevelPriority = LOG_LEVEL_PRIORITY.error;
        break;
      case Environment.Preproduction:
        this.environment = Environment.Preproduction;
        this.enableConsoleLogging = false;
        this.enableDiscordLogging = true;
        this.minLevelPriority = LOG_LEVEL_PRIORITY.debug;
        break;
      case Environment.Development:
        this.environment = Environment.Development;
        this.enableConsoleLogging = true;
        this.enableDiscordLogging = false;
        this.minLevelPriority = LOG_LEVEL_PRIORITY.debug;
        break;
      default:
        throw new RealmError(
          `Invalid NODE_ENV value: "${nodeEnv}". Expected one of: development, preproduction, production.`
        );
    }

    // Override with environment variables if present
    if (process.env.ENABLE_CONSOLE_LOGGING !== undefined) {
      this.enableConsoleLogging = process.env.ENABLE_CONSOLE_LOGGING === "true";
    }

    if (process.env.ENABLE_DISCORD_LOGGING !== undefined) {
      this.enableDiscordLogging = process.env.ENABLE_DISCORD_LOGGING === "true";
    }

    this.initializeLoggers();
  }

  /**
   * Initializes the Discord and file loggers based on current configuration.
   */
  private initializeLoggers(config?: Partial<LoggerConfig>): void {
    const discordToken = config?.discordToken || process.env.LOGGER_TOKEN;
    const discordChannelId =
      config?.discordChannelId || process.env.LOGGER_CHANNEL_ID;
    const backupLogPath =
      config?.backupLogPath ||
      process.env.LOG_FILE_PATH ||
      path.join(process.cwd(), "..", "logs", `${this.appName}.log`);

    // Initialize Discord logger if enabled and configured
    if (this.enableDiscordLogging && discordToken && discordChannelId) {
      this.discordLogger = new DiscordLogger(discordToken, discordChannelId);
    } else {
      this.discordLogger = undefined;
    }

    // Initialize file logger as backup
    this.fileLogger = new FileLogger(backupLogPath);
  }

  /**
   * Logs a debug message.
   *
   * @param message - The debug message
   * @param options - Additional logging options
   * @returns Promise that resolves when logging is complete
   */
  public debug(message: string, options: LogOptions = {}): void {
    this.log(LogLevel.Debug, message, options);
  }

  /**
   * Logs an info message.
   *
   * @param message - The info message
   * @param options - Additional logging options
   * @returns Promise that resolves when logging is complete
   */
  public info(message: string, options: LogOptions = {}): void {
    this.log(LogLevel.Info, message, options);
  }

  /**
   * Logs a warning message.
   *
   * @param message - The warning message
   * @param options - Additional logging options
   */
  public warn(message: string, options: LogOptions = {}): void {
    this.log(LogLevel.Warning, message, options);
  }

  /**
   * Logs an error message.
   *
   * @param message - The error message
   * @param options - Additional logging options
   * @returns Promise that resolves when logging is complete
   */
  public error(message: string, options: LogOptions = {}): void {
    this.log(LogLevel.Error, message, options);
  }

  /**
   * Logs a fatal error message.
   *
   * @param message - The fatal error message
   * @param options - Additional logging options
   * @returns Promise that resolves when logging is complete
   */
  public fatal(message: string, options: LogOptions = {}): void {
    this.log(LogLevel.Fatal, message, options);
  }

  /**
   * Logs a RealmError with all its metadata.
   * ClientErrors are not logged as they represent user errors, not system issues.
   *
   * @param error - The error to log (RealmError or ClientError)
   * @param additionalOptions - Additional logging options to merge
   * @returns Promise that resolves when logging is complete
   */
  public exception(
    message: string,
    error: RealmError | Error | unknown,
    additionalOptions: Omit<LogOptions, "error"> = {}
  ): void {
    let options: LogOptions;
    if (error instanceof RealmError && !error.log) {
      return;
    } else if (error instanceof RealmError) {
      options = {
        location: error.location || additionalOptions.location,
        fields: {
          ...error.fields,
          ...additionalOptions.fields,
        },
        error: error,
      };
    } else {
      // Handle error or unknown error types
      options = {
        location: additionalOptions.location,
        fields: additionalOptions.fields,
        error: error,
      };
    }
    this.log(LogLevel.Error, message, options);
  }

  /**
   * Core logging method that handles the actual log processing.
   *
   * @param level - The log level
   * @param message - The log message
   * @param options - Additional logging options
   * @returns Promise that resolves when logging is complete
   */
  private log(
    level: LogLevel,
    message: string,
    options: LogOptions = {}
  ): void {
    // Check if this log level should be processed
    if (LOG_LEVEL_PRIORITY[level] < this.minLevelPriority) {
      return;
    }
    // Need to be extra safe here since an error here could remain uncaught
    try {
      if (this.shouldIgnore(options.error)) return;
      const logEntry = this.createLogEntry(level, message, options);

      // Log to console if enabled
      if (this.enableConsoleLogging) {
        this.logToConsole(logEntry);
      }

      // Attempt async logging (don't await to avoid blocking)
      this.logAsync(logEntry).catch((error) => {
        // If async logging fails completely, fall back to console error
        console.error("Failed to log message:", error);
        console.error("Original log entry:", logEntry);
      });
    } catch (error) {
      console.error("Failed to log message:", error);
    }
  }

  private shouldIgnore(error: unknown) {
    // Ignore errors I cannot control
    if (error instanceof HTTPError) return true;
    return false;
  }

  /**
   * Gets the current environment.
   *
   * @returns The current environment
   */
  public getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Checks if Discord logging is enabled.
   *
   * @returns True if Discord logging is enabled
   */
  public isDiscordLoggingEnabled(): boolean {
    return this.enableDiscordLogging && !!this.discordLogger;
  }

  /**
   * Checks if console logging is enabled.
   *
   * @returns True if console logging is enabled
   */
  public isConsoleLoggingEnabled(): boolean {
    return this.enableConsoleLogging;
  }

  /**
   * Creates a log entry from the provided parameters.
   *
   * @param level - The log level
   * @param message - The log message
   * @param options - Additional logging options
   * @returns The created log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    options: LogOptions
  ): LogEntry {
    const logEntry: LogEntry = {
      level,
      message,
      appName: this.appName,
      timestamp: new Date(),
    };

    // Add location if provided
    if (options.location) {
      logEntry.location = options.location;
    }

    // Add stack trace if an error is provided
    if (options.error) {
      let errorToLog: Error;

      if (options.error instanceof RealmError && options.error.cause) {
        errorToLog = options.error.cause;
        const fields = options.fields ?? {};
        fields["Raised by RealmError"] = `RealmError: ${options.error.message}`;
        options.fields = fields;
      } else if (options.error instanceof Error) {
        errorToLog = options.error;
      } else {
        errorToLog = new Error(String(options.error));
      }

      logEntry.stackTrace = errorToLog.stack;
    }

    // Add additional fields
    if (options.fields) {
      logEntry.fields = options.fields;
    }

    return logEntry;
  }

  /**
   * Handles async logging to Discord and file backup.
   *
   * @param logEntry - The log entry to process
   * @returns Promise that resolves when all logging attempts are complete
   */
  private async logAsync(logEntry: LogEntry): Promise<void> {
    let discordSuccess = false;

    // Try Discord logging first if enabled
    if (this.enableDiscordLogging && this.discordLogger) {
      try {
        await this.discordLogger.sendLog(logEntry);
        discordSuccess = true;
      } catch (error) {
        // Discord logging failed, we'll fall back to file logging
        if (this.enableConsoleLogging) {
          console.warn("Discord logging failed:", error);
        }
      }
    }

    // If Discord failed or isn't configured, use file backup
    if (!discordSuccess && this.fileLogger) {
      try {
        await this.fileLogger.writeLog(logEntry);
      } catch {
        // Both Discord and file logging failed
        throw new Error(
          `All logging methods failed. Discord: ${!this.discordLogger ? "not configured" : "failed"}`
        );
      }
    }

    // If neither Discord nor file logging worked, that's a configuration issue
    if (!this.enableDiscordLogging && !this.fileLogger) {
      throw new Error(
        "No logging methods configured. Please configure either Discord or file logging."
      );
    }
  }

  /**
   * Logs a message to the console with appropriate formatting.
   *
   * @param logEntry - The log entry to log to console
   */
  private logToConsole(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const level = logEntry.level.toUpperCase();
    const prefix = `[${timestamp}] [${level}] [${logEntry.appName}]`;

    const consoleMethod = this.getConsoleMethod(logEntry.level);
    consoleMethod(`${prefix} ${logEntry.message}`);

    if (logEntry.location) {
      consoleMethod(`  Location: ${logEntry.location}`);
    }

    if (logEntry.fields && Object.keys(logEntry.fields).length > 0) {
      consoleMethod("  Fields:", logEntry.fields);
    }

    if (logEntry.stackTrace) {
      consoleMethod("  Stack Trace:");
      consoleMethod(logEntry.stackTrace);
    }
  }

  /**
   * Gets the appropriate console method for a log level.
   *
   * @param level - The log level
   * @returns The console method to use
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.Debug:
        // eslint-disable-next-line no-console
        return console.debug;
      case LogLevel.Info:
        // eslint-disable-next-line no-console
        return console.info;
      case LogLevel.Warning:
        return console.warn;
      case LogLevel.Error:
      case LogLevel.Fatal:
        return console.error;
      default:
        // eslint-disable-next-line no-console
        return console.log;
    }
  }
}

/**
 * Singleton logger instance.
 *
 * This ensures all imports within the same application (process) get the same logger instance,
 * allowing you to set the app name once and have it persist across all imports.
 *
 * Different applications (bot vs API vs frontend) run in separate memory spaces,
 * so each gets its own singleton instance.
 *
 * @example
 * ```typescript
 * // In bot/src/main.ts
 * import { logger } from "shared/logger";
 * logger.setAppName("bot");
 *
 * // In bot/src/commands/dice.ts
 * import { logger } from "shared/logger"; // Same instance!
 * console.log(logger.getAppName()); // "bot"
 * ```
 */
let _logger: Logger | null = null;

export const logger = (() => {
  if (!_logger) {
    _logger = new Logger();
  }
  return _logger;
})();
