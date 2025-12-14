import type { Client } from "discord.js";

import { logger } from "@realm/logger";
import { GuildRepository } from "@realm/repositories";
import { GuildService } from "@realm/core";
import { Events } from "discord.js";
import { ActivityService } from "../services";
import { initializeEmojis } from "../utilities/emoji-manager";

/**
 * Discord ClientReady event handler.
 *
 * Executes once when the bot successfully connects to Discord.
 * Handles:
 * - Emoji initialization
 * - Syncing all guilds with database
 * - Setting up activity status updates
 */
module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    if (!client.user) {
      logger.error("Client ready event fired but client.user is undefined");
      return;
    }

    logger.info(`Bot logged in as ${client.user.tag}`, {
      fields: {
        userId: client.user.id,
        username: client.user.username,
        guildCount: client.guilds.cache.size.toString(),
      },
    });

    try {
      // Initialize dynamic emoji management
      logger.info("Loading application emojis...");
      await initializeEmojis(client);
      logger.info("Application emojis loaded successfully");
    } catch (error) {
      logger.exception("Failed to load application emojis", error);
    }

    try {
      // Sync all guilds with database
      logger.info("Syncing guilds with database...");
      await syncAllGuilds(client);
      logger.info(
        `Successfully synced ${client.guilds.cache.size} guilds with database`
      );
    } catch (error) {
      logger.exception("Failed to sync guilds", error);
    }

    // Update activity status
    ActivityService.update(client);

    // Set up periodic activity updates (every 5 minutes)
    setInterval(() => {
      ActivityService.update(client);
    }, 300000); // 5 minutes

    logger.info("Bot is ready and operational");
  },
};

/**
 * Sync all guilds the bot is in with the database.
 *
 * @param client - Discord client instance
 */
async function syncAllGuilds(client: Client): Promise<void> {
  const guildRepository = new GuildRepository();
  const guildService = new GuildService(logger, guildRepository);

  const guilds = Array.from(client.guilds.cache.values());

  for (const guild of guilds) {
    try {
      // Upsert guild (creates if new, updates name/icon if exists)
      await guildService.upsert({
        id: guild.id,
        name: guild.name,
        iconUrl: guild.iconURL() || "",
      });

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      logger.exception(
        `Failed to sync guild ${guild.name} (${guild.id})`,
        error
      );
    }
  }
}
