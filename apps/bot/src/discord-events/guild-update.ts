import type { Guild as DiscordGuild } from "discord.js";

import { logger } from "@realm/logger";
import { GuildRepository } from "@realm/repositories";
import { GuildService } from "@realm/core";
import { Events } from "discord.js";
import { setActivity } from "utilities";

module.exports = {
  name: Events.GuildUpdate,
  once: false,
  async execute(oldGuild: DiscordGuild, newGuild: DiscordGuild) {
    await setActivity(newGuild.client);

    // Create guild service
    const guildRepository = new GuildRepository();
    const guildService = new GuildService(guildRepository);

    try {
      // Fetch current guild from database
      const guildEntity = await guildService.findById(newGuild.id);

      if (!guildEntity) {
        logger.warn(
          `Guild update received for unknown guild: ${newGuild.name}`,
          {
            fields: { guildId: newGuild.id },
          }
        );
        return;
      }

      // Update guild properties if they changed
      if (oldGuild.name !== newGuild.name) {
        guildEntity.updateName(newGuild.name);
        logger.debug(
          `Guild name updated: ${oldGuild.name} -> ${newGuild.name}`,
          {
            fields: { guildId: newGuild.id },
          }
        );
      }

      const newIconUrl = newGuild.iconURL() || "";
      if (oldGuild.iconURL() !== newIconUrl) {
        guildEntity.updateIconUrl(newIconUrl);
        logger.debug(`Guild icon updated`, {
          fields: { guildId: newGuild.id },
        });
      }

      // Save updated guild to database
      await guildService.update(guildEntity);

      logger.debug(`Guild updated: ${newGuild.name}`, {
        fields: { guildId: newGuild.id },
      });
    } catch (error) {
      logger.exception(
        `Failed to update guild ${newGuild.name} (${newGuild.id}):`,
        error
      );
    }
  },
};
