import type { GuildMember as DiscordGuildMember } from "discord.js";

import { Events, PermissionFlagsBits } from "discord.js";
import { DiscordEvent } from "framework";
import { logger } from "@realm/logger";
import { MemberRepository, UserRepository } from "@realm/repositories";
import { MemberRepositoryInputSchema } from "@realm/common";

/**
 * Handles guild member add events.
 * Creates member records for registered users joining guilds.
 */
class GuildMemberAddEvent extends DiscordEvent<Events.GuildMemberAdd> {
  readonly eventName = Events.GuildMemberAdd as const;
  override readonly once = false;

  async execute(member: DiscordGuildMember): Promise<void> {
    if (member.user.bot) return;

    try {
      if (member.partial) await member.fetch();

      // Instantiate repository and service
      const memberRepository = new MemberRepository();
      const userRepository = new UserRepository();

      const exists = await userRepository.exists(member.user.id);

      if (!exists) {
        // We don't create members for users that don't exist in our DB
        return;
      }

      // Create member with DTO

      const validatedData = MemberRepositoryInputSchema.parse({
        guildId: member.guild.id,
        userId: member.id,
        nickname: member.displayName,
        avatarUrl: member.displayAvatarURL(),
        admin: member.permissions.has(PermissionFlagsBits.Administrator),
        roleIds: Array.from(member.roles.cache.keys()),
        boosted: 0,
      });

      await memberRepository.create(validatedData);
    } catch (error) {
      logger.exception(
        `Failed to handle member add for user ${member.id}`,
        error
      );
    }
  }
}

export default new GuildMemberAddEvent();
