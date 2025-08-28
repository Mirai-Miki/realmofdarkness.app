import { EmbedBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import type { LogEntry, LogLevel } from "../types/logger.js";

/**
 * Maps log levels to Discord embed colors.
 */
const LOG_LEVEL_COLORS: Record<LogLevel, number> = {
  debug: 0x9ca3af, // Gray-400
  info: 0x3b82f6, // Blue-500
  warning: 0xf59e0b, // Amber-500
  error: 0xef4444, // Red-500
  fatal: 0x7c2d12, // Red-900
} as const;

/**
 * Maps log levels to emoji indicators.
 */
const LOG_LEVEL_EMOJIS: Record<LogLevel, string> = {
  debug: "🐛",
  info: "ℹ️",
  warning: "⚠️",
  error: "❌",
  fatal: "💀",
} as const;

/**
 * Discord-specific logger implementation that sends log messages as embeds
 * to a Discord channel using the Discord REST API.
 */
export class DiscordLogger {
  private readonly rest: REST;
  private readonly channelId: string;

  /**
   * Creates a new Discord logger instance.
   *
   * @param token - The Discord bot token
   * @param channelId - The Discord channel ID to send logs to
   */
  constructor(token: string, channelId: string) {
    this.rest = new REST({ version: "10" }).setToken(token);
    this.channelId = channelId;
  }

  /**
   * Sends a log entry to Discord as an embed.
   *
   * @param logEntry - The log entry to send
   * @returns Promise that resolves when the message is sent
   * @throws Error if the Discord API request fails
   */
  async sendLog(logEntry: LogEntry): Promise<void> {
    const embed = this.createEmbed(logEntry);

    try {
      await this.rest.post(Routes.channelMessages(this.channelId), {
        body: {
          embeds: [embed.toJSON()],
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to send log to Discord: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Creates a Discord embed from a log entry.
   *
   * @param logEntry - The log entry to convert to an embed
   * @returns The Discord embed builder
   */
  private createEmbed(logEntry: LogEntry): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(LOG_LEVEL_COLORS[logEntry.level])
      .setAuthor({
        name: logEntry.appName,
      })
      .setTitle(
        `${LOG_LEVEL_EMOJIS[logEntry.level]} ${logEntry.level.toUpperCase()}`
      )
      .setTimestamp(logEntry.timestamp);

    // Add the main message as a field
    embed.addFields({
      name: "Message",
      value: this.truncateText(logEntry.message, 1024),
      inline: false,
    });

    // Add location if provided
    if (logEntry.location) {
      embed.addFields({
        name: "Location",
        value: this.truncateText(logEntry.location, 1024),
        inline: false,
      });
    }

    // Add stack trace to description if available (descriptions allow more content)
    if (logEntry.stackTrace) {
      embed.setDescription(
        `\`\`\`js\n${this.truncateText(logEntry.stackTrace, 4096)}\n\`\`\``
      );
    }

    // Add additional fields (up to Discord's limit of 25 fields)
    if (logEntry.fields) {
      const fieldEntries = Object.entries(logEntry.fields);
      const maxFields = 25 - embed.data.fields!.length; // Account for already added fields

      for (let i = 0; i < Math.min(fieldEntries.length, maxFields); i++) {
        const [name, value] = fieldEntries[i];
        embed.addFields({
          name: this.truncateText(name, 256),
          value: this.truncateText(value, 1024),
          inline: false,
        });
      }
    }

    return embed;
  }

  /**
   * Truncates text to fit within Discord's field limits.
   *
   * @param text - The text to truncate
   * @param maxLength - The maximum allowed length
   * @returns The truncated text
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength - 3) + "...";
  }
}
