import type {
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  AutocompleteInteraction,
  BaseInteraction,
} from "discord.js";

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

  /**
   * Execute the handler logic.
   * @param interaction - The Discord interaction to handle
   */
  abstract execute(interaction: BaseInteraction): Promise<void>;
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
   * @param ChatInputCommandInteraction - The chat input command interaction
   */
  abstract override execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void>;

  /**
   * Handle autocomplete interactions for the command.
   * @param AutocompleteInteraction - The autocomplete interaction
   */
  abstract autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

/**
 * Handler for Interface Interactions (Buttons, Modals, Selects).
 * Implements the View-First pattern where the handler pulls the contract from the View.
 */
export abstract class InterfaceHandler extends BaseInteractionHandler {
  /**
   * Execute the handler logic.
   * @param interaction - The interface interaction
   */
  abstract override execute(
    interaction: MessageComponentInteraction | ModalSubmitInteraction
  ): Promise<void>;
}
