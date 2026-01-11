import type { Guild as DiscordGuild } from "discord.js";

import { Events } from "discord.js";
import { DiscordEvent } from "framework";
import { logger } from "@realm/logger";
import { GuildRepository } from "@realm/repositories";
import { GuildRepositoryInputSchema } from "@realm/common";

/**
 * Handles guild update events.
 * Syncs guild data when guild information changes.
 */
class GuildUpdateEvent extends DiscordEvent<Events.GuildUpdate> {
  readonly eventName = Events.GuildUpdate as const;
  override readonly once = false;

  async execute(oldGuild: DiscordGuild, newGuild: DiscordGuild): Promise<void> {
    // Instantiate repository and service
    const guildRepository = new GuildRepository();

    try {
      logger.debug(`Guild updated: ${newGuild.name} (${newGuild.id})`);
      const validatedData = GuildRepositoryInputSchema.parse({
        id: newGuild.id,
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
  }
}

export default new GuildUpdateEvent();
