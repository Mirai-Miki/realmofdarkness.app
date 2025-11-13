import type { User, PartialUser } from "discord.js";
import type { BotEvent } from "types";
import { Events } from "discord.js";
import { AppUser } from "entities";
import { logger } from "shared/logger";

/**
 * Handles Discord UserUpdate events
 * Updates user information in our database when Discord user data changes
 */
const userUpdateEvent: BotEvent<Events.UserUpdate> = {
  name: Events.UserUpdate,
  once: false,
  async execute(oldUser: User | PartialUser, newUser: User): Promise<void> {
    try {
      // Fetch full user data if partial
      if (newUser.partial) {
        await newUser.fetch();
      }
      const user = AppUser.from(newUser);
      await user.update();
    } catch (error) {
      logger.exception("Failed to handle user update event", error);
    }
  },
};

export default userUpdateEvent;
