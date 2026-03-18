import type { Color } from "./logger.types";
import { LogLevel, LogLevelName } from "@realm/common";

/**
 * Get the human-readable name for a numeric `LogLevel`.
 *
 * @param level - Numeric log level (from `LogLevel`)
 * @returns Lowercase level name (e.g. `LogLevel.Debug` -> `"debug"`).
 */
export function getLogLevelName(level: LogLevel): LogLevelName {
  switch (level) {
    case LogLevel.Debug:
      return LogLevelName.Debug;
    case LogLevel.Info:
      return LogLevelName.Info;
    case LogLevel.Warn:
      return LogLevelName.Warn;
    case LogLevel.Error:
      return LogLevelName.Error;
    case LogLevel.Fatal:
      return LogLevelName.Fatal;
    default:
      return LogLevelName.Info;
  }
}

/**
 * Convert a log level name to its numeric `LogLevel` value.
 *
 * @param name - Level name (case-sensitive constant from `LogLevelName`)
 * @returns Numeric `LogLevel` corresponding to the name.
 */
export function getLogLevelFromName(name: LogLevelName): LogLevel {
  switch (name) {
    case LogLevelName.Debug:
      return LogLevel.Debug;
    case LogLevelName.Info:
      return LogLevel.Info;
    case LogLevelName.Warn:
      return LogLevel.Warn;
    case LogLevelName.Error:
      return LogLevel.Error;
    case LogLevelName.Fatal:
      return LogLevel.Fatal;
    default:
      return LogLevel.Info;
  }
}

/**
 * Formats a timestamp for logging in a human-readable format.
 * Uses local timezone and 12-hour format like "2025-12-28 10:30:45 AM EST"
 *
 * @param date - The date to format (defaults to current time)
 * @returns Formatted timestamp string with timezone
 */
export function formatTimestamp(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Get 12-hour format with am/pm
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const hours12 = String(hours).padStart(2, "0");

  return `${year}/${month}/${day} - ${hours12}:${minutes}:${seconds}${ampm}`;
}

/**
 * If the given text is valid JSON, return a pretty-printed JSON string,
 * otherwise return the original text.
 *
 * @param text - The text to potentially pretty-print
 * @returns Pretty-printed JSON if valid, otherwise the original text
 */
export function prettyPrintIfJson(text: string): string {
  try {
    const parsed: unknown = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return text;
  }
}

/**
 * Get the ANSI color code if supported by the terminal.
 *
 * @param color - The desired color code
 * @returns The ANSI color code or an empty string if not supported
 */
export function getColor(color: Color): string {
  return supportsColor() ? color : "";
}

/**
 * Get the ANSI color code for a given log level.
 *
 * @param level - The log level
 * @returns The ANSI color code for the log level
 */
export function getLogLevelColor(level: LogLevel): string {
  const LogLevelColors: Record<LogLevel, string> = {
    [LogLevel.Debug]: "\x1b[38;2;180;95;201m", // Custom purple #b45fc9
    [LogLevel.Info]: "\x1b[34m", // Blue
    [LogLevel.Warn]: "\x1b[33m", // Yellow
    [LogLevel.Error]: "\x1b[31m", // Red
    [LogLevel.Fatal]: "\x1b[1m\x1b[31m", // Bright Red
  };
  return supportsColor() ? LogLevelColors[level] : "";
}

/**
 * Check if the terminal supports colors.
 */
export function supportsColor(): boolean {
  // Check for CONSOLE_COLORS environment variable
  if (process.env.CONSOLE_COLORS === "false") return false;

  // Check if stdout is a TTY (interactive terminal)
  if (!process.stdout.isTTY) return false;

  // Check TERM environment variable
  const term = process.env.TERM;
  if (term && (term === "dumb" || term === "unknown")) return false;

  // Check COLORTERM environment variable
  if (process.env.COLORTERM) return true;

  return true;
}
