import type { GuildMember as DiscordGuildMember } from "discord.js";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import {
  UserRepository,
  MemberRepository,
  SupporterRepository,
} from "@realm/repositories";
import { MemberService } from "@realm/core";

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: DiscordGuildMember) {
    if (member.user.bot) return;

    try {
      if (member.partial) await member.fetch();

      // Instantiate services
      const userRepository = new UserRepository();
      // UserService not strictly needed if we assume MemberService handles user checks or if we trust addMember
      // But addMember calls userService.exists(userId) so it needs IUserRepository.
      // We pass userRepository to MemberService.

      const memberRepository = new MemberRepository();
      const supporterRepository = new SupporterRepository();
      const memberService = new MemberService(
        memberRepository,
        supporterRepository,
        userRepository
      );

      await memberService.create(member.guild.id, member.id, {
        nickname: member.nickname || "",
        avatarUrl: member.displayAvatarURL(),
        admin: member.permissions.has("Administrator"),
      });
    } catch (error) {
      logger.exception(
        `Failed to handle member add for user ${member.id}`,
        error
      );
    }
  },
};
