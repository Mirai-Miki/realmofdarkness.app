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
      // Instantiate repository and service
      const memberRepository = new MemberRepository();
      const memberService = new MemberService(logger, memberRepository);

      // Service handles deletion logic including existence check
      await memberService.delete({
        guildId: member.guild.id,
        userId: member.id,
      });
    } catch (error) {
      logger.exception(
        `Failed to handle member remove for user ${member.id}`,
        error
      );
    }
  },
};
