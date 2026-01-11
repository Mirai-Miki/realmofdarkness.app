import type { GuildMember, PartialGuildMember } from "discord.js";

import { Events, PermissionFlagsBits } from "discord.js";
import { DiscordEvent } from "framework";
import { logger } from "@realm/logger";
import { MemberRepository } from "@realm/repositories";
import { MemberRepositoryInputSchema } from "@realm/common";

/**
 * Handles guild member update events.
 * Syncs member data when member information changes.
 */
class GuildMemberUpdateEvent extends DiscordEvent<Events.GuildMemberUpdate> {
  readonly eventName = Events.GuildMemberUpdate as const;
  override readonly once = false;

  async execute(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember
  ): Promise<void> {
    if (newMember.user.bot) return;

    try {
      if (newMember.partial) await newMember.fetch();

      // Instantiate repository and service
      const memberRepository = new MemberRepository();

      const validatedData = MemberRepositoryInputSchema.parse({
        guildId: newMember.guild.id,
        userId: newMember.id,
        nickname: newMember.displayName,
        avatarUrl: newMember.displayAvatarURL(),
        admin: newMember.permissions.has(PermissionFlagsBits.Administrator),
        roleIds: Array.from(newMember.roles.cache.keys()),
      });

      // Only update existing members
      await memberRepository.update(validatedData, { ignoreNotFound: true });
    } catch (error) {
      logger.exception(
        `Failed to handle member update for user ${newMember.id}`,
        error
      );
    }
  }
}

export default new GuildMemberUpdateEvent();
