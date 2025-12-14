import type { Role } from "discord.js";

import { logger } from "@realm/logger";
import { GuildRepository } from "@realm/repositories";
import { GuildService } from "@realm/core";
import { Events } from "discord.js";

module.exports = {
  name: Events.GuildRoleDelete,
  once: false,
  async execute(role: Role) {
    // Instantiate repository and service
    const guildRepository = new GuildRepository();
    const guildService = new GuildService(logger, guildRepository);

    try {
      // Get the guild entity to check if this role is a storyteller role
      const guild = await guildService.getById(role.guild.id);

      // Check if the deleted role is in the storyteller roles array
      if (guild.storytellerRoles.includes(role.id)) {
        logger.info(
          `Storyteller role "${role.name}" was deleted from guild "${role.guild.name}", removing from guild configuration`,
          {
            fields: { guildId: role.guild.id, roleId: role.id },
          }
        );

        // Remove the role from the guild's storyteller roles
        await guildService.removeStorytellerRole({
          guildId: role.guild.id,
          roleId: role.id,
        });
      }
    } catch (error) {
      logger.exception(
        `Failed to handle role deletion in guild ${role.guild.name} (${role.guild.id}):`,
        error
      );
    }
  },
};
