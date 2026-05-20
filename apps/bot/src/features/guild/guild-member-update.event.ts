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
 * Handles guild member update events.
 * Syncs member data when member information changes, across all linked Chronicles.
 */
class GuildMemberUpdateEvent extends DiscordEvent<Events.GuildMemberUpdate> {
  readonly eventName = Events.GuildMemberUpdate as const;
  override readonly once = false;

  async execute(
    _oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember
  ): Promise<void> {
    if (newMember.user.bot) return;

    try {
      if (newMember.partial) await newMember.fetch();

      const guildRepo = new DiscordGuildRepository();
      const linkRepo = new DiscordGuildChronicleRepository();
      const identityRepo = new DiscordIdentityRepository();
      const chronicleMemberRepo = new ChronicleMemberRepository();

      const discordGuild = await guildRepo.findById(newMember.guild.id);
      if (!discordGuild) return;

      const identity = await identityRepo.findByDiscordId(newMember.id);
      if (!identity) return;

      const links = await linkRepo.findByDiscordId(discordGuild.discordId);

      for (const link of links) {
        // Only update existing members across each linked chronicle
        await chronicleMemberRepo.update(
          {
            chronicleId: link.chronicleId,
            userId: identity.userId,
            nickname: newMember.displayName,
            avatarUrl: newMember.displayAvatarURL(),
            boosted: newMember.premiumSince ? 1 : 0,
          },
          { ignoreNotFound: true }
        );
      }
    } catch (error: unknown) {
      logger.exception(
        `Failed to handle member update for user ${newMember.id}`,
        error
      );
    }
  }
}

export default new GuildMemberUpdateEvent();
