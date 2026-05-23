import type {
  AutocompleteInteraction,
  BaseInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import type { Snowflake, UserData } from "@realm/common";

/**
 * Discord app aggregate representing the acting user.
 *
 * This shape is intentionally scoped to the Discord app. Shared packages should
 * receive only the fields they explicitly require (usually the core User/UserData).
 */
export type DiscordActor = {
  /** RoD user ID. */
  rodUserId: Snowflake;

  /** Discord user snowflake ID. */
  discordUserId: Snowflake;

  /** Core user record. */
  user: UserData;
};

/**
 * Minimal interaction context passed into handlers.
 *
 * Keep this intentionally small:
 * - Raw interaction contains user/guild IDs when needed.
 * - Longer-lived state belongs in session storage, not on the per-dispatch context.
 */
export type BaseInteractionContext<TInteraction extends BaseInteraction> = {
  /** Raw Discord.js interaction. */
  interaction: TInteraction;

  /** Actor aggregate, attached by middleware such as ensure-actor. */
  actor?: DiscordActor;
};

export type CommandContext =
  BaseInteractionContext<ChatInputCommandInteraction>;

export type InterfaceContext = BaseInteractionContext<
  MessageComponentInteraction | ModalSubmitInteraction
>;

export type AutocompleteContext =
  BaseInteractionContext<AutocompleteInteraction>;

export type ContextMenuContext =
  BaseInteractionContext<ContextMenuCommandInteraction>;

/**
 * Extract the handler ID from a component/modal custom ID.
 *
 * Current format: `handlerId:...` or just `handlerId`.
 */
export function parseHandlerIdFromCustomId(customId: string): string {
  const [handlerId] = customId.split(":");
  return handlerId;
}
