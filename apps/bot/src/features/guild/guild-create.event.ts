import type { Guild as DiscordGuild } from "discord.js";

import { Events, SnowflakeUtil } from "discord.js";
import { DiscordEvent } from "framework";
import { GuildSyncAction } from "./guild-sync.action";
import { ActivityService } from "../core/activity.service";
import { logger } from "@realm/logger";
import {
  DiscordGuildRepository,
  DiscordGuildChronicleRepository,
  ChronicleRepository,
} from "@realm/repositories";

/**
 * Handles guild create events.
 * Syncs guild data when bot joins a new guild.
 * Automatically creates a default Chronicle for the new guild if one doesn't exist.
 */
class GuildCreateEvent extends DiscordEvent<Events.GuildCreate> {
  readonly eventName = Events.GuildCreate as const;
  override readonly once = false;

  private guildRepository = new DiscordGuildRepository();
  private chronicleRepository = new ChronicleRepository();
  private linkRepository = new DiscordGuildChronicleRepository();

  async execute(guild: DiscordGuild): Promise<void> {
    ActivityService.update(guild.client);

    try {
      // 1. Check if the Guild is already tracked
      const isTracked = await this.guildRepository.exists(guild.id);

      if (!isTracked) {
        logger.info(
          `New guild joined: ${guild.name} (${guild.id}). Setting up default Chronicle.`
        );

        // 2. Upsert the Guild
        await this.guildRepository.upsert({
          discordId: guild.id,
          name: guild.name,
          iconUrl: guild.iconURL() || "",
        });

        // 3. Create a default Chronicle
        // Use discord.js SnowflakeUtil to generate a valid snowflake for the new Chronicle
        const chronicleId = SnowflakeUtil.generate().toString();
        await this.chronicleRepository.create({
          id: chronicleId,
          name: guild.name, // Use guild name as default chronicle name per user request
          iconUrl: guild.iconURL() || "",
        });

        // 4. Link the Guild to the new Chronicle
        await this.linkRepository.link({
          discordId: guild.id,
          chronicleId: chronicleId,
        });

        logger.info(
          `Successfully created and linked default Chronicle (${chronicleId}) for guild ${guild.id}`
        );
      }
    } catch (error) {
      logger.exception(`Failed to setup new guild ${guild.name}`, error);
    }

    // 5. Sync Members
    const guildSyncAction = new GuildSyncAction();
    await guildSyncAction.execute(guild);
  }
}

export default new GuildCreateEvent();
