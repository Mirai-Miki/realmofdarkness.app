import type { GuildMember as DiscordGuildMember } from "discord.js";

import { Events } from "discord.js";
import { DiscordEvent } from "framework";
import { logger } from "@realm/logger";
import {
  DiscordGuildChronicleRepository,
  ChronicleMemberRepository,
  UserRepository,
} from "@realm/repositories";

/**
 * Handles guild member add events.
 * Creates member records for registered users joining guilds across all linked Chronicles.
 */
class GuildMemberAddEvent extends DiscordEvent<Events.GuildMemberAdd> {
  readonly eventName = Events.GuildMemberAdd as const;
  override readonly once = false;

  async execute(member: DiscordGuildMember): Promise<void> {
    if (member.user.bot) return;

    try {
      if (member.partial) await member.fetch();

      const linkRepo = new DiscordGuildChronicleRepository();
      const userRepo = new UserRepository();
      const chronicleMemberRepo = new ChronicleMemberRepository();

      const user = await userRepo.findByDiscordId(member.id);
      if (!user) {
        // We don't create members for users that don't exist in our DB
        return;
      }

      const links = await linkRepo.findByDiscordId(member.guild.id);

      for (const link of links) {
        await chronicleMemberRepo.upsert({
          chronicleId: link.chronicleId,
          userId: user.id,
          nickname: member.displayName,
          avatarUrl: member.displayAvatarURL(),
        });
      }
    } catch (error: unknown) {
      logger.exception(
        `Failed to handle member add for user ${member.id}`,
        error
      );
    }
  }
}

export default new GuildMemberAddEvent();
