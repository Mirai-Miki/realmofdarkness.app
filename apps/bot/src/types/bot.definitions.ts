import type {
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  AutocompleteInteraction,
  ClientEvents,
} from "discord.js";
import { z } from "zod";

// ============================================================================
// Bot Type
// ============================================================================

export const BotTypes = {
  Cod: "cod",
  Wod5: "5th",
  Wod20: "20th",
} as const;
export const BotTypesSchema = z.enum(BotTypes);
export type BotType = z.infer<typeof BotTypesSchema>;

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Zod schema for validating BotCommand structure at runtime.
 * Defines the structure that all command modules must follow.
 *
 * @remarks
 * The `data` field is validated as an object (not deeply validated) because
 * it's a Discord.js SlashCommandBuilder which has complex internal structure.
 */
export const BotCommandSchema = z.object({
  data: z.object({}).loose(), // SlashCommandBuilder - just verify it's an object
  execute: z.function(),
  autocomplete: z.function().optional(),
});

/**
 * Zod schema for validating BotComponent structure at runtime.
 * Defines the structure that all component modules must follow.
 */
export const BotComponentSchema = z.object({
  name: z.string(),
  execute: z.function(),
});

/**
 * Zod schema for validating BotEvent structure at runtime.
 * Defines the structure that all event modules must follow.
 */
export const BotEventSchema = z.object({
  name: z.string(),
  once: z.boolean(),
  execute: z.function(),
});

// ============================================================================
// TypeScript Types (Enhanced with Discord.js types for IDE support)
// ============================================================================

/**
 * Type for slash command modules.
 * Structurally matches BotCommandSchema but with proper Discord.js types.
 */
export interface BotCommand {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

/**
 * Type for message component modules.
 * Structurally matches BotComponentSchema but with proper Discord.js types.
 */
export interface BotComponent {
  name: string;
  execute(interaction: MessageComponentInteraction): Promise<void>;
}

/**
 * Type for Discord event handlers.
 * Structurally matches BotEventSchema but with proper Discord.js types and generics.
 */
export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once: boolean;
  execute(...args: ClientEvents[K]): Promise<void>;
}
