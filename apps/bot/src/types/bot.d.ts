import type {
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  AutocompleteInteraction,
  ClientEvents,
} from "discord.js";

// Bot type definition
export type BotType = "cod" | "5th" | "20th";

/**
 * Structure for Discord event handlers.
 */
export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void>;
}

/**
 * Structure for slash command modules.
 * Commands must implement execute() to handle interactions.
 */
export interface BotCommand {
  /** Slash command definition */
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;

  /**
   * Execute the command.
   * Command must handle its own response (reply/defer/followUp).
   *
   * @param interaction - Chat input command interaction
   * @throws {UserError} For expected user mistakes (validation, not found, etc.)
   * @throws {RealmError} For system errors (database, API, etc.)
   */
  execute(interaction: ChatInputCommandInteraction): Promise<void>;

  /**
   * Optional autocomplete handler for option values.
   *
   * @param interaction - Autocomplete interaction
   */
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

/**
 * Structure for message component (button/select menu) modules.
 */
export interface BotComponent {
  /** Component identifier used in customId */
  name: string;

  /**
   * Execute the component interaction.
   * Component must handle its own response (reply/defer/update/followUp).
   *
   * @param interaction - Message component interaction
   * @throws {UserError} For expected user mistakes
   * @throws {RealmError} For system errors
   */
  execute(interaction: MessageComponentInteraction): Promise<void>;
}
