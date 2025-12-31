import type { GuildMember, PartialGuildMember } from "discord.js";
import { PermissionFlagsBits } from "discord.js";
import type { Snowflake } from "@realm/common";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import { MemberRepository } from "@realm/repositories";
import { MemberRepositoryInputSchema } from "@realm/common";

module.exports = {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember
  ) {
    if (newMember.user.bot) return;

    try {
      if (newMember.partial) await newMember.fetch();

      // Instantiate repository and service
      const memberRepository = new MemberRepository();

      const validatedData = MemberRepositoryInputSchema.parse({
        guildId: newMember.guild.id as Snowflake,
        userId: newMember.id as Snowflake,
        nickname: newMember.displayName,
        avatarUrl: newMember.displayAvatarURL(),
        admin: newMember.permissions.has(PermissionFlagsBits.Administrator),
        roleIds: Array.from(newMember.roles.cache.keys()) as Snowflake[],
      });

      // Only update existing members
      await memberRepository.update(validatedData, { ignoreNotFound: true });
    } catch (error) {
      logger.exception(
        `Failed to handle member update for user ${newMember.id}`,
        error
      );
    }
  },
};
