import type { GuildMember, PartialGuildMember } from "discord.js";
import type { Snowflake } from "@realm/common";

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

      // Service handles deletion logic including existence check
      await memberRepository.delete(
        member.guild.id as Snowflake,
        member.user.id as Snowflake
      );
    } catch (error) {
      logger.exception(
        `Failed to handle member remove for user ${member.id}`,
        error
      );
    }
  },
};
