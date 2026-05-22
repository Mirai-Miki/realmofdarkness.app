import type { SlashCommandBuilder } from "discord.js";

import type {
  AutocompleteContext,
  CommandContext,
  InterfaceContext,
} from "../interaction-router/interaction-context";

/**
 * Base class for all interaction handlers.
 * This provides the foundation for both command and interface handlers.
 */
export abstract class BaseInteractionHandler {
  /**
   * Unique identifier for this handler.
   * For commands, this is the command name.
   * For interfaces (buttons/modals), this is the custom ID prefix.
   */
  abstract readonly handlerId: string;
}

/**
 * Handler for Slash Commands.
 * Defines the command structure and execution logic.
 */
export abstract class CommandHandler extends BaseInteractionHandler {
  /**
   * The command definition (name, description, options).
   * Used for registering with Discord's API.
   */
  abstract readonly data: SlashCommandBuilder;

  /**
   * Get the handler ID from the command name.
   */
  get handlerId(): string {
    return this.data.name;
  }

  /**
   * Execute the command.
   * @param ctx - The typed command context
   */
  abstract execute(ctx: CommandContext): Promise<void>;

  /**
   * Handle autocomplete interactions for the command.
   * @param ctx - The typed autocomplete context
   */
  abstract autocomplete?(ctx: AutocompleteContext): Promise<void>;
}

/**
 * Handler for Interface Interactions (Buttons, Modals, Selects).
 * Implements the View-First pattern where the handler pulls the contract from the View.
 */
export abstract class InterfaceHandler extends BaseInteractionHandler {
  /**
   * Execute the handler logic.
   * @param ctx - The typed interface context
   */
  abstract execute(ctx: InterfaceContext): Promise<void>;
}
