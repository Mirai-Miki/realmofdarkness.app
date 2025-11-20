import type { Guild } from "discord.js";

import { Events } from "discord.js";
import { setActivity } from "utilities";
import { GuildDeleteService } from "services";
import { logger } from "@realm/core/logger";

module.exports = {
  name: Events.GuildDelete,
  once: false,
  async execute(guild: Guild) {
    await setActivity(guild.client);

    try {
      await GuildDeleteService.execute(guild);
    } catch (error) {
      logger.exception(`Failed to delete guild ${guild.id}:`, error, {
        location: "bot/src/events/guild-delete.ts",
      });
    }
  },
};
