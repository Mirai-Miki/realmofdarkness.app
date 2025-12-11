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

      const memberRepository = new MemberRepository();

      // Check if we are tracking this member
      const member = await memberRepository.findByGuildAndUser(
        newMember.guild.id,
        newMember.id
      );
      if (!member) {
        return;
      }

      // Update fields
      // TODO: Sync storyteller status based on configured roles
      // But we do sync admin status from Discord permissions

      let hasChanges = false;

      // Sync Admin status
      const isAdmin = newMember.permissions.has("Administrator");
      if (member.admin !== isAdmin) {
        if (isAdmin) member.grantAdmin();
        else member.revokeAdmin();
        hasChanges = true;
      }

      // Sync Boost status
      const isBoosted = newMember.premiumSince !== null;
      if (member.boosted !== isBoosted) {
        if (isBoosted) member.markAsBoosted();
        else member.markAsNotBoosted();
        hasChanges = true;
      }

      // Sync Nickname
      const nickname = newMember.nickname || "";
      if (member.nickname !== nickname) {
        member.setNickname(nickname);
        hasChanges = true;
      }

      // Sync Avatar
      const avatarUrl = newMember.displayAvatarURL();
      if (member.avatarUrl !== avatarUrl) {
        member.setAvatarUrl(avatarUrl);
        hasChanges = true;
      }

      if (hasChanges) {
        await memberRepository.update(member);
        logger.debug(`Updated member record`, {
          fields: {
            userId: newMember.id,
            guildId: newMember.guild.id,
          },
        });
      }
    } catch (error) {
      logger.exception(
        `Failed to handle member update for user ${newMember.id}`,
        error
      );
    }
  },
};
