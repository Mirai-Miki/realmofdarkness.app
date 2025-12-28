import type { LogEntry } from "./logger.types";

import { EmbedBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { LogLevel } from "@realm/common";
import { getLogLevelName, prettyPrintIfJson } from "./logger.utils";

/**
 * Maps log levels to Discord embed colors.
 */
const LOG_LEVEL_COLORS: Record<LogLevel, number> = {
  [LogLevel.Debug]: 0x9ca3af, // Gray-400
  [LogLevel.Info]: 0x3b82f6, // Blue-500
  [LogLevel.Warn]: 0xf59e0b, // Amber-500
  [LogLevel.Error]: 0xef4444, // Red-500
  [LogLevel.Fatal]: 0x7c2d12, // Red-900
} as const;

/**
 * Maps log levels to emoji indicators.
 */
const LOG_LEVEL_EMOJIS: Record<LogLevel, string> = {
  [LogLevel.Debug]: "🐛",
  [LogLevel.Info]: "ℹ️",
  [LogLevel.Warn]: "⚠️",
  [LogLevel.Error]: "❌",
  [LogLevel.Fatal]: "💀",
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
  public async sendLog(logEntry: LogEntry): Promise<void> {
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
      });

    let title = `${LOG_LEVEL_EMOJIS[logEntry.level]} ${getLogLevelName(logEntry.level).toUpperCase()}`;
    embed.setTimestamp(logEntry.timestamp);

    // Set description based on whether we have a stack trace. If the
    // message or stack contains JSON, pretty-print it for readability.
    if (logEntry.stackTrace) {
      const pretty = prettyPrintIfJson(logEntry.stackTrace);

      embed.setDescription(
        `\`\`\`json\n${this.truncateText(pretty, 4096)}\n\`\`\``
      );
      title += ` - ${logEntry.message}`;
    } else {
      const pretty = prettyPrintIfJson(logEntry.message);
      embed.setDescription(this.truncateText(pretty, 4096));
    }
    embed.setTitle(this.truncateText(title, 1024));

    // Add location if provided
    if (logEntry.location) {
      embed.addFields({
        name: "Location",
        value: `\`\`\`${this.truncateText(logEntry.location, 1024)}\`\`\``,
        inline: false,
      });
    }

    // Add additional fields (up to Discord's limit of 25 fields)
    if (logEntry.fields) {
      const fieldEntries = Object.entries(logEntry.fields);
      const maxFields = 25 - embed.data.fields!.length; // Account for already added fields

      for (let i = 0; i < Math.min(fieldEntries.length, maxFields); i++) {
        const [name, value] = fieldEntries[i];
        // If the field value is JSON, pretty-print it inside a code block.
        const prettyValue = prettyPrintIfJson(value);
        const fieldValue =
          prettyValue !== value
            ? `\`\`\`json\n${this.truncateText(prettyValue, 1016)}\n\`\`\``
            : this.truncateText(value, 1024);

        embed.addFields({
          name: this.truncateText(name, 256),
          value: fieldValue,
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
