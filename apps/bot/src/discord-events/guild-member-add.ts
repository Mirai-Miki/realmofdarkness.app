import type { GuildMember as DiscordGuildMember } from "discord.js";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import { MemberRepository } from "@realm/repositories";
import { MemberService } from "@realm/core";

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: DiscordGuildMember) {
    if (member.user.bot) return;

    try {
      if (member.partial) await member.fetch();

      // Instantiate repository and service
      const memberRepository = new MemberRepository();
      const memberService = new MemberService(logger, memberRepository);

      // Create member with DTO
      await memberService.create({
        guildId: member.guild.id,
        userId: member.id,
        nickname: member.nickname || "",
        avatarUrl: member.displayAvatarURL(),
        admin: member.permissions.has("Administrator"),
        roleIds: Array.from(member.roles.cache.keys()),
        boosted: 0,
      });
    } catch (error) {
      logger.exception(
        `Failed to handle member add for user ${member.id}`,
        error
      );
    }
  },
};
