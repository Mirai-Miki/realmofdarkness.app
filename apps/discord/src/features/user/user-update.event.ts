import type { User, PartialUser } from "discord.js";
import { Events } from "discord.js";
import { DiscordEvent } from "framework";
import { logger } from "@realm/logger";
import { UserRepositoryInputSchema } from "@realm/common";
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

      const validatedData = UserRepositoryInputSchema.parse({
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
        avatarUrl: newUser.displayAvatarURL(),
      });

      // Only update existing users
      await userRepository.update(validatedData, { ignoreNotFound: true });
    } catch (error) {
      logger.exception(
        `Failed to handle user update for ${newUser.username} (${newUser.id}):`,
        error
      );
    }
  }
}

export default new UserUpdateEvent();
