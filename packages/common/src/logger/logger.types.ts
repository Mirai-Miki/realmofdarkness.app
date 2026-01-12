/**
 * Log level enumeration.
 */

import z from "zod";
import type { Environment } from "../primitives/";

export const LogLevel = {
  Debug: 0,
  Info: 1,
  Warn: 2,
  Error: 3,
  Fatal: 4,
} as const;
export const LogLevelSchema = z.enum(LogLevel);
export type LogLevel = z.infer<typeof LogLevelSchema>;

export const LogLevelName = {
  Debug: "debug",
  Info: "info",
  Warn: "warn",
  Error: "error",
  Fatal: "fatal",
} as const;
export const LogLevelNameSchema = z.enum(LogLevelName);
export type LogLevelName = z.infer<typeof LogLevelNameSchema>;

/**
 * Options for log entries.
 */
export interface LogOptions {
  /** Location/source of the log (e.g., file path, method name) */
  location?: string;

  /** Additional structured fields for the log entry */
  fields?: Record<string, string>;

  /** Error object */
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
