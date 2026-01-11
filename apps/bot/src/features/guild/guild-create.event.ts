import type { Guild as DiscordGuild } from "discord.js";

import { Events } from "discord.js";
import { DiscordEvent } from "framework";
import { GuildSyncAction } from "./guild-sync.action";
import { ActivityService } from "../core/activity.service";

/**
 * Handles guild create events.
 * Syncs guild data when bot joins a new guild.
 */
class GuildCreateEvent extends DiscordEvent<Events.GuildCreate> {
  readonly eventName = Events.GuildCreate as const;
  override readonly once = false;

  async execute(guild: DiscordGuild): Promise<void> {
    ActivityService.update(guild.client);

    const guildSyncAction = new GuildSyncAction();
    await guildSyncAction.execute(guild);
  }
}

export default new GuildCreateEvent();
