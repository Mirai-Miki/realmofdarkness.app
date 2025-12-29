import type { User, PartialUser } from "discord.js";
import type { BotEvent } from "types";

import { logger } from "@realm/logger";
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
    const userService = new UserService(logger, userRepository);

    try {
      // Fetch full user data if partial
      if (newUser.partial) {
        await newUser.fetch();
      }

      // Update user profile with new Discord data
      await userService.update({
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName || newUser.username,
        avatarUrl: newUser.avatarURL() || undefined,
      });
    } catch (error) {
      logger.exception(
        `Failed to handle user update for ${newUser.username} (${newUser.id}):`,
        error
      );
    }
  },
};

export default userUpdateEvent;
