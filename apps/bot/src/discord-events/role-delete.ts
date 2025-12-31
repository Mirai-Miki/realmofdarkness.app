import type { Role } from "discord.js";
import type { Snowflake } from "@realm/common";

import { logger } from "@realm/logger";
import { Guild as AppGuild } from "@realm/core";
import { GuildRepository } from "@realm/repositories";
import { Events } from "discord.js";

module.exports = {
  name: Events.GuildRoleDelete,
  once: false,
  async execute(role: Role) {
    // Instantiate repository and service
    const guildRepository = new GuildRepository();

    try {
      // Get the guild entity to check if this role is a storyteller role
      const guildData = await guildRepository.findById(
        role.guild.id as Snowflake
      );

      if (!guildData) {
        logger.warn(
          `Guild data not found for guild ID ${role.guild.id} while handling role deletion`
        );
        return;
      }

      const appGuild = new AppGuild(guildData);

      // Check if the deleted role is in the storyteller roles array
      if (appGuild.storytellerRoles.includes(role.id as Snowflake)) {
        logger.info(
          `Storyteller role "${role.name}" was deleted from guild "${role.guild.name}", removing from guild configuration`,
          {
            fields: { guildId: role.guild.id, roleId: role.id },
          }
        );
        appGuild.removeStorytellerRole(role.id as Snowflake);

        // Remove the role from the guild's storyteller roles
        await guildRepository.update(appGuild.toRepositoryInput());
      }
    } catch (error) {
      logger.exception(
        `Failed to handle role deletion in guild ${role.guild.name} (${role.guild.id}):`,
        error
      );
    }
  },
};
