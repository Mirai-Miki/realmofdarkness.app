import type { Guild } from "discord.js";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import { GuildRepository } from "@realm/repositories";
import { GuildService } from "@realm/core";
import { Guild as RealmGuild } from "@realm/core";
import { setActivity } from "utilities";

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild: Guild) {
    await setActivity(guild.client);

    // Create guild service
    const guildRepository = new GuildRepository();
    const guildService = new GuildService(guildRepository);

    try {
      // Check if guild already exists
      const exists = await guildService.exists(guild.id);

      if (exists) {
        logger.info(`Bot re-added to existing guild: ${guild.name}`, {
          fields: { guildId: guild.id },
        });
        return;
      }

      // Create new guild entity
      const realmGuild = new RealmGuild({
        id: guild.id,
        name: guild.name,
        iconUrl: guild.iconURL() || "",
        trackerChannel: "",
      });

      // Save to database
      await guildService.create(realmGuild);

      logger.info(`Bot added to new guild: ${guild.name}`, {
        fields: { guildId: guild.id, memberCount: guild.memberCount },
      });

      // TODO: Update all existing guild members to create member relations
      // This will be implemented when member management is added
    } catch (error) {
      logger.exception(
        `Failed to create guild ${guild.name} (${guild.id}):`,
        error
      );
    }
  },
};
