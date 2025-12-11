import type { Guild as DiscordGuild } from "discord.js";

import { Events } from "discord.js";
import { logger } from "@realm/logger";
import {
  GuildRepository,
  UserRepository,
  MemberRepository,
} from "@realm/repositories";
import {
  GuildService,
  Guild as AppGuild,
  Member as AppMember,
} from "@realm/core";
import { ActivityService } from "services";

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild: DiscordGuild) {
    ActivityService.update(guild.client);

    // Create services and repositories
    const guildRepository = new GuildRepository();
    const userRepository = new UserRepository();
    const memberRepository = new MemberRepository();
    const guildService = new GuildService(guildRepository);

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
        const registeredUsers = await userRepository.findManyByIds(memberIds);

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

              const member = new AppMember({
                guildId: guild.id,
                userId: user.id,
                admin: discordMember.permissions.has("Administrator"),
                storyteller: false, // TODO: Check against configured storyteller roles in DB
                boosted: false,
                nickname: discordMember.nickname || "",
                avatarUrl: discordMember.avatarURL() || "",
                createdAt: now,
                lastUpdated: now,
              });

              await memberRepository.create(member).catch((err) => {
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
