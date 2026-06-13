import type { Guild as DiscordGuild } from "discord.js";

import { Events } from "discord.js";
import { DiscordEvent } from "framework";
import { CreateGuildAction } from "./create-guild.action";
import { ActivityService } from "../core/activity.service";
import { logger } from "@realm/logger";

/**
 * Handles guild create events.
 * Triggered when the bot joins a new guild.
 * delegates the guild creation and default Chronicle setup to CreateGuildAction.
 */
class GuildCreateEvent extends DiscordEvent<Events.GuildCreate> {
  readonly eventName = Events.GuildCreate as const;
  override readonly once = false;

  async execute(guild: DiscordGuild): Promise<void> {
    ActivityService.update(guild.client);

    try {
      const createGuildAction = new CreateGuildAction();
      await createGuildAction.execute(guild);
    } catch (error) {
      // This is fatal and will cause a cascade of issues when trying to perform operations in that guild
      logger.fatal(`Failed to setup new guild ${guild.name}`, { error });
    }
  }
}

export default new GuildCreateEvent();
