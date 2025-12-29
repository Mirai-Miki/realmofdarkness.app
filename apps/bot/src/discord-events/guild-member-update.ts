import type { GuildMember, PartialGuildMember } from "discord.js";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import { MemberRepository } from "@realm/repositories";

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
      const memberService = new MemberService(logger, memberRepository);

      // Sync member with DTO
      await memberService.syncProfile({
        guildId: newMember.guild.id,
        userId: newMember.id,
        nickname: newMember.nickname || "",
        avatarUrl: newMember.displayAvatarURL(),
        admin: newMember.permissions.has("Administrator"),
        roleIds: Array.from(newMember.roles.cache.keys()),
      });
    } catch (error) {
      logger.exception(
        `Failed to handle member update for user ${newMember.id}`,
        error
      );
    }
  },
};
