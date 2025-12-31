import type { Guild as DiscordGuild } from "discord.js";
import type { Snowflake } from "@realm/common";

import { logger } from "@realm/logger";
import { GuildRepository } from "@realm/repositories";
import { GuildRepositoryInputSchema } from "@realm/common";
import { Events } from "discord.js";

module.exports = {
  name: Events.GuildUpdate,
  once: false,
  async execute(oldGuild: DiscordGuild, newGuild: DiscordGuild) {
    // Instantiate repository and service
    const guildRepository = new GuildRepository();

    try {
      logger.debug(`Guild updated: ${newGuild.name} (${newGuild.id})`);
      const validatedData = GuildRepositoryInputSchema.parse({
        id: newGuild.id as Snowflake,
        name: newGuild.name,
        iconUrl: newGuild.iconURL() || "",
      });
      // Upsert updated guild data (updates name/icon, creates if missing)
      await guildRepository.upsert(validatedData);
    } catch (error) {
      logger.exception(
        `Failed to update guild ${newGuild.name} (${newGuild.id}):`,
        error
      );
    }
  },
};
