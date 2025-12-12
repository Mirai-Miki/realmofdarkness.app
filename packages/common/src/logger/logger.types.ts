/**
 * Log level enumeration.
 */
export const enum LogLevel {
  Debug = "debug",
  Info = "info",
  Warning = "warning",
  Error = "error",
  Fatal = "fatal",
}

/**
 * Options for log entries.
 */
export interface LogOptions {
  /** Location/source of the log (e.g., file path, method name) */
  location?: string;

  /** Additional structured fields for the log entry */
  fields?: Record<string, string>;

  /** Error object (used by exception method) */
  error?: unknown;

  /** Whether to send this log to Discord (overrides default behavior) */
  sendToDiscord?: boolean;

  /** Whether to write this log to the console (overrides default behavior) */
  logToConsole?: boolean;
}

/**
 * Logger configuration options.
 */
export interface LoggerConfig {
  /** The current environment */
  environment: Environment;

  /** Discord bot token for sending logs */
  discordToken?: string;

  /** Discord channel ID where logs should be sent */
  discordChannelId?: string;

  /** Path to the backup log file */
  backupLogPath?: string;

  /** Whether to enable console logging (overrides default behavior) */
  enableConsoleLogging?: boolean;

  /** Whether to enable Discord logging (overrides default behavior) */
  enableDiscordLogging?: boolean;

  /** Custom minimum log level (overrides environment defaults) */
  customMinLogLevel?: LogLevel;
}
