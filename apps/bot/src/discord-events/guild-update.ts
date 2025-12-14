import type { Guild as DiscordGuild } from "discord.js";

import { logger } from "@realm/logger";
import { GuildRepository } from "@realm/repositories";
import { GuildService } from "@realm/core";
import { Events } from "discord.js";

module.exports = {
  name: Events.GuildUpdate,
  once: false,
  async execute(oldGuild: DiscordGuild, newGuild: DiscordGuild) {
    // Instantiate repository and service
    const guildRepository = new GuildRepository();
    const guildService = new GuildService(logger, guildRepository);

    try {
      // Just pass the new data to service - it handles checking and updating
      await guildService.update(newGuild.id, {
        name: newGuild.name,
        iconUrl: newGuild.iconURL() || "",
      });
    } catch (error) {
      logger.exception(
        `Failed to update guild ${newGuild.name} (${newGuild.id}):`,
        error
      );
    }
  },
};
