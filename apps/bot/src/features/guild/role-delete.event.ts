import type { Role } from "discord.js";

import { Events } from "discord.js";
import { DiscordEvent } from "framework";
import { logger } from "@realm/logger";
import { Guild as AppGuild } from "@realm/core";
import { GuildRepository } from "@realm/repositories";

/**
 * Handles role deletion events.
 * Removes deleted roles from guild storyteller role configuration.
 */
class RoleDeleteEvent extends DiscordEvent<Events.GuildRoleDelete> {
  readonly eventName = Events.GuildRoleDelete as const;
  override readonly once = false;

  async execute(role: Role): Promise<void> {
    // Instantiate repository and service
    const guildRepository = new GuildRepository();

    try {
      // Get the guild entity to check if this role is a storyteller role
      const guildData = await guildRepository.findById(role.guild.id);

      if (!guildData) {
        logger.warn(
          `Guild data not found for guild ID ${role.guild.id} while handling role deletion`
        );
        return;
      }

      const appGuild = new AppGuild(guildData);

      // Check if the deleted role is in the storyteller roles array
      if (appGuild.storytellerRoles.includes(role.id)) {
        logger.info(
          `Storyteller role "${role.name}" was deleted from guild "${role.guild.name}", removing from guild configuration`,
          {
            fields: { guildId: role.guild.id, roleId: role.id },
          }
        );
        appGuild.removeStorytellerRole(role.id);

        // Remove the role from the guild's storyteller roles
        await guildRepository.update(appGuild.toRepositoryInput());
      }
    } catch (error) {
      logger.exception(
        `Failed to handle role deletion in guild ${role.guild.name} (${role.guild.id}):`,
        error
      );
    }
  }
}

export default new RoleDeleteEvent();
