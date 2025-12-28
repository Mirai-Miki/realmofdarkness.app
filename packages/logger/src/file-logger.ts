import type { LogEntry } from "./logger.types";

import { promises as fs } from "fs";
import { dirname } from "path";
import { getLogLevelName, formatTimestamp } from "./logger.utils";

/**
 * File-based logger implementation that writes log entries to a file.
 * This serves as a backup when Discord logging fails.
 */
export class FileLogger {
  private readonly logPath: string;

  /**
   * Creates a new file logger instance.
   *
   * @param logPath - The path to the log file
   */
  constructor(logPath: string) {
    this.logPath = logPath;
  }

  /**
   * Writes a log entry to the file.
   *
   * @param logEntry - The log entry to write
   * @returns Promise that resolves when the log is written
   * @throws Error if the file write operation fails
   */
  public async writeLog(logEntry: LogEntry): Promise<void> {
    const logLine = this.formatLogEntry(logEntry);

    try {
      // Ensure the directory exists
      await this.ensureDirectoryExists();

      // Append the log entry to the file
      await fs.appendFile(this.logPath, logLine + "\n", "utf8");
    } catch (error) {
      throw new Error(
        `Failed to write log to file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Formats a log entry as a string for file output.
   *
   * @param logEntry - The log entry to format
   * @returns The formatted log string
   */
  private formatLogEntry(logEntry: LogEntry): string {
    const timestamp = formatTimestamp(logEntry.timestamp);
    const level = logEntry.level;
    const appName = logEntry.appName;

    let logLine = `[${timestamp}] [${appName}] [${getLogLevelName(level).toUpperCase()}] - ${logEntry.message}`;

    if (logEntry.location) {
      logLine += `\nLocation: ${logEntry.location}`;
    }

    if (logEntry.fields && Object.keys(logEntry.fields).length > 0) {
      const fieldsStr = Object.entries(logEntry.fields)
        .map(([key, value]) => `${key}=${value}`)
        .join(", ");
      logLine += `\nFields: ${fieldsStr}`;
    }

    if (logEntry.stackTrace) {
      logLine += `\nStackTrace:\n${logEntry.stackTrace}`;
    }
    logLine += "\n"; // Extra newline for spacing

    return logLine;
  }

  /**
   * Ensures that the directory for the log file exists.
   *
   * @returns Promise that resolves when the directory is confirmed to exist
   */
  private async ensureDirectoryExists(): Promise<void> {
    const directory = dirname(this.logPath);

    try {
      await fs.access(directory);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(directory, { recursive: true });
    }
  }

  /**
   * Rotates the log file if it exceeds a certain size.
   * This helps prevent log files from growing too large.
   *
   * @param maxSizeBytes - Maximum size in bytes before rotation (default: 10MB)
   * @returns Promise that resolves when rotation is complete (if needed)
   */
  async rotateIfNeeded(maxSizeBytes: number = 10 * 1024 * 1024): Promise<void> {
    try {
      const stats = await fs.stat(this.logPath);

      if (stats.size > maxSizeBytes) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const rotatedPath = `${this.logPath}.${timestamp}`;

        await fs.rename(this.logPath, rotatedPath);
      }
    } catch {
      // If the file doesn't exist or we can't rotate, that's okay
      // We'll just continue with a new file
    }
  }
}
