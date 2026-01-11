import type { BaseInteractionHandler } from "./entities/interaction-handlers.entity";
import type { DiscordEvent } from "./entities/discord-event.entity";

import { Collection } from "discord.js";
import { logger } from "@realm/logger";

/**
 * Central registry for all handlers and Discord events.
 * This is the single source of truth for the router to dispatch interactions.
 */
export class Registry {
  /**
   * Map of Handler ID → Handler.
   * Stores all interaction handlers (commands, buttons, modals, selects).
   * Uses Discord.js Collection for compatibility with existing patterns.
   */
  private readonly interactionHandlers = new Collection<
    string,
    BaseInteractionHandler
  >();

  /**
   * Array of all registered Discord client events.
   * Named specifically to differentiate from future Redis/internal events.
   */
  private readonly discordEvents: DiscordEvent[] = [];

  /**
   * Get a handler by its ID.
   * @param handlerId - The handler ID to lookup
   * @returns The handler if found, undefined otherwise
   */
  public getInteractionHandler(
    handlerId: string
  ): BaseInteractionHandler | undefined {
    return this.interactionHandlers.get(handlerId);
  }

  /**
   * Get all registered Discord events.
   * @returns Array of Discord events
   */
  public getDiscordEvents(): readonly DiscordEvent[] {
    return this.discordEvents;
  }

  /**
   * Register a handler with the registry.
   * All handlers (commands, interfaces) are stored in a single collection.
   *
   * @param handler - The handler to register
   */
  public registerInteractionHandler(handler: BaseInteractionHandler): void {
    if (this.interactionHandlers.has(handler.handlerId)) {
      logger.warn("Duplicate handler detected", {
        fields: { handlerId: handler.handlerId },
      });
      return;
    }
    this.interactionHandlers.set(handler.handlerId, handler);
    logger.debug("Handler registered", {
      fields: { handlerId: handler.handlerId },
    });
  }

  /**
   * Register a Discord client event with the registry.
   *
   * @param event - The Discord event to register
   */
  public registerDiscordEvent(event: DiscordEvent): void {
    const existing = this.discordEvents.find(
      (e) => e.eventName === event.eventName
    );
    if (existing && event.once) {
      logger.warn("Duplicate 'once' Discord event detected", {
        fields: { eventName: String(event.eventName) },
      });
    }
    this.discordEvents.push(event);
    logger.debug("Discord event registered", {
      fields: { eventName: String(event.eventName) },
    });
  }

  /**
   * Get statistics about the current registry state.
   */
  public getStats() {
    return {
      handlers: this.interactionHandlers.size,
      discordEvents: this.discordEvents.length,
    };
  }

  /**
   * Clear all registered handlers and Discord events.
   * Useful for testing or hot-reloading.
   */
  public clear(): void {
    this.interactionHandlers.clear();
    this.discordEvents.length = 0;
    logger.debug("Registry cleared");
  }
}

/**
 * Global singleton instance of the Registry.
 * All parts of the application should use this instance.
 */
export const registry = new Registry();
