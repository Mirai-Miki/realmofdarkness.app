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
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember
  ) {
    if (newMember.user.bot) return;

    try {
      if (newMember.partial) await newMember.fetch();

      const memberRepository = new MemberRepository();
      const supporterRepository = new SupporterRepository();
      const userRepository = new UserRepository();

      const memberService = new MemberService(
        memberRepository,
        supporterRepository,
        userRepository
      );

      await memberService.syncMember(newMember.guild.id, newMember.id, {
        nickname: newMember.nickname || "",
        avatarUrl: newMember.displayAvatarURL(),
        admin: newMember.permissions.has("Administrator"),
      });
    } catch (error) {
      logger.exception(
        `Failed to handle member update for user ${newMember.id}`,
        error
      );
    }
  },
};
