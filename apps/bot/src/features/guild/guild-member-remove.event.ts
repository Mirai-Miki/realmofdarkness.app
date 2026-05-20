import type { GuildMember, PartialGuildMember } from "discord.js";

import { Events } from "discord.js";
import { DiscordEvent } from "framework";
import { logger } from "@realm/logger";
import {
  DiscordGuildRepository,
  ChronicleMemberRepository,
  DiscordIdentityRepository,
} from "@realm/repositories";

/**
 * Handles guild member remove events.
 * Removes member records when members leave guilds.
 */
class GuildMemberRemoveEvent extends DiscordEvent<Events.GuildMemberRemove> {
  readonly eventName = Events.GuildMemberRemove as const;
  override readonly once = false;

  async execute(member: GuildMember | PartialGuildMember): Promise<void> {
    if (member.user.bot) return;

    try {
      // Instantiate repository and service
      const guildRepo = new DiscordGuildRepository();
      const identityRepo = new DiscordIdentityRepository();
      const chronicleMemberRepo = new ChronicleMemberRepository();

      const discordGuild = await guildRepo.findById(member.guild.id);
      if (!discordGuild) return;

      const identity = await identityRepo.findByDiscordId(member.id);
      if (!identity) return;

      // Service handles deletion logic including existence check
      await chronicleMemberRepo.delete(
        discordGuild.chronicleId,
        identity.userId
      );
    } catch (error) {
      logger.exception(
        `Failed to handle member remove for user ${member.id}`,
        error
      );
    }
  }
}

export default new GuildMemberRemoveEvent();
