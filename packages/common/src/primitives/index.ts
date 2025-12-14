/**
 * Core type definitions for the Realm of Darkness application.
 * These types are used across all packages.
 *
 * @packageDocumentation
 */

import { z } from "zod";

// Re-export HttpStatus enum
export { HttpStatus } from "./http-status.enum.js";

export const DISCORD_FIELD_RULES = {
  // Display names, usernames, nicknames.
  username: { minLength: 1, maxLength: 35 },
  // Server names.
  guildName: { minLength: 1, maxLength: 100 },
  cdnUrl: { maxLength: 500 },
};

export const HexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

/**
 * Type alias for Discord snowflake IDs.
 * Snowflakes are unique 64-bit identifiers used by Discord.
 * We store them as strings to preserve precision.
 */
export const SnowflakeSchema = z.string().regex(/^\d{17,20}$/, {
  message: "Invalid snowflake ID format",
});
export type Snowflake = z.infer<typeof SnowflakeSchema>;

// Discord CDN URLs
export const DiscordUrlSchema = z.url({
  hostname: /^(media\.discordapp\.net|cdn\.discordapp\.com)$/,
  protocol: /^https:$/,
  message: "URL must be a valid Discord CDN URL",
});
export type DiscordUrl = z.infer<typeof DiscordUrlSchema>;
/**
 * Environment modes.
 * Defines the runtime environment.
 */
export const Environment = {
  Development: "development",
  Preproduction: "preproduction",
  Production: "production",
} as const;
export const EnvironmentSchema = z.enum(
  Object.values(Environment) as [string, ...string[]]
);
export type Environment = (typeof Environment)[keyof typeof Environment];
