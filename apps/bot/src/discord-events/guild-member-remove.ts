import type { GuildMember, PartialGuildMember } from "discord.js";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import {
  MemberRepository,
  SupporterRepository,
  UserRepository,
} from "@realm/repositories";
import { MemberService } from "@realm/core";

module.exports = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member: GuildMember | PartialGuildMember) {
    if (member.user.bot) return;

    try {
      const memberRepository = new MemberRepository();
      const supporterRepository = new SupporterRepository();
      const userRepository = new UserRepository();

      const memberService = new MemberService(
        memberRepository,
        supporterRepository,
        userRepository
      );

      // Service handles deletion logic including existence check or idempotency
      await memberService.delete(member.guild.id, member.id);
    } catch (error) {
      logger.exception(
        `Failed to handle member remove for user ${member.id}`,
        error
      );
    }
  },
};
