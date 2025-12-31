import type { Guild as DiscordGuild } from "discord.js";

import { Events } from "discord.js";
import { GuildSyncAction } from "../actions";
import { ActivityService } from "../services";

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild: DiscordGuild) {
    ActivityService.update(guild.client);

    const guildSyncAction = new GuildSyncAction();
    await guildSyncAction.execute(guild);
  },
};
