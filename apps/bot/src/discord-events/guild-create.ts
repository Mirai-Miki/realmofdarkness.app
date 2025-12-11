import type { Guild as DiscordGuild } from "discord.js";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import {
  GuildRepository,
  UserRepository,
  MemberRepository,
  SupporterRepository,
} from "@realm/repositories";
import {
  GuildService,
  UserService,
  MemberService,
  Guild as AppGuild,
} from "@realm/core";
import { ActivityService } from "services";

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild: DiscordGuild) {
    ActivityService.update(guild.client);

    // Create services
    const guildRepository = new GuildRepository();
    const guildService = new GuildService(guildRepository);

    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);

    const memberRepository = new MemberRepository();
    const supporterRepository = new SupporterRepository();
    const memberService = new MemberService(
      memberRepository,
      supporterRepository,
      userRepository
    );

    try {
      // Check if guild already exists
      const exists = await guildService.exists(guild.id);

      if (exists) {
        logger.info(`Bot re-added to existing guild: ${guild.name}`, {
          fields: { guildId: guild.id },
        });
        return;
      }

      // Create new guild entity
      const now = new Date();
      const realmGuild = new AppGuild({
        id: guild.id,
        name: guild.name,
        iconUrl: guild.iconURL() || "",
        trackerChannel: "",
        createdAt: now,
        lastUpdated: now,
      });

      // Save to database
      await guildService.create(realmGuild);

      logger.info(`Bot added to new guild: ${guild.name}`, {
        fields: { guildId: guild.id, memberCount: String(guild.memberCount) },
      });

      // Find all AppUsers in this guild and create AppMembers for them
      try {
        // Fetch all members from Discord
        const discordMembers = await guild.members.fetch();
        const memberIds = Array.from(discordMembers.keys());

        // Find which members are registered users
        const registeredUsers = await userService.findManyByIds(memberIds);

        if (registeredUsers.length > 0) {
          logger.info(
            `Found ${registeredUsers.length} registered users in new guild`,
            {
              fields: { guildId: guild.id },
            }
          );

          // Create member records for each registered user
          await Promise.all(
            registeredUsers.map(async (user) => {
              const discordMember = discordMembers.get(user.id);
              if (!discordMember) return;

              await memberService
                .create(guild.id, user.id, {
                  nickname: discordMember.nickname || "",
                  avatarUrl: discordMember.displayAvatarURL(),
                  admin: discordMember.permissions.has("Administrator"),
                })
                .catch((err) => {
                  logger.exception(
                    `Failed to create member for user ${user.id}`,
                    err
                  );
                });
            })
          );
        }
      } catch (error) {
        logger.exception("Failed to sync members on guild create", error);
      }
    } catch (error) {
      logger.exception(
        `Failed to create guild ${guild.name} (${guild.id}):`,
        error
      );
    }
  },
};
