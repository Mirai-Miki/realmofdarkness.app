import type { GuildMember, PartialGuildMember } from "discord.js";

import { Events } from "discord.js";
import { DiscordEvent } from "framework";
import { logger } from "@realm/logger";
import {
  DiscordGuildRepository,
  DiscordGuildChronicleRepository,
  ChronicleMemberRepository,
  DiscordIdentityRepository,
} from "@realm/repositories";

/**
 * Handles guild member remove events.
 * Removes member records when members leave guilds, across all linked Chronicles.
 */
class GuildMemberRemoveEvent extends DiscordEvent<Events.GuildMemberRemove> {
  readonly eventName = Events.GuildMemberRemove as const;
  override readonly once = false;

  async execute(member: GuildMember | PartialGuildMember): Promise<void> {
    if (member.user.bot) return;

    try {
      const guildRepo = new DiscordGuildRepository();
      const linkRepo = new DiscordGuildChronicleRepository();
      const identityRepo = new DiscordIdentityRepository();
      const chronicleMemberRepo = new ChronicleMemberRepository();

      const discordGuild = await guildRepo.findById(member.guild.id);
      if (!discordGuild) return;

      const identity = await identityRepo.findByDiscordId(member.id);
      if (!identity) return;

      const links = await linkRepo.findByDiscordId(discordGuild.discordId);

      for (const link of links) {
        // Remove the member from each chronicle this guild is linked to
        await chronicleMemberRepo.delete(link.chronicleId, identity.userId);
      }
    } catch (error: unknown) {
      logger.exception(
        `Failed to handle member remove for user ${member.id}`,
        error
      );
    }
  }
}

export default new GuildMemberRemoveEvent();
