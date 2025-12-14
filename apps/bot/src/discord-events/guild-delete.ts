import type { Guild as DiscordGuild } from "discord.js";

import { logger } from "@realm/logger";
import { GuildRepository } from "@realm/repositories";
import { GuildService } from "@realm/core";
import { Events } from "discord.js";
import { ActivityService } from "services";

module.exports = {
  name: Events.GuildDelete,
  once: false,
  async execute(guild: DiscordGuild) {
    ActivityService.update(guild.client);

    // Instantiate repository and service
    const guildRepository = new GuildRepository();
    const guildService = new GuildService(logger, guildRepository);

    try {
      await guildService.delete(guild.id);

      logger.info(
        `Guild deleted and members cleaned up: ${guild.name} (${guild.id})`
      );
    } catch (error) {
      logger.exception(`Failed to delete guild or cleanup members`, error);
    }
  },
};
