import { z } from "zod";
import { SnowflakeGenerator } from "utils";

// Shared validation schemas
export const HexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const SnowflakeSchema = z.string().refine(SnowflakeGenerator.isValid, {
  message: "Invalid snowflake ID format",
});

export const DiscordSnowflakeSchema = z.string().regex(/^\d{17,20}$/);

export const DiscordUrlSchema = z.url({
  hostname: /^(media\.discordapp\.net\|cdn\.discordapp\.com)$/,
});

// Environment validation schema
export const EnvironmentSchema = z.enum([
  "development",
  "preproduction",
  "production",
]);
