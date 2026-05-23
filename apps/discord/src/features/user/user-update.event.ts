import type { User, PartialUser } from "discord.js";
import { Events } from "discord.js";
import { DiscordEvent } from "framework";
import { logger } from "@realm/logger";
import { DiscordUserProfileInputSchema } from "@realm/common";
import { UserRepository } from "@realm/repositories";

/**
 * Handles Discord UserUpdate events.
 * Updates user information in our database when Discord user data changes.
 */
class UserUpdateEvent extends DiscordEvent<Events.UserUpdate> {
  readonly eventName = Events.UserUpdate as const;
  override readonly once = false;

  async execute(oldUser: User | PartialUser, newUser: User): Promise<void> {
    // Instantiate repository and service
    const userRepository = new UserRepository();

    try {
      // Fetch full user data if partial
      if (newUser.partial) {
        await newUser.fetch();
      }

      // Only update users that are already registered in our DB.
      // We intentionally do not track every Discord user the bot can see.
      const existing = await userRepository.findByDiscordId(newUser.id);
      if (!existing) return;

      const validatedData = DiscordUserProfileInputSchema.parse({
        discordId: newUser.id,
        displayName: newUser.displayName,
        avatarUrl: newUser.displayAvatarURL(),
      });

      await userRepository.upsertFromDiscordProfile(validatedData, {
        newUserId: existing.id,
      });
    } catch (error) {
      logger.exception(
        `Failed to handle user update for ${newUser.username} (${newUser.id}):`,
        error
      );
    }
  }
}

export default new UserUpdateEvent();
