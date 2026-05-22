import type { Client, ClientEvents } from "discord.js";

import { logger } from "@realm/logger";

/**
 * Base class for Discord event handlers.
 * Provides a structured way to handle Discord.js client events.
 */
export abstract class DiscordEvent<K extends keyof ClientEvents = any> {
  /**
   * The name of the Discord event to listen for.
   * Examples: 'ready', 'interactionCreate', 'messageCreate', 'guildCreate'
   */
  abstract readonly eventName: K;

  /**
   * Whether this event should only trigger once.
   * Default: false
   */
  readonly once: boolean = false;

  /**
   * Execute the event handler.
   * @param args - The arguments passed by Discord.js for this event
   */
  abstract execute(...args: ClientEvents[K]): Promise<void>;

  /**
   * Register this event handler with a Discord client.
   * @param client - The Discord.js client
   */
  register(client: Client): void {
    if (this.once) {
      client.once(
        this.eventName,
        (...args: Parameters<typeof this.execute>) => {
          Promise.resolve(this.execute(...args)).catch((error) => {
            logger.exception(`Event ${this.eventName} execution failed`, error);
          });
        }
      );
    } else {
      client.on(this.eventName, (...args: Parameters<typeof this.execute>) => {
        Promise.resolve(this.execute(...args)).catch((error) => {
          logger.exception(`Event ${this.eventName} execution failed`, error);
        });
      });
    }
  }
}

/**
 * Helper function to create a simple event handler without extending the class.
 * Useful for quick event handlers that don't need complex logic.
 *
 * @example
 * ```typescript
 * export const readyEvent = createEvent('ready', true, async (client) => {
 *   console.log(`Logged in as ${client.user.tag}`);
 * });
 * ```
 */
export function createEvent<K extends keyof ClientEvents>(
  eventName: K,
  once: boolean = false,
  execute: (...args: ClientEvents[K]) => Promise<void> | void
): DiscordEvent<K> {
  return new (class extends DiscordEvent<K> {
    readonly eventName = eventName;
    override readonly once = once;
    async execute(...args: ClientEvents[K]) {
      return execute(...args);
    }
  })();
}
