import type { GuildMember as DiscordGuildMember } from "discord.js";
import type { Snowflake } from "@realm/common";

import { Events, PermissionFlagsBits } from "discord.js";
import { logger } from "@realm/logger";
import { MemberRepository, UserRepository } from "@realm/repositories";
import { MemberRepositoryInputSchema } from "@realm/common";

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: DiscordGuildMember) {
    if (member.user.bot) return;

    try {
      if (member.partial) await member.fetch();

      // Instantiate repository and service
      const memberRepository = new MemberRepository();
      const userRepository = new UserRepository();

      const exists = await userRepository.exists(member.user.id as Snowflake);

      if (!exists) {
        // We don't create members for users that don't exist in our DB
        return;
      }

      // Create member with DTO

      const validatedData = MemberRepositoryInputSchema.parse({
        guildId: member.guild.id as Snowflake,
        userId: member.id as Snowflake,
        nickname: member.displayName,
        avatarUrl: member.displayAvatarURL(),
        admin: member.permissions.has(PermissionFlagsBits.Administrator),
        roleIds: Array.from(member.roles.cache.keys()) as Snowflake[],
        boosted: 0,
      });

      await memberRepository.create(validatedData);
    } catch (error) {
      logger.exception(
        `Failed to handle member add for user ${member.id}`,
        error
      );
    }
  },
};
