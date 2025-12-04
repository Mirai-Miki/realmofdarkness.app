import type { Guild as DiscordGuild } from "discord.js";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import { GuildRepository } from "@realm/repositories";
import { GuildService } from "@realm/core";
import { Guild as RealmGuild } from "@realm/core";
import { setActivity } from "utilities";

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild: DiscordGuild) {
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
      const now = new Date();
      const realmGuild = new RealmGuild({
        id: guild.id,
        name: guild.name,
        iconUrl: guild.iconURL() || "",
        trackerChannel: "",
        createdAt: now,
        lastUpdated: now,
      });

      // Save to database
      await guildService.create(realmGuild);

      logger.info(`Bot added to new guild: ${guild.name}`, {
        fields: { guildId: guild.id, memberCount: String(guild.memberCount) },
      });

      // TODO: Find all RealmUsers in this guild and create RealmMembers for them
    } catch (error) {
      logger.exception(
        `Failed to create guild ${guild.name} (${guild.id}):`,
        error
      );
    }
  },
};
