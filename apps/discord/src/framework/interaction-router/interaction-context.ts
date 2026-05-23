import type {
  AutocompleteInteraction,
  BaseInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import type { User as RodUser } from "@realm/core";

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

  /**
   * Hydrated RoD domain user entity, attached by middleware such as ensure-actor.
   *
   * Do not pass raw `UserData` around inside the app.
   */
  actor?: RodUser;
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
