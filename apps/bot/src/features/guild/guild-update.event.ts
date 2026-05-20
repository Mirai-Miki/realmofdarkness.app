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

  async execute(
    _oldGuild: DiscordGuild,
    newGuild: DiscordGuild
  ): Promise<void> {
    const guildRepository = new DiscordGuildRepository();

    try {
      logger.debug(`Guild updated: ${newGuild.name} (${newGuild.id})`);
      const exists = await guildRepository.exists(newGuild.id);
      if (!exists) {
        return; // Guild is not tracked, do not update
      }

      // Update existing guild name and icon only
      await guildRepository.update(
        {
          discordId: newGuild.id,
          name: newGuild.name,
          iconUrl: newGuild.iconURL() || "",
        },
        { ignoreNotFound: true }
      );
    } catch (error: unknown) {
      logger.exception(
        `Failed to update guild ${newGuild.name} (${newGuild.id}):`,
        error
      );
    }
  }
}

export default new GuildUpdateEvent();
