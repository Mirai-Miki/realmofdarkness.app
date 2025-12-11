import type { GuildMember, PartialGuildMember } from "discord.js";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import { MemberRepository } from "@realm/repositories";

module.exports = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member: GuildMember | PartialGuildMember) {
    if (member.user.bot) return;

    try {
      const memberRepository = new MemberRepository();

      // Check if member record exists
      const exists = await memberRepository.exists(member.guild.id, member.id);
      if (!exists) {
        return;
      }

      await memberRepository.delete(member.guild.id, member.id);

      logger.info(`Deleted member record for user`, {
        fields: {
          userId: member.id,
          guildId: member.guild.id,
        },
      });
    } catch (error) {
      logger.exception(
        `Failed to handle member remove for user ${member.id}`,
        error
      );
    }
  },
};
