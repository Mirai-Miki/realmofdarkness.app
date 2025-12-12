/**
 * Core type definitions for the Realm of Darkness application.
 * These types are used across all packages.
 *
 * @packageDocumentation
 */

import { z } from "zod";

export const HexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

/**
 * Type alias for Discord snowflake IDs.
 * Snowflakes are unique 64-bit identifiers used by Discord.
 * We store them as strings to preserve precision (JavaScript numbers are only 53-bit).
 */
export const SnowflakeSchema = z.string().regex(/^\d{17,20}$/, {
  message: "Invalid snowflake ID format",
});
export type Snowflake = z.infer<typeof SnowflakeSchema>;

export const DiscordSnowflakeSchema = z.string().regex(/^\d{17,20}$/);

// Discord CDN URLs
export const DiscordUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => {
      const hostname = new URL(url).hostname;
      return (
        hostname === "media.discordapp.net" || hostname === "cdn.discordapp.com"
      );
    },
    {
      message: "URL must be from Discord CDN",
    }
  );

/**
 * Environment modes.
 * Defines the runtime environment.
 */
export const enum Environment {
  Development = "development",
  Preproduction = "preproduction",
  Production = "production",
}
