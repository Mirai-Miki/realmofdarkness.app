import type { Client } from "discord.js";

import { logger } from "@realm/logger";
import { Events } from "discord.js";
import { GuildSyncAction } from "../actions";
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

      const guildSyncAction = new GuildSyncAction();
      await guildSyncAction.execute(client.guilds.cache);

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
