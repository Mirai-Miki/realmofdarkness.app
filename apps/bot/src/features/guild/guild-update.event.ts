import type { Guild as DiscordGuild } from "discord.js";

import { Events } from "discord.js";
import { DiscordEvent } from "framework";
import { logger } from "@realm/logger";
import { DiscordGuildRepository } from "@realm/repositories";

/**
 * Handles guild update events.
 * Syncs guild data when guild information changes.
 */
class GuildUpdateEvent extends DiscordEvent<Events.GuildUpdate> {
  readonly eventName = Events.GuildUpdate as const;
  override readonly once = false;

  async execute(oldGuild: DiscordGuild, newGuild: DiscordGuild): Promise<void> {
    // Instantiate repository and service
    const guildRepository = new DiscordGuildRepository();

    try {
      logger.debug(`Guild updated: ${newGuild.name} (${newGuild.id})`);
      const existingGuild = await guildRepository.findById(newGuild.id);
      if (!existingGuild) {
        return; // Guild is not tracked, do not update
      }

      // Update existing guild data (updates name/icon, does NOT create if missing because chronicleId is required)
      await guildRepository.update(
        {
          discordId: newGuild.id,
          chronicleId: existingGuild.chronicleId,
          name: newGuild.name,
          iconUrl: newGuild.iconURL() || "",
        },
        { ignoreNotFound: true }
      );
    } catch (error) {
      logger.exception(
        `Failed to update guild ${newGuild.name} (${newGuild.id}):`,
        error
      );
    }
  }
}

export default new GuildUpdateEvent();
