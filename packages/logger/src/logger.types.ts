/**
 * Type definitions for the Realm of Darkness logger package
 * This file contains type definitions for logging functionality.
 * @packageDocumentation
 */

// Import types from @realm/common
import type { Environment } from "@realm/common";
import type { LogLevel } from "@realm/common";

/**
 * Configuration options for the RealmLogger singleton.
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

/**
 * Represents a log entry with all necessary information.
 */
export interface LogEntry {
  /** The severity level of the log */
  level: LogLevel;

  /** The main log message */
  message: string;

  /** The application that generated this log */
  appName: string;

  /** Timestamp when the log was created */
  timestamp: Date;

  /** Optional location information (file, function, etc.) */
  location?: string;

  /** Stack trace information (usually from errors) */
  stackTrace?: string;

  /** Additional fields to include in the log */
  fields?: Record<string, string>;
}

/**
 * Additional fields that can be added to log entries.
 */
export interface LogField {
  /** The field name */
  name: string;

  /** The field value */
  value: string;

  /** Whether this field should be displayed inline in Discord embeds */
  inline?: boolean;
}

/**
 * ANSI color codes for console output.
 */
export const Color = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",

  // Foreground colors
  Red: "\x1b[31m",
  Green: "\x1b[32m",
  Yellow: "\x1b[33m",
  Blue: "\x1b[34m",
  Magenta: "\x1b[35m",
  Cyan: "\x1b[36m",
  Gray: "\x1b[37m",
  White: "\x1b[97m",

  // Background colors
  BgRed: "\x1b[41m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
} as const;
export type Color = (typeof Color)[keyof typeof Color];
