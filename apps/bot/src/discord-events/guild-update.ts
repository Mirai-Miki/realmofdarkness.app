import type { Guild as DiscordGuild } from "discord.js";

import { logger } from "@realm/logger";
import { GuildRepository } from "@realm/repositories";
import { Events } from "discord.js";

module.exports = {
  name: Events.GuildUpdate,
  once: false,
  async execute(oldGuild: DiscordGuild, newGuild: DiscordGuild) {
    // Instantiate repository and service
    const guildRepository = new GuildRepository();

    try {
      logger.debug(`Guild updated: ${newGuild.name} (${newGuild.id})`);
      // Upsert updated guild data (updates name/icon, creates if missing)
      await guildRepository.upsert({
        id: newGuild.id,
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
