import type { GuildMember as DiscordGuildMember } from "discord.js";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import { UserRepository, MemberRepository } from "@realm/repositories";
import { Member as AppMember } from "@realm/core";

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: DiscordGuildMember) {
    if (member.user.bot) return;

    try {
      if (member.partial) await member.fetch();

      const userRepository = new UserRepository();
      const memberRepository = new MemberRepository();

      // Check if user is registered in our system
      const userExists = await userRepository.exists(member.id);
      if (!userExists) {
        return;
      }

      // Check if member record already exists (sanity check)
      const memberExists = await memberRepository.exists(
        member.guild.id,
        member.id
      );
      if (memberExists) {
        logger.debug(
          `Member record already exists for user ${member.id} in guild ${member.guild.id}`
        );
        return;
      }

      const now = new Date();
      const newMember = new AppMember({
        guildId: member.guild.id,
        userId: member.id,
        admin: member.permissions.has("Administrator"),
        storyteller: false, // TODO: Check against configured storyteller roles in DB
        boosted: false,
        nickname: member.nickname || "",
        avatarUrl: member.displayAvatarURL(),
        createdAt: now,
        lastUpdated: now,
      });

      await memberRepository.create(newMember);

      logger.info(`Created member record for registered user`, {
        fields: {
          userId: member.id,
          guildId: member.guild.id,
          username: member.user.username,
        },
      });
    } catch (error) {
      logger.exception(
        `Failed to handle member add for user ${member.id}`,
        error
      );
    }
  },
};
