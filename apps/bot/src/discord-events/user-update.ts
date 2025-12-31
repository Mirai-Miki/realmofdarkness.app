import type { User, PartialUser } from "discord.js";
import type { Snowflake } from "@realm/common";
import type { BotEvent } from "types";

import { logger } from "@realm/logger";
import { UserRepositoryInputSchema } from "@realm/common";
import { UserRepository } from "@realm/repositories";
import { Events } from "discord.js";

/**
 * Handles Discord UserUpdate events.
 * Updates user information in our database when Discord user data changes.
 */
const userUpdateEvent: BotEvent<Events.UserUpdate> = {
  name: Events.UserUpdate,
  once: false,
  async execute(oldUser: User | PartialUser, newUser: User): Promise<void> {
    // Instantiate repository and service
    const userRepository = new UserRepository();

    try {
      // Fetch full user data if partial
      if (newUser.partial) {
        await newUser.fetch();
      }

      const validatedData = UserRepositoryInputSchema.parse({
        id: newUser.id as Snowflake,
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
  },
};

export default userUpdateEvent;
