import type { Guild } from "discord.js";

import { logger } from "@realm/logger";
import { GuildRepository } from "@realm/repositories";
import { GuildService } from "@realm/core";
import { Events } from "discord.js";
import { setActivity } from "utilities";

module.exports = {
  name: Events.GuildDelete,
  once: false,
  async execute(guild: Guild) {
    await setActivity(guild.client);

    // Simple instantiation - repositories use singleton db internally
    const guildRepository = new GuildRepository();
    const guildService = new GuildService(guildRepository);

    try {
      await guildService.delete(guild.id);
    } catch (error) {
      logger.exception(`Failed to delete guild`, error);
    }
  },
};
