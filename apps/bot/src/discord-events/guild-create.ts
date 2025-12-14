import type { Guild as DiscordGuild } from "discord.js";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import {
  GuildRepository,
  UserRepository,
  MemberRepository,
} from "@realm/repositories";
import { GuildService, MemberService } from "@realm/core";
import { ActivityService } from "services";

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild: DiscordGuild) {
    ActivityService.update(guild.client);

    // Instantiate repositories
    const guildRepository = new GuildRepository();
    const userRepository = new UserRepository(logger);
    const memberRepository = new MemberRepository();

    // Inject repositories into services
    const guildService = new GuildService(logger, guildRepository);
    const memberService = new MemberService(logger, memberRepository);

    try {
      // Check if guild already exists
      const existingGuild = await guildRepository.findById(guild.id);

      if (existingGuild) {
        logger.info(`Bot re-added to existing guild: ${guild.name}`, {
          fields: { guildId: guild.id },
        });
        return;
      }

      // Create new guild using DTO
      await guildService.create({
        id: guild.id,
        name: guild.name,
        iconUrl: guild.iconURL() || "",
        storytellerRoleIds: [],
      });

      logger.info(`Bot added to new guild: ${guild.name}`, {
        fields: { guildId: guild.id, memberCount: String(guild.memberCount) },
      });

      // Find all registered users in this guild and create member records
      try {
        // Fetch all members from Discord
        const discordMembers = await guild.members.fetch();
        const memberIds = Array.from(discordMembers.keys());

        // Find which members are registered users
        const registeredUserDtos = await Promise.all(
          memberIds.map(async (id) => {
            try {
              return await userRepository.findById(id);
            } catch {
              return null;
            }
          })
        );

        const registeredUsers = registeredUserDtos.filter(
          (dto) => dto !== null
        );

        if (registeredUsers.length > 0) {
          logger.info(
            `Found ${registeredUsers.length} registered users in new guild`,
            {
              fields: { guildId: guild.id },
            }
          );

          // Create member records for each registered user
          await Promise.all(
            registeredUsers.map(async (userDto) => {
              const discordMember = discordMembers.get(userDto.id);
              if (!discordMember) return;

              await memberService
                .create({
                  guildId: guild.id,
                  userId: userDto.id,
                  nickname: discordMember.nickname || "",
                  avatarUrl: discordMember.displayAvatarURL(),
                  admin: discordMember.permissions.has("Administrator"),
                  roleIds: Array.from(discordMember.roles.cache.keys()),
                  boosted: 0,
                })
                .catch((err) => {
                  logger.exception(
                    `Failed to create member for user ${userDto.id}`,
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
