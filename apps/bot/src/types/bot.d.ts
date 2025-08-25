import type {
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  InteractionEditReplyOptions,
  InteractionReplyOptions,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ClientEvents,
} from "discord.js";

// Bot type definition
export type BotType = "cod" | "5th" | "20th";

// Event Interface
export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void>;
}

// Command interface
export interface BotCommand {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (
    interaction: ChatInputCommandInteraction
  ) => Promise<InteractionReplyOptions | InteractionEditReplyOptions>;
}

// Component interface
export interface BotComponent {
  // name should be a ComponentCID Type
  name: string;
  execute: (
    interaction: ButtonInteraction | StringSelectMenuInteraction
  ) => Promise<InteractionReplyOptions | InteractionEditReplyOptions>;
}
