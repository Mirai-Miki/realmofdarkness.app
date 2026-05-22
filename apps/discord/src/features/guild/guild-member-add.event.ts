import type { GuildMember as DiscordGuildMember } from "discord.js";

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
 * Handles guild member add events.
 * Creates member records for registered users joining guilds across all linked Chronicles.
 */
class GuildMemberAddEvent extends DiscordEvent<Events.GuildMemberAdd> {
  readonly eventName = Events.GuildMemberAdd as const;
  override readonly once = false;

  async execute(member: DiscordGuildMember): Promise<void> {
    if (member.user.bot) return;

    try {
      if (member.partial) await member.fetch();

      const guildRepo = new DiscordGuildRepository();
      const linkRepo = new DiscordGuildChronicleRepository();
      const identityRepo = new DiscordIdentityRepository();
      const chronicleMemberRepo = new ChronicleMemberRepository();

      const discordGuild = await guildRepo.findById(member.guild.id);

      if (!discordGuild) {
        // We don't create members for guilds that aren't tracked
        return;
      }

      const identity = await identityRepo.findByDiscordId(member.id);

      if (!identity) {
        // We don't create members for users that don't exist in our DB
        return;
      }

      const links = await linkRepo.findByDiscordId(discordGuild.discordId);

      for (const link of links) {
        await chronicleMemberRepo.upsert({
          chronicleId: link.chronicleId,
          userId: identity.userId,
          nickname: member.displayName,
          avatarUrl: member.displayAvatarURL(),
          boosted: member.premiumSince ? 1 : 0,
        });
      }
    } catch (error: unknown) {
      logger.exception(
        `Failed to handle member add for user ${member.id}`,
        error
      );
    }
  }
}

export default new GuildMemberAddEvent();
