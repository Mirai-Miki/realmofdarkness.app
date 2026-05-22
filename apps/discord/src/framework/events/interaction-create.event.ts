import type { Interaction } from "discord.js";

import { Events } from "discord.js";
import { DiscordEvent } from "framework";
import { InteractionRouter } from "framework";

/**
 * Discord InteractionCreate event handler.
 * Routes all interactions to the framework router.
 */
class InteractionCreateEvent extends DiscordEvent<Events.InteractionCreate> {
  readonly eventName = Events.InteractionCreate as const;
  override readonly once = false;

  private router = new InteractionRouter();

  async execute(interaction: Interaction): Promise<void> {
    await this.router.route(interaction);
  }
}

export const interactionCreateEvent = new InteractionCreateEvent();
