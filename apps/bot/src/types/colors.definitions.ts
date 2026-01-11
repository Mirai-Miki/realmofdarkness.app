import { Colors as DiscordColors } from "discord.js";

/**
 * Extended Color Palette including both standard Discord colors and custom bot branding colors.
 */
export const Colors = {
  ...DiscordColors,
  Success: 0x57f287,
  Error: 0xed4245,
  Warning: 0xfee75c,
  Info: 0x5865f2,
} as const;

export type Colors = (typeof Colors)[keyof typeof Colors];
